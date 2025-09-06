exports.handler = async () => {
  try {
    const key = process.env.RESEND_API_KEY || '';
    const keyPreview = key ? key.slice(0, 7) + '…' : '(missing)';

    console.log('Debug: RESEND_API_KEY present?', !!key, 'preview:', keyPreview);

    if (!key) {
      return { statusCode: 200, body: 'Missing RESEND_API_KEY' };
    }

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Avian Forms <forms@aviandrivingschool.com>',
        to: ['info@aviandrivingschool.com'],
        subject: 'Debug Resend test',
        text: 'If you see this, Netlify → Resend is working.',
      }),
    });

    const text = await resp.text();
    console.log('Resend response:', resp.status, text);

    return {
      statusCode: resp.status,
      body: text,
    };
  } catch (err) {
    console.error('debug-resend error:', err);
    return { statusCode: 500, body: 'Error: ' + err.message };
  }
};