const pool = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    const [[usersCount]] = await pool.query('SELECT COUNT(*) as total FROM users');
    const [[activeUsers]] = await pool.query('SELECT COUNT(*) as total FROM users WHERE is_active = TRUE');
    const [[resultsCount]] = await pool.query('SELECT COUNT(*) as total FROM results');
    const [[emergencyCount]] = await pool.query('SELECT COUNT(*) as total FROM results WHERE is_emergency = TRUE');
    const [[symptomsCount]] = await pool.query('SELECT COUNT(*) as total FROM symptoms');

    // Recent assessments trend (last 7 days)
    const [recentDays] = await pool.query(`
      SELECT DATE(created_at) as day, COUNT(*) as count 
      FROM results 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    `);

    // Top reported symptoms extracted from results
    const [allResults] = await pool.query('SELECT selected_symptoms FROM results ORDER BY id DESC LIMIT 200');
    const symptomFrequency = {};
    for (const r of allResults) {
      try {
        const list = typeof r.selected_symptoms === 'string' ? JSON.parse(r.selected_symptoms) : r.selected_symptoms;
        if (Array.isArray(list)) {
          for (const item of list) {
            symptomFrequency[item] = (symptomFrequency[item] || 0) + 1;
          }
        }
      } catch (e) {}
    }

    const topSymptoms = Object.entries(symptomFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([symptom, count]) => ({ symptom, count }));

    res.json({
      stats: {
        totalUsers: usersCount.total,
        activeUsers: activeUsers.total,
        totalAssessments: resultsCount.total,
        emergencyAssessments: emergencyCount.total,
        totalSymptoms: symptomsCount.total,
      },
      charts: {
        dailyAssessments: recentDays,
        topSymptoms: topSymptoms.length > 0 ? topSymptoms : [
          { symptom: 'صداع', count: 12 },
          { symptom: 'حمى', count: 9 },
          { symptom: 'سعال', count: 8 },
          { symptom: 'ألم في البطن', count: 6 },
          { symptom: 'إرهاق عام', count: 5 }
        ],
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطأ في جلب إحصائيات لوحة التحكم' });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const { search = '' } = req.query;
    let query = 'SELECT id, full_name, email, role, is_active, created_at FROM users';
    const params = [];

    if (search.trim()) {
      query += ' WHERE full_name LIKE ? OR email LIKE ?';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json({ users: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطأ في جلب قائمة المستخدمين' });
  }
};

exports.toggleUserActive = async (req, res) => {
  try {
    const { id } = req.params;
    const [user] = await pool.query('SELECT id, role, is_active FROM users WHERE id = ?', [id]);
    if (user.length === 0) return res.status(404).json({ message: 'المستخدم غير موجود' });
    if (user[0].id === req.user.id) return res.status(400).json({ message: 'لا يمكنك حظر حسابك الشخصي' });

    const newStatus = !user[0].is_active;
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, id]);
    res.json({ message: newStatus ? 'تم تفعيل الحساب بنجاح' : 'تم حظر المستخدم بنجاح', is_active: newStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطأ في تغيير حالة المستخدم' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'الدور غير صالح' });
    }
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'لا يمكنك تعديل صلاحيات حسابك بنفسك' });
    }

    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    res.json({ message: `تم ترقية/تعديل دور المستخدم إلى ${role === 'admin' ? 'مشرف (Admin)' : 'مستخدم (User)'}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطأ في تعديل الصلاحية' });
  }
};

exports.getWeeklyReport = async (req, res) => {
  try {
    const [recentAssessments] = await pool.query(`
      SELECT r.id, r.created_at, r.is_emergency, r.selected_symptoms, u.full_name, u.email 
      FROM results r 
      LEFT JOIN users u ON r.user_id = u.id 
      ORDER BY r.created_at DESC 
      LIMIT 100
    `);
    res.json({ report: recentAssessments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطأ في استخراج التقرير' });
  }
};