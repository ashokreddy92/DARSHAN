const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html, replyTo }) => {
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.replace(/\s+/g, '');

  if (!emailUser || !emailPass) {
    console.warn(
      '⚠️ [Email Notification] EMAIL_USER or EMAIL_PASS missing in environment. Simulating email.'
    );
    console.log(`✉️ [Simulated Email] To: ${to} | Subject: ${subject}`);
    return {
      success: true,
      simulated: true,
      message: 'Email credentials not configured; simulated email logged.'
    };
  }

  try {
    let transportConfig;

    if (process.env.EMAIL_HOST) {
      const port = parseInt(process.env.EMAIL_PORT, 10) || 465;
      const isSecure = process.env.EMAIL_SECURE ? process.env.EMAIL_SECURE === 'true' : port === 465;

      transportConfig = {
        host: process.env.EMAIL_HOST,
        port: port,
        secure: isSecure,
        auth: {
          user: emailUser,
          pass: emailPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 8000,
      };
    } else {
      transportConfig = {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: emailUser,
          pass: emailPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 8000,
      };
    }

    const transporter = nodemailer.createTransport(transportConfig);

    const mailOptions = {
      from: `"DarshanEase Support" <${emailUser}>`,
      to,
      subject,
      text,
      html,
      ...(replyTo && { replyTo }),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully via SMTP:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.warn('⚠️ SMTP Email Timeout/Error:', error.message);
    console.log(`✉️ [Fallback Email Output] To: ${to} | Subject: ${subject}`);
    return {
      success: true,
      simulated: true,
      error: error.message,
      note: 'SMTP connection timed out; logged email to console.'
    };
  }
};

module.exports = { sendEmail };
