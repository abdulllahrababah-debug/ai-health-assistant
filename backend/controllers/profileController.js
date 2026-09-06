const pool = require('../config/db');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const [users] = await pool.query(
      'SELECT id, full_name, email, role, is_active, created_at FROM users WHERE id = ?',
      [userId]
    );
    if (users.length === 0) return res.status(404).json({ message: 'المستخدم غير موجود' });

    const [history] = await pool.query(
      'SELECT * FROM medical_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    res.json({ user: users[0], medicalHistory: history[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطأ في جلب الملف الشخصي' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name } = req.body;
    if (full_name) {
      await pool.query('UPDATE users SET full_name = ? WHERE id = ?', [full_name.trim(), userId]);
    }
    res.json({ message: 'تم تحديث البيانات الشخصية بنجاح' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطأ في تحديث البيانات' });
  }
};

exports.saveMedicalHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      age,
      gender,
      height_cm,
      weight_kg,
      chronic_diseases,
      current_medications,
      drug_allergies,
      blood_type
    } = req.body;

    const [existing] = await pool.query('SELECT id FROM medical_history WHERE user_id = ?', [userId]);

    if (existing.length > 0) {
      await pool.query(
        `UPDATE medical_history SET 
           age = ?, gender = ?, height_cm = ?, weight_kg = ?, 
           chronic_diseases = ?, current_medications = ?, drug_allergies = ?, blood_type = ? 
         WHERE user_id = ?`,
        [
          parseInt(age) || 30,
          gender || 'male',
          parseFloat(height_cm) || null,
          parseFloat(weight_kg) || null,
          chronic_diseases || '',
          current_medications || '',
          drug_allergies || '',
          blood_type || null,
          userId
        ]
      );
    } else {
      await pool.query(
        `INSERT INTO medical_history 
           (user_id, age, gender, height_cm, weight_kg, chronic_diseases, current_medications, drug_allergies, blood_type) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          parseInt(age) || 30,
          gender || 'male',
          parseFloat(height_cm) || null,
          parseFloat(weight_kg) || null,
          chronic_diseases || '',
          current_medications || '',
          drug_allergies || '',
          blood_type || null
        ]
      );
    }

    res.json({ message: 'تم حفظ التاريخ الطبي بنجاح وسيتم أخذه بالاعتبار في جميع التشخيصات القادمة' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطأ في حفظ التاريخ الطبي' });
  }
};