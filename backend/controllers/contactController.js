const { sendEmail } = require('../utils/emailHelper');

const sendContactEmail = async (req, res, next) => {
  const { name, email, message, phone } = req.body;

  // Use authenticated user information if available
  const senderName = req.user?.name || name;
  const senderEmail = req.user?.email || email;

  if (!senderName || !senderEmail || !message) {
    return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
  }

  try {
    const recipient = process.env.SMTP_USER || process.env.EMAIL_USER || process.env.SMTP_FROM || 'vennapusaashok8@gmail.com';
    const isAuthUser = Boolean(req.user);

    const emailResult = await sendEmail({
      to: recipient,
      replyTo: senderEmail,
      subject: `New Support Request from ${senderName}${isAuthUser ? ` [User: ${req.user.role}]` : ''}`,
      text: `You have received a new contact support message on DarshanEase.

Name: ${senderName}
Email: ${senderEmail}
${phone ? `Phone: ${phone}\n` : ''}${isAuthUser ? `Account ID: ${req.user._id}\nRole: ${req.user.role}\n` : ''}
Message:
${message}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
          <h2 style="color: #ea580c; border-bottom: 2px solid #ea580c; padding-bottom: 8px;">New Contact Support Message</h2>
          <p><strong>Name:</strong> ${senderName}</p>
          <p><strong>Email:</strong> <a href="mailto:${senderEmail}">${senderEmail}</a></p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          ${isAuthUser ? `<p><strong>User ID:</strong> <code>${req.user._id}</code> (${req.user.role})</p>` : ''}
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Message:</strong></p>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #ea580c; font-size: 15px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
      `,
    });

    if (!emailResult.success) {
      console.warn('Email notification warning:', emailResult.error);
    }

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. Support will reply within 24 hours.'
    });
  } catch (error) {
    console.error('Error handling contact form submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message. Please try again later.'
    });
  }
};

module.exports = { sendContactEmail };
