const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html, replyTo }) => {
  // If BREVO_API_KEY is present, send email via Brevo HTTP API (bypasses Render SMTP port blocking)
  if (process.env.BREVO_API_KEY) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'DarshanEase Support', email: process.env.EMAIL_USER || 'vennapusaashok8@gmail.com' },
          to: [{ email: to }],
          subject: subject,
          textContent: text,
          htmlContent: html,
          ...(replyTo && { replyTo: { email: replyTo } })
        })
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Email sent via Brevo HTTP API:', data.messageId);
        return { success: true, messageId: data.messageId };
      } else {
        console.error('Brevo API error:', data);
        return { success: false, error: data.message || 'Brevo API error' };
      }
    } catch (error) {
      console.error('Error sending email via Brevo:', error);
      return { success: false, error: error.message };
    }
  }

  // Standard SMTP (e.g. Gmail App Password)
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.replace(/\s+/g, '');

  if (!emailUser || !emailPass) {
    console.warn(
      '⚠️ [Email Notification] EMAIL_USER or EMAIL_PASS is missing in backend/.env. Please configure a Gmail App Password to send live emails.'
    );
    console.log(`✉️ [Simulated Email] To: ${to} | Subject: ${subject}`);
    return {
      success: true,
      simulated: true,
      message: 'Email credentials not configured; message logged to server console in dev mode.'
    };
  }

  try {
    const isSecure = process.env.EMAIL_PORT === '465' || !process.env.EMAIL_PORT;
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || (!process.env.EMAIL_HOST ? 'gmail' : undefined),
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 465,
      secure: isSecure,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const mailOptions = {
      from: `"DarshanEase Support" <${emailUser}>`,
      to,
      subject,
      text,
      html,
      ...(replyTo && { replyTo }),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email via SMTP:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };
