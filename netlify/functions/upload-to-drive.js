// netlify/functions/upload-to-drive.js
const { google } = require('googleapis');
const { PassThrough } = require('stream');

const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID;
const SERVICE_ACCOUNT = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || '{}');

function driveClient() {
  const jwt = new google.auth.JWT(
    SERVICE_ACCOUNT.client_email,
    null,
    SERVICE_ACCOUNT.private_key,
    ['https://www.googleapis.com/auth/drive']
  );
  return google.drive({ version: 'v3', auth: jwt });
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
    if (!DRIVE_FOLDER_ID) {
      console.error('Missing DRIVE_FOLDER_ID env var');
      return { statusCode: 500, body: 'Server config error' };
    }

    const { filename, contentType, base64 } = JSON.parse(event.body || '{}');
    if (!filename || !contentType || !base64) {
      return { statusCode: 400, body: 'Missing fields' };
    }

    const drive = driveClient();

    // Convert base64 -> Buffer -> Readable stream
    const buffer = Buffer.from(base64, 'base64');
    const stream = new PassThrough();
    stream.end(buffer);

    // Create file in target folder (multipart upload expects a stream)
    const createRes = await drive.files.create({
      requestBody: {
        name: filename,
        parents: [DRIVE_FOLDER_ID],
        mimeType: contentType,
      },
      media: {
        mimeType: contentType,
        body: stream,
      },
      fields: 'id,name',
    });

    const fileId = createRes.data.id;

    // Anyone-with-link can view (optional)
    await drive.permissions.create({
      fileId,
      requestBody: { role: 'reader', type: 'anyone' },
    });

    const { data } = await drive.files.get({
      fileId,
      fields: 'webViewLink,webContentLink',
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        id: fileId,
        webViewLink: data.webViewLink,
        webContentLink: data.webContentLink,
      }),
    };
  } catch (err) {
    console.error('upload-to-drive error:', err);
    return { statusCode: 500, body: 'Upload failed' };
  }
};