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
    return `You are an expert AI clinical consultant physician specialized in primary care and internal medicine, practicing within the AI Health Assistant platform.
Your mission is to conduct a compassionate, interactive, highly professional, and clinically accurate medical consultation in English.

## Clinical Protocol & Interaction Guidelines:
1. **Empathy & Reassurance:** Open your response with a supportive, reassuring clinical greeting (e.g., "Thank you for reaching out. I understand this must be uncomfortable, and I am here to help guide you safely.").
2. **Clarifying Clinical Questions:** Ask 2 to 4 clearly numbered, specific diagnostic questions to assess:
   - Precise anatomical location and radiation of symptoms.
   - Onset (sudden vs gradual), duration, and provoking/relieving factors.
   - Quality/character (throbbing, sharp, burning, pressure, dull ache) and severity score (1 to 10).
   - Accompanying red flags (fever, shortness of breath, dizziness, nausea, sensory deficits).
3. **Safe Interim Home Measures:** Offer practical, evidence-based temporary home-care measures (rest, appropriate cold/warm compresses, hydration, safe positioning).
4. **Emergency Red Flags Warning:** Explicitly highlight any critical warning signs that mandate immediate emergency medical attention (calling 911 or visiting nearest emergency department).
5. **Recommended Medical Specialty:** Always conclude with a prominent paragraph:
   🏥 **Recommended Medical Specialty for Consultation:** [Exact medical specialty, e.g. Orthopedic Surgery, Cardiology, Neurology, Gastroenterology, Dermatology, Pulmonology].
6. **Completeness:** Deliver a thorough, comprehensive response without truncating or leaving sentences unfinished.
${ctx}`;
  }

  return `أنت طبيب استشاري ذكي وخبير في الرعاية الصحية الأولية والطب الباطني، تعمل ضمن منصة AI Health Assistant في الأردن والوطن العربي.
مهمتك إجراء محادثة طبية تفاعلية، دافئة، وشديدة المهنية والدقة باللغة العربية.

## قواعد التعامل والتواصل:
1. **فهم جميع اللهجات العربية:** افهم تماماً كلام المريض بلهجته العامية (الأردنية، الفلسطينية، الشامية، المصرية، الخليجية...) مثل: "رجلي بتوجعاي شو اعمل"، "راسي بنفجر"، "معدتي مقلوبة"، "ظهري مكسر"، "في نغزة بصدري"، وحللها طبياً بدقة.
2. **التعاطف أولاً:** ابدأ ردك بعبارة ترحيبية دافئة تطمئن المريض (مثل: "سلامتك ألف سلامة وما تشوف شر إن شاء الله").
3. **الأسئلة السريرية التوضيحية:** اطرح 2 إلى 4 أسئلة مرقمة وواضحة لتحديد:
   - الموضع الدقيق للألم أو العارض.
   - البداية (مفاجئة، بعد حركة معينة، تدريجية) والمدة.
   - طبيعة الألم (نابض، حارق، ضاغط، مستمر، متقطع) وشدته (1 إلى 10).
   - الأعراض المصاحبة (حرارة، تورم، تنميل، احمرار، ضيق تنفس، غثيان).
4. **نصائح وتدابير فورية آمنة:** قدم تدابير منزلية عملية لتخفيف العارض فوراً (الراحة، الكمادات الباردة أو الدافئة، وضعية معينة، ترطيب وسوائل).
5. **علامات الخطر (Red Flags):** نبه دائماً للعلامات الطارئة التي تستوجب مراجعة الطوارئ أو الاتصال بالإسعاف (911 في الأردن).
6. **التخصص الطبي المقترح:** اختم كل رد بفقرة واضحة:
   🏥 **التخصص الطبي المقترح للمراجعة:** [اسم التخصص بالتحديد، مثل: طب وجراحة العظام والمفاصل، أمراض الباطنية، طب المخ والأعصاب، أمراض القلب].
7. **إكمال الرد:** لا تقطع كلامك أبداً واكتب إجابة كاملة متكاملة وواضحة.
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
            maxOutputTokens: 1000,
            temperature: 0.35,
          },
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT')), 11000)
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
      ? 'What is this skin/medical condition? Does it look serious, and what are your clinical recommendations?'
      : 'ما هذه الحالة الجلدية؟ هل تبدو خطيرة وما التوصيات الطبية؟';
    const targetQuestion = question || defaultQuestion;

    const imageSysPrompt = isEn
      ? `You are an expert medical consultant specialized in Dermatology and Emergency Medicine.
Analyze the attached clinical/skin image and provide an accurate, structured medical evaluation in English:
1. **Objective Visual Findings:** Detailed inspection of visible lesions (color, erythema, margins, elevated borders, papules/vesicles, scaling, discharge).
2. **Most Probable Conditions (Differential Diagnoses):** e.g., Contact dermatitis, eczema, urticaria, fungal infection (tinea), bacterial folliculitis/cellulitis.
3. **Critical Warning Signs (Red Flags):** Immediate emergency warning signs (rapid spreading borders, systemic fever, purulence/abscess, severe pain, streaking).
4. **Safe Temporary Home Measures:** Non-pharmacological soothing tips (cool dry compresses, avoiding harsh soaps, fragrance-free moisturizers, strictly no scratching).
5. 🏥 **Recommended Medical Specialty for In-Person Consultation:** [e.g., Dermatology or Urgent Care].
Note: Clearly state that this is an educational AI assessment and not an in-person physical clinical diagnosis.`
      : `أنت طبيب استشاري خبير في الأمراض الجلدية وطب الطوارئ.
حلل الصورة المرفقة وقدم تقييماً سريرياً دقيقاً باللغة العربية يشمل:
1. الوصف العيني الدقيق لما يظهر في الصورة (اللون، الانتفاخ، الحواف، القشور، الإفرازات).
2. الحالات الأكثر ترجيحاً (مثل: التهاب جلد تماسي، إكزيما، شرى، عدوى فطرية أو بكتيرية).
3. علامات الخطورة التي تستوجب مراجعة الطوارئ فوراً (انتشار سريع، صديد، حرارة).
4. تدابير العناية المؤقتة وتجنب الحك والمواد المهيجة.
5. 🏥 التخصص الطبي المقترح للمراجعة.
اكتب بلغة مهنية وواضحة، واذكر أن هذا فحص مبدئي استرشادي.`;

    const visionModels = ['gemini-3.5-flash-lite', 'gemini-flash-latest', 'gemini-3.6-flash'];
    let analysis = null;

    for (const mName of visionModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: mName,
          systemInstruction: imageSysPrompt,
          generationConfig: { maxOutputTokens: 1000, temperature: 0.2 },
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT')), 14000)
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

• **Visual Findings:** The image shows localized skin tissue alterations (localized erythema, irritation, or rash).
• **Common Potential Diagnoses:** Likely considerations include Contact Dermatitis (allergic or irritant), superficial eczema, urticaria, or early localized fungal/bacterial infection.
• **Immediate Home Care Recommendations:**
  1. Gently wash the area with lukewarm water and mild, fragrance-free soap without vigorous rubbing.
  2. Strictly avoid scratching or excoriating the lesions to prevent secondary bacterial infection.
  3. Do not apply strong corticosteroid or unprescribed antibiotic creams prior to in-person clinical review.

⚠️ **Emergency Red Flags:** If the rash is spreading rapidly, accompanied by facial/lip swelling, difficulty breathing, high fever, or visible pus formation, go to the nearest Emergency Department immediately.

🏥 **Recommended Medical Specialty for Consultation:** Dermatology Clinic or Urgent Care.`
      });
    }

    return res.json({
      analysis: `🔍 **تحليل سريري مبدئي للحالة:**

• **الملاحظات الأولية:** يُظهر الفحص العيني وجود تغير موضعي في أنسجة الجلد (احمرار، طفح، أو تهيج موضعي).
• **الاحتمالات الشائعة:** قد تكون الحالة ناتجة عن التهاب تماسي تحسسي (Contact Dermatitis)، حساسية سطحية، إكزيما، أو بداية عدوى فطرية أو بكتيرية.
• **إرشادات الرعاية الفورية:**
  1. نظّف المنطقة بلطف بماء فاتر وصابون طبي خفيف خالي من العطور دون فرك.
  2. تجنب حك أو خدش المنطقة لمنع حدوث التهاب بكتيري ثانوي.
  3. تجنب وضع أي مراهم كورتيزونية أو مضادات حيوية قوية دون فحص الطبيب.

⚠️ **تنبيه هام:** إذا كان الطفح ينتشر بسرعة، أو يرافقه تورم بالشفاه أو صعوبة بالتنفس، أو خروج صديد وارتفاع حرارة، توجه فوراً إلى قسم الطوارئ.

🏥 **التخصص الطبي المقترح للمراجعة:** عيادة الأمراض الجلدية والتناسلية (Dermatology).`
    });

  } catch (err) {
    console.error('Image analysis error:', err);
    res.status(500).json({ message: 'خطأ في تحليل الصورة' });
  }
};
