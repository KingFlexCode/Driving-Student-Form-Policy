// netlify/functions/after-submit.js
// Appends full submission data + metadata to Google Sheets

const { google } = require('googleapis');

const SHEET_ID = process.env.SHEET_ID;
const SERVICE_ACCOUNT = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || '{}');
const RANGE = 'Form Responses!A1'; // change if your tab has a different name

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

function parseSubmission(event) {
  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch {}
  const payload = body.payload || {};
  const data = payload.data || {};
  const files = payload.files || [];
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

  // Netlify stores uploaded files and passes an array like:
  // [{ name: 'idFront', url: 'https://...'}, { name: 'idBack', url: 'https://...'}]
  const fileByName = (n) => {
    const f = files.find((x) => x.name === n);
    return f && f.url ? f.url : '';
  };

  return { data, metadata, fileUrls: { idFrontUrl: fileByName('idFront'), idBackUrl: fileByName('idBack') } };
}

exports.handler = async (event) => {
  console.log('after-submit invoked');

  try {
    const { data, metadata, fileUrls } = parseSubmission(event);

    // Column order for your sheet (edit/extend as you like)
    // TIP: Make row 1 of your sheet these exact headers to keep things tidy.
    // Timestamp | Submission ID | Form Name | Page URL | IP | User Agent |
    // First Name | Last Name | Email | Phone |
    // Address1 | Address2 | City | State | Zip |
    // Permit No | Issue Date | Exp Date |
    // Package | Five Hour Slot | Permit Source | Sign Help |
    // ID Front URL | ID Back URL | Signature (preview) |
    // Agree TOS | Agree Privacy | Acknowledge 6mo

    const signaturePreview = (data.signatureData || '').slice(0, 80) + (data.signatureData ? '…' : '');

    const row = [
      new Date().toISOString(),
      metadata.id,
      metadata.form_name,
      metadata.page_url,
      metadata.ip,
      metadata.user_agent,

      data.firstName || '',
      data.lastName || '',
      data.email || '',
      data.phone || '',

      data.address1 || '',
      data.address2 || '',
      data.city || '',
      data.state || '',
      data.zip || '',

      data.permitNo || '',
      data.issueDate || '',
      data.expDate || '',

      data.package || '',
      data.fiveHourSlot || '',
      data.permitSource || '',
      data.signHelp || '',

      fileUrls.idFrontUrl || '',
      fileUrls.idBackUrl || '',
      signaturePreview,

      data.agreeTOS ? 'Yes' : '',
      data.agreePrivacy ? 'Yes' : '',
      data.ack6mo ? 'Yes' : '',
    ];

    const sheets = sheetsClient();
    const res = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: RANGE,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    });

    console.log('append status:', res.status);
    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    console.error('after-submit error:', err);
    return { statusCode: 500, body: 'Error processing submission.' };
  }
};