require('dotenv').config();
const pool = require('../config/db');

async function updateDB() {
  console.log('--- Starting DB Expansion & Updates ---');
  
  try {
    await pool.query('ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL');
    console.log('✓ Added reset_token to users');
  } catch (err) {
    if (!err.message.includes('Duplicate column')) console.log('users reset_token:', err.message);
  }

  try {
    await pool.query('ALTER TABLE users ADD COLUMN reset_token_expires DATETIME NULL');
    console.log('✓ Added reset_token_expires to users');
  } catch (err) {
    if (!err.message.includes('Duplicate column')) console.log('users reset_token_expires:', err.message);
  }

  try {
    await pool.query('ALTER TABLE medical_history ADD COLUMN blood_type VARCHAR(10) NULL');
    console.log('✓ Added blood_type to medical_history');
  } catch (err) {
    if (!err.message.includes('Duplicate column')) console.log('medical_history blood_type:', err.message);
  }

  try {
    await pool.query("ALTER TABLE symptoms ADD COLUMN category VARCHAR(50) DEFAULT 'general'");
  } catch (err) {}
  try {
    await pool.query("ALTER TABLE symptoms ADD COLUMN icon VARCHAR(50) DEFAULT '🩺'");
  } catch (err) {}

  const symptoms = [
    // General
    { code: 'fever', ar: 'حمى وارتفاع حرارة', en: 'Fever', cat: 'general', icon: '🌡️', em: false },
    { code: 'fatigue', ar: 'إرهاق وتعب عام وخمول', en: 'Fatigue & Exhaustion', cat: 'general', icon: '😴', em: false },
    { code: 'chills', ar: 'قشعريرة ورجفة في الجسم', en: 'Chills & Shivering', cat: 'general', icon: '🥶', em: false },
    { code: 'weight_loss', ar: 'فقدان وزن غير مبرر', en: 'Unexplained Weight Loss', cat: 'general', icon: '📉', em: false },
    { code: 'weight_gain', ar: 'زيادة وزن مفاجئة واحتباس سوائل', en: 'Sudden Weight Gain', cat: 'general', icon: '📈', em: false },
    { code: 'night_sweats', ar: 'تعرق ليلي غزير', en: 'Severe Night Sweats', cat: 'general', icon: '💦', em: false },
    { code: 'loss_of_appetite', ar: 'فقدان تام للشهية', en: 'Loss of Appetite', cat: 'general', icon: '🍽️', em: false },
    { code: 'excessive_thirst', ar: 'عطش شديد ومستمر وجفاف الفم', en: 'Excessive Thirst', cat: 'general', icon: '🥤', em: false },
    { code: 'pallor', ar: 'شحوب واصفرار الوجه', en: 'Pale Skin (Pallor)', cat: 'general', icon: '😶', em: false },
    { code: 'swollen_lymph_nodes', ar: 'تورم الغدد اللمفاوية بالرقبة أو الإبط', en: 'Swollen Lymph Nodes', cat: 'general', icon: '🟣', em: false },
    { code: 'malaise', ar: 'توعك عام وضعف عام في الجسد', en: 'General Malaise', cat: 'general', icon: '🛌', em: false },

    // Respiratory
    { code: 'cough', ar: 'سعال جاف أو مصحوب ببلغم', en: 'Cough', cat: 'respiratory', icon: '🗣️', em: false },
    { code: 'shortness_of_breath', ar: 'ضيق وصعوبة في التنفس والتقاط النفس', en: 'Shortness of Breath', cat: 'respiratory', icon: '🫁', em: true },
    { code: 'wheezing', ar: 'صفير وأزيز في الصدر عند الزفير', en: 'Wheezing', cat: 'respiratory', icon: '💨', em: false },
    { code: 'hemoptysis', ar: 'سعال مصحوب بدم أو بصاق دموي', en: 'Coughing Blood (Hemoptysis)', cat: 'respiratory', icon: '🩸', em: true },
    { code: 'chest_tightness', ar: 'كتمة وانقباض وثقل في القفص الصدري', en: 'Chest Tightness', cat: 'respiratory', icon: '🔒', em: false },
    { code: 'rapid_breathing', ar: 'تسارع غير طبيعي في معدل التنفس', en: 'Rapid Breathing (Tachypnea)', cat: 'respiratory', icon: '⚡', em: true },
    { code: 'choking_sensation', ar: 'شعور بالاختناق وتشنج الحنجرة', en: 'Choking Sensation', cat: 'respiratory', icon: '🤐', em: true },
    { code: 'nasal_congestion', ar: 'احتقان وانسداد في الأنف', en: 'Nasal Congestion', cat: 'respiratory', icon: '👃', em: false },
    { code: 'runny_nose', ar: 'سيلان أنفي مائي أو كثيف', en: 'Runny Nose (Rhinorrhea)', cat: 'respiratory', icon: '💧', em: false },
    { code: 'sneezing', ar: 'عطس متكرر ومفاجئ', en: 'Frequent Sneezing', cat: 'respiratory', icon: '🤧', em: false },

    // Cardiovascular
    { code: 'chest_pain', ar: 'ألم أو ضغط ساحق في الصدر يمتد للكتف والفك', en: 'Crushing Chest Pain', cat: 'cardiovascular', icon: '💔', em: true },
    { code: 'palpitations', ar: 'خفقان وتسارع وقوة ضربات القلب', en: 'Heart Palpitations', cat: 'cardiovascular', icon: '💓', em: false },
    { code: 'irregular_heartbeat', ar: 'عدم انتظام أو تخطي نبضات القلب', en: 'Arrhythmia / Irregular Beat', cat: 'cardiovascular', icon: '〰️', em: true },
    { code: 'ankle_swelling', ar: 'تورم وانتفاخ في الكاحلين والقدمين (وذمة)', en: 'Swelling of Feet and Ankles', cat: 'cardiovascular', icon: '🦶', em: false },
    { code: 'cyanosis', ar: 'زرقة في الشفاه أو أطراف الأصابع', en: 'Cyanosis (Bluish Lips/Fingers)', cat: 'cardiovascular', icon: '🫐', em: true },
    { code: 'cold_extremities', ar: 'برودة مستمرة في اليدين والقدمين', en: 'Cold Hands and Feet', cat: 'cardiovascular', icon: '🧤', em: false },

    // Digestive
    { code: 'abdominal_pain', ar: 'ألم وتقلصات ومغص في البطن', en: 'Abdominal Cramps / Pain', cat: 'digestive', icon: '🤢', em: false },
    { code: 'severe_acute_abdomen', ar: 'ألم حاد مفاجئ وشديد جداً وتصلب في جدار البطن', en: 'Acute Severe Abdomen', cat: 'digestive', icon: '⚡', em: true },
    { code: 'nausea', ar: 'غثيان وشعور بالرغبة في التقيؤ', en: 'Nausea', cat: 'digestive', icon: '🥴', em: false },
    { code: 'vomiting', ar: 'تقيؤ متكرر وصعوبة إبقاء السوائل', en: 'Frequent Vomiting', cat: 'digestive', icon: '🤮', em: false },
    { code: 'vomiting_blood', ar: 'تقيؤ دم أحمر أو ترجيع يشبه ثفل القهوة', en: 'Vomiting Blood (Hematemesis)', cat: 'digestive', icon: '🩸', em: true },
    { code: 'diarrhea', ar: 'إسهال مائي مستمر لعدة مرات', en: 'Persistent Diarrhea', cat: 'digestive', icon: '🚽', em: false },
    { code: 'bloody_stool', ar: 'خروج دم مع البراز أو براز أسود داكن كالفحم', en: 'Bloody / Black Stool (Melena)', cat: 'digestive', icon: '⚠️', em: true },
    { code: 'constipation', ar: 'إمساك شديد وصعوبة وألم عند الإخراج', en: 'Severe Constipation', cat: 'digestive', icon: '🧱', em: false },
    { code: 'heartburn', ar: 'حرقة وحموضة تصعد للمريء والحلق', en: 'Heartburn & Acid Reflux', cat: 'digestive', icon: '🔥', em: false },
    { code: 'bloating', ar: 'انتفاخ وغازات وضغط مزعج بالبطن', en: 'Bloating & Excess Gas', cat: 'digestive', icon: '🎈', em: false },
    { code: 'difficulty_swallowing', ar: 'صعوبة أو ألم عند بلع الطعام والسوائل', en: 'Dysphagia (Difficulty Swallowing)', cat: 'digestive', icon: '🥖', em: false },
    { code: 'jaundice', ar: 'اصفرار بياض العين والجلد وبول داكن كالشاي', en: 'Jaundice (Yellow Skin/Eyes)', cat: 'digestive', icon: '🟡', em: true },

    // Neurological
    { code: 'headache', ar: 'صداع وألم في الرأس أو الجبهة', en: 'Headache', cat: 'neurological', icon: '🤕', em: false },
    { code: 'thunderclap_headache', ar: 'صداع انفجاري مفاجئ وشديد كالصاعقة', en: 'Thunderclap Severe Headache', cat: 'neurological', icon: '⚡', em: true },
    { code: 'dizziness', ar: 'دوار وعدم اتزان وخفة في الرأس', en: 'Dizziness & Lightheadedness', cat: 'neurological', icon: '💫', em: false },
    { code: 'vertigo', ar: 'دوخة دورانية تشعر فيها أن المكان يدور بك', en: 'True Vertigo', cat: 'neurological', icon: '🌀', em: false },
    { code: 'loss_of_consciousness', ar: 'إغماء وفقدان وعي وسقوط على الأرض', en: 'Loss of Consciousness / Syncope', cat: 'neurological', icon: '😵', em: true },
    { code: 'stroke_symptoms', ar: 'اعوجاج بالوجه أو خزل وضعف في الذراع أو ثقل بالنطق', en: 'Stroke Signs (Face, Arm, Speech)', cat: 'neurological', icon: '🚨', em: true },
    { code: 'stiff_neck', ar: 'تيبس وتصلب الرقبة مع صعوبة ثنيها للأمام', en: 'Stiff Neck with Fever', cat: 'neurological', icon: '🧣', em: true },
    { code: 'seizures', ar: 'تشنجات ونوبات صرعية واختلاج عضلي', en: 'Seizures & Convulsions', cat: 'neurological', icon: '⚡', em: true },
    { code: 'numbness', ar: 'تنميل أو خدر ووخز في الأطراف أو الوجه', en: 'Numbness and Tingling', cat: 'neurological', icon: '⚡', em: false },
    { code: 'tremor', ar: 'رجفة واهتزاز لا إرادي في اليدين أو الرأس', en: 'Tremor & Involuntary Shaking', cat: 'neurological', icon: '📳', em: false },
    { code: 'memory_loss', ar: 'تشوش ذهني وارتباك وفقدان تركيز مفاجئ', en: 'Confusion & Disorientation', cat: 'neurological', icon: '🧠', em: false },

    // Musculoskeletal
    { code: 'joint_pain', ar: 'ألم وتيبس في المفاصل (الركبة، الورك، اليدين)', en: 'Joint Pain & stiffness', cat: 'musculoskeletal', icon: '🦴', em: false },
    { code: 'joint_swelling', ar: 'احمرار وسخونة وتورم واضح في المفصل', en: 'Joint Swelling and Redness', cat: 'musculoskeletal', icon: '🔴', em: false },
    { code: 'muscle_pain', ar: 'ألم وتقلصات وشد عضلي مؤلم', en: 'Muscle Aches & Cramps', cat: 'musculoskeletal', icon: '💪', em: false },
    { code: 'lower_back_pain', ar: 'ألم أسفل الظهر يمتد للساقين (عرق النسا)', en: 'Lower Back Pain / Sciatica', cat: 'musculoskeletal', icon: '🧍', em: false },
    { code: 'neck_pain', ar: 'ألم وتشنج في عضلات الرقبة والكتفين', en: 'Neck & Shoulder Stiffness', cat: 'musculoskeletal', icon: '🦒', em: false },

    // Dermatological
    { code: 'skin_rash', ar: 'طفح جلدي أو بقع حمراء منتشرة', en: 'Skin Rash & Erythema', cat: 'dermatological', icon: '🩹', em: false },
    { code: 'itching', ar: 'حكة جلدية شديدة ومستمرة (هرش)', en: 'Severe Skin Itching (Pruritus)', cat: 'dermatological', icon: '🪶', em: false },
    { code: 'hives', ar: 'شَرَى وانتفاخات جلدية بارزة ومثيرة للحكة (أرتيكاريا)', en: 'Hives & Urticaria', cat: 'dermatological', icon: '🛑', em: false },
    { code: 'skin_ulcer', ar: 'قرحة جلدية مفتوحة أو جرح بطيء الالتئام', en: 'Non-Healing Skin Ulcer', cat: 'dermatological', icon: '🩸', em: false },
    { code: 'severe_skin_peeling', ar: 'تقشر جلد واسع مع فقاعات مائية مؤلمة', en: 'Extensive Blistering & Peeling', cat: 'dermatological', icon: '⚠️', em: true },

    // ENT & Eyes
    { code: 'sore_throat', ar: 'ألم والتهاب حاد في الحلق وصعوبة بلع', en: 'Sore Throat', cat: 'ent', icon: '🧣', em: false },
    { code: 'ear_pain', ar: 'ألم نابض داخل الأذن وإفرازات', en: 'Ear Pain & Discharge', cat: 'ent', icon: '👂', em: false },
    { code: 'tinnitus', ar: 'طنين أو رنين مزعج ومستمر في الأذن', en: 'Tinnitus (Ringing Ears)', cat: 'ent', icon: '🔔', em: false },
    { code: 'hearing_loss', ar: 'ضعف سمع مفاجئ أو كتمة في الأذن', en: 'Sudden Hearing Loss', cat: 'ent', icon: '🔕', em: false },
    { code: 'hoarseness', ar: 'بحة أو خشونة أو اختفاء الصوت', en: 'Hoarseness of Voice', cat: 'ent', icon: '🗣️', em: false },
    { code: 'eye_redness', ar: 'احمرار وحرقة وإفرازات في العين (رمد)', en: 'Eye Redness & Conjunctivitis', cat: 'ent', icon: '👁️', em: false },
    { code: 'vision_loss', ar: 'فقدان مفاجئ أو ضبابية حادة في الرؤية', en: 'Sudden Vision Loss or Blurring', cat: 'ent', icon: '🕶️', em: true },
    { code: 'eye_pain', ar: 'ألم عميق أو ضغط شديد بالعين وحولها', en: 'Severe Eye Pain & Pressure', cat: 'ent', icon: '👁️‍🗨️', em: true },
    { code: 'epistaxis', ar: 'نزيف متكرر أو غزير من الأنف (رعاف)', en: 'Persistent Nosebleed (Epistaxis)', cat: 'ent', icon: '🩸', em: false },

    // Urological
    { code: 'dysuria', ar: 'ألم وحرقة شديدة أثناء التبول', en: 'Painful Urination (Dysuria)', cat: 'urological', icon: '🚽', em: false },
    { code: 'frequent_urination', ar: 'تكرار التبول بكميات قليلة وبصورة ملحة', en: 'Frequent Urination', cat: 'urological', icon: '⏱️', em: false },
    { code: 'hematuria', ar: 'خروج دم مع البول (بول أحمر أو وردي)', en: 'Blood in Urine (Hematuria)', cat: 'urological', icon: '🩸', em: true },
    { code: 'urinary_retention', ar: 'احتباس بولي تام مع امتلاء المثانة وألم شديد', en: 'Acute Urinary Retention', cat: 'urological', icon: '🛑', em: true },
    { code: 'flank_pain', ar: 'مغص كلوي حاد في الخاصرة والظهر ينتشر للأسفل', en: 'Severe Kidney / Flank Pain', cat: 'urological', icon: '🫘', em: false },

    // Psychiatric
    { code: 'severe_anxiety', ar: 'قلق وتوتر نفسي حاد ونوبات هلع', en: 'Severe Anxiety & Panic Attacks', cat: 'psychiatric', icon: '⚡', em: false },
    { code: 'persistent_sadness', ar: 'حزن عميق مستمر وفقدان الشغف والمتعة', en: 'Persistent Depression', cat: 'psychiatric', icon: '🌧️', em: false },
    { code: 'hallucinations', ar: 'سماع أصوات أو رؤية أشياء لا يراها غيرك', en: 'Hallucinations & Delusions', cat: 'psychiatric', icon: '🌀', em: true },
    { code: 'suicidal_thoughts', ar: 'أفكار لإيذاء النفس أو رغبة بالموت واليأس', en: 'Suicidal Ideation / Crisis', cat: 'psychiatric', icon: '🆘', em: true }
  ];

  console.log('Upserting ' + symptoms.length + ' symptoms...');
  for (const s of symptoms) {
    await pool.query(
      `INSERT INTO symptoms (code, name_ar, name_en, category, icon, is_emergency_flag)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         name_ar = VALUES(name_ar),
         name_en = VALUES(name_en),
         category = VALUES(category),
         icon = VALUES(icon),
         is_emergency_flag = VALUES(is_emergency_flag)`,
      [s.code, s.ar, s.en, s.cat, s.icon, s.em ? 1 : 0]
    );
  }

  const [count] = await pool.query('SELECT COUNT(*) as total FROM symptoms');
  console.log('✓ Total Symptoms in DB: ' + count[0].total);
  console.log('--- Migration Finished Successfully ---');
  process.exit(0);
}

updateDB().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});