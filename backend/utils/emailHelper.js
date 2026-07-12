const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html, replyTo }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER?.trim(),
        pass: process.env.EMAIL_PASS?.replace(/\s+/g, ''),
      },
    });

    const mailOptions = {
      from: `"DarshanEase Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
      ...(replyTo && { replyTo }),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };
