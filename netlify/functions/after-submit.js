// netlify/functions/after-submit.js
import { google } from 'googleapis';

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

// Normalize submission from either:
// A) Netlify Event: header x-netlify-event === 'submission-created' (body: { payload: {...} })
// B) Form Webhook: standard Netlify POST (body: { payload: {...} })
function parseSubmission(event) {
  try {
    const body = JSON.parse(event.body || '{}');
    // Both event + webhook use body.payload
    const payload = body.payload || {};
    const data = payload.data || {};
    const files = payload.files || []; // array of { name, url, ... } when files present
    return { data, files, raw: body };
  } catch (e) {
    return { data: {}, files: [], raw: {} };
  }
}

export const handler = async (event) => {
  try {
    console.log('after-submit invoked. headers:', JSON.stringify(event.headers || {}));
    const { data, files } = parseSubmission(event);

    // Quick sanity log
    console.log('parsed fields:', Object.keys(data));
    console.log('files meta:', files);

    // Build row (adjust column order to match your sheet)
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

    // Append to "Form Responses" sheet
    const sheets = sheetsClient();
    const range = 'Form Responses!A1'; // make sure this tab exists
    const res = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    });

    console.log('append result:', res.status, res.statusText);
    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    console.error('after-submit error:', err);
    return { statusCode: 500, body: 'Error processing submission.' };
  }
};
