const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { sendPasswordResetEmail } = require('../services/emailService');

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'البريد الإلكتروني مطلوب' });

    const [rows] = await pool.query('SELECT id, full_name, email FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.json({ message: 'إذا كان هذا البريد مسجلاً، فقد تم إرسال رابط الاسترداد إليه.' });
    }

    const user = rows[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [resetToken, expires, user.id]
    );

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

    let emailSent = false;
    let emailErrorMessage = null;

    try {
      const emailResult = await sendPasswordResetEmail(user.email, resetToken, user.full_name);
      if (emailResult && !emailResult.mock) {
        emailSent = true;
      }
    } catch (emailErr) {
      console.error('Email send error:', emailErr.message);
      emailErrorMessage = emailErr.message;
    }

    if (emailSent) {
      return res.json({
        success: true,
        emailSent: true,
        message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح! يرجى تفقد صندوق الوارد أو مجلد الرسائل غير المرغوب فيها (Spam).',
      });
    }

    // If email failed or SMTP not configured: provide direct link
    return res.json({
      success: true,
      emailSent: false,
      message: emailErrorMessage
        ? `تعذر تسليم الإيميل عبر مزود البريد (${emailErrorMessage}). يمكنك المتابعة عبر رابط الاسترداد المباشر أدناه:`
        : 'تم إنشاء رابط استرداد كلمة المرور بنجاح. يمكنك المتابعة بالضغط على الرابط أدناه:',
      mockLink: resetUrl,
      isMock: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'حدث خطأ في الخادم أثناء معالجة الطلب' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'الرمز وكلمة المرور الجديدة مطلوبان' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'كلمة المرور يجب ألا تقل عن 6 أحرف' });
    }

    const [rows] = await pool.query(
      'SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'رابط الاسترداد غير صالح أو انتهت صلاحيته. يرجى طلب رابط جديد.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    await pool.query(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [password_hash, rows[0].id]
    );

    res.json({ message: 'تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
};