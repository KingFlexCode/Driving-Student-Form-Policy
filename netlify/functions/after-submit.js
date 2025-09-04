import { google } from 'googleapis';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;      // optional if using SendGrid
const FROM_EMAIL = 'no-reply@aviandrivingschool.com';
const ADMIN_EMAIL = 'info@aviandrivingschool.com';

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

function parseSubmission(event) {
  const body = JSON.parse(event.body || '{}');
  const { payload } = body;
  return { data: payload?.data || {}, files: payload?.files || [] };
}

async function sendEmail({ to, subject, html }) {
  if (!SENDGRID_API_KEY) return; // skip if not set
  await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: FROM_EMAIL, name: 'Avian Driving School' },
      subject, content: [{ type: 'text/html', value: html }],
    }),
  });
}

export const handler = async (event) => {
  try {
    const isSubmissionEvent = event.headers['x-netlify-event'] === 'submission-created';
    if (!isSubmissionEvent) return { statusCode: 200, body: 'Not a submission event.' };

    const { data, files } = parseSubmission(event);

    const row = [
      new Date().toISOString(),
      data.firstName || '', data.lastName || '', data.email || '', data.phone || '',
      data.address1 || '', data.address2 || '', data.city || '', data.state || '', data.zip || '',
      data.permitNo || '', data.issueDate || '', data.expDate || '',
      data.package || '', data.fiveHourSlot || '', data.permitSource || '', data.signHelp || '',
      (files.find(f => f.name === 'idFront') || {}).url || '',
      (files.find(f => f.name === 'idBack')  || {}).url || '',
      (data.signatureData || '').slice(0,60) + (data.signatureData ? '…' : '')
    ];

    const sheets = sheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Form Responses!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    });

    await sendEmail({
      to: ADMIN_EMAIL,
      subject: 'New Student Registration – Avian Driving School',
      html: `
        <h2>New Registration</h2>
        <p><strong>${data.firstName || ''} ${data.lastName || ''}</strong></p>
        <p>${data.email || ''} · ${data.phone || ''}</p>
        <p>Package: $${data.package || ''} · 5-Hour: ${data.fiveHourSlot || ''}</p>
        <p>Permit#: ${data.permitNo || ''}</p>
        <p>ID Front: ${(files.find(f => f.name === 'idFront') || {}).url || ''}</p>
        <p>ID Back: ${(files.find(f => f.name === 'idBack') || {}).url || ''}</p>
      `,
    });

    if (data.email) {
      await sendEmail({
        to: data.email,
        subject: 'We received your registration – Avian Driving School',
        html: `
          <p>Hi ${data.firstName || 'there'},</p>
          <p>Thanks for registering! We’ll contact you to finalize scheduling.</p>
          <p>Reminder: purchases are valid for 6 months; unused lessons expire thereafter.</p>
          <p>— Avian Team · 718-215-4045</p>
        `,
      });
    }

    return { statusCode: 200, body: 'OK' };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: 'Error' };
  }
};
