const pool = require('../config/db');

const SYMPTOMS_SEED = [
  // 1. General & Systemic
  { code: 'fever', ar: 'حرارة مرتفعة / حمى', en: 'High Fever', cat: 'general', icon: '🌡️', em: false },
  { code: 'fatigue', ar: 'إرهاق عام وخمول', en: 'Fatigue & Lethargy', cat: 'general', icon: '😴', em: false },
  { code: 'chills', ar: 'قشعريرة ورجفة', en: 'Chills & Shivering', cat: 'general', icon: '🥶', em: false },
  { code: 'loss_of_appetite', ar: 'فقدان الشهية', en: 'Loss of Appetite', cat: 'general', icon: '🍽️', em: false },
  { code: 'night_sweats', ar: 'تعرق ليلي غزير', en: 'Night Sweats', cat: 'general', icon: '💦', em: false },
  { code: 'unexplained_weight_loss', ar: 'نزول وزن مفاجئ غير مبرر', en: 'Unexplained Weight Loss', cat: 'general', icon: '⚖️', em: false },
  { code: 'excessive_thirst', ar: 'عطش شديد ومستمر وجفاف الفم', en: 'Excessive Thirst', cat: 'general', icon: '🥤', em: false },

  // 2. Respiratory & Chest
  { code: 'cough', ar: 'سعال / كحة', en: 'Cough', cat: 'respiratory', icon: '🗣️', em: false },
  { code: 'cough_dry', ar: 'سعال جاف مستمر', en: 'Dry Cough', cat: 'respiratory', icon: '🤧', em: false },
  { code: 'cough_phlegm', ar: 'سعال مصحوب ببلغم', en: 'Productive Cough with Phlegm', cat: 'respiratory', icon: '😷', em: false },
  { code: 'shortness_of_breath', ar: 'ضيق وصعوبة في التنفس', en: 'Shortness of Breath', cat: 'respiratory', icon: '🫁', em: true },
  { code: 'sore_throat', ar: 'التهاب واحتقان الحلق', en: 'Sore Throat', cat: 'respiratory', icon: '🧣', em: false },
  { code: 'runny_nose', ar: 'سيلان واحتقان الأنف', en: 'Runny / Stuffy Nose', cat: 'respiratory', icon: '👃', em: false },
  { code: 'wheezing', ar: 'صفير أو حشرجة بالصدر', en: 'Wheezing', cat: 'respiratory', icon: '🌬️', em: false },
  { code: 'loss_of_smell_taste', ar: 'فقدان حاسة الشم أو التذوق', en: 'Loss of Smell / Taste', cat: 'respiratory', icon: '🍋', em: false },
  { code: 'chest_pain', ar: 'ألم أو ضغط في الصدر', en: 'Chest Pain / Pressure', cat: 'respiratory', icon: '💔', em: true },
  { code: 'palpitations', ar: 'خفقان وتسارع ضربات القلب', en: 'Heart Palpitations', cat: 'respiratory', icon: '💓', em: false },

  // 3. Digestive & Abdominal
  { code: 'abdominal_pain', ar: 'ألم أو مغص في البطن', en: 'Abdominal Pain / Cramps', cat: 'digestive', icon: '🤢', em: false },
  { code: 'nausea_vomiting', ar: 'غثيان أو تقيؤ', en: 'Nausea or Vomiting', cat: 'digestive', icon: '🤮', em: false },
  { code: 'diarrhea', ar: 'إسهال متكرر', en: 'Diarrhea', cat: 'digestive', icon: '💧', em: false },
  { code: 'constipation', ar: 'إمساك وصعوبة إخراج', en: 'Constipation', cat: 'digestive', icon: '🧱', em: false },
  { code: 'heartburn', ar: 'حموضة وحرقة بالمعدة والارتجاع', en: 'Heartburn / Acid Reflux', cat: 'digestive', icon: '🔥', em: false },
  { code: 'bloating', ar: 'انتفاخ وغازات البطن', en: 'Abdominal Bloating & Gas', cat: 'digestive', icon: '🎈', em: false },
  { code: 'vomiting_blood', ar: 'تقيؤ دموي أو براز أسود داكن', en: 'Vomiting Blood / Dark Stool', cat: 'digestive', icon: '⚠️', em: true },
  { code: 'difficulty_swallowing', ar: 'صعوبة أو ألم عند بلع الطعام', en: 'Difficulty Swallowing', cat: 'digestive', icon: '🥖', em: false },

  // 4. Neurological & Head
  { code: 'headache', ar: 'صداع في الرأس', en: 'Headache', cat: 'neurological', icon: '🤕', em: false },
  { code: 'dizziness', ar: 'دوخة أو دوار وعدم اتزان', en: 'Dizziness / Vertigo', cat: 'neurological', icon: '💫', em: false },
  { code: 'blurred_vision', ar: 'تشوش أو زغللة في الرؤية', en: 'Blurred or Double Vision', cat: 'neurological', icon: '👁️', em: false },
  { code: 'tinnitus', ar: 'طنين أو رنين في الأذن', en: 'Ear Ringing (Tinnitus)', cat: 'neurological', icon: '👂', em: false },
  { code: 'numbness_tingling', ar: 'خدر أو تنميل في الأطراف', en: 'Numbness / Tingling in Limbs', cat: 'neurological', icon: '⚡', em: false },
  { code: 'stiff_neck', ar: 'تيبس وألم شديد في الرقبة', en: 'Stiff Neck with Severe Pain', cat: 'neurological', icon: '🦯', em: true },
  { code: 'loss_of_consciousness', ar: 'إغماء أو فقدان وعي مفاجئ', en: 'Fainting / Loss of Consciousness', cat: 'neurological', icon: '😵', em: true },
  { code: 'stroke_symptoms', ar: 'ثقل في الكلام أو شلل نصفي مفاجئ', en: 'Sudden Facial Droop / Slurred Speech', cat: 'neurological', icon: '🚨', em: true },

  // 5. Musculoskeletal
  { code: 'joint_pain', ar: 'آلام وتيبس في المفاصل', en: 'Joint Pain & Stiffness', cat: 'musculoskeletal', icon: '🦴', em: false },
  { code: 'muscle_aches', ar: 'آلام عضلية وتكسير بالجسم', en: 'Muscle Aches & Body Pains', cat: 'musculoskeletal', icon: '💪', em: false },
  { code: 'back_pain', ar: 'ألم في أسفل الظهر', en: 'Lower Back Pain', cat: 'musculoskeletal', icon: '🧍', em: false },
  { code: 'joint_swelling', ar: 'تورم أو احمرار بالمفاصل', en: 'Joint Swelling / Redness', cat: 'musculoskeletal', icon: '🔴', em: false },

  // 6. Dermatological & Urinary
  { code: 'skin_rash', ar: 'طفح جلدي أو حكة شديدة', en: 'Skin Rash or Itching', cat: 'dermatological', icon: '🧴', em: false },
  { code: 'urinary_burning', ar: 'حرقة أو ألم أثناء التبول', en: 'Painful / Burning Urination', cat: 'dermatological', icon: '🚽', em: false },
  { code: 'frequent_urination', ar: 'كثرة التبول غير المعتادة', en: 'Frequent Urination', cat: 'dermatological', icon: '⏳', em: false },
  { code: 'blood_in_urine', ar: 'دم في البول (بول أحمر أو وردي)', en: 'Blood in Urine', cat: 'dermatological', icon: '🩸', em: true },
];

async function autoMigrate() {
  try {
    console.log('[AutoMigrate] Checking database schema & seed data...');

    const columnChecks = [
      { table: 'users', col: 'reset_token', def: 'VARCHAR(255) NULL' },
      { table: 'users', col: 'reset_token_expires', def: 'DATETIME NULL' },
      { table: 'medical_history', col: 'blood_type', def: 'VARCHAR(10) NULL' },
      { table: 'symptoms', col: 'category', def: "VARCHAR(50) DEFAULT 'general'" },
      { table: 'symptoms', col: 'icon', def: "VARCHAR(50) DEFAULT '🩺'" },
    ];

    for (const c of columnChecks) {
      try {
        await pool.query('ALTER TABLE ' + c.table + ' ADD COLUMN ' + c.col + ' ' + c.def);
      } catch (err) {}
    }

    console.log('[AutoMigrate] Ensuring all standard symptoms are present with categories and icons...');
    for (const s of SYMPTOMS_SEED) {
      await pool.query(
        `INSERT INTO symptoms (code, name_ar, name_en, category, icon, is_emergency_flag)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
           name_ar = VALUES(name_ar),
           name_en = VALUES(name_en),
           category = VALUES(category),
           icon = VALUES(icon),
           is_emergency_flag = VALUES(is_emergency_flag)`,
        [s.code, s.ar, s.en, s.cat, s.icon, s.em]
      );
    }

    console.log('[AutoMigrate] Database verification & auto-seeding completed successfully ✅');
  } catch (err) {
    console.error('[AutoMigrate] Notice during auto-migration (continuing):', err.message);
  }
}

module.exports = autoMigrate;
