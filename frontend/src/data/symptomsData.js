// Fallback local symptom list, used if the backend /api/symptoms call
// hasn't loaded yet or for quick local prototyping.
const SYMPTOMS = [
  // 1. الأعراض العامة والجهازية (General & Systemic)
  { code: 'fever', name_ar: 'حرارة مرتفعة / حمى', name_en: 'High Fever', icon: '🌡️', category: 'general', emergency: false },
  { code: 'fatigue', name_ar: 'إرهاق عام وخمول', name_en: 'Fatigue & Lethargy', icon: '😴', category: 'general', emergency: false },
  { code: 'chills', name_ar: 'قشعريرة ورجفة', name_en: 'Chills & Shivering', icon: '🥶', category: 'general', emergency: false },
  { code: 'loss_of_appetite', name_ar: 'فقدان الشهية', name_en: 'Loss of Appetite', icon: '🍽️', category: 'general', emergency: false },
  { code: 'night_sweats', name_ar: 'تعرق ليلي غزير', name_en: 'Night Sweats', icon: '💦', category: 'general', emergency: false },
  { code: 'unexplained_weight_loss', name_ar: 'نزول وزن مفاجئ غير مبرر', name_en: 'Unexplained Weight Loss', icon: '⚖️', category: 'general', emergency: false },

  // 2. الأعراض التنفسية والصدرية (Respiratory & Chest)
  { code: 'cough', name_ar: 'سعال / كحة مستمرة', name_en: 'Cough', icon: '🗣️', category: 'respiratory', emergency: false },
  { code: 'cough_dry', name_ar: 'سعال جاف مستمر', name_en: 'Dry Cough', icon: '🤧', category: 'respiratory', emergency: false },
  { code: 'cough_phlegm', name_ar: 'سعال مصحوب ببلغم', name_en: 'Productive Cough with Phlegm', icon: '😷', category: 'respiratory', emergency: false },
  { code: 'shortness_of_breath', name_ar: 'ضيق وصعوبة في التنفس', name_en: 'Shortness of Breath', icon: '🫁', category: 'respiratory', emergency: true },
  { code: 'sore_throat', name_ar: 'التهاب واحتقان الحلق', name_en: 'Sore Throat', icon: '🧣', category: 'respiratory', emergency: false },
  { code: 'runny_nose', name_ar: 'سيلان واحتقان الأنف', name_en: 'Runny / Stuffy Nose', icon: '👃', category: 'respiratory', emergency: false },
  { code: 'wheezing', name_ar: 'صفير أو حشرجة بالصدر', name_en: 'Wheezing', icon: '🌬️', category: 'respiratory', emergency: false },
  { code: 'loss_of_smell_taste', name_ar: 'فقدان حاسة الشم أو التذوق', name_en: 'Loss of Smell / Taste', icon: '🍋', category: 'respiratory', emergency: false },
  { code: 'chest_pain', name_ar: 'ألم أو ضغط في الصدر', name_en: 'Chest Pain / Pressure', icon: '💔', category: 'respiratory', emergency: true },

  // 3. الجهاز الهضمي والبطن (Digestive & Abdominal)
  { code: 'abdominal_pain', name_ar: 'ألم أو مغص في البطن', name_en: 'Abdominal Pain / Cramps', icon: '🤢', category: 'digestive', emergency: false },
  { code: 'nausea_vomiting', name_ar: 'غثيان أو تقيؤ', name_en: 'Nausea or Vomiting', icon: '🤮', category: 'digestive', emergency: false },
  { code: 'diarrhea', name_ar: 'إسهال متكرر', name_en: 'Diarrhea', icon: '💧', category: 'digestive', emergency: false },
  { code: 'constipation', name_ar: 'إمساك وصعوبة إخراج', name_en: 'Constipation', icon: '🧱', category: 'digestive', emergency: false },
  { code: 'heartburn', name_ar: 'حموضة وحرقة بالمعدة والارتجاع', name_en: 'Heartburn / Acid Reflux', icon: '🔥', category: 'digestive', emergency: false },
  { code: 'bloating', name_ar: 'انتفاخ وغازات البطن', name_en: 'Abdominal Bloating & Gas', icon: '🎈', category: 'digestive', emergency: false },
  { code: 'vomiting_blood', name_ar: 'تقيؤ دموي أو براز أسود داكن', name_en: 'Vomiting Blood / Dark Stool', icon: '⚠️', category: 'digestive', emergency: true },

  // 4. الرأس والجهاز العصبي (Neurological & Head)
  { code: 'headache', name_ar: 'صداع في الرأس', name_en: 'Headache', icon: '🤕', category: 'neurological', emergency: false },
  { code: 'dizziness', name_ar: 'دوخة أو دوار وعدم اتزان', name_en: 'Dizziness / Vertigo', icon: '💫', category: 'neurological', emergency: false },
  { code: 'blurred_vision', name_ar: 'تشوش أو زغللة في الرؤية', name_en: 'Blurred or Double Vision', icon: '👁️', category: 'neurological', emergency: false },
  { code: 'tinnitus', name_ar: 'طنين أو رنين في الأذن', name_en: 'Ear Ringing (Tinnitus)', icon: '👂', category: 'neurological', emergency: false },
  { code: 'numbness_tingling', name_ar: 'خدر أو تنميل في الأطراف', name_en: 'Numbness / Tingling in Limbs', icon: '⚡', category: 'neurological', emergency: false },
  { code: 'stiff_neck', name_ar: 'تيبس وألم شديد في الرقبة', name_en: 'Stiff Neck with Severe Pain', icon: '🦯', category: 'neurological', emergency: true },
  { code: 'loss_of_consciousness', name_ar: 'إغماء أو فقدان وعي مفاجئ', name_en: 'Fainting / Loss of Consciousness', icon: '😵', category: 'neurological', emergency: true },
  { code: 'stroke_symptoms', name_ar: 'ثقل في الكلام أو شلل نصفي مفاجئ', name_en: 'Sudden Facial Droop / Slurred Speech', icon: '🚨', category: 'neurological', emergency: true },

  // 5. العضلات والمفاصل والعظام (Musculoskeletal)
  { code: 'joint_pain', name_ar: 'آلام وتيبس في المفاصل', name_en: 'Joint Pain & Stiffness', icon: '🦴', category: 'musculoskeletal', emergency: false },
  { code: 'muscle_aches', name_ar: 'آلام عضلية وتكسير بالجسم', name_en: 'Muscle Aches & Body Pains', icon: '💪', category: 'musculoskeletal', emergency: false },
  { code: 'back_pain', name_ar: 'ألم في أسفل الظهر', name_en: 'Lower Back Pain', icon: '🧍', category: 'musculoskeletal', emergency: false },
  { code: 'joint_swelling', name_ar: 'تورم أو احمرار بالمفاصل', name_en: 'Joint Swelling / Redness', icon: '🔴', category: 'musculoskeletal', emergency: false },

  // 6. الجلد والجهاز البولي (Dermatological & Urinary)
  { code: 'skin_rash', name_ar: 'طفح جلدي أو حكة شديدة', name_en: 'Skin Rash or Itching', icon: '🧴', category: 'dermatological', emergency: false },
  { code: 'urinary_burning', name_ar: 'حرقة أو ألم أثناء التبول', name_en: 'Painful / Burning Urination', icon: '🚽', category: 'dermatological', emergency: false },
  { code: 'frequent_urination', name_ar: 'كثرة التبول غير المعتادة', name_en: 'Frequent Urination', icon: '⏳', category: 'dermatological', emergency: false },
];

export default SYMPTOMS;
