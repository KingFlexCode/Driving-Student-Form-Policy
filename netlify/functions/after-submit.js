// netlify/functions/after-submit.js
// Requires env: SHEET_ID, GOOGLE_SERVICE_ACCOUNT, RESEND_API_KEY
// zisi bundler + included_files: ["assets/avian_logo.png"]

// Convert any submitted value into a Sheets-friendly cell
const MAX_CELL_LEN = 48000; // under Sheets' ~50k char limit
function toCell(key, v) {
  if (v == null) return '';
  // Arrays -> comma-joined
  if (Array.isArray(v)) return v.map(x => toCell(key, x)).join(', ').slice(0, MAX_CELL_LEN);

  // Objects -> file url if present, else JSON
  if (typeof v === 'object') {
    if (v.url && typeof v.url === 'string') return v.url.slice(0, MAX_CELL_LEN);
    try { return JSON.stringify(v).slice(0, MAX_CELL_LEN); }
    catch { return String(v); }
  }

  // Enormous data URIs (e.g., signatureData) -> short marker
  if (typeof v === 'string' && v.startsWith('data:')) {
    return `data-uri(len=${v.length})`;
  }

  return String(v).slice(0, MAX_CELL_LEN);
}
const { google } = require('googleapis');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  console.log('[after-submit] start', { hasBody: !!event.body, len: event.body?.length });

  try {
    // -------- 1) Parse Netlify webhook payload (or raw JSON) ----------
    const body = JSON.parse(event.body || '{}');
    const payload = body.payload || body || {};
    const data = payload.data || {};
    const files = payload.files || [];
    console.log('[after-submit] parsed keys:', Object.keys(data));

    // -------- 2) Resolve core fields (tolerant to name styles) --------
    const pick = (obj, ...cands) => {
      for (const c of cands) if (obj[c] != null && String(obj[c]).trim() !== '') return String(obj[c]).trim();
      const keys = Object.keys(obj);
      for (const c of cands) {
        const norm = c.toLowerCase().replace(/[\s_-]/g,'');
        const hit = keys.find(k => k.toLowerCase().replace(/[\s_-]/g,'') === norm);
        if (hit && String(obj[hit]).trim() !== '') return String(obj[hit]).trim();
      }
      return '';
    };

    const core = {
      firstName: pick(data,'firstName','First Name','first-name','first_name','first'),
      lastName:  pick(data,'lastName','Last Name','last-name','last_name','last'),
      email:     pick(data,'email','Email','studentEmail','contactEmail'),
      phone:     pick(data,'phone','Phone','phoneNumber','Phone Number'),
      permit:    pick(data,'permit','permitNumber','Permit Number','licenseNumber','License Number')
    };
    let dob = pick(data,'dob','DOB','dateOfBirth','Date of Birth','birthdate','Birth Date');
    if (!dob) {
      const m = pick(data,'dobMonth','DOB Month','birthMonth','Birth Month');
      const d = pick(data,'dobDay','DOB Day','birthDay','Birth Day');
      const y = pick(data,'dobYear','DOB Year','birthYear','Birth Year');
      if (y && m && d) dob = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    }
    core.dob = dob;
    console.log('[after-submit] core', core);

    // -------- 3) Build PDF (robust; images optional) ------------------
    const buildPdf = async () => new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'LETTER', margin: 36 });
        const chunks = [];
        doc.on('data', c => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        try {
          const logoPath = path.join(__dirname, '..', 'assets', 'avian_logo.png');
          if (fs.existsSync(logoPath)) doc.image(logoPath, 36, 36, { width: 110 });
        } catch (_) {}
        doc.fontSize(18).text('Student Information Sheet', 160, 40);

        doc.moveDown().fontSize(11);
        const line = (label, val) => { doc.font('Helvetica-Bold').text(label + ': ', { continued: true }); doc.font('Helvetica').text(val || 'N/A'); };

        doc.moveDown(0.5).font('Helvetica-Bold').text('Student Information', { underline: true }).font('Helvetica');
        line('First Name', core.firstName);
        line('Last Name',  core.lastName);
        line('Email',      core.email);
        line('Phone',      core.phone);
        line('Permit / License #', core.permit);
        line('Date of Birth', core.dob);

        doc.moveDown().font('Helvetica-Bold').text('All Submitted Fields', { underline: true }).font('Helvetica');
        Object.keys(data).forEach(k => { doc.font('Helvetica-Bold').text(k + ': ', { continued: true }); doc.font('Helvetica').text(String(data[k])); });

        // (Optional) ID images from Netlify uploads
        const findFile = (...needles) => (files.find(f => {
          const n = (f.name || '').toLowerCase(); return needles.some(nd => n.includes(nd));
        }) || null);

        const front = findFile('idfront','frontid','id front');
        const back  = findFile('idback','backid','id back');
        const fetchBuffer = async (url) => {
          const r = await fetch(url); if (!r.ok) throw new Error('fetch ' + url + ' ' + r.status);
          const ab = await r.arrayBuffer(); return Buffer.from(ab);
        };

        if (front || back) {
          doc.addPage().font('Helvetica-Bold').fontSize(14).text('Identification Images').fontSize(11).font('Helvetica');
          if (front) try { const b = await fetchBuffer(front.url); doc.text('Front', { underline: true }); doc.image(b, { fit: [520, 360] }); } catch { doc.text('Front: <unable to load>'); }
          if (back)  try { const b = await fetchBuffer(back.url);  doc.text('Back',  { underline: true }); doc.image(b, { fit: [520, 360] }); } catch { doc.text('Back: <unable to load>'); }
        }

        doc.end();
      } catch (e) { reject(e); }
    });

    const pdfBuffer = await buildPdf();
    console.log('[after-submit] PDF built', { bytes: pdfBuffer.length });

    // -------- 4) Append ALL fields to Google Sheet --------------------
    const svc = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || '{}');
    if (!svc.client_email || !svc.private_key) throw new Error('GOOGLE_SERVICE_ACCOUNT missing client_email/private_key');
    const auth = new google.auth.JWT(svc.client_email, null, svc.private_key, ['https://www.googleapis.com/auth/spreadsheets']);
    const sheets = google.sheets({ version: 'v4', auth });

    const tabName = 'Form Responses'; // change if your tab is named differently
    const headerResp = await sheets.spreadsheets.values.get({ spreadsheetId: process.env.SHEET_ID, range: `${tabName}!1:1` });
    let header = (headerResp.data.values && headerResp.data.values[0]) || [];
    if (!header.length) header = ['timestamp'];

    const keys = Object.keys(data);
    for (const k of keys) if (!header.includes(k)) header.push(k);

    const needHeaderUpdate = !headerResp.data.values || header.length !== (headerResp.data.values[0] || []).length;
    if (needHeaderUpdate) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.SHEET_ID,
        range: `${tabName}!1:1`,
        valueInputOption: 'RAW',
        requestBody: { values: [header] },
      });
      console.log('[after-submit] header updated:', header);
    }
    const row = header.map(h =>
      h === 'timestamp' ? new Date().toISOString() : toCell(h, dataObj[h]));
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SHEET_ID,
      range: `${tabName}!A:A`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    });
    console.log('[after-submit] appended row OK');

    // -------- 5) Email via Resend ------------------------------------
    const subject = `New Student Registration${(core.firstName||core.lastName)?` – ${core.firstName||''} ${core.lastName||''}`:''}`;
    const text =
`You have a new student registration.

Name: ${core.firstName || 'N/A'} ${core.lastName || 'N/A'}
Email: ${core.email || 'N/A'}
Phone: ${core.phone || 'N/A'}
Permit #: ${core.permit || 'N/A'}
Date of Birth: ${core.dob || 'N/A'}

The PDF summary is attached. ID images are embedded inside the PDF.`;

    const emailResp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Avian Forms <forms@aviandrivingschool.com>', // must be verified in Resend
        to: ['info@aviandrivingschool.com'],
        subject, text,
        attachments: [{ filename: `Registration-${Date.now()}.pdf`, content: pdfBuffer.toString('base64') }],
        // cc: core.email ? [core.email] : undefined,
      }),
    });

    if (!emailResp.ok) {
      const t = await emailResp.text();
      throw new Error(`Resend ${emailResp.status}: ${t}`);
    }
    console.log('[after-submit] email sent OK');

    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    console.error('[after-submit] ERROR:', err);
    // Keep 500 so you can see failures in Netlify logs
    return { statusCode: 500, body: String(err && err.message ? err.message : err) };
  }
};
