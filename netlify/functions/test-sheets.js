// netlify/functions/test-sheets.js
const { google } = require('googleapis');

exports.handler = async () => {
  try {
    const SHEET_ID = process.env.SHEET_ID;
    const svc = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || '{}');
    if (!SHEET_ID || !svc.client_email || !svc.private_key) {
      return { statusCode: 200, body: 'Missing SHEET_ID or GOOGLE_SERVICE_ACCOUNT' };
    }

    const jwt = new google.auth.JWT(
      svc.client_email,
      null,
      svc.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    const sheets = google.sheets({ version: 'v4', auth: jwt });

    const rows = [[new Date().toISOString(), 'NETLIFY TEST', 'Hello from test-sheets']];
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Form Responses!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: rows },
    });

    return { statusCode: 200, body: 'Appended test row to Form Responses' };
  } catch (e) {
    return { statusCode: 500, body: 'Sheets error: ' + e.message };
  }
};
