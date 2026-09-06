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

-- -------------------------------
-- Seed: common symptoms
-- -------------------------------
INSERT INTO symptoms (code, name_ar, name_en, is_emergency_flag) VALUES
('cough', 'سعال', 'Cough', FALSE),
('abdominal_pain', 'ألم في البطن', 'Abdominal Pain', FALSE),
('headache', 'صداع', 'Headache', FALSE),
('fever', 'حرارة مرتفعة', 'Fever', FALSE),
('chest_pain', 'ألم في الصدر', 'Chest Pain', TRUE),
('shortness_of_breath', 'ضيق تنفس', 'Shortness of Breath', TRUE),
('loss_of_consciousness', 'فقدان وعي', 'Loss of Consciousness', TRUE),
('stroke_symptoms', 'أعراض سكتة دماغية', 'Stroke Symptoms', TRUE)
ON DUPLICATE KEY UPDATE name_ar = VALUES(name_ar);

-- -------------------------------
-- Seed: follow-up questions for 'cough'
-- -------------------------------
INSERT INTO questions (symptom_id, question_ar, question_en, answer_type, is_emergency_trigger)
SELECT id, 'هل يوجد بلغم؟', 'Is there phlegm/mucus?', 'boolean', FALSE FROM symptoms WHERE code='cough';
INSERT INTO questions (symptom_id, question_ar, question_en, answer_type, is_emergency_trigger)
SELECT id, 'هل توجد حرارة مرتفعة؟', 'Is there a high fever?', 'boolean', FALSE FROM symptoms WHERE code='cough';
INSERT INTO questions (symptom_id, question_ar, question_en, answer_type, is_emergency_trigger)
SELECT id, 'هل يوجد ضيق تنفس؟', 'Is there shortness of breath?', 'boolean', TRUE FROM symptoms WHERE code='cough';

-- -------------------------------
-- Seed: follow-up questions for 'abdominal_pain'
-- -------------------------------
INSERT INTO questions (symptom_id, question_ar, question_en, answer_type, options, is_emergency_trigger)
SELECT id, 'أين يقع الألم بالضبط؟', 'Where exactly is the pain located?', 'single_choice',
  '["أعلى البطن","أسفل البطن","الجانب الأيمن","الجانب الأيسر","منتشر"]', FALSE
FROM symptoms WHERE code='abdominal_pain';
INSERT INTO questions (symptom_id, question_ar, question_en, answer_type, is_emergency_trigger)
SELECT id, 'هل يوجد غثيان أو تقيؤ؟', 'Is there nausea or vomiting?', 'boolean', FALSE FROM symptoms WHERE code='abdominal_pain';
INSERT INTO questions (symptom_id, question_ar, question_en, answer_type, is_emergency_trigger)
SELECT id, 'هل يوجد إسهال أو إمساك؟', 'Is there diarrhea or constipation?', 'boolean', FALSE FROM symptoms WHERE code='abdominal_pain';

-- -------------------------------
-- Seed: follow-up questions for 'headache'
-- -------------------------------
INSERT INTO questions (symptom_id, question_ar, question_en, answer_type, is_emergency_trigger)
SELECT id, 'هل الصداع مفاجئ وشديد جداً (الأسوأ في حياتك)؟', 'Is the headache sudden and extremely severe (worst of your life)?', 'boolean', TRUE FROM symptoms WHERE code='headache';
INSERT INTO questions (symptom_id, question_ar, question_en, answer_type, is_emergency_trigger)
SELECT id, 'هل يوجد غثيان أو حساسية للضوء؟', 'Is there nausea or light sensitivity?', 'boolean', FALSE FROM symptoms WHERE code='headache';

-- -------------------------------
-- Seed: follow-up questions for 'fever'
-- -------------------------------
INSERT INTO questions (symptom_id, question_ar, question_en, answer_type, is_emergency_trigger)
SELECT id, 'كم تبلغ درجة الحرارة تقريباً (بالمئوية)؟', 'What is the approximate temperature (Celsius)?', 'text', FALSE FROM symptoms WHERE code='fever';
INSERT INTO questions (symptom_id, question_ar, question_en, answer_type, is_emergency_trigger)
SELECT id, 'هل تستمر الحرارة أكثر من 3 أيام؟', 'Has the fever lasted more than 3 days?', 'boolean', FALSE FROM symptoms WHERE code='fever';
