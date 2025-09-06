// netlify/functions/after-submit.js
// 1) Append to Google Sheets  2) Generate PDF  3) Email PDF via Resend

const { google } = require('googleapis');
const PDFDocument = require('pdfkit');
const { Resend } = require('resend');

const SHEET_ID = process.env.SHEET_ID;
const SERVICE_ACCOUNT = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || '{}');
const RANGE = 'Form Responses!A1'; // change if your tab name differs
const resend = new Resend(process.env.RESEND_API_KEY);

// ---------------- Google Sheets client ----------------
function sheetsClient() {
  const jwt = new google.auth.JWT(
    SERVICE_ACCOUNT.client_email,
    null,
    SERVICE_ACCOUNT.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );
  return google.sheets({ version: 'v4', auth: jwt });
}

// ---------------- Payload parsing (robust) ----------------
function parseSubmission(event) {
  // Preview for debugging (remove later if you want)
  console.log('raw body preview:', (event.body || '').slice(0, 400));

  let obj = {};
  // Try JSON first
  try {
    obj = JSON.parse(event.body || '{}');
  } catch {
    // If not JSON, try url-encoded (fallback)
    try {
      const sp = new URLSearchParams(event.body || '');
      obj = Object.fromEntries(sp.entries());
    } catch {
      obj = {};
    }
  }

  // Netlify can send:
  // { payload: { data, files, id, created_at, ... } }
  // OR flat: { data, files, ... }  OR even all fields at root.
  const payload = obj.payload || obj || {};
  const dataRaw = payload.data || obj.data || obj || {};
  const files = payload.files || obj.files || [];

  // Normalize checkboxes (Netlify can send 'on'/'true' etc.)
  const normalizeBool = (v) =>
    typeof v === 'string' ? /^(on|true|1|yes)$/i.test(v) : !!v;

  const data = { ...dataRaw };
  ['agreeTOS', 'agreePrivacy', 'ack6mo'].forEach((k) => {
    if (k in data) data[k] = normalizeBool(data[k]);
  });

  const headers = event.headers || {};
  const metadata = {
    id: payload.id || '',
    created_at: payload.created_at || '',
    form_name: payload.form_name || '',
    page_url: payload.page_url || '',
    user_agent: headers['user-agent'] || headers['User-Agent'] || '',
    ip:
      headers['x-nf-client-connection-ip'] ||
      headers['client-ip'] ||
      headers['x-forwarded-for'] ||
      '',
  };

  // Files helper (Netlify uploads)
  const fileByName = (n) => {
    const f = files.find((x) => x.name === n);
    return f && f.url ? f.url : '';
  };

  const fileUrls = {
    idFrontUrl: data.idFrontUrl || fileByName('idFront') || '',
    idBackUrl: data.idBackUrl || fileByName('idBack') || '',
  };

  console.log('parsed submission data keys:', Object.keys(data));
  console.log('parsed file urls:', fileUrls);

  return { data, metadata, fileUrls };
}

// ---------------- PDF helpers ----------------
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
    if (!res.ok) return null;
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  } catch {
    return null;
  }
}

async function buildPdf({ data, metadata, fileUrls }) {
  const doc = new PDFDocument({ size: 'LETTER', margin: 50 });

  // Header
  doc.fontSize(18).text('Avian Driving School — Student Registration', { align: 'left' });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor('#666')
    .text(`Submitted: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}`)
    .text(`Submission ID: ${metadata.id}`)
    .text(`Form: ${metadata.form_name}`)
    .text(`Page URL: ${metadata.page_url}`)
    .text(`IP: ${metadata.ip}`)
    .text(`User Agent: ${metadata.user_agent}`);
  doc.moveDown(0.75).fillColor('#000');

  const rule = () => {
    doc.moveDown(0.35);
    doc.strokeColor('#ddd').moveTo(50, doc.y).lineTo(562, doc.y).stroke();
    doc.moveDown(0.35);
  };

  // Student Info
  doc.fontSize(14).text('Student Information'); rule();
  doc.fontSize(11);
  doc.text(`First Name: ${data.firstName || ''}`);
  doc.text(`Last Name: ${data.lastName || ''}`);
  doc.text(`Email: ${data.email || ''}`);
  doc.text(`Phone: ${data.phone || ''}`);
  doc.text(`Address 1: ${data.address1 || ''}`);
  doc.text(`Address 2: ${data.address2 || ''}`);
  doc.text(`City: ${data.city || ''}`);
  doc.text(`State: ${data.state || ''}`);
  doc.text(`ZIP: ${data.zip || ''}`);
  doc.moveDown(0.5);

  // Permit / License
  doc.fontSize(14).text('Permit / License'); rule();
  doc.fontSize(11);
  doc.text(`Permit/License #: ${data.permitNo || ''}`);
  doc.text(`Issue Date: ${data.issueDate || ''}`);
  doc.text(`Expiration Date: ${data.expDate || ''}`);
  doc.moveDown(0.5);

  // Services / Choices
  doc.fontSize(14).text('Service Selection'); rule();
  doc.fontSize(11);
  doc.text(`Package: ${data.package || ''}`);
  doc.text(`5-Hour Class Slot: ${data.fiveHourSlot || ''}`);
  doc.text(`Permit Source: ${data.permitSource || ''}`);
  doc.text(`Need help with signs?: ${data.signHelp || ''}`);
  doc.moveDown(0.5);

  // Agreements
  doc.fontSize(14).text('Agreements'); rule();
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
      doc.fontSize(14).text('Signature'); rule();
      doc.image(sigBuffer, { fit: [300, 120] });
      doc.moveDown(0.5);
    } catch { /* ignore */ }
  }

  // ID Images (new page)
  const frontBuf = await fetchImageBuffer(fileUrls.idFrontUrl);
  const backBuf  = await fetchImageBuffer(fileUrls.idBackUrl);

  if (frontBuf || backBuf) {
    doc.addPage();
    doc.fontSize(14).text('ID Images'); rule();
    doc.fontSize(10).fillColor('#666')
      .text('These are the images uploaded with the submission.', { paragraphGap: 8 })
      .fillColor('#000');

    const maxW = 480, maxH = 360;

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

// ---------------- Main handler ----------------
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
      data.permitNo || '', data.issueDate || '', data.expDate || '',
      data.package || '', data.fiveHourSlot || '', data.permitSource || '', data.signHelp || '',
      fileUrls.idFrontUrl || '', fileUrls.idBackUrl || '',
      (data.signatureData ? 'Captured' : 'Missing'),
      data.agreeTOS ? 'Yes' : 'No', data.agreePrivacy ? 'Yes' : 'No', data.ack6mo ? 'Yes' : 'No'
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
    const pdfBuffer = await buildPdf({ data, metadata, fileUrls });

    // 3) Email via Resend
    const studentName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
    const subject = `New Student Registration: ${studentName || metadata.id || ''}`;

    const emailRes = await resend.emails.send({
      from: 'Avian Forms <forms@aviandrivingschool.com>', // your verified domain
      to: ['info@aviandrivingschool.com'],
      cc: ['aviandrivingschool@gmail.com'],
      subject,
      html: `
        <p>You have a new student registration.</p>
        <p>
          <strong>Name:</strong> ${studentName || 'N/A'}<br/>
          <strong>Email:</strong> ${data.email || 'N/A'}<br/>
          <strong>Phone:</strong> ${data.phone || 'N/A'}
        </p>
        <p>The PDF summary is attached. ID images are embedded inside the PDF.</p>
      `,
      attachments: [
        {
          filename: `Registration-${metadata.id || Date.now()}.pdf`,
          content: pdfBuffer.toString('base64'),
          // contentType is optional; Resend detects, but you can include:
          // contentType: 'application/pdf',
        },
      ],
    });

    console.log('email status:', emailRes && (emailRes.id || 'ok'));

    // Always return 200 (Netlify treats the hook as handled)
    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    console.error('after-submit error:', err);
    // Still 200 so the submission isn't retried forever
    return { statusCode: 200, body: 'Received (error logged).' };
  }
};