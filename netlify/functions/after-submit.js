// netlify/functions/after-submit.js
// Append to Google Sheets + Generate PDF + Email via Resend

const { google } = require('googleapis');
const PDFDocument = require('pdfkit');
const { Resend } = require('resend');

const SHEET_ID = process.env.SHEET_ID;
const SERVICE_ACCOUNT = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || '{}');
const RANGE = 'Form Responses!A1';
const resend = new Resend(process.env.RESEND_API_KEY);

// ------- Helpers -------
function sheetsClient() {
  const jwt = new google.auth.JWT(
    SERVICE_ACCOUNT.client_email,
    null,
    SERVICE_ACCOUNT.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );
  return google.sheets({ version: 'v4', auth: jwt });
}

function safe(obj, path, def = '') {
  try {
    return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj) ?? def;
  } catch {
    return def;
  }
}

function formatPhone(s) {
  const d = String(s || '').replace(/\D/g, '').slice(-10);
  if (d.length !== 10) return s || '';
  return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
}

function parseSubmission(event) {
  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch {}
  const payload = body.payload || {};
  const data = payload.data || {};
  const files = payload.files || [];

  const fileByName = (n) => {
    const f = files.find(x => x.name === n);
    return f && f.url ? f.url : '';
  };

  return {
    // All fields that came from your <form>
    data: {
      firstName: data.firstName || '',
      lastName:  data.lastName || '',
      email:     data.email || '',
      phone:     data.phone || '',
      address1:  data.address1 || '',
      address2:  data.address2 || '',
      city:      data.city || '',
      state:     data.state || '',
      zip:       data.zip || '',
      // NEW: date of birth (add <input type="date" name="dob"> to your form)
      dob:       data.dob || '',
      permitNo:  data.permitNo || '',
      issueDate: data.issueDate || '',
      expDate:   data.expDate || '',
      pkg:       data.package || '',
      fiveHour:  data.fiveHourSlot || '',
      permitSrc: data.permitSource || '',
      signHelp:  data.signHelp || '',
      signatureData: data.signatureData || '',
      agreeTOS:  !!data.agreeTOS,
      agreePrivacy: !!data.agreePrivacy,
      ack6mo:    !!data.ack6mo,
    },
    fileUrls: {
      idFrontUrl: fileByName('idFront'),
      idBackUrl:  fileByName('idBack'),
    }
  };
}

// Convert PDFKit stream → Buffer
function pdfToBuffer(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.end();
  });
}

// Fetch Netlify-hosted image → Buffer (skip if missing)
async function fetchImageBuffer(url) {
  if (!url) return null;
  const res = await fetch(url);
  if (!res.ok) return null;
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

// Build a clean, student-facing PDF (no submission metadata)
async function buildPdf({ data, fileUrls }) {
  const doc = new PDFDocument({ size: 'LETTER', margin: 50 });

  const H1 = (t) => { doc.fontSize(20).text(t); doc.moveDown(0.5); };
  const H2 = (t) => { doc.fontSize(14).text(t); line(); };
  const L  = (k, v='') => doc.fontSize(11).text(`${k}: ${v}`);
  const line = () => {
    doc.moveDown(0.35);
    doc.strokeColor('#cccccc').moveTo(50, doc.y).lineTo(562, doc.y).stroke();
    doc.moveDown(0.35);
  };

  // Header
  H1('Avian Driving School — Student Information Sheet');

  // Student Information
  H2('Student Information');
  L('First Name', data.firstName);
  L('Last Name',  data.lastName);
  L('Date of Birth', data.dob);
  L('Email', data.email);
  L('Phone', formatPhone(data.phone));
  L('Address 1', data.address1);
  L('Address 2', data.address2);
  L('City', data.city);
  L('State', data.state);
  L('ZIP', data.zip);
  doc.moveDown(0.5);

  // Permit / License
  H2('Permit / License');
  L('Permit/License #', data.permitNo);
  L('Issue Date', data.issueDate);
  L('Expiration Date', data.expDate);
  doc.moveDown(0.5);

  // Service Selection
  H2('Service Selection');
  L('Package', data.pkg);
  L('5-Hour Class Slot', data.fiveHour);
  L('Permit Source', data.permitSrc);
  L('Need help with signs?', data.signHelp);
  doc.moveDown(0.5);

  // Agreements
  H2('Agreements');
  L('Agreed to Terms of Service', data.agreeTOS ? 'Yes' : 'No');
  L('Agreed to Privacy Policy',   data.agreePrivacy ? 'Yes' : 'No');
  L('Acknowledged 6-month validity', data.ack6mo ? 'Yes' : 'No');
  doc.moveDown(0.5);

  // Signature (if present)
  if (data.signatureData) {
    try {
      const b64 = data.signatureData.replace(/^data:image\/\w+;base64,/, '');
      const buf = Buffer.from(b64, 'base64');
      H2('Signature');
      doc.image(buf, { fit: [300, 120] });
      doc.moveDown(0.5);
    } catch {
      // ignore decode failures
    }
  }

  // ID Images page
  const frontBuf = await fetchImageBuffer(fileUrls.idFrontUrl);
  const backBuf  = await fetchImageBuffer(fileUrls.idBackUrl);
  if (frontBuf || backBuf) {
    doc.addPage();
    H2('ID Images');
    doc.fontSize(10).fillColor('#666').text('Images uploaded with the submission.').fillColor('#000').moveDown(0.5);
    if (frontBuf) { doc.fontSize(12).text('Front', { paragraphGap: 6 }); doc.image(frontBuf, { fit: [480, 360] }); doc.moveDown(0.5); }
    if (backBuf)  { doc.fontSize(12).text('Back',  { paragraphGap: 6 }); doc.image(backBuf,  { fit: [480, 360] }); doc.moveDown(0.5); }
  }

  return await pdfToBuffer(doc);
}

exports.handler = async (event) => {
  console.log('after-submit invoked');
  try {
    const { data, fileUrls } = parseSubmission(event);

    // 1) Append to Google Sheets
    const sheets = sheetsClient();
    const values = [[
      new Date().toISOString(),
      data.firstName, data.lastName, data.email, formatPhone(data.phone),
      data.address1, data.address2, data.city, data.state, data.zip,
      data.dob,                 // NEW column for DOB
      data.permitNo, data.issueDate, data.expDate,
      data.pkg, data.fiveHour, data.permitSrc, data.signHelp,
      fileUrls.idFrontUrl, fileUrls.idBackUrl,
      data.signatureData ? 'Captured' : '',
      data.agreeTOS ? 'Yes' : 'No',
      data.agreePrivacy ? 'Yes' : 'No',
      data.ack6mo ? 'Yes' : 'No'
    ]];

    const appendRes = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: RANGE,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values }
    });
    console.log('append status:', appendRes.status);

    // 2) Build PDF
    const pdfBuffer = await buildPdf({ data, fileUrls });

    // 3) Email via Resend
    const studentName = `${data.firstName} ${data.lastName}`.trim();
    const emailHtml = `
      <p>You have a new student registration.</p>
      <p>
        <strong>Name:</strong> ${studentName || 'N/A'}<br/>
        <strong>Email:</strong> <a href="mailto:${data.email}">${data.email || 'N/A'}</a><br/>
        <strong>Phone:</strong> ${formatPhone(data.phone) || 'N/A'}<br/>
        <strong>Permit #:</strong> ${data.permitNo || 'N/A'}<br/>
        <strong>Date of Birth:</strong> ${data.dob || 'N/A'}
      </p>
      <p>
        ${(fileUrls.idFrontUrl ? `ID (Front): <a href="${fileUrls.idFrontUrl}">Download</a><br/>` : '')}
        ${(fileUrls.idBackUrl  ? `ID (Back): <a href="${fileUrls.idBackUrl}">Download</a><br/>`  : '')}
      </p>
      <p>The PDF summary is attached.</p>
    `;

    const emailRes = await resend.emails.send({
      from: 'Avian Forms <forms@aviandrivingschool.com>',
      to:   ['info@aviandrivingschool.com'],
      cc:   ['aviandrivingschool@gmail.com'],
      subject: `New Student Registration: ${studentName || data.email || 'Unknown'}`,
      html: emailHtml,
      attachments: [{
        filename: `Registration-${Date.now()}.pdf`,
        content: pdfBuffer.toString('base64'),
      }],
    });

    console.log('email status:', (emailRes && emailRes.id) ? emailRes.id : 'ok');
    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    console.error('after-submit error:', err);
    // Still 200 so Netlify accepts the submission; check logs for details
    return { statusCode: 200, body: 'Received (email/pdf error logged).' };
  }
};