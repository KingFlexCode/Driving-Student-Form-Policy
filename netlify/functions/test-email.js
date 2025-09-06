const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async () => {
  try {
    const out = await resend.emails.send({
      from: 'Avian Forms <forms@aviandrivingschool.com>',
      to: ['info@aviandrivingschool.com'],
      cc: ['aviandrivingschool@gmail.com'],
      subject: 'Test email from Netlify + Resend',
      text: 'If you received this, your domain + API setup is correct.',
    });
    console.log('test email id:', out.id);
    return { statusCode: 200, body: 'Sent' };
  } catch (e) {
    console.error('test-email error:', e);
    return { statusCode: 500, body: 'Error sending test' };
  }
};

