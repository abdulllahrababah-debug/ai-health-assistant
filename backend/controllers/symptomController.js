const pool = require('../config/db');

exports.listSymptoms = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM symptoms ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch symptoms' });
  }
};

exports.createSymptom = async (req, res) => {
  try {
    const { code, name_ar, name_en, is_emergency_flag } = req.body;
    const [result] = await pool.query(
      'INSERT INTO symptoms (code, name_ar, name_en, is_emergency_flag) VALUES (?, ?, ?, ?)',
      [code, name_ar, name_en, Boolean(is_emergency_flag)]
    );
    res.status(201).json({ id: result.insertId, code, name_ar, name_en, is_emergency_flag });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create symptom' });
  }
};

exports.deleteSymptom = async (req, res) => {
  try {
    await pool.query('DELETE FROM symptoms WHERE id = ?', [req.params.id]);
    res.json({ message: 'Symptom deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete symptom' });
  }
};

// Get follow-up questions for a list of symptom codes
exports.getFollowupQuestions = async (req, res) => {
  try {
    const { codes } = req.body; // array of symptom codes
    if (!Array.isArray(codes) || codes.length === 0) {
      return res.json([]);
    }
    const placeholders = codes.map(() => '?').join(',');
    const [rows] = await pool.query(
      `SELECT q.*, s.code AS symptom_code, s.name_ar AS symptom_name_ar, s.name_en AS symptom_name_en
       FROM questions q
       JOIN symptoms s ON q.symptom_id = s.id
       WHERE s.code IN (${placeholders})
       ORDER BY q.symptom_id, q.id`,
      codes
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch follow-up questions' });
  }
};
