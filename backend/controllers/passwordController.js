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

    let emailResult = null;
    try {
      emailResult = await sendPasswordResetEmail(user.email, resetToken, user.full_name);
    } catch (emailErr) {
      console.error('Email send error:', emailErr.message);
    }

    if (emailResult && emailResult.mock) {
      return res.json({
        message: 'تم إنشاء رابط استرداد كلمة المرور بنجاح.',
        mockLink: emailResult.resetUrl,
        isMock: true,
      });
    }

    res.json({ message: 'إذا كان هذا البريد مسجلاً، فقد تم إرسال رابط الاسترداد إلى بريدك الإلكتروني بنجاح.' });
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