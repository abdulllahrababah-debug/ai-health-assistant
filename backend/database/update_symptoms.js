const pool = require('../config/db');

const SYMPTOMS_DATA = [
  // 1. الأعراض العامة والجهازية (General & Systemic)
  { code: 'fever', name_ar: 'حرارة مرتفعة / حمى', name_en: 'High Fever', icon: '🌡️', category: 'general', emergency: 0 },
  { code: 'fatigue', name_ar: 'إرهاق عام وخمول', name_en: 'Fatigue & Lethargy', icon: '😴', category: 'general', emergency: 0 },
  { code: 'chills', name_ar: 'قشعريرة ورجفة', name_en: 'Chills & Shivering', icon: '🥶', category: 'general', emergency: 0 },
  { code: 'loss_of_appetite', name_ar: 'فقدان الشهية', name_en: 'Loss of Appetite', icon: '🍽️', category: 'general', emergency: 0 },
  { code: 'night_sweats', name_ar: 'تعرق ليلي غزير', name_en: 'Night Sweats', icon: '💦', category: 'general', emergency: 0 },
  { code: 'unexplained_weight_loss', name_ar: 'نزول وزن مفاجئ غير مبرر', name_en: 'Unexplained Weight Loss', icon: '⚖️', category: 'general', emergency: 0 },

  // 2. الأعراض التنفسية والصدرية (Respiratory & Chest)
  { code: 'cough_dry', name_ar: 'سعال جاف مستمر', name_en: 'Dry Cough', icon: '🤧', category: 'respiratory', emergency: 0 },
  { code: 'cough_phlegm', name_ar: 'سعال مصحوب ببلغم', name_en: 'Productive Cough with Phlegm', icon: '😷', category: 'respiratory', emergency: 0 },
  { code: 'shortness_of_breath', name_ar: 'ضيق وصعوبة في التنفس', name_en: 'Shortness of Breath', icon: '🫁', category: 'respiratory', emergency: 1 },
  { code: 'sore_throat', name_ar: 'التهاب واحتقان الحلق', name_en: 'Sore Throat', icon: '🧣', category: 'respiratory', emergency: 0 },
  { code: 'runny_nose', name_ar: 'سيلان واحتقان الأنف', name_en: 'Runny / Stuffy Nose', icon: '👃', category: 'respiratory', emergency: 0 },
  { code: 'wheezing', name_ar: 'صفير أو حشرجة بالصدر', name_en: 'Wheezing', icon: '🌬️', category: 'respiratory', emergency: 0 },
  { code: 'loss_of_smell_taste', name_ar: 'فقدان حاسة الشم أو التذوق', name_en: 'Loss of Smell / Taste', icon: '🍋', category: 'respiratory', emergency: 0 },
  { code: 'chest_pain', name_ar: 'ألم أو ضغط في الصدر', name_en: 'Chest Pain / Pressure', icon: '💔', category: 'respiratory', emergency: 1 },

  // 3. الجهاز الهضمي والبطن (Digestive & Abdominal)
  { code: 'abdominal_pain', name_ar: 'ألم أو مغص في البطن', name_en: 'Abdominal Pain / Cramps', icon: '🤢', category: 'digestive', emergency: 0 },
  { code: 'nausea_vomiting', name_ar: 'غثيان أو تقيؤ', name_en: 'Nausea or Vomiting', icon: '🤮', category: 'digestive', emergency: 0 },
  { code: 'diarrhea', name_ar: 'إسهال متكرر', name_en: 'Diarrhea', icon: '💧', category: 'digestive', emergency: 0 },
  { code: 'constipation', name_ar: 'إمساك وصعوبة إخراج', name_en: 'Constipation', icon: '🧱', category: 'digestive', emergency: 0 },
  { code: 'heartburn', name_ar: 'حموضة وحرقة بالمعدة والارتجاع', name_en: 'Heartburn / Acid Reflux', icon: '🔥', category: 'digestive', emergency: 0 },
  { code: 'bloating', name_ar: 'انتفاخ وغازات البطن', name_en: 'Abdominal Bloating & Gas', icon: '🎈', category: 'digestive', emergency: 0 },
  { code: 'vomiting_blood', name_ar: 'تقيؤ دموي أو براز أسود داكن', name_en: 'Vomiting Blood / Dark Stool', icon: '⚠️', category: 'digestive', emergency: 1 },

  // 4. الرأس والجهاز العصبي (Neurological & Head)
  { code: 'headache', name_ar: 'صداع في الرأس', name_en: 'Headache', icon: '🤕', category: 'neurological', emergency: 0 },
  { code: 'dizziness', name_ar: 'دوخة أو دوار وعدم اتزان', name_en: 'Dizziness / Vertigo', icon: '💫', category: 'neurological', emergency: 0 },
  { code: 'blurred_vision', name_ar: 'تشوش أو زغللة في الرؤية', name_en: 'Blurred or Double Vision', icon: '👁️', category: 'neurological', emergency: 0 },
  { code: 'tinnitus', name_ar: 'طنين أو رنين في الأذن', name_en: 'Ear Ringing (Tinnitus)', icon: '👂', category: 'neurological', emergency: 0 },
  { code: 'numbness_tingling', name_ar: 'خدر أو تنميل في الأطراف', name_en: 'Numbness / Tingling in Limbs', icon: '⚡', category: 'neurological', emergency: 0 },
  { code: 'stiff_neck', name_ar: 'تيبس وألم شديد في الرقبة', name_en: 'Stiff Neck with Severe Pain', icon: '🦯', category: 'neurological', emergency: 1 },
  { code: 'loss_of_consciousness', name_ar: 'إغماء أو فقدان وعي مفاجئ', name_en: 'Fainting / Loss of Consciousness', icon: '😵', category: 'neurological', emergency: 1 },
  { code: 'stroke_symptoms', name_ar: 'ثقل في الكلام أو شلل نصفي مفاجئ', name_en: 'Sudden Facial Droop / Slurred Speech', icon: '🚨', category: 'neurological', emergency: 1 },

  // 5. العضلات والمفاصل والعظام (Musculoskeletal)
  { code: 'joint_pain', name_ar: 'آلام وتيبس في المفاصل', name_en: 'Joint Pain & Stiffness', icon: '🦴', category: 'musculoskeletal', emergency: 0 },
  { code: 'muscle_aches', name_ar: 'آلام عضلية وتكسير بالجسم', name_en: 'Muscle Aches & Body Pains', icon: '💪', category: 'musculoskeletal', emergency: 0 },
  { code: 'back_pain', name_ar: 'ألم في أسفل الظهر', name_en: 'Lower Back Pain', icon: '🧍', category: 'musculoskeletal', emergency: 0 },
  { code: 'joint_swelling', name_ar: 'تورم أو احمرار بالمفاصل', name_en: 'Joint Swelling / Redness', icon: '🔴', category: 'musculoskeletal', emergency: 0 },

  // 6. الجلد والجهاز البولي (Dermatological & Urinary)
  { code: 'skin_rash', name_ar: 'طفح جلدي أو حكة شديدة', name_en: 'Skin Rash or Itching', icon: '🧴', category: 'dermatological', emergency: 0 },
  { code: 'urinary_burning', name_ar: 'حرقة أو ألم أثناء التبول', name_en: 'Painful / Burning Urination', icon: '🚽', category: 'dermatological', emergency: 0 },
  { code: 'frequent_urination', name_ar: 'كثرة التبول غير المعتادة', name_en: 'Frequent Urination', icon: '⏳', category: 'dermatological', emergency: 0 },
];

async function updateDatabase() {
  console.log('Connecting to MySQL...');
  const conn = await pool.getConnection();

  try {
    // 1. Ensure columns exist
    const [flagCols] = await conn.query("SHOW COLUMNS FROM symptoms LIKE 'is_emergency_flag'");
    if (flagCols.length === 0) {
      await conn.query("ALTER TABLE symptoms ADD COLUMN is_emergency_flag TINYINT(1) DEFAULT 0");
      console.log('Added is_emergency_flag column to symptoms.');
    }

    const [cols] = await conn.query("SHOW COLUMNS FROM symptoms LIKE 'category'");
    if (cols.length === 0) {
      await conn.query("ALTER TABLE symptoms ADD COLUMN category VARCHAR(50) DEFAULT 'general'");
      console.log('Added category column to symptoms.');
    }

    const [iconCols] = await conn.query("SHOW COLUMNS FROM symptoms LIKE 'icon'");
    if (iconCols.length === 0) {
      await conn.query("ALTER TABLE symptoms ADD COLUMN icon VARCHAR(20) DEFAULT '🩹'");
      console.log('Added icon column to symptoms.');
    }

    // 2. Insert or update all symptoms
    console.log(`Upserting ${SYMPTOMS_DATA.length} symptoms...`);
    for (const sym of SYMPTOMS_DATA) {
      await conn.query(
        `INSERT INTO symptoms (code, name_ar, name_en, category, icon, is_emergency_flag)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name_ar = VALUES(name_ar),
           name_en = VALUES(name_en),
           category = VALUES(category),
           icon = VALUES(icon),
           is_emergency_flag = VALUES(is_emergency_flag)`,
        [sym.code, sym.name_ar, sym.name_en, sym.category, sym.icon, sym.emergency]
      );
    }
    console.log('All symptoms upserted successfully!');

    // 3. Seed targeted questions
    console.log('Seeding clinical follow-up questions...');
    const questionsSeed = [
      // Chest pain
      {
        symptom_code: 'chest_pain',
        question_ar: 'هل يمتد ألم الصدر إلى الذراع الأيسر، الفك، أو الظهر مصحوباً بتعرق بارد؟',
        question_en: 'Does the chest pain radiate to your left arm, jaw, or back with cold sweats?',
        answer_type: 'boolean',
        is_emergency: 1,
      },
      {
        symptom_code: 'chest_pain',
        question_ar: 'ما هي طبيعة ألم الصدر؟',
        question_en: 'What is the nature of the chest pain?',
        answer_type: 'single_choice',
        options: '["ضغط وثقل كالصخرة","وخز حاد مثل الإبرة","حارق كالحموضة","يزداد مع التنفس العميق"]',
        is_emergency: 0,
      },
      // Shortness of breath
      {
        symptom_code: 'shortness_of_breath',
        question_ar: 'هل يحدث ضيق التنفس أثناء الراحة التامة دون أي مجهود؟',
        question_en: 'Does the shortness of breath occur at complete rest?',
        answer_type: 'boolean',
        is_emergency: 1,
      },
      // Headache
      {
        symptom_code: 'headache',
        question_ar: 'هل الصداع حاد جداً وبدأ فجأة كأنه صاعقة رعدية (الأسوأ في حياتك)؟',
        question_en: 'Was the headache sudden and excruciating like a thunderclap?',
        answer_type: 'boolean',
        is_emergency: 1,
      },
      {
        symptom_code: 'headache',
        question_ar: 'أين يتركز الصداع بشكل رئيسي؟',
        question_en: 'Where is the headache primarily located?',
        answer_type: 'single_choice',
        options: '["نصف الرأس فقط (نابض)","مقدمة الرأس والجبين","خلف الرأس والرقبة","ضغط شامل كالطوق حول الرأس"]',
        is_emergency: 0,
      },
      // Abdominal pain
      {
        symptom_code: 'abdominal_pain',
        question_ar: 'أين يتركز ألم البطن بالتحديد؟',
        question_en: 'Where is the abdominal pain precisely localized?',
        answer_type: 'single_choice',
        options: '["أعلى منتصف البطن (المعدة)","أسفل الجانب الأيمن","أسفل الجانب الأيسر","محيط السرة","منتشر في كامل البطن"]',
        is_emergency: 0,
      },
      {
        symptom_code: 'abdominal_pain',
        question_ar: 'هل يصاحب ألم البطن تقيؤ شديد ومستمر أو عدم القدرة على شرب السوائل؟',
        question_en: 'Is the abdominal pain accompanied by persistent vomiting or inability to keep fluids down?',
        answer_type: 'boolean',
        is_emergency: 0,
      },
      // Fever
      {
        symptom_code: 'fever',
        question_ar: 'كم تبلغ درجة الحرارة المقاسة وما هي مدتها؟',
        question_en: 'What is the measured temperature and duration?',
        answer_type: 'single_choice',
        options: '["أقل من 38.5 مئوية (أقل من يومين)","بين 38.5 و 39.5 مئوية (2-4 أيام)","أعلى من 39.5 مئوية أو مستمرة لأكثر من 5 أيام"]',
        is_emergency: 0,
      },
      {
        symptom_code: 'fever',
        question_ar: 'هل يصاحب الحرارة تيبس في عضلات الرقبة أو طفح جلدي أرجواني جديد؟',
        question_en: 'Is the fever accompanied by neck stiffness or a new purplish rash?',
        answer_type: 'boolean',
        is_emergency: 1,
      },
    ];

    for (const q of questionsSeed) {
      const [symRow] = await conn.query('SELECT id FROM symptoms WHERE code = ?', [q.symptom_code]);
      if (symRow.length > 0) {
        const symId = symRow[0].id;
        const [existing] = await conn.query(
          'SELECT id FROM questions WHERE symptom_id = ? AND question_ar = ?',
          [symId, q.question_ar]
        );
        if (existing.length === 0) {
          await conn.query(
            `INSERT INTO questions (symptom_id, question_ar, question_en, answer_type, options, is_emergency_trigger)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [symId, q.question_ar, q.question_en, q.answer_type, q.options || null, q.is_emergency]
          );
        }
      }
    }

    console.log('Follow-up questions seeded successfully!');
    console.log('Database update completed successfully! 🎉');
  } catch (err) {
    console.error('Error updating database:', err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

updateDatabase();
