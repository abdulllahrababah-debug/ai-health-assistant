const pool = require('../config/db');

const SYMPTOMS_SEED = [
  // 1. General & Systemic
  { code: 'fever', ar: 'حرارة مرتفعة / حمى', en: 'High Fever', cat: 'general', icon: '🌡️', em: false },
  { code: 'fatigue', ar: 'إرهاق عام وخمول مستمر', en: 'Fatigue & Lethargy', cat: 'general', icon: '😴', em: false },
  { code: 'chills', ar: 'قشعريرة ورجفة بالجسم', en: 'Chills & Shivering', cat: 'general', icon: '🥶', em: false },
  { code: 'loss_of_appetite', ar: 'فقدان الشهية للطعام', en: 'Loss of Appetite', cat: 'general', icon: '🍽️', em: false },
  { code: 'night_sweats', ar: 'تعرق ليلي غزير', en: 'Night Sweats', cat: 'general', icon: '💦', em: false },
  { code: 'unexplained_weight_loss', ar: 'نزول وزن مفاجئ غير مبرر', en: 'Unexplained Weight Loss', cat: 'general', icon: '⚖️', em: false },
  { code: 'excessive_thirst', ar: 'عطش شديد وجفاف مستمر بالحلق', en: 'Excessive Thirst & Dry Mouth', cat: 'general', icon: '🥤', em: false },
  { code: 'swollen_lymph_nodes', ar: 'انتفاخ الغدد اللمفاوية بالرقبة أو الإبط', en: 'Swollen Lymph Nodes', cat: 'general', icon: '🩺', em: false },
  { code: 'heat_cold_intolerance', ar: 'عدم تحمل الحرارة أو البرودة الشديدة', en: 'Temperature Intolerance', cat: 'general', icon: '🌡️', em: false },

  // 2. Respiratory & Chest & ENT
  { code: 'cough', ar: 'سعال / كحة مستمرة', en: 'Cough', cat: 'respiratory', icon: '🗣️', em: false },
  { code: 'cough_dry', ar: 'سعال جاف متهيج', en: 'Dry Cough', cat: 'respiratory', icon: '🤧', em: false },
  { code: 'cough_phlegm', ar: 'سعال مصحوب ببلغم أو مخاط', en: 'Productive Cough with Phlegm', cat: 'respiratory', icon: '😷', em: false },
  { code: 'shortness_of_breath', ar: 'ضيق وصعوبة حادة في التنفس', en: 'Shortness of Breath', cat: 'respiratory', icon: '🫁', em: true },
  { code: 'sore_throat', ar: 'التهاب واحتقان الحلق وصعوبة البلع', en: 'Sore Throat & Painful Swallowing', cat: 'respiratory', icon: '🧣', em: false },
  { code: 'runny_nose', ar: 'سيلان واحتقان الأنف وعطاس', en: 'Runny / Stuffy Nose & Sneezing', cat: 'respiratory', icon: '👃', em: false },
  { code: 'wheezing', ar: 'صفير أو حشرجة أثناء التنفس', en: 'Wheezing in Chest', cat: 'respiratory', icon: '🌬️', em: false },
  { code: 'loss_of_smell_taste', ar: 'فقدان حاسة الشم أو التذوق', en: 'Loss of Smell / Taste', cat: 'respiratory', icon: '🍋', em: false },
  { code: 'chest_pain', ar: 'ألم ضاغط أو ثقل في الصدر', en: 'Chest Pain / Tightness', cat: 'respiratory', icon: '💔', em: true },
  { code: 'palpitations', ar: 'خفقان وتسارع نبضات القلب', en: 'Heart Palpitations / Rapid Pulse', cat: 'respiratory', icon: '💓', em: false },
  { code: 'ear_pain', ar: 'ألم أو ضغط أو إفرازات في الأذن', en: 'Ear Pain / Fullness', cat: 'respiratory', icon: '👂', em: false },
  { code: 'hoarseness', ar: 'بحة أو تغير مفاجئ في الصوت', en: 'Hoarseness / Voice Changes', cat: 'respiratory', icon: '📢', em: false },
  { code: 'sinus_facial_pain', ar: 'ألم وضغط في الجيوب الأنفية والوجه', en: 'Sinus Pressure & Facial Pain', cat: 'respiratory', icon: '🤕', em: false },
  { code: 'nosebleed', ar: 'نزيف من الأنف (رعاف متكرر)', en: 'Nosebleed (Epistaxis)', cat: 'respiratory', icon: '🩸', em: false },

  // 3. Digestive & Abdominal
  { code: 'abdominal_pain', ar: 'ألم أو مغص في البطن', en: 'Abdominal Pain / Cramps', cat: 'digestive', icon: '🤢', em: false },
  { code: 'nausea_vomiting', ar: 'غثيان مستمر أو تقيؤ', en: 'Nausea or Vomiting', cat: 'digestive', icon: '🤮', em: false },
  { code: 'diarrhea', ar: 'إسهال مائي متكرر', en: 'Frequent Diarrhea', cat: 'digestive', icon: '💧', em: false },
  { code: 'constipation', ar: 'إمساك وصعوبة إخراج لأيام', en: 'Constipation & Straining', cat: 'digestive', icon: '🧱', em: false },
  { code: 'heartburn', ar: 'حموضة وحرقة بالمعدة والارتجاع المريئي', en: 'Heartburn / Acid Reflux', cat: 'digestive', icon: '🔥', em: false },
  { code: 'bloating', ar: 'انتفاخ وغازات البطن وعسر الهضم', en: 'Abdominal Bloating & Gas', cat: 'digestive', icon: '🎈', em: false },
  { code: 'vomiting_blood', ar: 'تقيؤ دموي أو براز أسود داكن', en: 'Vomiting Blood / Dark Stool', cat: 'digestive', icon: '⚠️', em: true },
  { code: 'difficulty_swallowing', ar: 'صعوبة أو وقوف الطعام في المريء', en: 'Difficulty Swallowing (Dysphagia)', cat: 'digestive', icon: '🥖', en: false },
  { code: 'jaundice', ar: 'اصفرار الجلد أو بياض العينين وتغير لون البول', en: 'Jaundice (Yellow Skin/Eyes)', cat: 'digestive', icon: '🟡', em: false },
  { code: 'rectal_bleeding', ar: 'نزيف شرجي أو دم أحمر مع الإخراج', en: 'Rectal Bleeding / Blood in Stool', cat: 'digestive', icon: '🩸', em: false },

  // 4. Neurological & Head
  { code: 'headache', ar: 'صداع عام في الرأس', en: 'General Headache', cat: 'neurological', icon: '🤕', em: false },
  { code: 'migraine_throbbing', ar: 'صداع نصفي نابض مع حساسية ضوء وصوت', en: 'Throbbing Migraine', cat: 'neurological', icon: '⚡', em: false },
  { code: 'dizziness', ar: 'دوخة أو دوار وعدم اتزان حركي', en: 'Dizziness / Vertigo', cat: 'neurological', icon: '💫', em: false },
  { code: 'blurred_vision', ar: 'تشوش أو زغللة أو ازدواجية الرؤية', en: 'Blurred / Double Vision', cat: 'neurological', icon: '👁️', em: false },
  { code: 'tinnitus', ar: 'طنين أو رنين مزعج في الأذن', en: 'Ear Ringing (Tinnitus)', cat: 'neurological', icon: '🔔', em: false },
  { code: 'numbness_tingling', ar: 'خدر أو تنميل ووخز في الأطراف', en: 'Numbness / Tingling in Limbs', cat: 'neurological', icon: '⚡', em: false },
  { code: 'stiff_neck', ar: 'تيبس وألم شديد في الرقبة مع حرارة', en: 'Stiff Neck with Severe Pain', cat: 'neurological', icon: '🦯', em: true },
  { code: 'loss_of_consciousness', ar: 'إغماء أو فقدان وعي مفاجئ', en: 'Fainting / Loss of Consciousness', cat: 'neurological', icon: '😵', em: true },
  { code: 'stroke_symptoms', ar: 'ثقل مفاجئ في الكلام أو انحراف بالوجه أو شلل طرفي', en: 'Sudden Facial Droop / Slurred Speech', cat: 'neurological', icon: '🚨', em: true },
  { code: 'tremors_shaking', ar: 'رجفة أو ارتعاش لا إرادي باليدين', en: 'Hand Tremors / Involuntary Shaking', cat: 'neurological', icon: '👋', em: false },
  { code: 'memory_confusion', ar: 'ارتباك ذهني وتشوش بالذاكرة والتركيز', en: 'Confusion & Memory Loss', cat: 'neurological', icon: '🧩', em: false },
  { code: 'severe_anxiety', ar: 'قلق حاد ونوبات هلع مع خوف وضيق نفس', en: 'Severe Anxiety / Panic Attacks', cat: 'neurological', icon: '😰', em: false },
  { code: 'insomnia', ar: 'أرق شديد وصعوبة الاستغراق في النوم', en: 'Severe Insomnia / Sleep Issues', cat: 'neurological', icon: '🌙', em: false },

  // 5. Musculoskeletal
  { code: 'joint_pain', ar: 'آلام وتيبس في المفاصل', en: 'Joint Pain & Morning Stiffness', cat: 'musculoskeletal', icon: '🦴', em: false },
  { code: 'muscle_aches', ar: 'آلام عضلية وتكسير عام بالجسم', en: 'Muscle Aches & Body Pains', cat: 'musculoskeletal', icon: '💪', em: false },
  { code: 'back_pain', ar: 'ألم في أسفل الظهر مع صعوبة الحركة', en: 'Lower Back Pain', cat: 'musculoskeletal', icon: '🧍', em: false },
  { code: 'joint_swelling', ar: 'تورم أو احمرار وسخونة حول المفصل', en: 'Joint Swelling & Warmth', cat: 'musculoskeletal', icon: '🔴', em: false },
  { code: 'neck_pain', ar: 'ألم وتشنج بعضلات الرقبة والأكتاف', en: 'Neck & Shoulder Muscle Spasms', cat: 'musculoskeletal', icon: '🧣', em: false },
  { code: 'knee_pain', ar: 'ألم أو طقطقة وصعوبة ثني الركبة', en: 'Knee Pain & Clicking', cat: 'musculoskeletal', icon: '🦵', em: false },
  { code: 'muscle_weakness', ar: 'ضعف عضلي ملحوظ وصعوبة حمل الأشياء', en: 'Muscle Weakness', cat: 'musculoskeletal', icon: '📉', em: false },
  { code: 'sciatica_radiating', ar: 'ألم ممتد من الظهر أو المقعدة إلى الساق (عرق النسا)', en: 'Sciatica / Radiating Leg Pain', cat: 'musculoskeletal', icon: '⚡', em: false },

  // 6. Dermatological, Eyes & Dental
  { code: 'skin_rash', ar: 'طفح جلدي أو بقع وتغير في لون الجلد', en: 'Skin Rash or Lesions', cat: 'dermatological', icon: '🧴', em: false },
  { code: 'hives_urticaria', ar: 'شرى وانتفاخات جلدية حمراء شديدة الحكة', en: 'Hives (Urticaria) & Itching', cat: 'dermatological', icon: '🔥', em: false },
  { code: 'severe_itching', ar: 'حكة جلدية شديدة دون طفح واضح', en: 'Severe Skin Itching (Pruritus)', cat: 'dermatological', icon: '✋', em: false },
  { code: 'skin_ulcer', ar: 'قرحة جلدية أو جرح بطيء الالتئام', en: 'Skin Ulcer or Non-healing Wound', cat: 'dermatological', icon: '🩹', em: false },
  { code: 'eye_redness', ar: 'احمرار وحرقة في العين مع إفرازات', en: 'Eye Redness & Irritation (Conjunctivitis)', cat: 'dermatological', icon: '👁️', em: false },
  { code: 'eye_pain', ar: 'ألم عميق بالعين أو حساسية مفرطة للضوء', en: 'Eye Pain & Photophobia', cat: 'dermatological', icon: '👀', em: false },
  { code: 'toothache', ar: 'ألم حاد في الأسنان أو الفك عند الأكل', en: 'Toothache & Jaw Pain', cat: 'dermatological', icon: '🦷', em: false },
  { code: 'bleeding_gums', ar: 'نزيف وتورم اللثة عند تفريش الأسنان', en: 'Swollen & Bleeding Gums', cat: 'dermatological', icon: '🩸', em: false },

  // 7. Urinary & Renal
  { code: 'urinary_burning', ar: 'حرقة أو ألم أثناء التبول', en: 'Painful / Burning Urination (Dysuria)', cat: 'dermatological', icon: '🚽', em: false },
  { code: 'frequent_urination', ar: 'كثرة التبول غير المعتادة ليلاً ونهاراً', en: 'Frequent Urination', cat: 'dermatological', icon: '⏳', em: false },
  { code: 'blood_in_urine', ar: 'دم في البول (بول أحمر أو وردي أو داكن)', en: 'Blood in Urine (Hematuria)', cat: 'dermatological', icon: '🩸', em: true },
  { code: 'flank_kidney_pain', ar: 'مغص كلوي وألم حاد في الخاصرة وأسفل الظهر', en: 'Flank / Kidney Pain (Renal Colic)', cat: 'dermatological', icon: '⚡', em: false },
  { code: 'urinary_urgency', ar: 'إلحاح بولي مفاجئ وصعوبة في حبس البول', en: 'Urinary Urgency & Incontinence', cat: 'dermatological', icon: '💧', em: false },
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

    console.log('[AutoMigrate] Database verification & auto-seeding completed successfully with ' + SYMPTOMS_SEED.length + ' symptoms ✅');
  } catch (err) {
    console.error('[AutoMigrate] Notice during auto-migration (continuing):', err.message);
  }
}

module.exports = autoMigrate;
