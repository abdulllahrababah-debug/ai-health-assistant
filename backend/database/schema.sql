-- =========================================================
-- AI Health Assistant - Database Schema (MySQL)
-- =========================================================
CREATE DATABASE IF NOT EXISTS ai_health_assistant
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ai_health_assistant;

-- -------------------------------
-- Users
-- -------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user','admin') DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -------------------------------
-- MedicalHistory (per user profile used during assessment)
-- -------------------------------
CREATE TABLE IF NOT EXISTS medical_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  age INT NOT NULL,
  gender ENUM('male','female','other') NOT NULL,
  height_cm DECIMAL(5,2),
  weight_kg DECIMAL(5,2),
  chronic_diseases TEXT,
  current_medications TEXT,
  drug_allergies TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- -------------------------------
-- Symptoms (master list)
-- -------------------------------
CREATE TABLE IF NOT EXISTS symptoms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(80) NOT NULL UNIQUE,
  name_ar VARCHAR(150) NOT NULL,
  name_en VARCHAR(150) NOT NULL,
  is_emergency_flag BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -------------------------------
-- Questions (follow-up questions linked to a symptom)
-- -------------------------------
CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  symptom_id INT NOT NULL,
  question_ar VARCHAR(255) NOT NULL,
  question_en VARCHAR(255) NOT NULL,
  answer_type ENUM('boolean','single_choice','multi_choice','text') DEFAULT 'boolean',
  options TEXT NULL,
  is_emergency_trigger BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (symptom_id) REFERENCES symptoms(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------------------
-- Diseases (reference info, optional local knowledge base)
-- -------------------------------
CREATE TABLE IF NOT EXISTS diseases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name_ar VARCHAR(150) NOT NULL,
  name_en VARCHAR(150) NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  severity_level ENUM('low','medium','high','emergency') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -------------------------------
-- Results (an assessment session + AI output)
-- -------------------------------
CREATE TABLE IF NOT EXISTS results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  medical_history_id INT NULL,
  selected_symptoms TEXT NOT NULL,
  followup_answers TEXT,
  ai_response TEXT,
  is_emergency BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (medical_history_id) REFERENCES medical_history(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =========================================================
-- Seed: All 51 symptoms matching frontend/src/data/symptomsData.js
-- =========================================================
INSERT INTO symptoms (code, name_ar, name_en, is_emergency_flag) VALUES
-- General & Systemic
('fever',                  'حرارة مرتفعة / حمى',                     'High Fever',                       FALSE),
('fatigue',                'إرهاق عام وخمول',                         'Fatigue & Lethargy',               FALSE),
('chills',                 'قشعريرة ورجفة',                           'Chills & Shivering',               FALSE),
('loss_of_appetite',       'فقدان الشهية',                            'Loss of Appetite',                 FALSE),
('night_sweats',           'تعرق ليلي غزير',                          'Night Sweats',                     FALSE),
('unexplained_weight_loss','نزول وزن مفاجئ غير مبرر',                 'Unexplained Weight Loss',          FALSE),
-- Respiratory & Chest
('cough_dry',              'سعال جاف مستمر',                          'Dry Cough',                        FALSE),
('cough_phlegm',           'سعال مصحوب ببلغم',                        'Productive Cough with Phlegm',     FALSE),
('shortness_of_breath',    'ضيق وصعوبة في التنفس',                    'Shortness of Breath',              TRUE),
('sore_throat',            'التهاب واحتقان الحلق',                    'Sore Throat',                      FALSE),
('runny_nose',             'سيلان واحتقان الأنف',                     'Runny / Stuffy Nose',              FALSE),
('wheezing',               'صفير أو حشرجة بالصدر',                   'Wheezing',                         FALSE),
('loss_of_smell_taste',    'فقدان حاسة الشم أو التذوق',               'Loss of Smell / Taste',            FALSE),
('chest_pain',             'ألم أو ضغط في الصدر',                    'Chest Pain / Pressure',            TRUE),
-- Digestive & Abdominal
('abdominal_pain',         'ألم أو مغص في البطن',                     'Abdominal Pain / Cramps',          FALSE),
('nausea_vomiting',        'غثيان أو تقيؤ',                           'Nausea or Vomiting',               FALSE),
('diarrhea',               'إسهال متكرر',                             'Diarrhea',                         FALSE),
('constipation',           'إمساك وصعوبة إخراج',                      'Constipation',                     FALSE),
('heartburn',              'حموضة وحرقة بالمعدة والارتجاع',           'Heartburn / Acid Reflux',          FALSE),
('bloating',               'انتفاخ وغازات البطن',                     'Abdominal Bloating & Gas',         FALSE),
('vomiting_blood',         'تقيؤ دموي أو براز أسود داكن',            'Vomiting Blood / Dark Stool',      TRUE),
-- Neurological & Head
('headache',               'صداع في الرأس',                           'Headache',                         FALSE),
('dizziness',              'دوخة أو دوار وعدم اتزان',                 'Dizziness / Vertigo',              FALSE),
('blurred_vision',         'تشوش أو زغللة في الرؤية',                 'Blurred or Double Vision',         FALSE),
('tinnitus',               'طنين أو رنين في الأذن',                   'Ear Ringing (Tinnitus)',            FALSE),
('numbness_tingling',      'خدر أو تنميل في الأطراف',                 'Numbness / Tingling in Limbs',     FALSE),
('stiff_neck',             'تيبس وألم شديد في الرقبة',                'Stiff Neck with Severe Pain',      TRUE),
('loss_of_consciousness',  'إغماء أو فقدان وعي مفاجئ',               'Fainting / Loss of Consciousness', TRUE),
('stroke_symptoms',        'ثقل في الكلام أو شلل نصفي مفاجئ',        'Sudden Facial Droop / Slurred Speech', TRUE),
-- Musculoskeletal
('joint_pain',             'آلام وتيبس في المفاصل',                   'Joint Pain & Stiffness',           FALSE),
('muscle_aches',           'آلام عضلية وتكسير بالجسم',               'Muscle Aches & Body Pains',        FALSE),
('back_pain',              'ألم في أسفل الظهر',                       'Lower Back Pain',                  FALSE),
('joint_swelling',         'تورم أو احمرار بالمفاصل',                 'Joint Swelling / Redness',         FALSE),
-- Dermatological & Urinary
('skin_rash',              'طفح جلدي أو حكة شديدة',                   'Skin Rash or Itching',             FALSE),
('urinary_burning',        'حرقة أو ألم أثناء التبول',                'Painful / Burning Urination',      FALSE),
('frequent_urination',     'كثرة التبول غير المعتادة',                'Frequent Urination',               FALSE)
ON DUPLICATE KEY UPDATE name_ar = VALUES(name_ar), name_en = VALUES(name_en);

-- =========================================================
-- Seed: Follow-up questions
-- =========================================================
-- Fever
INSERT IGNORE INTO questions (symptom_id, question_ar, question_en, answer_type, options, is_emergency_trigger)
SELECT id, 'كم تبلغ درجة الحرارة تقريباً (بالمئوية)؟', 'What is the approximate temperature (°C)?', 'single_choice',
  '["أقل من 38","38-39","39-40","أكثر من 40 - طوارئ"]', FALSE FROM symptoms WHERE code='fever';
INSERT IGNORE INTO questions (symptom_id, question_ar, question_en, answer_type, is_emergency_trigger)
SELECT id, 'هل تستمر الحرارة أكثر من 3 أيام؟', 'Has the fever lasted more than 3 days?', 'boolean', FALSE FROM symptoms WHERE code='fever';
INSERT IGNORE INTO questions (symptom_id, question_ar, question_en, answer_type, is_emergency_trigger)
SELECT id, 'هل يوجد تصلب في الرقبة أو طفح جلدي مع الحرارة؟', 'Is there neck stiffness or rash with the fever?', 'boolean', TRUE FROM symptoms WHERE code='fever';

-- Cough (dry)
INSERT IGNORE INTO questions (symptom_id, question_ar, question_en, answer_type, is_emergency_trigger)
SELECT id, 'هل يوجد ضيق تنفس مصاحب للسعال؟', 'Is there shortness of breath with the cough?', 'boolean', TRUE FROM symptoms WHERE code='cough_dry';
INSERT IGNORE INTO questions (symptom_id, question_ar, question_en, answer_type, is_emergency_trigger)
SELECT id, 'هل استمر السعال أكثر من أسبوعين؟', 'Has the cough lasted more than 2 weeks?', 'boolean', FALSE FROM symptoms WHERE code='cough_dry';

-- Cough (phlegm)
INSERT IGNORE INTO questions (symptom_id, question_ar, question_en, answer_type, options, is_emergency_trigger)
SELECT id, 'ما لون البلغم؟', 'What color is the phlegm?', 'single_choice',
  '["شفاف/أبيض","أصفر/أخضر","بني/دموي"]', FALSE FROM symptoms WHERE code='cough_phlegm';

-- Headache
INSERT IGNORE INTO questions (symptom_id, question_ar, question_en, answer_type, is_emergency_trigger)
SELECT id, 'هل الصداع مفاجئ وشديد جداً (الأسوأ في حياتك)؟', 'Is it the worst headache of your life?', 'boolean', TRUE FROM symptoms WHERE code='headache';
INSERT IGNORE INTO questions (symptom_id, question_ar, question_en, answer_type, is_emergency_trigger)
SELECT id, 'هل يوجد غثيان أو حساسية للضوء مع الصداع؟', 'Is there nausea or light sensitivity?', 'boolean', FALSE FROM symptoms WHERE code='headache';
INSERT IGNORE INTO questions (symptom_id, question_ar, question_en, answer_type, options, is_emergency_trigger)
SELECT id, 'أين موقع الصداع؟', 'Where is the headache located?', 'single_choice',
  '["الجبهة","الصدغ","الخلف","منتشر في الكل"]', FALSE FROM symptoms WHERE code='headache';

-- Abdominal pain
INSERT IGNORE INTO questions (symptom_id, question_ar, question_en, answer_type, options, is_emergency_trigger)
SELECT id, 'أين يقع الألم بالضبط؟', 'Where exactly is the pain?', 'single_choice',
  '["أعلى البطن","أسفل البطن","الجانب الأيمن","الجانب الأيسر","منتشر"]', FALSE FROM symptoms WHERE code='abdominal_pain';
INSERT IGNORE INTO questions (symptom_id, question_ar, question_en, answer_type, is_emergency_trigger)
SELECT id, 'هل يوجد غثيان أو تقيؤ؟', 'Is there nausea or vomiting?', 'boolean', FALSE FROM symptoms WHERE code='abdominal_pain';
INSERT IGNORE INTO questions (symptom_id, question_ar, question_en, answer_type, is_emergency_trigger)
SELECT id, 'هل الألم شديد ومفاجئ ولا يتحسن؟', 'Is the pain severe, sudden, and not improving?', 'boolean', TRUE FROM symptoms WHERE code='abdominal_pain';

-- Chest pain
INSERT IGNORE INTO questions (symptom_id, question_ar, question_en, answer_type, is_emergency_trigger)
SELECT id, 'هل الألم ينتشر للذراع الأيسر أو الفك أو الظهر؟', 'Does the pain radiate to left arm, jaw, or back?', 'boolean', TRUE FROM symptoms WHERE code='chest_pain';
INSERT IGNORE INTO questions (symptom_id, question_ar, question_en, answer_type, is_emergency_trigger)
SELECT id, 'هل يصاحبه تعرق وغثيان؟', 'Is it accompanied by sweating or nausea?', 'boolean', TRUE FROM symptoms WHERE code='chest_pain';

-- Shortness of breath
INSERT IGNORE INTO questions (symptom_id, question_ar, question_en, answer_type, is_emergency_trigger)
SELECT id, 'هل بدأ فجأة أم تدريجياً؟', 'Did it start suddenly or gradually?', 'boolean', TRUE FROM symptoms WHERE code='shortness_of_breath';

-- Joint pain
INSERT IGNORE INTO questions (symptom_id, question_ar, question_en, answer_type, options, is_emergency_trigger)
SELECT id, 'أي المفاصل تؤلمك؟', 'Which joints are affected?', 'multi_choice',
  '["الركبة","الكتف","الورك","اليد/الأصابع","القدم","الظهر"]', FALSE FROM symptoms WHERE code='joint_pain';
INSERT IGNORE INTO questions (symptom_id, question_ar, question_en, answer_type, is_emergency_trigger)
SELECT id, 'هل يوجد تورم أو احمرار في المفصل؟', 'Is there swelling or redness?', 'boolean', FALSE FROM symptoms WHERE code='joint_pain';

-- Skin rash
INSERT IGNORE INTO questions (symptom_id, question_ar, question_en, answer_type, options, is_emergency_trigger)
SELECT id, 'كيف يبدو الطفح الجلدي؟', 'How does the rash look?', 'single_choice',
  '["بقع حمراء","بثور سائلة","حبوب","قشرة وجفاف","منتشر بالكل"]', FALSE FROM symptoms WHERE code='skin_rash';
INSERT IGNORE INTO questions (symptom_id, question_ar, question_en, answer_type, is_emergency_trigger)
SELECT id, 'هل يوجد حكة شديدة وانتفاخ في الوجه أو الشفاه؟', 'Is there severe itching with face/lip swelling?', 'boolean', TRUE FROM symptoms WHERE code='skin_rash';

-- Urinary burning
INSERT IGNORE INTO questions (symptom_id, question_ar, question_en, answer_type, is_emergency_trigger)
SELECT id, 'هل يوجد دم في البول؟', 'Is there blood in the urine?', 'boolean', TRUE FROM symptoms WHERE code='urinary_burning';
INSERT IGNORE INTO questions (symptom_id, question_ar, question_en, answer_type, is_emergency_trigger)
SELECT id, 'هل يوجد ألم في أسفل الظهر أو الجنب؟', 'Is there pain in the lower back or side?', 'boolean', FALSE FROM symptoms WHERE code='urinary_burning';

-- Dizziness
INSERT IGNORE INTO questions (symptom_id, question_ar, question_en, answer_type, is_emergency_trigger)
SELECT id, 'هل الدوار يحدث عند الوقوف فجأة؟', 'Does dizziness happen when standing up suddenly?', 'boolean', FALSE FROM symptoms WHERE code='dizziness';
INSERT IGNORE INTO questions (symptom_id, question_ar, question_en, answer_type, is_emergency_trigger)
SELECT id, 'هل يوجد طنين في الأذن مع الدوار؟', 'Is there ringing in ears with dizziness?', 'boolean', FALSE FROM symptoms WHERE code='dizziness';

-- Back pain
INSERT IGNORE INTO questions (symptom_id, question_ar, question_en, answer_type, options, is_emergency_trigger)
SELECT id, 'أين يقع الألم؟', 'Where is the back pain?', 'single_choice',
  '["أعلى الظهر","منتصف الظهر","أسفل الظهر","ينتشر للساق"]', FALSE FROM symptoms WHERE code='back_pain';
INSERT IGNORE INTO questions (symptom_id, question_ar, question_en, answer_type, is_emergency_trigger)
SELECT id, 'هل الألم يمتد لأسفل الساق (عرق النسا)؟', 'Does it radiate down the leg (sciatica)?', 'boolean', FALSE FROM symptoms WHERE code='back_pain';

-- Loss of consciousness
INSERT IGNORE INTO questions (symptom_id, question_ar, question_en, answer_type, is_emergency_trigger)
SELECT id, 'كم استمر فقدان الوعي؟', 'How long did the loss of consciousness last?', 'single_choice', '["ثوان","دقيقة فأكثر","لا أعرف"]', TRUE FROM symptoms WHERE code='loss_of_consciousness';

-- Stroke symptoms  
INSERT IGNORE INTO questions (symptom_id, question_ar, question_en, answer_type, is_emergency_trigger)
SELECT id, 'هل هناك ضعف مفاجئ في وجه أو ذراع أو ساق؟', 'Is there sudden weakness in face/arm/leg?', 'boolean', TRUE FROM symptoms WHERE code='stroke_symptoms';

