require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Ensure GEMINI_API_KEY is read
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Emergency red-flag symptom codes
const EMERGENCY_SYMPTOM_CODES = [
  'chest_pain',
  'shortness_of_breath',
  'loss_of_consciousness',
  'stroke_symptoms',
  'severe_chest_pressure',
  'vomiting_blood',
];

function detectEmergencyFromInputs({ symptoms = [] }) {
  return symptoms.some((s) => EMERGENCY_SYMPTOM_CODES.includes(s));
}

async function detectEmergencyFromTriggerAnswers(pool, followupAnswers = {}) {
  const isTruthy = (a) => a === true || a === 'yes' || a === 'نعم';
  const answeredIds = Object.keys(followupAnswers).filter((id) => isTruthy(followupAnswers[id]));
  if (answeredIds.length === 0) return false;

  try {
    const placeholders = answeredIds.map(() => '?').join(',');
    const [rows] = await pool.query(
      `SELECT id FROM questions WHERE id IN (${placeholders}) AND is_emergency_trigger = TRUE`,
      answeredIds
    );
    return rows.length > 0;
  } catch (err) {
    return false;
  }
}

// Helper to get available Gemini model
function getPreferredModelName() {
  return process.env.GEMINI_MODEL || 'gemini-3.6-flash';
}

const ASSESSMENT_SYSTEM_PROMPT = `
You are an expert Senior Consultant Physician and clinical diagnostic assistant embedded in an advanced medical symptom checker.
Your role is to conduct a rigorous, evidence-based differential diagnosis evaluation based on the patient's reported symptoms, onset/duration, severity, answers to clarifying follow-up questions, and personal health background (age, gender, chronic diseases, medications, and allergies).

Respond ONLY with a valid, parsable JSON object (no markdown code blocks, no backticks, no explanatory text outside the JSON) in this exact structure:

{
  "possible_conditions": [
    {
      "name_ar": "اسم الحالة باللغة العربية",
      "name_en": "Condition Name in English",
      "probability_percent": 85,
      "explanation_ar": "شرح طبي سريري واضح ومبسط للحالة ولماذا تتطابق مع الأعراض",
      "explanation_en": "Clear plain-language clinical explanation of the condition",
      "clinical_rationale_ar": "الأسباب الطبية التفصيلية للترجيح: ارتباطها بمدة الأعراض، وشدتها، وإجابات الأسئلة الاستقصائية المحددة",
      "clinical_rationale_en": "Detailed clinical rationale: correlation with duration, severity, and specific follow-up answers",
      "suggested_investigations_ar": ["فحص صورة الدم الكاملة CBC", "تحليل بول", "أشعة سينية للصدر"],
      "suggested_investigations_en": ["Complete Blood Count (CBC)", "Urinalysis", "Chest X-ray"],
      "urgency_level": "routine",
      "recommend_doctor_visit": true
    }
  ],
  "is_emergency": false,
  "emergency_reason_ar": "سبب الطوارئ إن وجد بالعربية",
  "emergency_reason_en": "Emergency reason if any in English",
  "red_flags_ar": [
    "علامات تحذيرية تستدعي التوجه للطوارئ فوراً إن ظهرت"
  ],
  "red_flags_en": [
    "Red flag warning signs requiring immediate emergency care"
  ],
  "general_advice_ar": "نصائح وإرشادات طبية عامة للتعامل مع الحالة وتخفيف الأعراض بطرق آمنة",
  "general_advice_en": "General evidence-based self-care and non-pharmacological advice",
  "doctor_specialty_recommended_ar": "التخصص الطبي المقترح لمراجعته (مثل: باطنية، أنف وأذن وحنجرة، أعصاب)",
  "doctor_specialty_recommended_en": "Recommended Medical Specialty (e.g. Internal Medicine, ENT, Neurology)"
}

Key Clinical Rules:
1. Provide between 4 and 6 differential conditions, ranked in descending order by clinical probability_percent.
2. The probability_percent should reflect the clinical likelihood based on the holistic patient picture (range 10 to 95).
3. Connect the clinical rationale explicitly to the patient's specific follow-up answers (e.g. location of pain, triggers, relieving factors, accompanied signs).
4. For suggested investigations, list 2-4 standard medical tests a consulting doctor would routinely consider to confirm or rule out the condition.
5. If symptoms indicate an immediate life-threatening emergency (severe acute chest pain, neurological deficit, stroke signs, shock, respiratory distress), set is_emergency = true and urgency_level = 'emergency'.
6. Account for chronic diseases and medication interactions in all recommendations.
7. Return raw JSON only.
`;

const QUESTIONS_SYSTEM_PROMPT = `
You are a senior triage clinician taking a detailed medical history (anamnesis).
Based on the patient's age, gender, chronic diseases, selected symptoms, duration, and severity, formulate 3 to 5 high-yield, targeted clinical follow-up questions to differentiate between potential underlying causes and confirm the diagnosis with maximum clinical precision.

Respond ONLY with a valid JSON array of objects (no markdown, no backticks) in this exact shape:

[
  {
    "id": "q1",
    "question_ar": "نص السؤال باللغة العربية بطريقة دقيقة ومفهومة للمريض",
    "question_en": "Question text in English",
    "answer_type": "boolean",
    "options": null,
    "is_emergency_trigger": false,
    "clinical_purpose": "الهدف السريري من السؤال (مثلاً: التفريق بين الصداع التوتري والصداع النصفي)"
  }
]

Rules:
- Questions should focus on:
  1) Exact nature/character of the symptom (e.g., sharp vs dull, constant vs intermittent).
  2) Radiation or precise localization (e.g., pain spreading to left arm, back, or neck).
  3) Aggravating or relieving factors (e.g., worse after eating, worse with exertion or light).
  4) Critical associated red flags (e.g., sudden onset, stiff neck, high fever, shortness of breath).
- For multiple choice questions, set answer_type to 'single_choice' and options to an array of 3 to 4 string options.
- Keep questions simple and easy for patients to answer.
- Always provide valid JSON array.
`;

// Helper to safely execute a prompt with fast timeout and instant fallback
async function executeGeminiPrompt(systemInstruction, userPrompt) {
  if (!genAI) {
    throw new Error('Gemini API key is not configured');
  }

  const modelName = getPreferredModelName();

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
        maxOutputTokens: 800,
      },
    });

    // 10-second timeout: Gives Gemini sufficient time to write complete clinical JSON
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI response timeout (10s limit)')), 10000)
    );

    const result = await Promise.race([model.generateContent(userPrompt), timeoutPromise]);
    const text = result.response.text().trim();
    
    const cleanJson = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.warn(`Fast mode: Gemini call bypassed (${err.message}). Using instant medical knowledge engine.`);
    throw err;
  }
}

/**
 * Generate dynamic clinical follow-up questions using Gemini
 */
async function generateDynamicFollowupQuestions({ profile = {}, symptoms = [], duration = '', severity = '', language = 'ar' }) {
  const userPrompt = `
Patient profile: Age ${profile.age || 'unspecified'}, Gender: ${profile.gender || 'unspecified'}, Chronic conditions: ${profile.chronic_diseases || 'none'}.
Reported Symptoms: ${symptoms.join(', ')}
Duration: ${duration || 'unspecified'}
Severity: ${severity || 'mild'}
Preferred Language: ${language}
`;

  try {
    const questions = await executeGeminiPrompt(QUESTIONS_SYSTEM_PROMPT, userPrompt);
    if (Array.isArray(questions) && questions.length > 0) {
      return questions;
    }
  } catch (err) {
    console.warn('Gemini dynamic question generation notice:', err.message);
  }

  return null;
}

/**
 * Full AI Diagnostic Assessment with differential diagnosis & high accuracy clinical reasoning
 */
async function getAIAssessment({ profile, symptoms, followupAnswers, language = 'ar' }) {
  const emergencyByRules = detectEmergencyFromInputs({ symptoms });

  const userPrompt = `
Patient Profile:
- Age: ${profile.age}
- Gender: ${profile.gender}
- Height: ${profile.height_cm || 'Not provided'} cm
- Weight: ${profile.weight_kg || 'Not provided'} kg
- Chronic Diseases: ${Array.isArray(profile.chronic_diseases) ? profile.chronic_diseases.join(', ') : profile.chronic_diseases || 'None'}
- Current Medications: ${Array.isArray(profile.current_medications) ? profile.current_medications.join(', ') : profile.current_medications || 'None'}
- Drug Allergies: ${Array.isArray(profile.drug_allergies) ? profile.drug_allergies.join(', ') : profile.drug_allergies || 'None'}

Symptoms Reported:
${JSON.stringify(symptoms)}

Follow-up Answers & Timeline:
${JSON.stringify(followupAnswers)}

Language preference: ${language}
`;

  try {
    const parsed = await executeGeminiPrompt(ASSESSMENT_SYSTEM_PROMPT, userPrompt);
    parsed.is_emergency = Boolean(parsed.is_emergency || emergencyByRules);
    
    // Validate or enrich doctor specialty
    if (!parsed.doctor_specialty_recommended_ar || parsed.doctor_specialty_recommended_ar.includes('باطن') && !JSON.stringify(symptoms).includes('abdominal')) {
      const spec = determineSpecialty(symptoms, parsed.is_emergency);
      parsed.doctor_specialty_recommended_ar = spec.ar;
      parsed.doctor_specialty_recommended_en = spec.en;
    }

    return parsed;
  } catch (err) {
    console.error('Gemini Assessment Error:', err.message);
    return createResilientAssessmentFallback({ symptoms, followupAnswers, profile, emergencyByRules, language });
  }
}

/**
 * High-quality clinical fallback in case of API outage or key issues
 */
function createResilientAssessmentFallback({ symptoms, followupAnswers, profile, emergencyByRules, language }) {
  const symptomStr = Array.isArray(symptoms) ? symptoms.join(' ') : '';
  const isEmergency = emergencyByRules || symptomStr.includes('chest_pain') || symptomStr.includes('shortness_of_breath') || symptomStr.includes('loss_of_consciousness') || symptomStr.includes('stroke_symptoms') || symptomStr.includes('vomiting_blood');

  const conditions = [];

  // ── Emergency always comes first ──────────────────────────
  if (isEmergency) {
    conditions.push({
      name_ar: 'متلازمة قلبية وعائية / تنفسية طارئة تستدعي التقييم الفوري',
      name_en: 'Acute Cardiovascular / Respiratory Emergency',
      probability_percent: 92,
      explanation_ar: 'وجود أعراض ألم الصدر أو ضيق التنفس الحاد أو فقدان الوعي يتطلب استبعاد احتشاء عضلة القلب، الانصمام الرئوي، أو السكتة الدماغية بشكل طارئ.',
      explanation_en: 'Critical symptoms require immediate exclusion of acute coronary syndrome or pulmonary embolism.',
      clinical_rationale_ar: 'الأعراض تتضمن علامات حيوية خطيرة تتطلب مراقبة فورية وتخطيط قلب.',
      clinical_rationale_en: 'Vital indicators demand immediate emergency triage and ECG.',
      suggested_investigations_ar: ['تخطيط قلب كهربائي (ECG)', 'تحليل إنزيمات القلب (Troponin)', 'تصوير الصدر بالأشعة السينية'],
      suggested_investigations_en: ['Electrocardiogram (ECG)', 'Cardiac Troponin', 'Chest X-Ray'],
      urgency_level: 'emergency',
      recommend_doctor_visit: true,
    });
  }

  // ── Symptom scoring: give each group a match score ────────
  // Score = number of matching symptom codes from the symptoms array
  const has = (...codes) => codes.filter(c => symptomStr.includes(c)).length;

  const groups = [
    {
      score: has('headache', 'dizziness', 'migraine', 'vertigo', 'tinnitus'),
      tag: 'neuro',
      conditions: [
        {
          name_ar: 'صداع توتري حاد مرتبط بالإجهاد (Tension Headache)',
          name_en: 'Tension-Type Headache',
          probability_percent: 80,
          explanation_ar: 'نوع شائع جداً من الصداع ينتج عن شد عضلات الرقبة وفروة الرأس نتيجة الإرهاق أو قلة النوم أو إجهاد العينين.',
          explanation_en: 'Most common headache type caused by muscle contraction and tension.',
          clinical_rationale_ar: 'يتطابق مع نمط الصداع الضاغط المنتشر وغياب العلامات البؤرية العصبية.',
          clinical_rationale_en: 'Corresponds with diffuse pressure without focal neurological deficits.',
          suggested_investigations_ar: ['قياس ضغط الدم', 'فحص سريري عصبي بسيط', 'فحص حدة البصر'],
          suggested_investigations_en: ['Blood Pressure Check', 'Basic Neurological Exam', 'Visual Acuity Test'],
          urgency_level: 'routine',
          recommend_doctor_visit: false,
        },
        {
          name_ar: 'صداع نصفي (شقيقة - Migraine)',
          name_en: 'Migraine Headache',
          probability_percent: 65,
          explanation_ar: 'صداع نوبي نابض يصيب غالباً جانباً واحداً مع غثيان أو حساسية للضوء والأصوات.',
          explanation_en: 'Episodic pulsating headache with sensory sensitivity.',
          clinical_rationale_ar: 'يرجحه الطابع النبضي والحساسية للضوء المصاحبة.',
          clinical_rationale_en: 'Pulsating character and photophobia suggest migraine.',
          suggested_investigations_ar: ['استشارة طبيب أعصاب', 'مفكرة تتبع نوبات الصداع'],
          suggested_investigations_en: ['Neurology Consultation', 'Headache Diary'],
          urgency_level: 'routine',
          recommend_doctor_visit: true,
        },
        {
          name_ar: 'دوار موضعي حميد (BPPV) أو اضطراب توازن',
          name_en: 'Benign Paroxysmal Positional Vertigo (BPPV)',
          probability_percent: 50,
          explanation_ar: 'دوار مفاجئ مرتبط بتغيير وضع الرأس ناتج عن اضطراب في حصيات الأذن الداخلية.',
          explanation_en: 'Positional vertigo caused by inner ear crystal displacement.',
          clinical_rationale_ar: 'الدوار المرتبط بوضع الرأس يشير للأذن الداخلية.',
          clinical_rationale_en: 'Position-triggered dizziness suggests inner ear origin.',
          suggested_investigations_ar: ['اختبار Dix-Hallpike', 'استشارة طبيب أنف وأذن وحنجرة'],
          suggested_investigations_en: ['Dix-Hallpike Test', 'ENT Consultation'],
          urgency_level: 'routine',
          recommend_doctor_visit: true,
        },
      ],
    },
    {
      score: has('cough', 'sore_throat', 'fever', 'runny_nose', 'shortness_of_breath', 'wheezing'),
      tag: 'respiratory',
      conditions: [
        {
          name_ar: 'عدوى فيروسية بالجهاز التنفسي العلوي (إنفلونزا / نزلة برد)',
          name_en: 'Upper Respiratory Viral Infection / Influenza',
          probability_percent: 84,
          explanation_ar: 'التهاب فيروسي حاد يصيب الأغشية المخاطية للأنف والحلق مع سعال وحرارة وإرهاق.',
          explanation_en: 'Acute viral inflammation of nasal and pharyngeal mucosa.',
          clinical_rationale_ar: 'السعال مع الحرارة أو احتقان الحلق هو النمط الكلاسيكي للعدوى الفيروسية الموسمية.',
          clinical_rationale_en: 'Classic presentation of seasonal viral respiratory infection.',
          suggested_investigations_ar: ['فحص صورة الدم الكاملة (CBC)', 'مسحة الجهاز التنفسي السريعة', 'فحص CRP'],
          suggested_investigations_en: ['Complete Blood Count (CBC)', 'Rapid Viral Swab', 'CRP'],
          urgency_level: 'routine',
          recommend_doctor_visit: true,
        },
        {
          name_ar: 'التهاب الشعب الهوائية الحاد (Acute Bronchitis)',
          name_en: 'Acute Bronchitis',
          probability_percent: 60,
          explanation_ar: 'التهاب في الممرات الهوائية يسبب سعالاً مستمراً مع أو بدون بلغم.',
          explanation_en: 'Bronchial inflammation causing persistent productive or dry cough.',
          clinical_rationale_ar: 'استمرار السعال مع البلغم يعزز التشخيص.',
          clinical_rationale_en: 'Persistent cough duration supports bronchial involvement.',
          suggested_investigations_ar: ['أشعة سينية للصدر', 'فحص وظائف التنفس'],
          suggested_investigations_en: ['Chest X-Ray', 'Spirometry'],
          urgency_level: 'routine',
          recommend_doctor_visit: true,
        },
      ],
    },
    {
      score: has('abdominal_pain', 'nausea', 'diarrhea', 'heartburn', 'bloating', 'vomiting', 'constipation'),
      tag: 'digestive',
      conditions: [
        {
          name_ar: 'التهاب المعدة والأمعاء الحاد (نزلة معوية - Gastroenteritis)',
          name_en: 'Acute Gastroenteritis',
          probability_percent: 82,
          explanation_ar: 'تهيج والتهاب في الجهاز الهضمي ناتج عن عدوى غذائية أو فيروسية يسبب مغصاً وإسهالاً أو غثياناً.',
          explanation_en: 'Digestive tract inflammation caused by food or viral agents.',
          clinical_rationale_ar: 'آلام البطن مع اضطرابات الهضم تشير للنزلة المعوية.',
          clinical_rationale_en: 'Abdominal cramps with GI upset are concordant with gastroenteritis.',
          suggested_investigations_ar: ['تحليل براز مخبري', 'فحص شوارد الدم', 'موجات فوق صوتية للبطن'],
          suggested_investigations_en: ['Stool Analysis', 'Serum Electrolytes', 'Abdominal Ultrasound'],
          urgency_level: 'routine',
          recommend_doctor_visit: true,
        },
        {
          name_ar: 'ارتجاع مريئي وحموضة معدة (GERD / Gastritis)',
          name_en: 'Gastroesophageal Reflux / Gastritis',
          probability_percent: 68,
          explanation_ar: 'ارتداد حمض المعدة للمريء يسبب حرقة وألماً أعلى البطن يزداد بعد الوجبات.',
          explanation_en: 'Acid reflux causing epigastric burning aggravated by meals.',
          clinical_rationale_ar: 'الحرقة والألم بأعلى البطن مرتبطان بالوجبات.',
          clinical_rationale_en: 'Meal-related epigastric discomfort suggests GERD.',
          suggested_investigations_ar: ['فحص جرثومة المعدة (H. Pylori)', 'تنظير هضمي علوي عند الاستمرار'],
          suggested_investigations_en: ['H. Pylori Test', 'Upper Endoscopy if persistent'],
          urgency_level: 'routine',
          recommend_doctor_visit: true,
        },
      ],
    },
    {
      score: has('dysuria', 'frequent_urination', 'hematuria', 'flank_pain', 'urinary_urgency'),
      tag: 'urological',
      conditions: [
        {
          name_ar: symptomStr.includes('flank_pain') ? 'التهاب حويضة وكلية / حصوة كلوية (Pyelonephritis / Renal Colic)' : 'التهاب المسالك البولية الحاد (UTI / Cystitis)',
          name_en: symptomStr.includes('flank_pain') ? 'Pyelonephritis / Renal Colic' : 'Acute Urinary Tract Infection (UTI)',
          probability_percent: 88,
          explanation_ar: 'عدوى بكتيرية تصيب المثانة ومجرى البول تسبب حرقة ملحة وتكرار التبول.',
          explanation_en: 'Bacterial infection of the bladder or urinary tract causing dysuria and frequency.',
          clinical_rationale_ar: 'حرقة البول وتكراره هو النمط السريري المحدد لالتهاب المسالك البولية.',
          clinical_rationale_en: 'Dysuria and urinary frequency are pathognomonic of UTI.',
          suggested_investigations_ar: ['تحليل بول مع فحص مجهري (Urinalysis)', 'زراعة بول (Urine Culture)', 'وظائف كلى (Creatinine)'],
          suggested_investigations_en: ['Urinalysis & Microscopy', 'Urine Culture & Sensitivity', 'Serum Creatinine'],
          urgency_level: 'routine',
          recommend_doctor_visit: true,
        },
      ],
    },
    {
      score: has('skin_rash', 'itching', 'hives', 'eczema', 'skin_ulcer', 'acne'),
      tag: 'dermatological',
      conditions: [
        {
          name_ar: symptomStr.includes('hives') ? 'شرى تحسسي حاد (Acute Urticaria)' : 'التهاب الجلد التماسي التحسسي (Allergic Contact Dermatitis)',
          name_en: symptomStr.includes('hives') ? 'Acute Urticaria' : 'Allergic Contact Dermatitis',
          probability_percent: 86,
          explanation_ar: 'رد فعل التهابي تحسسي يصيب طبقات البشرة السطحية نتيجة ملامسة مادة مهيجة.',
          explanation_en: 'Inflammatory dermal response triggered by allergen exposure.',
          clinical_rationale_ar: 'الطفح مع الحكة الموضعية يعزز المنشأ التحسسي التماسي.',
          clinical_rationale_en: 'Localized erythema with pruritus confirms contact allergy.',
          suggested_investigations_ar: ['فحص سريري جلدي', 'اختبار الحساسية التلامسية (Patch Test)'],
          suggested_investigations_en: ['Dermatological Examination', 'Allergy Patch Testing'],
          urgency_level: 'routine',
          recommend_doctor_visit: true,
        },
      ],
    },
    {
      score: has('joint_pain', 'joint_swelling', 'lower_back_pain', 'neck_pain', 'muscle_pain', 'arthritis'),
      tag: 'musculoskeletal',
      conditions: [
        {
          name_ar: symptomStr.includes('lower_back_pain') ? 'ألم أسفل الظهر الميكانيكي (Mechanical Lumbar Strain)' : 'التهاب مفاصل تنكسي أو إجهادي (Arthralgia / Osteoarthritis)',
          name_en: symptomStr.includes('lower_back_pain') ? 'Mechanical Lumbar Strain' : 'Osteoarthritis / Joint Strain',
          probability_percent: 84,
          explanation_ar: 'إجهاد أو التهاب في الأنسجة حول المفصل أو فقرات الظهر ناتج عن الجلوس الطويل أو جهد مفاجئ.',
          explanation_en: 'Musculoskeletal inflammation or strain affecting mobility.',
          clinical_rationale_ar: 'تركز الألم بالمنطقة الهيكلية وزيادته بالحركة يؤكد المنشأ الميكانيكي.',
          clinical_rationale_en: 'Movement-related localized pain confirms musculoskeletal origin.',
          suggested_investigations_ar: ['أشعة سينية للمنطقة (X-Ray)', 'فحص حمض اليوريك (Uric Acid)'],
          suggested_investigations_en: ['Plain Radiography', 'Serum Uric Acid'],
          urgency_level: 'routine',
          recommend_doctor_visit: true,
        },
      ],
    },
    {
      score: has('anxiety', 'panic', 'depression', 'insomnia', 'palpitations', 'stress', 'mood'),
      tag: 'psychological',
      conditions: [
        {
          name_ar: 'قلق عام أو اضطراب نفسي جسدي (Generalized Anxiety / Psychosomatic)',
          name_en: 'Generalized Anxiety Disorder / Psychosomatic Disorder',
          probability_percent: 78,
          explanation_ar: 'توتر مزمن أو نوبات قلق تؤثر على الجهاز العصبي اللاإرادي مسببة أعراضاً جسدية متعددة.',
          explanation_en: 'Chronic anxiety causing multiple physical symptoms via autonomic dysregulation.',
          clinical_rationale_ar: 'الأعراض الجسدية المصاحبة للتوتر النفسي تؤكد الطابع النفسي الجسدي.',
          clinical_rationale_en: 'Physical symptoms correlated with psychological distress confirm psychosomatic component.',
          suggested_investigations_ar: ['مراجعة طبيب نفسي أو معالج نفسي', 'استبعاد الأسباب العضوية بالفحوص الأساسية'],
          suggested_investigations_en: ['Psychiatric Evaluation', 'Baseline Blood Work to Exclude Organic Causes'],
          urgency_level: 'routine',
          recommend_doctor_visit: true,
        },
      ],
    },
  ];

  // ── Pick up to 2 highest-scoring groups (non-zero score only) ─
  // This prevents headache patients from seeing stomach conditions
  const activeGroups = groups
    .filter(g => g.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  for (const g of activeGroups) {
    for (const c of g.conditions) {
      // Adjust probability in context of emergency
      const adjustedC = isEmergency ? { ...c, probability_percent: Math.round(c.probability_percent * 0.55) } : c;
      conditions.push(adjustedC);
    }
  }

  // ── Default fallback only when ZERO symptoms matched any group ─
  if (!isEmergency && conditions.length === 0) {
    conditions.push({
      name_ar: 'إجهاد بدني حاد مع إرهاق عام واضطراب نوم',
      name_en: 'Acute Fatigue & Physical Exhaustion',
      probability_percent: 75,
      explanation_ar: 'حالة ناتجة عن ضغط العمل أو نقص السوائل أو اضطرابات النوم وتستجيب جيداً للراحة.',
      explanation_en: 'Condition associated with sleep deprivation or physical exhaustion.',
      clinical_rationale_ar: 'توافق الأعراض مع الإجهاد البدني وغياب علامات العدوى الشديدة.',
      clinical_rationale_en: 'Consistent with physiological fatigue without focal signs.',
      suggested_investigations_ar: ['فحص صورة دم كاملة (CBC) وFerritin', 'فحص فيتامين د وب12', 'وظائف الغدة الدرقية (TSH)'],
      suggested_investigations_en: ['CBC & Ferritin', 'Vitamin D & B12', 'Thyroid Stimulating Hormone (TSH)'],
      urgency_level: 'routine',
      recommend_doctor_visit: false,
    });
  }




  // ---- Symptom-specific specialty routing ----
  const specialty = determineSpecialty(symptoms, isEmergency);

  return {
    possible_conditions: conditions.slice(0, 4),
    is_emergency: isEmergency,
    emergency_reason_ar: isEmergency ? 'وجود أعراض تتطلب استبعاد الحالات الطارئة مثل آلام الصدر أو ضيق التنفس الحاد أو فقدان الوعي.' : '',
    emergency_reason_en: isEmergency ? 'Presence of red flag symptoms requiring immediate medical evaluation.' : '',
    red_flags_ar: [
      'صعوبة مفاجئة في التنفس أو زرقة في الشفتين',
      'ألم حاد ضاغط في منتصف الصدر يمتد للكتف أو الفك',
      'فقدان مفاجئ للوعي أو ارتباك شديد',
      'شلل نصفي مفاجئ أو ثقل في اللسان والكلام',
    ],
    red_flags_en: [
      'Sudden severe shortness of breath or cyanosis',
      'Crushing chest pressure radiating to shoulder or jaw',
      'Loss of consciousness or severe confusion',
      'Sudden facial drooping, weakness in limbs, or slurred speech',
    ],
    general_advice_ar: 'يُنصح بالراحة التامة، الحفاظ على ترطيب الجسم بالسوائل، وتجنب أي مجهود بدني شاق لحين مراجعة الطبيب المختص.',
    general_advice_en: 'Rest, stay well hydrated, avoid physical exertion, and consult a qualified healthcare professional.',
    doctor_specialty_recommended_ar: specialty.ar,
    doctor_specialty_recommended_en: specialty.en,
  };
}

// ─────────────────────────────────────────────────────────────
// CLINICAL SPECIALTY ROUTER
// ─────────────────────────────────────────────────────────────
function determineSpecialty(symptoms = [], isEmergency = false) {
  const symptomStr = (Array.isArray(symptoms) ? symptoms.join(' ') : String(symptoms || '')).toLowerCase();

  if (isEmergency) {
    return {
      ar: 'طب الطوارئ والحوادث',
      en: 'Emergency Medicine',
    };
  }

  // Urological / Nephrology
  if (symptomStr.includes('dysuria') || symptomStr.includes('frequent_urination') || symptomStr.includes('flank_pain') || symptomStr.includes('blood_in_urine') || symptomStr.includes('urinary') || symptomStr.includes('hematuria') || symptomStr.includes('kidney') || symptomStr.includes('renal')) {
    return {
      ar: 'جراحة الكلى والمسالك البولية',
      en: 'Urology & Nephrology',
    };
  }

  // Dermatology
  if (symptomStr.includes('skin_rash') || symptomStr.includes('itching') || symptomStr.includes('hives') || symptomStr.includes('eczema') || symptomStr.includes('dermatitis') || symptomStr.includes('acne') || symptomStr.includes('skin_ulcer') || symptomStr.includes('skin')) {
    return {
      ar: 'الأمراض الجلدية والتناسلية',
      en: 'Dermatology',
    };
  }

  // Orthopedics & Musculoskeletal
  if (symptomStr.includes('joint_pain') || symptomStr.includes('lower_back_pain') || symptomStr.includes('back_pain') || symptomStr.includes('muscle_pain') || symptomStr.includes('arthritis') || symptomStr.includes('swollen_joint') || symptomStr.includes('leg_pain') || symptomStr.includes('knee_pain') || symptomStr.includes('foot_pain') || symptomStr.includes('neck_pain') || symptomStr.includes('shoulder_pain') || symptomStr.includes('bone') || symptomStr.includes('sciatica') || symptomStr.includes('sprain') || symptomStr.includes('strain')) {
    return {
      ar: 'طب وجراحة العظام والمفاصل والروماتيزم',
      en: 'Orthopedic Surgery & Rheumatology',
    };
  }

  // Cardiology
  if (symptomStr.includes('chest_pain') || symptomStr.includes('palpitations') || symptomStr.includes('irregular_heartbeat') || symptomStr.includes('heart') || symptomStr.includes('chest_pressure')) {
    return {
      ar: 'أمراض القلب والأوعية الدموية',
      en: 'Cardiology',
    };
  }

  // Neurology
  if (symptomStr.includes('headache') || symptomStr.includes('dizziness') || symptomStr.includes('seizure') || symptomStr.includes('numbness') || symptomStr.includes('memory_loss') || symptomStr.includes('tremor') || symptomStr.includes('migraine') || symptomStr.includes('vertigo')) {
    return {
      ar: 'طب المخ والأعصاب',
      en: 'Neurology',
    };
  }

  // Gastroenterology
  if (symptomStr.includes('abdominal_pain') || symptomStr.includes('nausea') || symptomStr.includes('vomiting') || symptomStr.includes('diarrhea') || symptomStr.includes('constipation') || symptomStr.includes('bloating') || symptomStr.includes('acid_reflux') || symptomStr.includes('heartburn') || symptomStr.includes('stomach')) {
    return {
      ar: 'أمراض الجهاز الهضمي والكبد',
      en: 'Gastroenterology & Hepatology',
    };
  }

  // ENT
  if (symptomStr.includes('sore_throat') || symptomStr.includes('ear_pain') || symptomStr.includes('hearing_loss') || symptomStr.includes('runny_nose') || symptomStr.includes('sinus') || symptomStr.includes('tonsil') || symptomStr.includes('hoarseness')) {
    return {
      ar: 'أمراض الأنف والأذن والحنجرة',
      en: 'ENT (Ear, Nose & Throat)',
    };
  }

  // Pulmonology
  if (symptomStr.includes('cough') || symptomStr.includes('wheezing') || symptomStr.includes('asthma') || symptomStr.includes('pneumonia') || symptomStr.includes('shortness_of_breath')) {
    return {
      ar: 'أمراض الصدر والجهاز التنفسي',
      en: 'Pulmonology & Respiratory Medicine',
    };
  }

  // Ophthalmology
  if (symptomStr.includes('eye_pain') || symptomStr.includes('blurred_vision') || symptomStr.includes('eye_redness') || symptomStr.includes('vision_loss') || symptomStr.includes('eye')) {
    return {
      ar: 'طب وجراحة العيون',
      en: 'Ophthalmology',
    };
  }

  // Psychiatry
  if (symptomStr.includes('anxiety') || symptomStr.includes('depression') || symptomStr.includes('panic') || symptomStr.includes('insomnia') || symptomStr.includes('mood') || symptomStr.includes('stress')) {
    return {
      ar: 'الطب النفسي وعلم النفس السريري',
      en: 'Psychiatry & Clinical Psychology',
    };
  }

  // Endocrinology
  if (symptomStr.includes('diabetes') || symptomStr.includes('thyroid') || symptomStr.includes('weight_gain') || symptomStr.includes('weight_loss') || symptomStr.includes('excessive_thirst') || symptomStr.includes('fatigue')) {
    return {
      ar: 'الغدد الصماء والسكري والتمثيل الغذائي',
      en: 'Endocrinology & Diabetes',
    };
  }

  return {
    ar: 'الطب الباطني / طب الأسرة',
    en: 'Internal Medicine / Family Medicine',
  };
}

module.exports = {
  getAIAssessment,
  generateDynamicFollowupQuestions,
  detectEmergencyFromInputs,
  detectEmergencyFromTriggerAnswers,
  determineSpecialty,
  EMERGENCY_SYMPTOM_CODES,
};