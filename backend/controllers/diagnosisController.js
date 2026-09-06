const pool = require('../config/db');
const {
  getAIAssessment,
  generateDynamicFollowupQuestions,
  detectEmergencyFromInputs,
  detectEmergencyFromTriggerAnswers,
} = require('../services/aiService');

exports.getDynamicQuestions = async (req, res) => {
  try {
    const { profile = {}, symptoms = [], duration = '', severity = '', language = 'ar' } = req.body;
    if (!Array.isArray(symptoms) || symptoms.length === 0) {
      return res.json([]);
    }

    // 1) Fast, instant lookup: Fetch targeted follow-up questions from database (< 10ms)
    const placeholders = symptoms.map(() => '?').join(',');
    const [rows] = await pool.query(
      `SELECT q.*, s.code AS symptom_code, s.name_ar AS symptom_name_ar, s.name_en AS symptom_name_en
       FROM questions q
       JOIN symptoms s ON q.symptom_id = s.id
       WHERE s.code IN (${placeholders})
       ORDER BY q.is_emergency_trigger DESC, q.symptom_id, q.id
       LIMIT 6`,
      symptoms
    );

    if (rows && rows.length > 0) {
      return res.json(rows);
    }

    // 3) Default high-yield clinical questions if DB doesn't have them
    return res.json([
      {
        id: 'clinical_q1',
        question_ar: 'هل تزداد حدة الأعراض عند الحركة أو المجهود البدني؟',
        question_en: 'Do the symptoms worsen with movement or physical exertion?',
        answer_type: 'boolean',
        is_emergency_trigger: false,
      },
      {
        id: 'clinical_q2',
        question_ar: 'هل بدأت هذه الأعراض بشكل مفاجئ وحاد جداً خلال دقائق؟',
        question_en: 'Did these symptoms start suddenly and acutely within minutes?',
        answer_type: 'boolean',
        is_emergency_trigger: true,
      },
      {
        id: 'clinical_q3',
        question_ar: 'هل يوجد غثيان، دوخة أو تشوش في الرؤية مصاحب للأعراض؟',
        question_en: 'Is there accompanying nausea, dizziness, or blurred vision?',
        answer_type: 'boolean',
        is_emergency_trigger: false,
      },
    ]);
  } catch (err) {
    console.error('getDynamicQuestions error:', err);
    res.status(500).json({ message: 'Failed to generate questions', error: err.message });
  }
};

exports.runAssessment = async (req, res) => {
  try {
    const {
      age,
      gender,
      height_cm,
      weight_kg,
      chronic_diseases = [],
      current_medications = [],
      drug_allergies = [],
      symptoms = [],
      followup_answers = {},
      language = 'ar',
    } = req.body;

    if (!age || !gender || !symptoms.length) {
      return res.status(400).json({ message: 'age, gender and at least one symptom are required' });
    }

    // 1) Fast, rule-based emergency check (does not depend on the AI call)
    const emergencyByRules =
      detectEmergencyFromInputs({ symptoms }) ||
      (await detectEmergencyFromTriggerAnswers(pool, followup_answers));

    // 2) Save medical history snapshot
    const [historyResult] = await pool.query(
      `INSERT INTO medical_history
        (user_id, age, gender, height_cm, weight_kg, chronic_diseases, current_medications, drug_allergies)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user ? req.user.id : null,
        age,
        gender,
        height_cm || null,
        weight_kg || null,
        JSON.stringify(chronic_diseases),
        JSON.stringify(current_medications),
        JSON.stringify(drug_allergies),
      ]
    );

    // 3) Call the AI engine
    const aiResponse = await getAIAssessment({
      profile: { age, gender, height_cm, weight_kg, chronic_diseases, current_medications, drug_allergies },
      symptoms,
      followupAnswers: followup_answers,
      language,
    });

    const isEmergency = Boolean(aiResponse.is_emergency || emergencyByRules);

    // 4) Persist the result
    const [resultRow] = await pool.query(
      `INSERT INTO results
        (user_id, medical_history_id, selected_symptoms, followup_answers, ai_response, is_emergency)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.user ? req.user.id : null,
        historyResult.insertId,
        JSON.stringify(symptoms),
        JSON.stringify(followup_answers),
        JSON.stringify(aiResponse),
        isEmergency,
      ]
    );

    res.json({
      result_id: resultRow.insertId,
      is_emergency: isEmergency,
      ...aiResponse,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to run AI assessment', error: err.message });
  }
};

exports.getResult = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM results WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Result not found' });
    const row = rows[0];
    res.json({
      ...row,
      selected_symptoms: JSON.parse(row.selected_symptoms || '[]'),
      followup_answers: JSON.parse(row.followup_answers || '{}'),
      ai_response: JSON.parse(row.ai_response || '{}'),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch result' });
  }
};
