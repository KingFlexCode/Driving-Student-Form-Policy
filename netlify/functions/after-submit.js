// netlify/functions/after-submit.js (CommonJS)
const { google } = require('googleapis');

const SHEET_ID = process.env.SHEET_ID;
const SERVICE_ACCOUNT = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || '{}');

function sheetsClient() {
  const jwt = new google.auth.JWT(
    SERVICE_ACCOUNT.client_email,
    null,
    SERVICE_ACCOUNT.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );
  return google.sheets({ version: 'v4', auth: jwt });
}

// Works for both Netlify event + webhook payloads
function parseSubmission(event) {
  try {
    const body = JSON.parse(event.body || '{}');
    const payload = body.payload || {};
    const data = payload.data || {};
    const files = payload.files || [];
    return { data, files };
  } catch (e) {
    return { data: {}, files: [] };
  }
}

exports.handler = async (event) => {
  try {
    console.log('after-submit invoked');
    const { data, files } = parseSubmission(event);

    // Build row (adjust to your sheet columns)
    const row = [
      new Date().toISOString(),
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
      (files.find(f => f.name === 'idFront') || {}).url || '',
      (files.find(f => f.name === 'idBack')  || {}).url || '',
      (data.signatureData || '').slice(0, 60) + (data.signatureData ? '…' : '')
    ];

    // Append to "Form Responses" sheet (tab must exist)
    const sheets = sheetsClient();
    const range = 'Form Responses!A1';
    const res = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    });

    console.log('append status:', res.status || 'ok');
    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    console.error('after-submit error:', err);
    return { statusCode: 500, body: 'Error processing submission.' };
  }
};