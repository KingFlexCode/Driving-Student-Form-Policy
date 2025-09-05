// netlify/functions/after-submit.js
// Appends Netlify Form submissions to Google Sheets, including file URLs from Netlify storage.
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

// Works for both event + webhook payloads (Netlify sends body.payload.{data,files})
function parseSubmission(event) {
  try {
    const body = JSON.parse(event.body || '{}');
    const payload = body.payload || {};
    return {
      data: payload.data || {},
      files: Array.isArray(payload.files) ? payload.files : [],
    };
  } catch (e) {
    console.error('parseSubmission error:', e);
    return { data: {}, files: [] };
  }
}

exports.handler = async (event) => {
  try {
    console.log('after-submit invoked');

    const { data, files } = parseSubmission(event);

    // Find Netlify-hosted file URLs by input name:
    const front = files.find(f => f.name === 'idFront');
    const back  = files.find(f => f.name === 'idBack');
    const frontUrl = front?.url || '';
    const backUrl  = back?.url  || '';

    // Build row (match your sheet column order)
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
      frontUrl,                          // Netlify file URL (front)
      backUrl,                           // Netlify file URL (back)
      (data.signatureData || '').slice(0, 60) + (data.signatureData ? '…' : '')
    ];

    const sheets = sheetsClient();
    const range = 'Form Responses!A1'; // tab must be named exactly this
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
