// Comprehensive symptom list (67 symptoms across all medical disciplines)
// Used in assessment and as fallback if backend is loading.
const SYMPTOMS = [
  // 1. الأعراض العامة والجهازية (General & Systemic)
  { code: 'fever', name_ar: 'حرارة مرتفعة / حمى', name_en: 'High Fever', icon: '🌡️', category: 'general', emergency: false },
  { code: 'fatigue', name_ar: 'إرهاق عام وخمول مستمر', name_en: 'Fatigue & Lethargy', icon: '😴', category: 'general', emergency: false },
  { code: 'chills', name_ar: 'قشعريرة ورجفة بالجسم', name_en: 'Chills & Shivering', icon: '🥶', category: 'general', emergency: false },
  { code: 'loss_of_appetite', name_ar: 'فقدان الشهية للطعام', name_en: 'Loss of Appetite', icon: '🍽️', category: 'general', emergency: false },
  { code: 'night_sweats', name_ar: 'تعرق ليلي غزير', name_en: 'Night Sweats', icon: '💦', category: 'general', emergency: false },
  { code: 'unexplained_weight_loss', name_ar: 'نزول وزن مفاجئ غير مبرر', name_en: 'Unexplained Weight Loss', icon: '⚖️', category: 'general', emergency: false },
  { code: 'excessive_thirst', name_ar: 'عطش شديد وجفاف مستمر بالحلق', name_en: 'Excessive Thirst & Dry Mouth', icon: '🥤', category: 'general', emergency: false },
  { code: 'swollen_lymph_nodes', name_ar: 'انتفاخ الغدد اللمفاوية بالرقبة أو الإبط', name_en: 'Swollen Lymph Nodes', icon: '🩺', category: 'general', emergency: false },
  { code: 'heat_cold_intolerance', name_ar: 'عدم تحمل الحرارة أو البرودة الشديدة', name_en: 'Temperature Intolerance', icon: '🌡️', category: 'general', emergency: false },

  // 2. الأعراض التنفسية والصدرية والأنف والأذن والحنجرة (Respiratory, Chest & ENT)
  { code: 'cough', name_ar: 'سعال / كحة مستمرة', name_en: 'Cough', icon: '🗣️', category: 'respiratory', emergency: false },
  { code: 'cough_dry', name_ar: 'سعال جاف متهيج', name_en: 'Dry Cough', icon: '🤧', category: 'respiratory', emergency: false },
  { code: 'cough_phlegm', name_ar: 'سعال مصحوب ببلغم أو مخاط', name_en: 'Productive Cough with Phlegm', icon: '😷', category: 'respiratory', emergency: false },
  { code: 'shortness_of_breath', name_ar: 'ضيق وصعوبة حادة في التنفس', name_en: 'Shortness of Breath', icon: '🫁', category: 'respiratory', emergency: true },
  { code: 'sore_throat', name_ar: 'التهاب واحتقان الحلق وصعوبة البلع', name_en: 'Sore Throat & Painful Swallowing', icon: '🧣', category: 'respiratory', emergency: false },
  { code: 'runny_nose', name_ar: 'سيلان واحتقان الأنف وعطاس', name_en: 'Runny / Stuffy Nose & Sneezing', icon: '👃', category: 'respiratory', emergency: false },
  { code: 'wheezing', name_ar: 'صفير أو حشرجة أثناء التنفس', name_en: 'Wheezing in Chest', icon: '🌬️', category: 'respiratory', emergency: false },
  { code: 'loss_of_smell_taste', name_ar: 'فقدان حاسة الشم أو التذوق', name_en: 'Loss of Smell / Taste', icon: '🍋', category: 'respiratory', emergency: false },
  { code: 'chest_pain', name_ar: 'ألم ضاغط أو ثقل في الصدر', name_en: 'Chest Pain / Tightness', icon: '💔', category: 'respiratory', emergency: true },
  { code: 'palpitations', name_ar: 'خفقان وتسارع نبضات القلب', name_en: 'Heart Palpitations / Rapid Pulse', icon: '💓', category: 'respiratory', emergency: false },
  { code: 'ear_pain', name_ar: 'ألم أو ضغط أو إفرازات في الأذن', name_en: 'Ear Pain / Fullness', icon: '👂', category: 'respiratory', emergency: false },
  { code: 'hoarseness', name_ar: 'بحة أو تغير مفاجئ في الصوت', name_en: 'Hoarseness / Voice Changes', icon: '📢', category: 'respiratory', emergency: false },
  { code: 'sinus_facial_pain', name_ar: 'ألم وضغط في الجيوب الأنفية والوجه', name_en: 'Sinus Pressure & Facial Pain', icon: '🤕', category: 'respiratory', emergency: false },
  { code: 'nosebleed', name_ar: 'نزيف من الأنف (رعاف متكرر)', name_en: 'Nosebleed (Epistaxis)', icon: '🩸', category: 'respiratory', emergency: false },

  // 3. الجهاز الهضمي والبطن (Digestive & Abdominal)
  { code: 'abdominal_pain', name_ar: 'ألم أو مغص في البطن', name_en: 'Abdominal Pain / Cramps', icon: '🤢', category: 'digestive', emergency: false },
  { code: 'nausea_vomiting', name_ar: 'غثيان مستمر أو تقيؤ', name_en: 'Nausea or Vomiting', icon: '🤮', category: 'digestive', emergency: false },
  { code: 'diarrhea', name_ar: 'إسهال مائي متكرر', name_en: 'Frequent Diarrhea', icon: '💧', category: 'digestive', emergency: false },
  { code: 'constipation', name_ar: 'إمساك وصعوبة إخراج لأيام', name_en: 'Constipation & Straining', icon: '🧱', category: 'digestive', emergency: false },
  { code: 'heartburn', name_ar: 'حموضة وحرقة بالمعدة والارتجاع المريئي', name_en: 'Heartburn / Acid Reflux', icon: '🔥', category: 'digestive', emergency: false },
  { code: 'bloating', name_ar: 'انتفاخ وغازات البطن وعسر الهضم', name_en: 'Abdominal Bloating & Gas', icon: '🎈', category: 'digestive', emergency: false },
  { code: 'vomiting_blood', name_ar: 'تقيؤ دموي أو براز أسود داكن', name_en: 'Vomiting Blood / Dark Stool', icon: '⚠️', category: 'digestive', emergency: true },
  { code: 'difficulty_swallowing', name_ar: 'صعوبة أو وقوف الطعام في المريء', name_en: 'Difficulty Swallowing (Dysphagia)', icon: '🥖', category: 'digestive', emergency: false },
  { code: 'jaundice', name_ar: 'اصفرار الجلد أو بياض العينين وتغير لون البول', name_en: 'Jaundice (Yellow Skin/Eyes)', icon: '🟡', category: 'digestive', emergency: false },
  { code: 'rectal_bleeding', name_ar: 'نزيف شرجي أو دم أحمر مع الإخراج', name_en: 'Rectal Bleeding / Blood in Stool', icon: '🩸', category: 'digestive', emergency: false },

  // 4. الرأس والجهاز العصبي والصحة النفسية (Neurological & Head)
  { code: 'headache', name_ar: 'صداع عام في الرأس', name_en: 'General Headache', icon: '🤕', category: 'neurological', emergency: false },
  { code: 'migraine_throbbing', name_ar: 'صداع نصفي نابض مع حساسية ضوء وصوت', name_en: 'Throbbing Migraine', icon: '⚡', category: 'neurological', emergency: false },
  { code: 'dizziness', name_ar: 'دوخة أو دوار وعدم اتزان حركي', name_en: 'Dizziness / Vertigo', icon: '💫', category: 'neurological', emergency: false },
  { code: 'blurred_vision', name_ar: 'تشوش أو زغللة أو ازدواجية الرؤية', name_en: 'Blurred / Double Vision', icon: '👁️', category: 'neurological', emergency: false },
  { code: 'tinnitus', name_ar: 'طنين أو رنين مزعج في الأذن', name_en: 'Ear Ringing (Tinnitus)', icon: '🔔', category: 'neurological', emergency: false },
  { code: 'numbness_tingling', name_ar: 'خدر أو تنميل ووخز في الأطراف', name_en: 'Numbness / Tingling in Limbs', icon: '⚡', category: 'neurological', emergency: false },
  { code: 'stiff_neck', name_ar: 'تيبس وألم شديد في الرقبة مع حرارة', name_en: 'Stiff Neck with Severe Pain', icon: '🦯', category: 'neurological', emergency: true },
  { code: 'loss_of_consciousness', name_ar: 'إغماء أو فقدان وعي مفاجئ', name_en: 'Fainting / Loss of Consciousness', icon: '😵', category: 'neurological', emergency: true },
  { code: 'stroke_symptoms', name_ar: 'ثقل مفاجئ في الكلام أو انحراف بالوجه أو شلل طرفي', name_en: 'Sudden Facial Droop / Slurred Speech', icon: '🚨', category: 'neurological', emergency: true },
  { code: 'tremors_shaking', name_ar: 'رجفة أو ارتعاش لا إرادي باليدين', name_en: 'Hand Tremors / Involuntary Shaking', icon: '👋', category: 'neurological', emergency: false },
  { code: 'memory_confusion', name_ar: 'ارتباك ذهني وتشوش بالذاكرة والتركيز', name_en: 'Confusion & Memory Loss', icon: '🧩', category: 'neurological', emergency: false },
  { code: 'severe_anxiety', name_ar: 'قلق حاد ونوبات هلع مع خوف وضيق نفس', name_en: 'Severe Anxiety / Panic Attacks', icon: '😰', category: 'neurological', emergency: false },
  { code: 'insomnia', name_ar: 'أرق شديد وصعوبة الاستغراق في النوم', name_en: 'Severe Insomnia / Sleep Issues', icon: '🌙', category: 'neurological', emergency: false },

  // 5. العضلات والمفاصل والعظام (Musculoskeletal)
  { code: 'joint_pain', name_ar: 'آلام وتيبس في المفاصل', name_en: 'Joint Pain & Morning Stiffness', icon: '🦴', category: 'musculoskeletal', emergency: false },
  { code: 'muscle_aches', name_ar: 'آلام عضلية وتكسير عام بالجسم', name_en: 'Muscle Aches & Body Pains', icon: '💪', category: 'musculoskeletal', emergency: false },
  { code: 'back_pain', name_ar: 'ألم في أسفل الظهر مع صعوبة الحركة', name_en: 'Lower Back Pain', icon: '🧍', category: 'musculoskeletal', emergency: false },
  { code: 'joint_swelling', name_ar: 'تورم أو احمرار وسخونة حول المفصل', name_en: 'Joint Swelling & Warmth', icon: '🔴', category: 'musculoskeletal', emergency: false },
  { code: 'neck_pain', name_ar: 'ألم وتشنج بعضلات الرقبة والأكتاف', name_en: 'Neck & Shoulder Muscle Spasms', icon: '🧣', category: 'musculoskeletal', emergency: false },
  { code: 'knee_pain', name_ar: 'ألم أو طقطقة وصعوبة ثني الركبة', name_en: 'Knee Pain & Clicking', icon: '🦵', category: 'musculoskeletal', emergency: false },
  { code: 'muscle_weakness', name_ar: 'ضعف عضلي ملحوظ وصعوبة حمل الأشياء', name_en: 'Muscle Weakness', icon: '📉', category: 'musculoskeletal', emergency: false },
  { code: 'sciatica_radiating', name_ar: 'ألم ممتد من الظهر أو المقعدة إلى الساق (عرق النسا)', name_en: 'Sciatica / Radiating Leg Pain', icon: '⚡', category: 'musculoskeletal', emergency: false },

  // 6. الجلد والعيون والأسنان (Dermatological, Eyes & Dental)
  { code: 'skin_rash', name_ar: 'طفح جلدي أو بقع وتغير في لون الجلد', name_en: 'Skin Rash or Lesions', icon: '🧴', category: 'dermatological', emergency: false },
  { code: 'hives_urticaria', name_ar: 'شرى وانتفاخات جلدية حمراء شديدة الحكة', name_en: 'Hives (Urticaria) & Itching', icon: '🔥', category: 'dermatological', emergency: false },
  { code: 'severe_itching', name_ar: 'حكة جلدية شديدة دون طفح واضح', name_en: 'Severe Skin Itching (Pruritus)', icon: '✋', category: 'dermatological', emergency: false },
  { code: 'skin_ulcer', name_ar: 'قرحة جلدية أو جرح بطيء الالتئام', name_en: 'Skin Ulcer or Non-healing Wound', icon: '🩹', category: 'dermatological', emergency: false },
  { code: 'eye_redness', name_ar: 'احمرار وحرقة في العين مع إفرازات', name_en: 'Eye Redness & Irritation (Conjunctivitis)', icon: '👁️', category: 'dermatological', emergency: false },
  { code: 'eye_pain', name_ar: 'ألم عميق بالعين أو حساسية مفرطة للضوء', name_en: 'Eye Pain & Photophobia', icon: '👀', category: 'dermatological', emergency: false },
  { code: 'toothache', name_ar: 'ألم حاد في الأسنان أو الفك عند الأكل', name_en: 'Toothache & Jaw Pain', icon: '🦷', category: 'dermatological', emergency: false },
  { code: 'bleeding_gums', name_ar: 'نزيف وتورم اللثة عند تفريش الأسنان', name_en: 'Swollen & Bleeding Gums', icon: '🩸', category: 'dermatological', emergency: false },

  // 7. الجهاز البولي والكلى (Urinary & Renal)
  { code: 'urinary_burning', name_ar: 'حرقة أو ألم أثناء التبول', name_en: 'Painful / Burning Urination (Dysuria)', icon: '🚽', category: 'dermatological', emergency: false },
  { code: 'frequent_urination', name_ar: 'كثرة التبول غير المعتادة ليلاً ونهاراً', name_en: 'Frequent Urination', icon: '⏳', category: 'dermatological', emergency: false },
  { code: 'blood_in_urine', name_ar: 'دم في البول (بول أحمر أو وردي أو داكن)', name_en: 'Blood in Urine (Hematuria)', icon: '🩸', category: 'dermatological', emergency: true },
  { code: 'flank_kidney_pain', name_ar: 'مغص كلوي وألم حاد في الخاصرة وأسفل الظهر', name_en: 'Flank / Kidney Pain (Renal Colic)', icon: '⚡', category: 'dermatological', emergency: false },
  { code: 'urinary_urgency', name_ar: 'إلحاح بولي مفاجئ وصعوبة في حبس البول', name_en: 'Urinary Urgency & Incontinence', icon: '💧', category: 'dermatological', emergency: false },
];

export default SYMPTOMS;
