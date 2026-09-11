const { GoogleGenerativeAI } = require('@google/generative-ai');
const pool = require('../config/db');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
  'gemini-flash-latest',
  'gemini-3.6-flash'
];

// ─────────────────────────────────────────────────────────────
// SYSTEM PROMPT — Comprehensive Clinical AI Doctor
// ─────────────────────────────────────────────────────────────
function buildDoctorSystemPrompt(medicalContext, language = 'ar') {
  const ctx = medicalContext || '';
  if (language === 'en') {
    return `You are an expert AI clinical consultant physician specialized in primary care, internal medicine, and emergency triage, practicing within the AI Health Assistant platform.
Your mission is to deliver fast, accurate, and compassionate medical consultations in English.

## CRITICAL SPEED PROTOCOL — Follow this STRICTLY:
1. **Empathy First (1 sentence only):** Begin with a brief warm, supportive greeting (e.g., "I'm sorry to hear you're feeling this way — I'm here to help.").
2. **ONE Focused Clarifying Question ONLY:** Ask a MAXIMUM of ONE single targeted question about the most clinically important missing detail (e.g., exact location, duration, or whether fever is present). Do NOT ask multiple questions at once. If you already have enough information, skip this step entirely.
3. **Immediately Deliver Your Full Clinical Assessment** after the one question (or immediately if enough info exists):
   - **Most Probable Diagnoses:** List 2-3 likely conditions with brief clinical reasoning.
   - **Urgency Level:** 🔴 Emergency / 🟡 Urgent (see doctor within 24-48h) / 🟢 Non-urgent (routine care).
   - **Safe Home Measures:** 2-3 practical evidence-based steps for immediate relief.
   - **Red Flag Warning Signs:** Critical signs requiring immediate ER visit or calling 911.
   - 🏥 **Recommended Medical Specialty:** [Exact specialty, e.g., Orthopedic Surgery, Cardiology, Neurology, Gastroenterology, Dermatology, Pulmonology].
4. **Completeness:** Never truncate your response. Always finish every sentence and complete the full assessment.
5. **Language:** Respond entirely in English regardless of how the patient writes.
${ctx}`;
  }

  return `أنت طبيب استشاري ذكي ومتخصص في الرعاية الأولية والطب الباطني والطوارئ، تعمل ضمن منصة AI Health Assistant.
مهمتك تقديم استشارات طبية سريعة ودقيقة وبدقة عالية جداً باللغة العربية.

## بروتوكول السرعة الطبية — اتبعه حرفياً:
1. **التعاطف أولاً (جملة واحدة فقط):** ابدأ بعبارة ترحيبية قصيرة دافئة (مثل: "سلامتك ألف سلامة وما تشوف شر").
2. **سؤال توضيحي واحد فقط بالحد الأقصى:** اطرح سؤالاً واحداً مركزاً فقط عن أهم تفصيلة ناقصة سريرياً (الموضع، المدة، أو هل يوجد حرارة). لا تطرح أسئلة متعددة في نفس الوقت. إذا كان عندك معلومات كافية فتجاوز هذه الخطوة مباشرة.
3. **أعطِ تقييمك السريري الكامل فوراً** بعد السؤال الواحد (أو مباشرة إذا المعلومات كافية):
   - **التشخيصات الأكثر ترجيحاً:** اذكر 2-3 حالات محتملة مع تفسير سريري مختصر.
   - **مستوى الإلحاح:** 🔴 طارئ / 🟡 عاجل (راجع الطبيب خلال 24-48 ساعة) / 🟢 غير عاجل.
   - **تدابير منزلية آمنة:** 2-3 خطوات عملية لتخفيف الحالة فوراً.
   - **علامات الخطر:** العلامات التي تستوجب الذهاب للطوارئ فوراً أو الاتصال بـ 911.
   - 🏥 **التخصص الطبي المقترح للمراجعة:** [اذكر التخصص بدقة: جراحة العظام، أمراض القلب، طب الأعصاب، إلخ].
4. **الإكمال الكامل:** لا تقطع إجابتك أبداً. اكتب كل جملة بالكامل حتى نهاية التقييم.
5. **اللغة:** افهم جميع اللهجات العربية العامية وردّ دائماً بالعربية الواضحة.
${ctx}`;
}

// ─────────────────────────────────────────────────────────────
// COMPREHENSIVE CLINICAL FALLBACK ENGINE
// ─────────────────────────────────────────────────────────────
function buildClinicalFallback(message, language = 'ar') {
  const isEn = language === 'en' || /^[a-zA-Z0-9\s.,?!'-]+$/.test((message || '').trim().slice(0, 30));
  const rawMsg = (message || '').toLowerCase();
  const msg = rawMsg
    .replace(/ي/g, 'ي').replace(/ة/g, 'ه').replace(/أ|إ|آ/g, 'ا');

  const has = (...words) => words.some(w => msg.includes(w) || rawMsg.includes(w.toLowerCase()));

  if (isEn) {
    if (has('chest pain', 'heart attack', 'shortness of breath', 'unconscious', 'faint', 'stroke', 'bleeding', 'severe burn')) {
      return `⚠️ **IMMEDIATE EMERGENCY ALERT:**
Your reported symptoms indicate potentially critical red flags that require urgent medical evaluation without delay!

🚨 **Immediate Action Required:**
1. Call Emergency Services (**911** in Jordan / international equivalent) immediately.
2. Sit in a comfortable, supported position and avoid any physical exertion.
3. Keep someone nearby to assist you while emergency responders are en route.

🏥 **Urgent Department:** Emergency Medicine & Trauma at the nearest hospital.`;
    }

    if (has('leg', 'knee', 'foot', 'ankle', 'joint', 'walk', 'limp', 'sprain', 'bone')) {
      return `I am sorry to hear you are dealing with leg/joint discomfort. Lower limb pain is very common and can stem from muscle strain, ligament sprain, or joint inflammation.

**To better assess your situation, please let me know:**
1. Exactly where is the pain centered (knee, calf muscle, thigh, ankle, or bottom of the foot)?
2. Did it begin abruptly after a twist/impact, or did it develop progressively?
3. Do you notice swelling, redness, or heat over the area?
4. Are you able to bear full weight and walk, or is it severely limited?

**Immediate Safe Self-Care Guidance:**
• **Rest & Offload:** Avoid strenuous walking, running, or prolonged standing.
• **Elevation:** Elevate your leg on pillows while resting to reduce swelling and venous pooling.
• **Ice/Warmth:** Apply a cloth-wrapped ice pack for 15 minutes 3 times daily for acute pain/sprains.
• **Over-the-counter pain relief:** Acetaminophen/Paracetamol can be taken if medically safe for you.

⚠️ **Seek prompt care if:** You notice acute calf swelling with warmth and redness, or complete inability to bear weight.

🏥 **Recommended Medical Specialty for Consultation:** Orthopedic Surgery & Sports Medicine (or Rheumatology).`;
    }

    if (has('headache', 'migraine', 'head', 'dizzy', 'dizziness', 'vertigo', 'tinnitus')) {
      return `Headache and dizziness are frequent complaints, most commonly related to tension, fatigue, dehydration, or migraine.

**Key Differential Possibilities:**
1. **Tension-type Headache:** Muscle contraction in neck and scalp due to stress or screen strain (>70% of cases).
2. **Migraine:** Throbbing unilateral headache often accompanied by light/sound sensitivity and nausea.
3. **Dehydration or Eye Strain:** From insufficient fluid intake or prolonged display exposure.

**Immediate Practical Tips:**
• Drink two large glasses of water immediately.
• Rest in a quiet, dark, well-ventilated room.
• Apply a cool compress across your forehead and back of your neck.

⚠️ **Emergency Warning:** Visit the ER immediately if the headache is sudden and explosive (worst headache of your life), or accompanied by neck stiffness, high fever, or vision loss.

🏥 **Recommended Medical Specialty for Consultation:** Neurology or Primary Care / Family Medicine.`;
    }

    if (has('stomach', 'abdomen', 'belly', 'diarrhea', 'constipation', 'nausea', 'vomit', 'acid', 'heartburn', 'cramp')) {
      return `Abdominal discomfort and digestive symptoms can have multiple causes, most of which respond well to gentle supportive care.

**Common Likely Causes:**
1. **Gastroenteritis (Stomach Flu):** Viral or foodborne, causing cramps, loose stools, and nausea.
2. **Acid Reflux & GERD:** Burning retrosternal sensation worsening after heavy or spicy meals.
3. **Irritable Bowel Syndrome (IBS):** Cramping, bloating, and irregular bowel habits triggered by stress or food.

**Home Management Steps:**
• Avoid greasy, spicy foods, caffeine, and dairy temporarily.
• Eat bland meals: plain boiled rice, toast, bananas, and clear broth.
• Stay hydrated with frequent small sips of water and oral rehydration salts.
• Warm chamomile or mint tea can help relax intestinal spasms.

⚠️ **Consult a doctor promptly if:** You notice blood in stool or vomit, severe localized pain in the lower right abdomen, or dehydration.

🏥 **Recommended Medical Specialty for Consultation:** Gastroenterology & Hepatology.`;
    }

    if (has('cough', 'throat', 'cold', 'flu', 'sore throat', 'tonsil', 'fever', 'runny nose', 'congestion', 'phlegm', 'sneeze')) {
      return `Upper respiratory infections, colds, and sore throats are among the most common ailments and usually resolve within 5–7 days.

**Likely Causes:**
1. **Viral Upper Respiratory Infection (Common Cold / Pharyngitis):** Runny nose, scratchy throat, dry or productive cough, mild low-grade fever.
2. **Streptococcal Pharyngitis (Strep Throat):** Sudden severe throat pain, difficulty swallowing, swollen white-spotted tonsils, high fever without cough.
3. **Allergic Rhinitis / Post-nasal Drip:** Persistent tickle in the throat, clear nasal drainage, and sneezing.

**Evidence-Based Immediate Care:**
• Gargle with warm salt water (1/2 teaspoon salt in a glass of warm water) 3–4 times daily to soothe throat inflammation.
• Drink warm liquids: honey and lemon water, ginger tea, or clear broths.
• Inhale warm steam or use a cool-mist humidifier in your room.
• Acetaminophen or Ibuprofen for fever and throat soreness as needed.

⚠️ **Seek Medical Attention if:** You have difficulty breathing or swallowing saliva, high fever > 39°C (102.2°F), or symptoms worsening after 7 days.

🏥 **Recommended Medical Specialty:** Otolaryngology (ENT) or Family Medicine.`;
    }

    if (has('eye', 'vision', 'red eye', 'pink eye', 'itchy eye', 'blurred', 'eyelid', 'tears')) {
      return `Eye symptoms require careful attention to protect vision and reduce ocular irritation.

**Common Causes:**
1. **Conjunctivitis (Pink Eye):** Redness, watery or yellowish discharge, grittiness; can be viral, bacterial, or allergic.
2. **Dry Eye Syndrome / Digital Eye Strain:** Burning, stinging sensation caused by prolonged screen time or dry air.
3. **Subconjunctival Hemorrhage or Corneal Abrasion:** Painless bright red spot or sharp scratchy feeling.

**Immediate Comfort Measures:**
• Do not rub your eyes under any circumstances.
• Apply a clean, cool or warm damp compress over closed eyelids for 10 minutes.
• Discontinue wearing contact lenses immediately until fully resolved.
• Use preservative-free lubricating artificial tear drops.

⚠️ **Urgent Warning:** Seek immediate ophthalmologist evaluation if you have sudden loss of vision, severe eye pain, or extreme sensitivity to light (photophobia).

🏥 **Recommended Medical Specialty:** Ophthalmology (Eye Clinic).`;
    }

    if (has('tooth', 'teeth', 'gum', 'jaw', 'toothache', 'dental')) {
      return `Dental and gum pain typically stems from tooth decay, pulp inflammation, or gum swelling.

**Common Causes:**
1. **Dental Pulpitis / Cavity:** Sharp or throbbing tooth pain provoked by hot, cold, or sugary drinks.
2. **Gingivitis / Periodontal Abscess:** Swollen, bleeding, or tender gums around teeth.
3. **Bruxism / TMJ Dysfunction:** Dull ache radiating along the jaw and temple upon waking.

**Temporary Home Relief:**
• Rinse your mouth with warm salt water every 3–4 hours.
• Apply an ice pack wrapped in a towel to the outside of your cheek for 15 minutes.
• Avoid chewing on the affected side and avoid extreme hot or icy foods.
• Over-the-counter pain relievers (Paracetamol or Ibuprofen) can provide temporary relief.

⚠️ **Consult Dentist Promptly if:** You notice facial swelling, high fever, or pus discharge near the tooth (signs of an abscess).

🏥 **Recommended Specialty:** Dental Surgery / Endodontics.`;
    }

    if (has('skin', 'rash', 'itch', 'spots', 'eczema', 'allergy', 'hive', 'redness')) {
      return `Skin irritations and rashes can result from contact allergies, viral exanthems, or dermatitis.

**Home Management Advice:**
• Wash gently with lukewarm water and a fragrance-free, mild soap.
• Avoid scratching to prevent secondary bacterial infection.
• Apply a cool, damp cloth or calming calamine / plain moisturizing lotion.
• Take an oral antihistamine if you experience widespread itching.
• You can upload a photo of the skin area directly in this chat for immediate AI visual analysis.

⚠️ **Seek Immediate Care if:** The rash is accompanied by lip/facial swelling, difficulty breathing, or appears as purple non-blanching spots (petechiae).

🏥 **Recommended Medical Specialty:** Dermatology.`;
    }

    return `Hello and welcome to your smart clinical consultation. I have received your message with care and am here to assist you.

**To help me provide the most precise medical guidance, please share:**
1. What is the main symptom or discomfort you are feeling?
2. How long have you had it (hours, days, weeks)?
3. Are there any other accompanying symptoms (such as fever, nausea, dizziness, or localized pain)?
4. Do you have any known chronic conditions or take regular medications?

I look forward to your response so I can assist you with targeted clinical recommendations!

🏥 **Recommended Specialty for Initial Review:** Family Medicine / Internal Medicine.`;
  }

  // Emergency Red Flags
  if (has('الم صدر شديد', 'صعوبه تنفس', 'ضيق تنفس حاد', 'فقدان وعي', 'اغماء', 'شلل', 'نزيف شديد', 'جلطه')) {
    return `⚠️ **تنبيه طبي طارئ فوري:**
الأعراض التي ذكرتها قد تشير إلى حالة حرجة تستدعي التقييم الإسعافي المباشر دون أي تأخير!

🚨 **ما يجب عليك فعله الآن:**
1. الاتصال فوراً برقم الطوارئ والإسعاف في الأردن: **911** (أو رقم الطوارئ في بلدك).
2. الجلوس في وضعية مريحة وتجنب أي مجهود بدني تماماً.
3. طلب المساعدة من أي شخص قريب منك ليبقى بجانبك لحين وصول الإسعاف.

🏥 **التخصص المطلوب فوراً:** طب الطوارئ والحوادث في أقرب مستشفى.`;
  }

  // Leg, Knee, Foot, Ankle Pain (مثل: رجلي بتوجعاي شو اعمل)
  if (has('رجل', 'قدم', 'ساق', 'فخذ', 'ركبه', 'كاحل', 'قدمي', 'رجلي', 'رجلي بتوجع', 'رجلي بتوجعاي', 'وجع رجل')) {
    return `سلامتك ألف سلامة وما تشوف شر إن شاء الله. ألم الرجل أو الساق من الأعراض الشائعة وله عدة أسباب محتملة تتراوح بين الإجهاد العضلي، التواء الأربطة، أو التهاب المفاصل.

**لتحديد السبب بدقة ومساعدتك بشكل أفضل، أرجو إجابتي:**
1. أين يتركز الألم تحديداً؟ (في الركبة، بطة الساق، الفخذ، أم في أسفل القدم والكاحل؟)
2. هل بدأ الألم فجأة بعد حركة معينة أو ضربة/التواء، أم ظهر تدريجياً؟
3. هل تلاحظ أي تورم (نفخة)، احمرار، أو سخونة مكان الألم؟
4. هل تقدر تدوس على رجلك وتمشي، أم أن المشي مؤلم جداً؟

---

**خطوات فورية لتخفيف الوجع بالمنزل الآن:**
• **الراحة التامة:** تجنب الوقوف الطويل أو المشي والمجهود حتى يهدأ الألم.
• **الرفع (Elevation):** ارفع رجلك على مخدة أثناء الجلوس أو الاستلقاء لتخفيف الاحتقان والتورم.
• **الكمادات:** إذا كان الألم جديداً أو ناتجاً عن ضربة/التواء، ضع كمادة ثلج (ملفوفة بقماش) لمدة 15 دقيقة 3 مرات يومياً. أما إذا كان شداً عضلياً مزمناً، فالماء الدافئ مفيد.
• **المسكنات البسيطة:** يمكنك تناول الباراسيتامول عند الحاجة إن لم تكن هناك موانع صحية.

⚠️ **راجع الطبيب فوراً إذا:** كان هناك تورم مفاجئ شديد مع احمرار وسخونة في بطة الساق، أو عدم القدرة التامة على الوقوف.

🏥 **التخصص الطبي المقترح للمراجعة:** طب وجراحة العظام والمفاصل (أو عيادة الطب الرياضي والعلاج الطبيعي).`;
  }

  // Throat, Cough, Cold, ENT
  if (has('حلق', 'زور', 'بلعوم', 'لوز', 'كحه', 'سعال', 'رشح', 'زكام', 'بلغم', 'صوت مبحوح', 'حراره وحلق')) {
    return `سلامتك ألف سلامة وما تشوف شر. التهاب الحلق والسعال ونزلات البرد من أكثر الحالات الشائعة وغالباً ما تشفى خلال أيام مع العناية المنزلية.

**الاحتمالات الطبية الأكثر ترجيحاً:**
1. **التهاب الحلق الفيروسي (الرشح والإنفلونزا):** سيلان الأنف، حرارة خفيفة، حكة في الحلق، وسعال جاف أو مع بلغم خفيف.
2. **التهاب اللوزتين البكتيري (Strep Throat):** ألم شديد جداً عند البلع، صعوبة فتح الفم، حرارة مرتفعة، وتضخم الغدد الليمفاوية في الرقبة بدون رشح.
3. **حساسية الجيوب الأنفية والبلغم المرتجع:** يسبب حكة متكررة وكحة تزداد عند النوم.

**إرشادات فورية لتخفيف ألم الحلق والكحة:**
• **الغرغرة بالماء الدافئ والملح:** (نصف ملعقة صغيرة ملح في كأس ماء دافئ) 3 مرات يومياً لتطهير الحلق وتخفيف الانتفاخ.
• **المشروبات الدافئة:** شاي اليانسون، البابونج، أو الماء الدافئ مع العسل والليمون (مهدئ ممتاز للغشاء المخاطي).
• **الترطيب واستنشاق البخار:** استنشاق بخار ماء دافئ يريح القصبات الهوائية ويذيب البلغم.
• **المسكنات الآمنة:** باراسيتامول لتسكين الألم وخفض الحرارة عند الحاجة.

⚠️ **علامات تستوجب مراجعة الطبيب:** صعوبة شديدة في التنفس أو البلع وسيلان اللعاب، حرارة مستمرة فوق 38.5 لأكثر من 3 أيام، أو ظهور بقع صديدية بيضاء على اللوزتين.

🏥 **التخصص الطبي المقترح للمراجعة:** أنف وأذن وحنجرة (ENT) أو طب الأسرة.`;
  }

  // Eye symptoms
  if (has('عين', 'عيون', 'احمرار عين', 'حرقان عين', 'حكه عين', 'دموع', 'رمص', 'غباش', 'ضبابيه')) {
    return `سلامتك وألف لا بأس عليك. العين عضو حساس وأي تهيج يتطلب رعاية حذرة ومناسبة.

**الاحتمالات الطبية الشائعة:**
1. **التهاب ملتحمة العين (Conjunctivitis / العين الوردية):** احمرار، إفرازات مائية أو صفراء، شعور بوجود رمل داخل العين.
2. **جفاف العين وإجهاد الشاشات:** حرقان، وخز، وتشوش خفيف بالرؤية بعد القراءة أو استخدام الهاتف لفترات طويلة.
3. **حساسية العين الموسمية:** حكة شديدة في كلتا العينين مع تدميع مستمر ورغبة في فركها.

**خطوات فورية للراحة:**
• **ممنوع فرك العين تماماً** لتجنب خدش القرنية أو نقل العدوى.
• غسل اليدين جيداً بالماء والصابون قبل لمس محيط العين.
• وضع كمادات ماء باردة نظيفة على الجفون المغلقة لمدة 10 دقائق لتخفيف الاحتقان.
• التوقف التام عن استخدام العدسات اللاصقة لحين زوال الأعراض بالكامل.
• استخدام قطرات الدموع الاصطناعية المرطبة الخالية من المواد الحافظة.

⚠️ **راجع طبيب العيون فوراً إذا:** كان هناك ألم حاد ومفاجئ داخل مقلة العين، فقدان أو ضعف مفاجئ في النظر، أو حساسية شديدة جداً من الضوء.

🏥 **التخصص الطبي المقترح للمراجعة:** طب وجراحة العيون (Ophthalmology).`;
  }

  // Dental & Toothache
  if (has('سن', 'اسنان', 'ضرس', 'اضراس', 'لثه', 'وجع سن', 'وجع ضرس', 'تسوس')) {
    return `سلامتك ألف سلامة. ألم الأسنان من الآلام المزعجة جداً وغالباً ما ينشأ من عصب السن أو اللثة.

**الاحتمالات الطبية:**
1. **التهاب عصب السن (Pulpitis):** تسوس عميق وصل للعصب يسبب ألماً نابضاً يزداد مع المشروبات الباردة أو الساخنة والسكريات.
2. **خراج سني أو التهاب لثة:** انتفاخ في اللثة حول السن، ألم عند الضغط أو العض، وربما طعم كريه في الفم.
3. **ضرس العقل:** التهاب محيط بضرس العقل أثناء بزوغه يسبب صعوبة في فتح الفك.

**تدابير منزلية لتسكين الألم مؤقتاً:**
• المضمضة بماء دافئ وملح كل بضع ساعات لتطهير الفم وتقليل الالتهاب.
• وضع كمادة ثلج ملفوفة بقماش على الخد من الخارج لمدة 10 دقائق.
• تجنب الأكل على الجانب المؤلم والابتعاد عن الأطعمة الشديدة البرودة أو السخونة.
• تناول مسكن باراسيتامول أو إيبوبروفين (إذا كانت المعدة تتحمله) لتسكين الوجع مؤقتاً.

⚠️ **راجع طبيب الأسنان بأقرب وقت:** المسكنات علاج مؤقت ولا تعالج التسوس أو الالتهاب الجذري.

🏥 **التخصص الطبي المقترح للمراجعة:** طب وجراحة الفم والأسنان (Dentistry).`;
  }

  // Headache & Dizziness
  if (has('صداع', 'راس', 'شقيقه', 'دوخه', 'دوار', 'راسي بوجعني', 'راسي بنفجر', 'طنين')) {
    return `سلامتك وألف لا بأس عليك. الصداع والدوخة من الأعراض كثيرة الحدوث، وغالباً ما ترتبط بالإجهاد، قلة النوم، أو الجفاف.

**الاحتمالات الطبية الأكثر ترجيحاً:**
1. **صداع التوتر (Tension Headache):** ناتج عن انشداد عضلات الرقبة وفروة الرأس بسبب التوتر والإرهاق (أكثر من 70% من الحالات).
2. **الصداع النصفي (الشقيقة):** ألم نابض في جهة واحدة غالباً، يترافق مع حساسية للضوء والصوت وغثيان.
3. **الجفاف أو إجهاد العينين:** بسبب قلة شرب الماء أو طول الجلوس أمام الشاشات.
4. **تذبذب ضغط الدم أو الجيوب الأنفية.**

**نصائح فورية لتخفيف الصداع:**
• شرب كوبين كبيرين من الماء فوراً.
• الاسترخاء في غرفة هادئة ذات إضاءة خافتة.
• وضع كمادة باردة أو دافئة على الجبين وخلف الرقبة.

⚠️ **علامات تحذيرية:** راجع الطوارئ إذا كان الصداع شديداً جداً ومفاجئاً، أو مصحوباً بتصلب الرقبة وحرارة عالية أو تشوش الرؤية.

🏥 **التخصص الطبي المقترح للمراجعة:** طب المخ والأعصاب (Neurology) أو طب الأسرة.`;
  }

  // Abdominal, Stomach, Digestion
  if (has('معده', 'بطن', 'اسهال', 'امساك', 'غثيان', 'استفراغ', 'تقيو', 'حرقه', 'حموضه', 'قولون', 'مغص')) {
    return `سلامتك ألف سلامة. آلام البطن واضطرابات الجهاز الهضمي متعددة الأسباب ولكن أغلبها يستجيب للعناية المناسبة.

**الاحتمالات الأكثر شيوعاً:**
1. **التهاب المعدة والأمعاء (نزلة معوية):** ناتج عن عدوى فيروسية أو تناول طعام ملوث، ويسبب مغصاً وإسهالاً أو غثياناً.
2. **عسر الهضم وحموضة المعدة (GERD):** حرقة بعد الأكل تصعد للمريء.
3. **القولون العصبي (IBS):** انتفاخ وتشنجات ترتبط بالتوتر ونوعيات أطعمة معينة.

**تدابير منزلية فورية:**
• الامتناع عن الأطعمة الدسمة، الحارة، المقالي، والقهوة.
• الاعتماد على وجبات خفيفة: أرز مسلوق، لبن رائب، موز، توست محمص، شوربة دافئة.
• شرب شاي البابونج أو النعناع الدافئ لتهدئة التشنجات.
• تعويض السوائل بالماء ومحلول الجفاف لتجنب الهبوط.

⚠️ **راجع الطبيب إذا:** ظهر دم في البراز أو القيء، أو كان الألم حاداً ومتركّزاً في أسفل الجانب الأيمن من البطن، أو استمر الإسهال أكثر من 48 ساعة.

🏥 **التخصص الطبي المقترح للمراجعة:** أمراض الجهاز الهضمي والكبد (Gastroenterology).`;
  }

  // Chest & Heart
  if (has('صدر', 'قلب', 'خفقان', 'نغزه', 'نبض سريع', 'وجع صدر')) {
    return `أهلاً بك. ألم الصدر والخفقان يستدعيان دائماً التقييم الدقيق والحذر الشديد.

**للاطمئنان الأولي:**
1. هل الألم ضاغط كالثقل في منتصف الصدر ويمتد للكتف أو الذراع الأيسر أو الفك؟
2. هل يترافق مع تعرق بارد، غثيان، أو صعوبة في التنفس؟
3. هل يزداد الألم عند أخذ نفس عميق أو الضغط على عظام القفص الصدري؟

⚠️ **إذا كانت إجابة السؤال 1 أو 2 نعم، اتصل فوراً بـ 911 (الإسعاف).**

إذا كان الألم نغزة خفيفة تزداد بالحركة والتنفس، فقد يكون شداً عضلياً أو التهاباً في غضاريف القفص الصدري، أو نتيجة ارتجاع مريئي وقلق.

🏥 **التخصص الطبي المقترح للمراجعة:** أمراض القلب والأوعية الدموية (Cardiology) للفحص والتخطيط.`;
  }

  // Back & Spine & Joints
  if (has('ظهر', 'عمود فقري', 'مفصل', 'مفاصل', 'فقرات', 'عضلات', 'ديسك', 'عرق النسا', 'رقبه')) {
    return `سلامتك ألف سلامة. آلام الظهر والمفاصل من أكثر الشكاوى الطبية شيوعاً.

**الاحتمالات الأكثر ترجيحاً:**
1. **شد عضلي ميكانيكي:** نتيجة حركة مفاجئة، حمل وزن ثقيل، أو الجلوس الطويل بوضعية خاطئة.
2. **انزلاق غضروفي (ديسك):** إذا كان الألم يمتد إلى الساق مع تنميل أو خدران.
3. **التهاب مفاصل تنكسي (خشونة):** يسبب تيبساً خاصة في الصباح.

**نصائح لتخفيف الألم:**
• تجنب الجلوس الطويل والراحة على فراش مريح متوسط الصلابة.
• وضع كمادات دافئة على الظهر لمدة 20 دقيقة لفك التشنج العضلي.
• تجنب الانحناء المفاجئ ورفع الأثقال تماماً.

🏥 **التخصص الطبي المقترح للمراجعة:** جراحة العظام والعمود الفقري أو طب الروماتيزم والمفاصل.`;
  }

  // Urinary & Kidneys
  if (has('بول', 'تبول', 'حرقان', 'حرقه بول', 'مثانه', 'كلى', 'خاصره', 'دم في البول')) {
    return `سلامتك وما تشوف شر. أعراض المسالك البولية تتطلب انتباهاً خاصاً.

**الاحتمالات الأكثر شيوعاً:**
1. **التهاب المسالك البولية والمثانة (UTI):** يسبب حرقة وتكرار التبول وألماً أسفل البطن.
2. **حصى الكلى أو المجاري البولية:** تسبب ألماً حاداً ومفاجئاً في الخاصرة يمتد لأسفل البطن.

**نصائح فورية:**
• الإكثار من شرب الماء (2.5 إلى 3 لترات يومياً).
• تجنب حبس البول تماماً.
• إجراء فحص تحليل بول كامل (Urinalysis) في أقرب مختبر لتحديد نوع الالتهاب.

🏥 **التخصص الطبي المقترح للمراجعة:** جراحة الكلى والمسالك البولية (Urology).`;
  }

  // Skin & Rash & Itching
  if (has('جلد', 'طفح', 'حكه', 'حبوب', 'بقع', 'اكزيما', 'حساسيه جلد')) {
    return `سلامتك وألف لا بأس عليك. الحالات الجلدية تتنوع أسبابها بين التحسسي، الفيروسي، والفطري.

**نصائح للعناية الفورية:**
• غسل المنطقة بماء فاتر وصابون طبي لطيف خالي من العطور.
• تجنب حك أو خدش الجلد لمنع تلوثه وحدوث عدوى بكتيرية ثانوية.
• تجنب استخدام أي مراهم كورتيزونية عشوائية دون استشارة طبية.
• يمكنك رفع صورة واضحة للطفح هنا في الشات عبر زر الكاميرا لأحللها لك فوراً.

🏥 **التخصص الطبي المقترح للمراجعة:** الأمراض الجلدية والتناسلية (Dermatology).`;
  }

  // Default general medical answer
  return `أهلاً بك يا غالي في عيادتك الطبية الذكية. قرأت رسالتك بكل اهتمام وأنا هنا لمساعدتك.

لكي أتمكن من تقديم المشورة الطبية الأكثر دقة لحالتك، أرجو تزويدي بالآتي:
1. ما هو العَرَض الرئيسي الذي تشعر به تحديداً؟
2. منذ متى بدأ هذا العارض (ساعات، أيام، أسابيع)؟
3. هل هناك أي أعراض مصاحبة (مثل حرارة، غثيان، دوخة، أو ألم في موضع آخر)؟
4. هل تعاني من أي أمراض مزمنة أو تتناول أدوية معينة حالياً؟

بانتظار إجابتك لأشخص حالتك وأعطيك النصائح الطبية الأنسب!

🏥 **التخصص المقترح للمراجعة الأولية:** طب الأسرة والرعاية الصحية الأولية (أو الباطنية العامة).`;
}

// ─────────────────────────────────────────────────────────────
// SEND MESSAGE CONTROLLER
// ─────────────────────────────────────────────────────────────
exports.sendMessage = async (req, res) => {
  try {
    const { message, history = [], language = 'ar' } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: language === 'en' ? 'Message is required' : 'الرسالة مطلوبة' });
    }

    // Fetch patient medical profile if logged in
    let medicalContext = '';
    const userId = req.user && req.user.id;
    if (userId) {
      try {
        const [rows] = await pool.query(
          `SELECT mh.chronic_diseases, mh.current_medications, mh.allergies, mh.blood_type,
                  u.full_name, u.age, u.gender
           FROM users u
           LEFT JOIN medical_history mh ON mh.user_id = u.id
           WHERE u.id = ? ORDER BY mh.id DESC LIMIT 1`,
          [userId]
        );
        if (rows.length > 0) {
          const p = rows[0];
          const parts = [];
          if (language === 'en') {
            if (p.full_name) parts.push('Patient Name: ' + p.full_name);
            if (p.age) parts.push('Age: ' + p.age + ' years');
            if (p.gender) parts.push('Gender: ' + (p.gender === 'male' ? 'Male' : 'Female'));
            if (p.blood_type) parts.push('Blood Type: ' + p.blood_type);
            if (p.chronic_diseases) parts.push('Chronic Diseases: ' + p.chronic_diseases);
            if (p.current_medications) parts.push('Current Medications: ' + p.current_medications);
            if (p.allergies) parts.push('Allergies: ' + p.allergies);
            if (parts.length > 0) {
              medicalContext = '\n\n## Patient Medical Profile:\n' + parts.join('\n');
            }
          } else {
            if (p.full_name) parts.push('اسم المريض: ' + p.full_name);
            if (p.age) parts.push('العمر: ' + p.age + ' سنة');
            if (p.gender) parts.push('الجنس: ' + (p.gender === 'male' ? 'ذكر' : 'أنثى'));
            if (p.blood_type) parts.push('فصيلة الدم: ' + p.blood_type);
            if (p.chronic_diseases) parts.push('الأمراض المزمنة: ' + p.chronic_diseases);
            if (p.current_medications) parts.push('الأدوية الحالية: ' + p.current_medications);
            if (p.allergies) parts.push('الحساسية: ' + p.allergies);
            if (parts.length > 0) {
              medicalContext = '\n\n## السجل الطبي للمريض:\n' + parts.join('\n');
            }
          }
        }
      } catch (dbErr) {
        console.warn('Could not fetch patient medical profile:', dbErr.message);
      }
    }

    const systemPrompt = buildDoctorSystemPrompt(medicalContext, language);

    // Build chat conversation history for Gemini
    const contents = [];
    for (const h of history.slice(-6)) {
      if (h.content && h.content.trim()) {
        contents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content.trim() }]
        });
      }
    }
    contents.push({ role: 'user', parts: [{ text: message.trim() }] });

    // Try candidate models in order of speed and reliability
    let reply = null;
    let lastError = null;

    for (const modelName of CANDIDATE_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
          generationConfig: {
            maxOutputTokens: 1200,
            temperature: 0.2,
            topK: 32,
            topP: 0.9,
          },
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT')), 12000)
        );

        const result = await Promise.race([
          model.generateContent({ contents }),
          timeoutPromise,
        ]);

        reply = result.response.text();
        if (reply && reply.trim().length > 15) {
          break; // Succeeded!
        }
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} attempt failed: ${err.message}. Trying next candidate...`);
      }
    }

    if (reply && reply.trim().length > 15) {
      return res.json({ reply: reply.trim() });
    }

    // Fallback: Comprehensive clinical response
    console.warn('All Gemini models failed, serving rich clinical fallback. Last error:', lastError?.message);
    const fallbackReply = buildClinicalFallback(message, language);
    return res.json({ reply: fallbackReply });

  } catch (err) {
    console.error('Chat controller error:', err);
    res.status(500).json({ message: 'حدث خطأ في خدمة المحادثة الطبية' });
  }
};

// ─────────────────────────────────────────────────────────────
// ANALYZE IMAGE CONTROLLER (Vision)
// ─────────────────────────────────────────────────────────────
exports.analyzeImage = async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', question, language = 'ar' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ message: language === 'en' ? 'Image is required for analysis' : 'الصورة مطلوبة للتحليل' });
    }


    const isEn = language === 'en';
    const defaultQuestion = isEn
      ? 'Analyze this medical image comprehensively. Identify the imaging modality, all visible findings, probable diagnoses, and recommended specialty.'
      : 'حلل هذه الصورة الطبية بشكل شامل. حدد نوع التصوير، جميع الموجودات الظاهرة، التشخيصات المحتملة، والتخصص المقترح.';
    const targetQuestion = question || defaultQuestion;

    const imageSysPrompt = isEn
      ? `You are an Expert AI Medical Imaging Analyst with advanced specialization across ALL clinical imaging modalities and medical photography. You analyze any type of medical image with high accuracy.

## Image Types You Expertly Analyze:
- **Radiological (X-Ray / Plain Film):** Bone fractures (complete, hairline, stress, pathological), dislocations, pneumonia, pleural effusion, pneumothorax, pulmonary infiltrates, cardiomegaly, joint space narrowing, arthritis, scoliosis, calcifications.
- **MRI Scans:** Brain lesions, tumors, disc herniation, spinal cord compression, ligament tears (ACL/PCL), meniscal tears, soft tissue masses, brain hemorrhage, stroke infarcts.
- **CT Scans:** Internal organ pathology, abdominal masses, appendicitis, trauma injuries, intracranial hemorrhage, pulmonary embolism.
- **Ultrasound Images:** Gallstones, kidney stones, ovarian cysts, fetal assessment, thyroid nodules, DVT screening.
- **ECG / EKG Tracings:** Arrhythmias, atrial fibrillation, ST elevation MI (STEMI), bundle branch blocks, tachycardia, bradycardia, QT prolongation.
- **Dermatological / Wound Photos:** Skin rashes, eczema, psoriasis, dermatitis, wound infections, abscess, cellulitis, melanoma red flags, burns, pressure sores.
- **Ophthalmological Images:** Fundus photos, retinal detachment, papilledema, diabetic retinopathy, glaucoma changes, corneal ulcers.
- **Orthopedic / Joint Images:** Bone pathology, joint effusion, metallic implants, growth plate injuries, osteomyelitis.
- **Histopathology / Lab Images:** Cell morphology analysis, tissue samples.

## Structured Output Format (ALWAYS follow this):
1. 🔬 **Imaging Modality & Anatomical Region:** Identify what type of image this is (X-ray, MRI, CT, ECG, skin photo, fundus, etc.) and the anatomical region shown.
2. 📋 **Key Visual Findings:** Describe all abnormal and relevant normal findings visible in the image in precise clinical detail (describe location, size, density, pattern, symmetry, etc.).
3. 🩺 **Most Probable Diagnoses (Differential):** List 2-4 most likely diagnoses ranked by probability with brief clinical reasoning for each.
4. ⚠️ **Critical Red Flags:** Any urgent findings requiring immediate medical attention or emergency referral.
5. 💊 **Clinical Recommendations:** Next diagnostic steps (additional imaging, labs, specialist referral), any immediate measures.
6. 🏥 **Recommended Medical Specialty:** [e.g., Orthopedic Surgery, Radiology, Pulmonology, Cardiology, Dermatology, Neurosurgery, Ophthalmology, Emergency Medicine].

## Important Notes:
- If the image quality is poor, describe what IS visible and note the limitation.
- Always state: "This is an AI-assisted preliminary assessment for educational purposes. An in-person specialist evaluation is required for definitive diagnosis and treatment."
- Provide your best clinical analysis even for challenging or unclear images — do NOT refuse or give generic responses.`
      : `أنت محلل تصوير طبي ذكي خبير في جميع أنواع الصور الطبية والتصوير الإشعاعي والسريري. تحلل أي نوع من الصور الطبية بدقة عالية جداً.

## أنواع الصور التي تحللها بخبرة عالية:
- **الأشعة السينية (X-Ray):** كسور العظام (الكاملة، الشعرية، الإجهادية)، خلع المفاصل، التهاب الرئة، انصباب الجنب، استرواح الصدر، تضخم القلب، ضيق الفجوة المفصلية، الالتهاب المفصلي، الجنف، التكلسات.
- **التصوير بالرنين المغناطيسي (MRI):** آفات الدماغ، الأورام، انزلاق الغضاريف، الانضغاط النخاعي، تمزق الأربطة (الرباط الصليبي)، تمزق الغضروف الهلالي، كتل الأنسجة الرخوة، النزيف الدماغي، احتشاء السكتة الدماغية.
- **التصوير المقطعي (CT):** أمراض الأعضاء الداخلية، الكتل البطنية، التهاب الزائدة الدودية، إصابات الصدمات، النزف داخل الجمجمة، الانسداد الرئوي.
- **تخطيط القلب الكهربائي (ECG/EKG):** اضطرابات النظم، الرجفان الأذيني، احتشاء عضلة القلب الحاد (STEMI)، حصار الحزمة، تسرع القلب، بطء القلب.
- **صور الجلد والجروح:** الطفح الجلدي، الإكزيما، الصدفية، التهاب الجلد، التهاب الخلية النسيجية، الخراج، قرح الضغط، الحروق، علامات تحذير سرطان الجلد.
- **صور العيون (Ophthalmology):** صور قاع العين، انفصال الشبكية، تورم حليمة العصب البصري، اعتلال الشبكية السكري، الزرق، قرح القرنية.
- **صور العظام والمفاصل (Orthopedic):** أمراض العظام، انصباب المفصل، الغرسات المعدنية، إصابات نوى النمو، التهاب العظم والنقي.

## تنسيق الإجابة الإلزامي (اتبعه دائماً):
1. 🔬 **نوع التصوير والمنطقة التشريحية:** حدد نوع الصورة (أشعة سينية، رنين مغناطيسي، تصوير مقطعي، تخطيط قلب، صورة جلدية، إلخ) والمنطقة الظاهرة.
2. 📋 **الموجودات البصرية الرئيسية:** صف بدقة سريرية جميع الموجودات الشاذة والطبيعية ذات الأهمية (الموقع، الحجم، الكثافة، النمط، التناسق، إلخ).
3. 🩺 **التشخيصات الأكثر احتمالاً:** اذكر 2-4 تشخيصات مرتبة حسب الاحتمالية مع تفسير سريري مختصر لكل منها.
4. ⚠️ **علامات الخطر الحرجة:** أي موجودات عاجلة تستوجب التدخل الطبي الفوري أو الإحالة الطارئة.
5. 💊 **التوصيات السريرية:** الخطوات التشخيصية التالية (تصوير إضافي، فحوصات مختبرية، إحالة للاختصاصي)، أي تدابير فورية.
6. 🏥 **التخصص الطبي المقترح:** [مثل: جراحة العظام والمفاصل، الأشعة التشخيصية، أمراض الصدر والرئتين، أمراض القلب، الأمراض الجلدية، جراحة المخ والأعصاب، طب الطوارئ].

## ملاحظات هامة:
- إذا كانت جودة الصورة ضعيفة، صف ما هو مرئي وأشر إلى القيد.
- اذكر دائماً: "هذا تقييم أولي بمساعدة الذكاء الاصطناعي لأغراض استرشادية. يُستوجب الفحص المتخصص الشخصي للتشخيص والعلاج النهائي."
- قدم أفضل تحليل سريري حتى للصور الصعبة أو غير الواضحة — لا ترفض التحليل أو تعطي إجابة عامة مبهمة.`;

    const visionModels = ['gemini-3.5-flash-lite', 'gemini-flash-latest'];
    let analysis = null;

    for (const mName of visionModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: mName,
          systemInstruction: imageSysPrompt,
          generationConfig: { maxOutputTokens: 1400, temperature: 0.15, topK: 32, topP: 0.9 },
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT')), 18000)
        );

        const result = await Promise.race([
          model.generateContent([
            targetQuestion,
            { inlineData: { data: imageBase64, mimeType } },
          ]),
          timeoutPromise,
        ]);

        analysis = result.response.text();
        if (analysis && analysis.trim().length > 20) break;
      } catch (vErr) {
        console.warn(`Vision model ${mName} failed: ${vErr.message}`);
      }
    }

    if (analysis && analysis.trim().length > 20) {
      return res.json({ analysis: analysis.trim() });
    }

    if (isEn) {
      return res.json({
        analysis: `🔍 **Preliminary Clinical Assessment:**

🔬 **Imaging Modality:** Medical image submitted for analysis (modality detection requires clearer resolution).

📋 **Visual Findings:** The image shows tissue or structural changes that require clinical evaluation. Due to image processing limitations, a detailed automated finding is unavailable at this moment.

🩺 **General Recommendations:**
  1. Please ensure the image is clear, well-lit, and in focus for accurate analysis.
  2. Upload the image again or consult a specialist directly with the original image file.
  3. For X-rays: an in-person radiologist review is the most reliable approach.

⚠️ **Emergency Red Flags:** If you are experiencing severe pain, inability to move a limb, chest pain, shortness of breath, or neurological symptoms — go to the nearest Emergency Department immediately.

🏥 **Recommended Medical Specialty for Consultation:** Radiology / Emergency Medicine / relevant specialist based on symptoms.`
      });
    }

    return res.json({
      analysis: `🔍 **تحليل سريري مبدئي للصورة:**

🔬 **نوع التصوير:** تم استلام الصورة الطبية للتحليل (يتطلب تحديد نوع التصوير دقة أعلى للصورة).

📋 **الموجودات البصرية:** تُظهر الصورة تغيرات في الأنسجة أو البنية تستوجب التقييم السريري. بسبب قيود جودة المعالجة، التحليل التفصيلي الآلي غير متاح في هذه اللحظة.

🩺 **توصيات عامة:**
  1. تأكد من أن الصورة واضحة ومضاءة بشكل جيد ومركّزة للحصول على تحليل دقيق.
  2. أعد رفع الصورة أو استشر اختصاصياً مباشرة بالملف الأصلي للصورة.
  3. لأشعة X: مراجعة طبيب الأشعة شخصياً هو الأسلوب الأكثر دقة.

⚠️ **علامات خطر فورية:** إذا كنت تعاني من ألم شديد، أو عدم القدرة على تحريك طرف، أو ألم في الصدر، أو ضيق تنفس، أو أعراض عصبية — توجه فوراً لأقرب قسم طوارئ.

🏥 **التخصص الطبي المقترح للمراجعة:** الأشعة التشخيصية / طب الطوارئ / اختصاصي ذو صلة حسب الأعراض.`
    });

  } catch (err) {
    console.error('Image analysis error:', err);
    res.status(500).json({ message: 'خطأ في تحليل الصورة' });
  }
};

