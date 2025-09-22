// netlify/functions/after-submit.js
// Keep your webhook. Make sure env vars are set: SHEET_ID, GOOGLE_SERVICE_ACCOUNT, RESEND_API_KEY
// netlify.toml should use zisi bundler and include assets/avian_logo.png

const { google } = require('googleapis');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// ---------- helpers ----------
function parseSubmission(event) {
  const body = JSON.parse(event.body || '{}');
  // Works with Netlify webhook shape OR a raw POST
  const payload = body.payload || body || {};
  const data = payload.data || {};
  const files = payload.files || [];
  return { data, files };
}

function pick(data, ...cands) {
  // 1) direct keys
  for (const c of cands) {
    if (data[c] != null && String(data[c]).trim() !== '') return String(data[c]).trim();
  }
  // 2) normalized keys (first-name / First Name / first_name => firstName)
  const keys = Object.keys(data);
  for (const c of cands) {
    const norm = c.toLowerCase().replace(/[\s_-]/g, '');
    const hit = keys.find(k => k.toLowerCase().replace(/[\s_-]/g, '') === norm);
    if (hit && String(data[hit]).trim() !== '') return String(data[hit]).trim();
  }
  return '';
}

function resolveFields(data) {
  const firstName = pick(data, 'firstName','First Name','first-name','first_name','first');
  const lastName  = pick(data, 'lastName','Last Name','last-name','last_name','last');

  const email = pick(data, 'email','Email','studentEmail','contactEmail');
  const phone = pick(data, 'phone','Phone','phoneNumber','Phone Number');

  const permit = pick(data, 'permit','permitNumber','Permit Number','licenseNumber','License Number');

  let dob = pick(data, 'dob','DOB','dateOfBirth','Date of Birth','birthdate','Birth Date');
  if (!dob) {
    const m = pick(data, 'dobMonth','DOB Month','birthMonth','Birth Month');
    const d = pick(data, 'dobDay','DOB Day','birthDay','Birth Day');
    const y = pick(data, 'dobYear','DOB Year','birthYear','Birth Year');
    if (y && m && d) dob = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  }

  return { firstName, lastName, email, phone, permit, dob };
}

async function appendAllFieldsToSheet({ sheetId, tabName, dataObj }) {
  const svc = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || '{}');
  if (!svc.client_email || !svc.private_key) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT is missing client_email/private_key');
  }
  const auth = new google.auth.JWT(
    svc.client_email, null, svc.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );
  const sheets = google.sheets({ version: 'v4', auth });

  // Read header (row 1)
  const headerResp = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId, range: `${tabName}!1:1`,
  });
  let header = (headerResp.data.values && headerResp.data.values[0]) || [];
  if (!header.length) header = ['timestamp']; // ensure timestamp first col

  // Add any new keys (stable order)
  const keys = Object.keys(dataObj);
  for (const k of keys) {
    if (!header.includes(k)) header.push(k);
  }

  // If header changed or was empty, write it back
  const needHeaderUpdate =
    !headerResp.data.values || header.length !== (headerResp.data.values[0] || []).length;

  if (needHeaderUpdate) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${tabName}!1:1`,
      valueInputOption: 'RAW',
      requestBody: { values: [header] },
    });
  }

  // Build row following header order
  const row = header.map(h =>
    h === 'timestamp' ? new Date().toISOString() : (dataObj[h] ?? '')
  );

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${tabName}!A:A`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] },
  });
}

function findFile(files, ...needles) {
  return files.find(f => {
    const n = (f.name || '').toLowerCase();
    return needles.some(nd => n.includes(nd));
  }) || null;
}

async function fetchBuffer(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`fetch ${url} failed: ${r.status}`);
  const ab = await r.arrayBuffer();
  return Buffer.from(ab);
}

async function buildPdf({ data, core, files }) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'LETTER', margin: 36 });
      const chunks = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Header with logo
      try {
        // NOTE: path is from functions/ to /assets (we keep zisi + included_files)
        const logoPath = path.join(__dirname, '..', 'assets', 'avian_logo.png');
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, 36, 36, { width: 110 });
        }
      } catch (e) { /* non-fatal */ }

      doc.fontSize(18).text('Student Information Sheet', 160, 40);
      doc.moveDown();

      doc.fontSize(11);
      const putLine = (label, value) => {
        doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
        doc.font('Helvetica').text(value || 'N/A');
      };

      // Summary section (core fields)
      doc.moveDown(1);
      doc.font('Helvetica-Bold').text('Student Information', { underline: true });
      doc.moveDown(0.5);

      putLine('First Name', core.firstName);
      putLine('Last Name',  core.lastName);
      putLine('Email',      core.email);
      putLine('Phone',      core.phone);
      putLine('Permit / License #', core.permit);
      putLine('Date of Birth', core.dob);

      // All Fields (everything submitted)
      doc.moveDown(1);
      doc.font('Helvetica-Bold').text('All Submitted Fields', { underline: true });
      doc.moveDown(0.5);
      const keys = Object.keys(data);
      keys.forEach(k => {
        doc.font('Helvetica-Bold').text(`${k}: `, { continued: true });
        doc.font('Helvetica').text(String(data[k]));
      });

      // ID Images if present (idFront/idBack, case-insensitive)
      const front = findFile(files, 'idfront', 'frontid', 'id front');
      const back  = findFile(files, 'idback',  'backid',  'id back');
      if (front || back) {
        doc.addPage();
        doc.font('Helvetica-Bold').fontSize(14).text('Identification Images');
        doc.moveDown(0.5);
        if (front) {
          try {
            const b = await fetchBuffer(front.url);
            doc.fontSize(12).text('Front', { underline: true });
            doc.image(b, { fit: [520, 360] });
            doc.moveDown(0.75);
          } catch (e) {
            doc.fontSize(10).fillColor('#900').text('Could not load ID Front image.');
            doc.fillColor('black');
          }
        }
        if (back) {
          try {
            const b = await fetchBuffer(back.url);
            doc.fontSize(12).text('Back', { underline: true });
            doc.image(b, { fit: [520, 360] });
          } catch (e) {
            doc.fontSize(10).fillColor('#900').text('Could not load ID Back image.');
            doc.fillColor('black');
          }
        }
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

async function sendEmail({ core, pdfBuffer }) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) throw new Error('Missing RESEND_API_KEY');

  const subject = `New Student Registration${core.firstName || core.lastName ? ` – ${core.firstName || ''} ${core.lastName || ''}` : ''}`;

  const text =
`You have a new student registration.

Name: ${core.firstName || 'N/A'} ${core.lastName || 'N/A'}
Email: ${core.email || 'N/A'}
Phone: ${core.phone || 'N/A'}
Permit #: ${core.permit || 'N/A'}
Date of Birth: ${core.dob || 'N/A'}

The PDF summary is attached. ID images are embedded inside the PDF.`;

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Avian Forms <forms@aviandrivingschool.com>', // must be a verified sender/domain in Resend
      to: ['info@aviandrivingschool.com'],
      subject,
      text,
      attachments: [
        {
          filename: `Registration-${Date.now()}.pdf`,
          content: pdfBuffer.toString('base64'), // base64 for Resend
        }
      ],
      // cc: core.email ? [core.email] : undefined, // enable if you want to CC student
    }),
  });

  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Resend error ${resp.status}: ${t}`);
  }
}

// ---------- main handler ----------
exports.handler = async (event) => {
  try {
    const { data, files } = parseSubmission(event);
    const core = resolveFields(data);

    // 1) Build PDF
    const pdfBuffer = await buildPdf({ data, core, files });

    // 2) Append ALL fields to Sheet (ensure tab name matches your Sheet)
    await appendAllFieldsToSheet({
      sheetId: process.env.SHEET_ID,
      tabName: 'Form Responses',
      dataObj: data,
    });

    // 3) Email with PDF
    await sendEmail({ core, pdfBuffer });

    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    console.error('after-submit error:', err);
    return { statusCode: 500, body: String(err && err.message ? err.message : err) };
  }
};