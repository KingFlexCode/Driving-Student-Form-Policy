// netlify/functions/after-submit.js
// 1) Append to Google Sheets  2) Generate PDF  3) Email PDF via Resend

const { google } = require('googleapis');
const PDFDocument = require('pdfkit');
const { Resend } = require('resend');
const path = require('path');

const SHEET_ID = process.env.SHEET_ID;
const SERVICE_ACCOUNT = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || '{}');
const RANGE = 'Form Responses!A1'; // change if your tab name differs
const resend = new Resend(process.env.RESEND_API_KEY);

// ---------- Helpers ----------
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

function formatPhone(s = '') {
  const d = (s || '').replace(/\D/g, '').slice(-10);
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : s || '';
}

// ---------- Parse Netlify submission ----------
function parseSubmission(event) {
  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch {}
  const payload = body.payload || {};
  const data = payload.data || {};
  const files = Array.isArray(payload.files) ? payload.files : [];

  const metadata = {
    id: payload.id || '',
    created_at: payload.created_at || '',
    form_name: payload.form_name || '',
    page_url: payload.page_url || '',
    user_agent: safe(event, 'headers.user-agent', ''),
    ip:
      safe(event, 'headers.x-nf-client-connection-ip', '') ||
      safe(event, 'headers.client-ip', '') ||
      safe(event, 'headers.x-forwarded-for', ''),
  };

  const urlBy = (needle) => {
    const exact = files.find((f) => (f.name || '').toLowerCase() === needle);
    if (exact?.url) return exact.url;
    const fuzzy = files.find((f) => (f.name || '').toLowerCase().includes(needle));
    return fuzzy?.url || '';
  };

  return {
    data,
    metadata,
    fileUrls: {
      idFrontUrl: urlBy('idfront'),
      idBackUrl: urlBy('idback'),
    },
  };
}

// ---------- PDF Helpers ----------
function pdfToBuffer(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.end();
  });
}

async function fetchImageBuffer(url) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn('fetchImageBuffer non-200', res.status, url);
      return null;
    }
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  } catch (e) {
    console.warn('fetchImageBuffer error', e?.message || e, url);
    return null;
  }
}

// ---------- Build PDF ----------
async function buildPdf({ data, fileUrls }) {
  const doc = new PDFDocument({ size: 'LETTER', margin: 50 });

  // Logo + Title
  try {
    const logoPath = path.join(__dirname, '../../assets/avian_logo.png');
    doc.image(logoPath, { fit: [140, 60], align: 'center' });
  } catch (e) {
    console.warn('Logo load failed:', e.message);
  }
  doc.moveDown(0.5);
  doc.fontSize(16).text('Student Information Sheet', { align: 'center' });
  doc.moveDown(1);

  const line = () => {
    doc.moveDown(0.35);
    doc.strokeColor('#ddd').moveTo(50, doc.y).lineTo(562, doc.y).stroke();
    doc.moveDown(0.35);
  };

  // Student Info
  doc.fontSize(14).text('Student Information');
  line();
  doc.fontSize(11);
  doc.text(`First Name: ${data.firstName || ''}`);
  doc.text(`Last Name: ${data.lastName || ''}`);
  doc.text(`Date of Birth: ${data.dob || ''}`);
  doc.text(`Email: ${data.email || ''}`);
  doc.text(`Phone: ${formatPhone(data.phone) || ''}`);
  doc.text(`Address 1: ${data.address1 || ''}`);
  doc.text(`Address 2: ${data.address2 || ''}`);
  doc.text(`City: ${data.city || ''}`);
  doc.text(`State: ${data.state || ''}`);
  doc.text(`ZIP: ${data.zip || ''}`);
  doc.moveDown(0.5);

  // Permit / License
  doc.fontSize(14).text('Permit / License');
  line();
  doc.fontSize(11);
  doc.text(`Permit/License #: ${data.permitNo || ''}`);
  doc.text(`Issue Date: ${data.issueDate || ''}`);
  doc.text(`Expiration Date: ${data.expDate || ''}`);
  doc.moveDown(0.5);

  // Services / Choices
  doc.fontSize(14).text('Service Selection');
  line();
  doc.fontSize(11);
  doc.text(`Package: ${data.package || ''}`);
  doc.text(`5-Hour Class Slot: ${data.fiveHourSlot || ''}`);
  doc.text(`Permit Source: ${data.permitSource || ''}`);
  doc.text(`Need help with signs?: ${data.signHelp || ''}`);
  doc.moveDown(0.5);

  // Agreements
  doc.fontSize(14).text('Agreements');
  line();
  doc.fontSize(11);
  doc.text(`Agreed to Terms of Service: ${data.agreeTOS ? 'Yes' : 'No'}`);
  doc.text(`Agreed to Privacy Policy: ${data.agreePrivacy ? 'Yes' : 'No'}`);
  doc.text(`Acknowledged 6-month validity: ${data.ack6mo ? 'Yes' : 'No'}`);
  doc.moveDown(0.5);

  // Signature
  if (data.signatureData) {
    try {
      const sigBase64 = data.signatureData.replace(/^data:image\/\w+;base64,/, '');
      const sigBuffer = Buffer.from(sigBase64, 'base64');
      doc.fontSize(14).text('Signature');
      line();
      const sigWidth = 300;
      doc.image(sigBuffer, { fit: [sigWidth, 120] });
      doc.moveDown(0.5);
    } catch {
      // ignore
    }
  }

  // ID Images
  const frontBuf = await fetchImageBuffer(fileUrls.idFrontUrl);
  const backBuf = await fetchImageBuffer(fileUrls.idBackUrl);

  if (frontBuf || backBuf) {
    doc.addPage();
    doc.fontSize(14).text('ID Images');
    line();
    const maxW = 480,
      maxH = 360;
    if (frontBuf) {
      doc.fontSize(12).text('Front', { paragraphGap: 6 });
      doc.image(frontBuf, { fit: [maxW, maxH] });
      doc.moveDown(0.5);
    }
    if (backBuf) {
      doc.fontSize(12).text('Back', { paragraphGap: 6 });
      doc.image(backBuf, { fit: [maxW, maxH] });
      doc.moveDown(0.5);
    }
  }

  return await pdfToBuffer(doc);
}

// ---------- Main handler ----------
exports.handler = async (event) => {
  console.log('after-submit invoked');
  try {
    const { data, metadata, fileUrls } = parseSubmission(event);

    // 1) Append to Google Sheets
    const rows = [[
      new Date().toISOString(),
      metadata.id, metadata.form_name, metadata.page_url, metadata.ip, metadata.user_agent,
      data.firstName || '', data.lastName || '', data.email || '', data.phone || '',
      data.address1 || '', data.address2 || '', data.city || '', data.state || '', data.zip || '',
      data.permitNo || '', data.dob || '', data.issueDate || '', data.expDate || '',
      data.package || '', data.fiveHourSlot || '', data.permitSource || '', data.signHelp || '',
      fileUrls.idFrontUrl || '', fileUrls.idBackUrl || '',
      (data.signatureData ? 'Captured' : 'Missing'),
      data.agreeTOS ? 'Yes' : '', data.agreePrivacy ? 'Yes' : '', data.ack6mo ? 'Yes' : ''
    ]];
    const sheets = sheetsClient();
    const appendRes = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: RANGE,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: rows },
    });
    console.log('append status:', appendRes.status);

    // 2) Build PDF
    const pdfBuffer = await buildPdf({ data, fileUrls });

    // 3) Email via Resend
    const studentName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
    const subject = `New Student Registration: ${studentName || 'Unknown'}`;

    const emailRes = await resend.emails.send({
      from: 'Avian Forms <forms@aviandrivingschool.com>',
      to: ['info@aviandrivingschool.com'],
      cc: ['aviandrivingschool@gmail.com'],
      subject,
      html: `
        <p>You have a new student registration.</p>
        <p>
          <strong>Name:</strong> ${studentName || 'N/A'}<br/>
          <strong>Email:</strong> <a href="mailto:${data.email || ''}">${data.email || 'N/A'}</a><br/>
          <strong>Phone:</strong> ${formatPhone(data.phone) || 'N/A'}<br/>
          <strong>Permit #:</strong> ${data.permitNo || 'N/A'}<br/>
          <strong>Date of Birth:</strong> ${data.dob || 'N/A'}
        </p>
        ${(fileUrls.idFrontUrl || fileUrls.idBackUrl) ? `
        <p><strong>Uploaded IDs:</strong><br/>
          ${fileUrls.idFrontUrl ? `• <a href="${fileUrls.idFrontUrl}" target="_blank" rel="noopener">ID Front</a><br/>` : ``}
          ${fileUrls.idBackUrl  ? `• <a href="${fileUrls.idBackUrl}"  target="_blank" rel="noopener">ID Back</a><br/>`  : ``}
        </p>` : ``}
        <p>The PDF summary is attached. ID images are embedded inside the PDF.</p>
      `,
      attachments: [
        {
          filename: `Registration-${metadata.id || Date.now()}.pdf`,
          content: pdfBuffer.toString('base64'),
        },
      ],
    });

    console.log('email status:', emailRes && (emailRes.id || 'ok'));
    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    console.error('after-submit error:', err);
    return { statusCode: 200, body: 'Received (error logged).' };
  }
};