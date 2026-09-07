const nodemailer = require('nodemailer');

function createTransporter() {
  const user = (process.env.EMAIL_USER || '').trim();
  // Strip any accidental spaces from Google 16-char App Password (e.g. "abcd efgh ijkl mnop" -> "abcdefghijklmnop")
  const pass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');

  if (!user || !pass) {
    return null;
  }

  if (process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: { user, pass },
      connectionTimeout: 10000,
    });
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

async function sendPasswordResetEmail(toEmail, resetToken, userName) {
  const clientUrl = process.env.CLIENT_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000';
  const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;
  const mailOptions = {
    from: `"AI Health Assistant" <${process.env.EMAIL_FROM || process.env.EMAIL_USER || 'support@health.ai'}>`,
    to: toEmail,
    subject: 'إعادة تعيين كلمة المرور - AI Health Assistant',
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 22px;">🏥 AI Health Assistant</h1>
        </div>
        <div style="background: white; padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin-top: 0;">مرحباً ${userName || 'بك'}،</h2>
          <p style="color: #4b5563; line-height: 1.7;">تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك على منصة المساعد الصحي الذكي.</p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetUrl}" style="background: #4f46e5; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: bold; display: inline-block;">
              إعادة تعيين كلمة المرور
            </a>
          </div>
          <p style="color: #6b7280; font-size: 13px;">⏱️ هذا الرابط صالح لمدة <strong>ساعة واحدة</strong> فقط.</p>
          <p style="color: #9ca3af; font-size: 12px;">إذا لم تطلب هذا التغيير، يمكنك تجاهل هذا البريد بأمان ولن يتم تغيير شيء.</p>
        </div>
      </div>
    `,
  };

  const transporter = createTransporter();
  if (!transporter) {
    console.log('[EmailService] EMAIL_USER or EMAIL_PASS not set. Falling back to direct link mode for ' + toEmail);
    return { mock: true, resetUrl };
  }

  console.log(`[EmailService] Attempting to send reset email to ${toEmail}...`);
  const info = await transporter.sendMail(mailOptions);
  console.log(`[EmailService] Email sent successfully: ${info.messageId}`);
  return { success: true, messageId: info.messageId, resetUrl };
}

module.exports = { sendPasswordResetEmail };