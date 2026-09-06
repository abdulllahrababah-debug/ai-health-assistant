const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendPasswordResetEmail(toEmail, resetToken, userName) {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;
  const mailOptions = {
    from: `"AI Health Assistant" <${process.env.EMAIL_USER || 'support@health.ai'}>`,
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

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('[EmailService Mock Mode] Reset link for ' + toEmail + ': ' + resetUrl);
    return { mock: true, resetUrl };
  }

  return await transporter.sendMail(mailOptions);
}

module.exports = { sendPasswordResetEmail };