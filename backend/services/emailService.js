/**
 * DarshanEase — Email Service
 * Renders branded, responsive HTML templates for transactional emails.
 */

const { sendEmail } = require('../utils/emailHelper');

class EmailService {
  /**
   * Send branded 6-digit OTP verification email.
   */
  async sendOtpEmail(toEmail, otp) {
    const subject = 'Your DarshanEase Verification Code';

    const text = `Hello,

Your DarshanEase verification code is:

${otp}

This OTP is valid for 5 minutes.

For your security, do not share this OTP with anyone.

If you did not request this code, you can safely ignore this email.

Regards,
DarshanEase Team`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DarshanEase Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); border: 1px solid #fed7aa;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); padding: 32px 24px; text-align: center;">
              <div style="font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: 1px; margin-bottom: 6px;">
                🙏 DarshanEase
              </div>
              <div style="font-size: 13px; color: #ffedd5; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">
                Sacred Pilgrimage & Darshan Booking
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 28px;">
              <h2 style="color: #1e293b; font-size: 20px; font-weight: 700; margin: 0 0 16px 0;">
                Hello Devotee,
              </h2>
              <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Your one-time verification code to access your DarshanEase account is:
              </p>

              <!-- 6-Digit OTP Box -->
              <div style="text-align: center; margin: 32px 0;">
                <span style="display: inline-block; font-family: monospace, Courier, sans-serif; font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #c2410c; background: #fff7ed; padding: 14px 28px 14px 40px; border-radius: 12px; border: 2px dashed #f97316; box-shadow: 0 2px 8px rgba(234, 88, 12, 0.1);">
                  ${otp}
                </span>
              </div>

              <div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px;">
                <p style="color: #854d0e; font-size: 13px; line-height: 1.5; margin: 0;">
                  ⏱️ <strong>Valid for 5 minutes.</strong> For your security, do not share this OTP with anyone.
                </p>
              </div>

              <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0 0 24px 0;">
                If you did not request this code, you can safely ignore this email. No account changes have been made.
              </p>

              <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 28px 0;" />

              <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0;">
                Regards,<br />
                <strong style="color: #475569;">DarshanEase Support Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #f1f5f9;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} DarshanEase. All rights reserved.<br />
                Empowering spiritual pilgrimages across India.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    return await sendEmail({
      to: toEmail,
      subject,
      text,
      html
    });
  }
}

module.exports = new EmailService();
