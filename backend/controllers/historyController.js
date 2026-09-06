const pool = require('../config/db');

exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      'SELECT id, selected_symptoms, ai_response, is_emergency, created_at FROM results WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json({ history: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطأ في جلب سجل التشخيصات' });
  }
};

exports.getHistoryItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM results WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'السجل غير موجود' });
    res.json({ record: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطأ في جلب تفاصيل السجل' });
  }
};

exports.deleteHistoryItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await pool.query('DELETE FROM results WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'تم حذف السجل بنجاح' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطأ أثناء الحذف' });
  }
};