// netlify/functions/after-submit.js
// Handles Netlify Forms webhook/event payload and appends a row to Google Sheets.
// Uses urls posted as hidden fields: idFrontUrl, idBackUrl (files go to Drive).

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

// Works for both event + webhook payloads
function parseSubmission(event) {
  try {
    const body = JSON.parse(event.body || '{}');
    const payload = body.payload || {};
    const data = payload.data || {};
    return { data };
  } catch (e) {
    console.error('parseSubmission error:', e);
    return { data: {} };
  }
}

exports.handler = async (event) => {
  try {
    console.log('after-submit invoked');

    const { data } = parseSubmission(event);

    // URLs created by upload-to-drive.js and injected as hidden inputs
    const frontUrl = data.idFrontUrl || '';
    const backUrl  = data.idBackUrl  || '';

    // Build row in the order your sheet expects
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
      frontUrl,                 // Drive link (front)
      backUrl,                  // Drive link (back)
      (data.signatureData || '').slice(0, 60) + (data.signatureData ? '…' : '')
    ];

    const sheets = sheetsClient();
    const range = 'Form Responses!A1'; // ensure this tab exists
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