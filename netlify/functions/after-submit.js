// netlify/functions/after-submit.js
// Robust parser for Netlify Form webhooks + Google Sheets + PDF + Resend

const { google } = require('googleapis');
const PDFDocument = require('pdfkit');
const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

const SHEET_ID = process.env.SHEET_ID;
const SERVICE_ACCOUNT = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || '{}');
const RANGE = 'Form Responses!A1';
const resend = new Resend(process.env.RESEND_API_KEY);

// ---------- helpers ----------
function sheetsClient() {
  const jwt = new google.auth.JWT(
    SERVICE_ACCOUNT.client_email,
    null,
    SERVICE_ACCOUNT.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );
  return google.sheets({ version: 'v4', auth: jwt });
}

function formatPhone(s) {
  const d = String(s || '').replace(/\D/g, '').slice(-10);
  if (d.length !== 10) return s || '';
  return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
}

/**
 * Parse the body regardless of how Netlify posts it:
 * - JSON: { payload: { data: {...}, files: [...] } }
 * - URL-encoded: payload=<json>, or raw k=v&k2=v2
 */
function robustParseBody(event) {
  const headers = event.headers || {};
  const ctype = (headers['content-type'] || headers['Content-Type'] || '').toLowerCase();
  const raw = event.body || '';

  // Log a tiny preview so we can debug exact format (visible in Function logs)
  try {
    console.log('after-submit content-type:', ctype);
    console.log('after-submit body preview:', raw.slice(0, 300));
  } catch {}

  let payload = null;

  // 1) Pure JSON body
  if (ctype.includes('application/json')) {
    try {
      const json = JSON.parse(raw);
      // Netlify usually wraps in { payload: {...} }
      if (json && typeof json === 'object') {
        if (json.payload) payload = json.payload;
        else payload = json; // fallback
      }
    } catch { /* fallthrough */ }
  }

  // 2) application/x-www-form-urlencoded (payload=<json> or key=value...)
  if (!payload && ctype.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams(raw);
    const possiblePayload = params.get('payload');
    if (possiblePayload) {
      try {
        payload = JSON.parse(possiblePayload);
      } catch { /* fallthrough */ }
    }
    // If no "payload" param, build a simple key/value object from params
    if (!payload) {
      const data = {};
      for (const [k, v] of params.entries()) data[k] = v;
      payload = { data, files: [] };
    }
  }

  // 3) Last-resort: body is literally "payload=<json>" without URL encoding
  if (!payload && raw.startsWith('payload=')) {
    try {
      payload = JSON.parse(decodeURIComponent(raw.slice('payload='.length)));
    } catch { /* fallthrough */ }
  }

  // Default safety
  if (!payload) payload = { data: {}, files: [] };

  const data = payload.data || {};
  const files = payload.files || [];

  const fileByName = (n) => {
    const f = files.find((x) => x.name === n);
    return f && f.url ? f.url : '';
    // Netlify also sometimes gives `file` or `mime_type`; we only need URL.
  };

  return {
    data: {
      firstName: data.firstName || data.firstname || '',
      lastName:  data.lastName  || data.lastname  || '',
      email:     data.email     || '',
      phone:     data.phone     || '',
      address1:  data.address1  || '',
      address2:  data.address2  || '',
      city:      data.city      || '',
      state:     data.state     || '',
      zip:       data.zip       || '',
      dob:       data.dob       || data.dateOfBirth || '',
      permitNo:  data.permitNo  || data.permit    || '',
      issueDate: data.issueDate || '',
      expDate:   data.expDate   || '',
      pkg:       data.package   || '',
      fiveHour:  data.fiveHourSlot || '',
      permitSrc: data.permitSource || '',
      signHelp:  data.signHelp  || '',
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

function pdfToBuffer(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.end();
  });
}

function getLogoPath() {
  return path.join(__dirname, '..', '..', 'assets', 'avian_logo.png');
}

async function buildPdf({ data, fileUrls }) {
  const doc = new PDFDocument({ size: 'LETTER', margin: 50 });

  const H1 = (t) => { doc.fontSize(20).text(t, { align: 'center' }); doc.moveDown(0.5); };
  const H2 = (t) => { doc.fontSize(14).text(t); line(); };
  const L  = (k, v='') => doc.fontSize(11).text(`${k}: ${v}`);
  const line = () => {
    doc.moveDown(0.35);
    doc.strokeColor('#cccccc').moveTo(50, doc.y).lineTo(562, doc.y).stroke();
    doc.moveDown(0.35);
  };

  // Logo
  try {
    const logoPath = getLogoPath();
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, (doc.page.width - 160) / 2, 40, { width: 160 });
      doc.moveDown(5);
    }
  } catch (e) {
    console.warn('Logo not found or failed to load:', e.message);
  }

  // Title
  H1('Student Information Sheet');

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

  // Signature
  if (data.signatureData) {
    try {
      const b64 = data.signatureData.replace(/^data:image\/\w+;base64,/, '');
      const buf = Buffer.from(b64, 'base64');
      H2('Signature');
      doc.image(buf, { fit: [300, 120] });
      doc.moveDown(0.5);
    } catch {}
  }

  // ID Images page (if any)
  const toBuf = async (url) => {
    if (!url) return null;
    const res = await fetch(url);
    if (!res.ok) return null;
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  };
  const frontBuf = await toBuf(fileUrls.idFrontUrl);
  const backBuf  = await toBuf(fileUrls.idBackUrl);

  if (frontBuf || backBuf) {
    doc.addPage();
    H2('ID Images');
    if (frontBuf) { doc.fontSize(12).text('Front', { paragraphGap: 6 }); doc.image(frontBuf, { fit: [480, 360] }); doc.moveDown(0.5); }
    if (backBuf)  { doc.fontSize(12).text('Back',  { paragraphGap: 6 }); doc.image(backBuf,  { fit: [480, 360] }); doc.moveDown(0.5); }
  }

  return await pdfToBuffer(doc);
}

exports.handler = async (event) => {
  console.log('after-submit invoked');
  try {
    const { data, fileUrls } = robustParseBody(event);

    // 1) Append to Google Sheets
    const sheets = sheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: RANGE,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[
        new Date().toISOString(),
        data.firstName, data.lastName, data.email, formatPhone(data.phone),
        data.address1, data.address2, data.city, data.state, data.zip,
        data.dob, data.permitNo, data.issueDate, data.expDate,
        data.pkg, data.fiveHour, data.permitSrc, data.signHelp,
        fileUrls.idFrontUrl, fileUrls.idBackUrl,
        data.signatureData ? 'Captured' : '',
        data.agreeTOS ? 'Yes' : 'No',
        data.agreePrivacy ? 'Yes' : 'No',
        data.ack6mo ? 'Yes' : 'No'
      ]]}
    });

    // 2) Build PDF
    const pdfBuffer = await buildPdf({ data, fileUrls });

    // 3) Email via Resend (rich summary)
    const studentName = `${data.firstName} ${data.lastName}`.trim();
    const emailHtml = `
      <p>You have a new student registration.</p>
      <p>
        <strong>Name:</strong> ${studentName || 'N/A'}<br/>
        <strong>Email:</strong> ${data.email ? `<a href="mailto:${data.email}">${data.email}</a>` : 'N/A'}<br/>
        <strong>Phone:</strong> ${formatPhone(data.phone) || 'N/A'}<br/>
        <strong>Permit #:</strong> ${data.permitNo || 'N/A'}<br/>
        <strong>Date of Birth:</strong> ${data.dob || 'N/A'}
      </p>
      <p>
        ${fileUrls.idFrontUrl ? `ID (Front): <a href="${fileUrls.idFrontUrl}">Download</a><br/>` : ''}
        ${fileUrls.idBackUrl  ? `ID (Back): <a href="${fileUrls.idBackUrl}">Download</a><br/>`  : ''}
      </p>
      <p>The PDF summary is attached.</p>
    `;

    await resend.emails.send({
      from: 'Avian Forms <forms@aviandrivingschool.com>',
      to: ['info@aviandrivingschool.com'],
      cc: ['aviandrivingschool@gmail.com'],
      subject: `New Student Registration: ${studentName || data.email || 'Unknown'}`,
      html: emailHtml,
      attachments: [{
        filename: `Registration-${Date.now()}.pdf`,
        content: pdfBuffer.toString('base64'),
      }],
    });

    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    console.error('after-submit error:', err);
    // keep 200 so Netlify marks the webhook handled
    return { statusCode: 200, body: 'Received (error logged).' };
  }
};