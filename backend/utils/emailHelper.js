const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html, replyTo }) => {
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.replace(/\s+/g, '');

  if (!emailUser || !emailPass) {
    console.warn(
      '⚠️ [Email Notification] EMAIL_USER or EMAIL_PASS is missing in environment variables. Please configure SMTP credentials to send live emails.'
    );
    console.log(`✉️ [Simulated Email] To: ${to} | Subject: ${subject}`);
    return {
      success: true,
      simulated: true,
      message: 'Email credentials not configured; simulated email logged to console.'
    };
  }

  try {
    let transportConfig;

    if (process.env.EMAIL_HOST) {
      // Custom SMTP server configuration
      const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
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
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
      };
    } else {
      // Default: Gmail SMTP service
      transportConfig = {
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
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
    console.error('❌ Error sending email via SMTP:', error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };
