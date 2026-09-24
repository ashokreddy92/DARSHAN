const nodemailer = require('nodemailer');

const getSmtpConfig = () => {
  const user = (process.env.SMTP_USER || process.env.EMAIL_USER || '').trim();
  const pass = (process.env.SMTP_PASSWORD || process.env.SMTP_PASS || process.env.EMAIL_PASS || '').replace(/\s+/g, '');
  const host = (process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com').trim();
  const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT, 10) || 587;
  
  let isSecure;
  if (process.env.SMTP_SECURE !== undefined) {
    isSecure = process.env.SMTP_SECURE === 'true';
  } else if (process.env.EMAIL_SECURE !== undefined) {
    isSecure = process.env.EMAIL_SECURE === 'true';
  } else {
    isSecure = port === 465;
  }

  const rawFrom = (process.env.SMTP_FROM || process.env.EMAIL_FROM || user || '').trim();
  const from = rawFrom.includes('<')
    ? rawFrom
    : `"DarshanEase Support" <${rawFrom || user}>`;

  return { user, pass, host, port, secure: isSecure, from };
};

const sendViaResend = async ({ to, subject, html, text }) => {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;

  const sender = process.env.RESEND_FROM?.trim() || 'DarshanEase <onboarding@resend.dev>';
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: sender,
        to: Array.isArray(to) ? to : [to],
        subject,
        html: html || `<p>${text}</p>`,
        text: text || '',
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.warn('⚠️ [Resend HTTP API] Error:', data.message || response.statusText);
      return null;
    }

    console.log('✅ Email sent successfully via Resend HTTP API (Port 443):', data.id);
    return { success: true, messageId: data.id, transport: 'Resend HTTP API (Port 443)' };
  } catch (err) {
    console.warn('⚠️ [Resend HTTP API] Request failed:', err.message);
    return null;
  }
};

const sendEmail = async (options = {}) => {
  const to = options.to || options.email;
  const { subject, text, html, replyTo } = options;

  // 1. First priority: Try HTTP API (Resend) if configured (works seamlessly on Render Free Tier via HTTPS Port 443)
  const resendResult = await sendViaResend({ to, subject, html, text });
  if (resendResult && resendResult.success) {
    return resendResult;
  }

  const config = getSmtpConfig();

  if (!config.user || !config.pass) {
    console.warn(
      '⚠️ [Email Notification] SMTP_USER/EMAIL_USER or SMTP_PASSWORD/EMAIL_PASS missing in environment. Simulating email.'
    );
    console.log(`✉️ [Simulated Email] To: ${to} | Subject: ${subject}`);
    return {
      success: true,
      simulated: true,
      message: 'Email credentials not configured; simulated email logged.'
    };
  }

  const mailOptions = {
    from: config.from,
    to,
    subject,
    text,
    html,
    ...(replyTo && { replyTo }),
  };

  // Primary transport configuration
  const transportConfigsToTry = [
    {
      name: `Primary SMTP (${config.host}:${config.port}, secure: ${config.secure})`,
      options: {
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 7000,
        greetingTimeout: 7000,
        socketTimeout: 10000,
      }
    }
  ];

  // If host is Gmail, provide alternative port/service fallbacks in case the host environment (e.g. Render) filters port 587 or 465
  if (config.host.toLowerCase().includes('gmail')) {
    if (config.port === 587) {
      transportConfigsToTry.push({
        name: 'Gmail Port 465 (SSL/TLS Fallback)',
        options: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: { user: config.user, pass: config.pass },
          tls: { rejectUnauthorized: false },
          connectionTimeout: 7000,
          greetingTimeout: 7000,
          socketTimeout: 10000,
        }
      });
    } else if (config.port === 465) {
      transportConfigsToTry.push({
        name: 'Gmail Port 587 (STARTTLS Fallback)',
        options: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: { user: config.user, pass: config.pass },
          tls: { rejectUnauthorized: false },
          connectionTimeout: 7000,
          greetingTimeout: 7000,
          socketTimeout: 10000,
        }
      });
    }

    // Built-in Gmail service configuration as a final fallback
    transportConfigsToTry.push({
      name: 'Nodemailer Gmail Service Fallback',
      options: {
        service: 'gmail',
        auth: { user: config.user, pass: config.pass },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 7000,
        greetingTimeout: 7000,
        socketTimeout: 10000,
      }
    });
  }

  let lastError = null;

  for (const transportAttempt of transportConfigsToTry) {
    try {
      const transporter = nodemailer.createTransport(transportAttempt.options);
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully via ${transportAttempt.name}:`, info.messageId);
      return { success: true, messageId: info.messageId, transport: transportAttempt.name };
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ [${transportAttempt.name}] Delivery failed:`, error.message);
    }
  }

  console.error('❌ All SMTP delivery attempts failed:', lastError ? lastError.message : 'Unknown error');
  console.log(`✉️ [Fallback Email Output] To: ${to} | Subject: ${subject}`);

  return {
    success: false,
    simulated: true,
    error: lastError ? lastError.message : 'SMTP connection failed',
    note: 'SMTP delivery failed on all attempted configurations; logged email to console.'
  };
};

module.exports = { sendEmail, getSmtpConfig };
