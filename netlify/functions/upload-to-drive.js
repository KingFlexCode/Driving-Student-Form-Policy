// netlify/functions/upload-to-drive.js
// Uploads base64 file data to Google Drive and returns share links.
const { google } = require('googleapis');

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

// expects JSON body: { filename, contentType, base64 } (base64 w/o dataURL prefix)
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
    const buffer = Buffer.from(base64, 'base64');

    // create file in target folder
    const createRes = await drive.files.create({
      requestBody: {
        name: filename,
        parents: [DRIVE_FOLDER_ID],
        mimeType: contentType,
      },
      media: { mimeType: contentType, body: buffer },
      fields: 'id,name'
    });

    const fileId = createRes.data.id;

    // Make link-viewable by anyone (optional; remove if you want private)
    await drive.permissions.create({
      fileId,
      requestBody: { role: 'reader', type: 'anyone' }
    });

    const { data } = await drive.files.get({
      fileId,
      fields: 'webViewLink,webContentLink'
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        id: fileId,
        webViewLink: data.webViewLink,
        webContentLink: data.webContentLink
      })
    };
  } catch (err) {
    console.error('upload-to-drive error:', err);
    return { statusCode: 500, body: 'Upload failed' };
  }
};
