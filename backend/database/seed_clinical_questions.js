require('dotenv').config();
const pool = require('../config/db');

async function seedQuestions() {
  console.log('--- Seeding Comprehensive Clinical Questions ---');

  const questionsData = [
    // Chest Pain
    {
      symptomCode: 'chest_pain',
      ar: 'هل يمتد الألم إلى الذراع الأيسر أو الكتف أو الفك السفلي والظهر؟',
      en: 'Does the pain radiate to your left arm, shoulder, jaw, or back?',
      type: 'boolean',
      em: true
    },
    {
      symptomCode: 'chest_pain',
      ar: 'هل يزداد الألم مع المجهود البدني ويخف عند الراحة؟',
      en: 'Does the pain worsen with physical exertion and subside with rest?',
      type: 'boolean',
      em: true
    },
    {
      symptomCode: 'chest_pain',
      ar: 'هل يصاحب الألم ضيق في التنفس أو تعرق بارد أو شعور بالغثيان؟',
      en: 'Is the pain accompanied by shortness of breath, cold sweats, or nausea?',
      type: 'boolean',
      em: true
    },
    {
      symptomCode: 'chest_pain',
      ar: 'هل يتغير الألم ويزداد مع أخذ نفس عميق أو الضغط على عظام الصدر؟',
      en: 'Does the pain change with deep breathing or pressing on the chest wall?',
      type: 'boolean',
      em: false
    },

    // Shortness of Breath
    {
      symptomCode: 'shortness_of_breath',
      ar: 'هل بدأ ضيق التنفس بشكل حاد ومفاجئ خلال دقائق معدودة؟',
      en: 'Did the shortness of breath start acutely and suddenly within minutes?',
      type: 'boolean',
      em: true
    },
    {
      symptomCode: 'shortness_of_breath',
      ar: 'هل يزداد ضيق التنفس عند الاستلقاء على الظهر وتضطر للنوم على عدة وسائد؟',
      en: 'Does it worsen when lying flat, requiring you to prop up with pillows?',
      type: 'boolean',
      em: false
    },
    {
      symptomCode: 'shortness_of_breath',
      ar: 'هل تسمع صوتاً كالصفير أو الأزيز أثناء التنفس؟',
      en: 'Do you hear an audible wheezing sound when breathing out?',
      type: 'boolean',
      em: false
    },

    // Skin Rash
    {
      symptomCode: 'skin_rash',
      ar: 'هل يصاحب الطفح حكة شديدة أو حرقة أو ألم موضعي؟',
      en: 'Is the rash accompanied by intense itching, burning, or pain?',
      type: 'boolean',
      em: false
    },
    {
      symptomCode: 'skin_rash',
      ar: 'هل ظهر الطفح بعد تناول دواء أو طعام جديد، أو ملامسة مادة كيميائية أو نبات؟',
      en: 'Did the rash appear after starting a new medicine, food, or touching an irritant?',
      type: 'boolean',
      em: false
    },
    {
      symptomCode: 'skin_rash',
      ar: 'هل توجد فقاعات مائية، تقشر واسع، أو بثور تحتوي على صديد؟',
      en: 'Are there fluid-filled blisters, extensive peeling, or pus-filled lesions?',
      type: 'boolean',
      em: true
    },
    {
      symptomCode: 'skin_rash',
      ar: 'أين يتركز الطفح الجلدي بالدرجة الأولى؟',
      en: 'Where is the rash predominantly located?',
      type: 'single_choice',
      options: '["الوجه والعنق","اليدين والذراعين","البطن والظهر","الساقين والقدمين","منتشر بكامل الجسم"]',
      em: false
    },

    // Joint Pain
    {
      symptomCode: 'joint_pain',
      ar: 'هل يوجد احمرار، سخونة، أو تورم واضح وانتفاخ في المفصل المصاب؟',
      en: 'Is there redness, warmth, or noticeable swelling around the affected joint?',
      type: 'boolean',
      em: false
    },
    {
      symptomCode: 'joint_pain',
      ar: 'هل تشعر بتيبس وصعوبة تحريك المفصل صباحاً لأكثر من 30 دقيقة؟',
      en: 'Do you experience morning stiffness lasting more than 30 minutes?',
      type: 'boolean',
      em: false
    },
    {
      symptomCode: 'joint_pain',
      ar: 'هل بدأ الألم بعد سقوط مباشر أو التواء أو إصابة رياضية حديثة؟',
      en: 'Did the pain start after a direct fall, sprain, or recent sports injury?',
      type: 'boolean',
      em: false
    },

    // Dysuria (Burning Urination)
    {
      symptomCode: 'dysuria',
      ar: 'هل لاحظت وجود دم في البول أو تحول لونه إلى الوردي أو الأحمر الداكن؟',
      en: 'Have you noticed visible blood or dark red/pink color in your urine?',
      type: 'boolean',
      em: true
    },
    {
      symptomCode: 'dysuria',
      ar: 'هل يصاحب حرقة البول ألم حاد في الخاصرة أو أسفل الظهر أو ارتفاع حرارة؟',
      en: 'Is it accompanied by severe flank/lower back pain or high fever?',
      type: 'boolean',
      em: true
    },
    {
      symptomCode: 'dysuria',
      ar: 'هل تشعر بحاجة ملحة ومتكررة للتبول بكميات صغيرة جداً؟',
      en: 'Do you feel a persistent urgent need to urinate small amounts?',
      type: 'boolean',
      em: false
    },

    // Dizziness
    {
      symptomCode: 'dizziness',
      ar: 'هل تشعر بأنك أو الأشياء حولك تدور بشكل فعلي (دوار حركي حقيقي)؟',
      en: 'Do you feel a true spinning sensation of yourself or the room (vertigo)?',
      type: 'boolean',
      em: false
    },
    {
      symptomCode: 'dizziness',
      ar: 'هل تحدث الدوخة تحديداً عند الوقوف السريع أو تغيير وضعية الرأس؟',
      en: 'Does the dizziness occur specifically when standing up rapidly or moving your head?',
      type: 'boolean',
      em: false
    },
    {
      symptomCode: 'dizziness',
      ar: 'هل ترافق الدوار مع طنين في الأذن، ثقل بالسمع، أو غثيان وتقيؤ؟',
      en: 'Is the dizziness accompanied by ear ringing (tinnitus), hearing fullness, or vomiting?',
      type: 'boolean',
      em: false
    },

    // Sore Throat
    {
      symptomCode: 'sore_throat',
      ar: 'هل تجد صعوبة شديدة ومؤلمة جداً عند بلع السوائل أو الريق؟',
      en: 'Do you experience severe, painful difficulty swallowing liquids or saliva?',
      type: 'boolean',
      em: false
    },
    {
      symptomCode: 'sore_throat',
      ar: 'هل لاحظت وجود بقع بيضاء أو صديد على اللوزتين عند فحص حلقك بالمرآة؟',
      en: 'Have you noticed white spots, exudates, or pus on your tonsils?',
      type: 'boolean',
      em: false
    },
    {
      symptomCode: 'sore_throat',
      ar: 'هل يوجد سعال أو سيلان أنفي مرافق لألم الحلق؟',
      en: 'Is there an accompanying cough or runny nose with your sore throat?',
      type: 'boolean',
      em: false
    },

    // Lower Back Pain
    {
      symptomCode: 'lower_back_pain',
      ar: 'هل يمتد الألم من أسفل الظهر نزولاً إلى الأرداف والساق أو خلف الركبة؟',
      en: 'Does the pain radiate down from lower back to your buttock, leg, or calf?',
      type: 'boolean',
      em: false
    },
    {
      symptomCode: 'lower_back_pain',
      ar: 'هل تشعر بخدر أو تنميل أو ضعف في عضلات القدمين أو صعوبة التحكم بالإخراج؟',
      en: 'Do you feel numbness, tingling in feet, or loss of bowel/bladder control?',
      type: 'boolean',
      em: true
    },
    {
      symptomCode: 'lower_back_pain',
      ar: 'هل بدأ الألم عقب رفع جسم ثقيل أو حركة التواء مفاجئة للظهر؟',
      en: 'Did the pain start after lifting heavy weights or a sudden twisting movement?',
      type: 'boolean',
      em: false
    },

    // Palpitations
    {
      symptomCode: 'palpitations',
      ar: 'هل بدأت الخفقان وتسارع النبض فجأة ودون أي مجهود بدني يذكر؟',
      en: 'Did the palpitations start abruptly and out of the blue without exertion?',
      type: 'boolean',
      em: true
    },
    {
      symptomCode: 'palpitations',
      ar: 'هل يصاحب الخفقان دوار أو شعور باقتراب الإغماء أو ضيق تنفس؟',
      en: 'Are the palpitations accompanied by near-fainting, dizziness, or air hunger?',
      type: 'boolean',
      em: true
    },

    // Severe Anxiety
    {
      symptomCode: 'severe_anxiety',
      ar: 'هل تشعر بنوبات فجائية من الخوف الشديد أو الإحساس بالموت الوشيك والضيق؟',
      en: 'Do you experience sudden waves of intense fear or impending doom?',
      type: 'boolean',
      em: false
    },
    {
      symptomCode: 'severe_anxiety',
      ar: 'هل يؤثر القلق على نومك وشهيتك وقدرتك على مواصلة أعمالك اليومية؟',
      en: 'Does anxiety significantly impair your sleep, appetite, or daily routines?',
      type: 'boolean',
      em: false
    },

    // Fatigue
    {
      symptomCode: 'fatigue',
      ar: 'هل يستمر الشعور بالإرهاق والتعب منذ أكثر من أربعة أسابيع دون تحسن؟',
      en: 'Has the fatigue and low energy persisted for more than 4 weeks without relief?',
      type: 'boolean',
      em: false
    },
    {
      symptomCode: 'fatigue',
      ar: 'هل لاحظت شحوباً في الوجه، تساقطاً غير معتاد في الشعر، أو تقصف الأظافر؟',
      en: 'Have you noticed pale skin, unusual hair shedding, or brittle nails?',
      type: 'boolean',
      em: false
    }
  ];

  let added = 0;
  for (const q of questionsData) {
    const [symRows] = await pool.query('SELECT id FROM symptoms WHERE code = ?', [q.symptomCode]);
    if (symRows.length > 0) {
      const symId = symRows[0].id;
      // Check if question already exists
      const [existing] = await pool.query(
        'SELECT id FROM questions WHERE symptom_id = ? AND question_ar = ?',
        [symId, q.ar]
      );
      if (existing.length === 0) {
        await pool.query(
          `INSERT INTO questions (symptom_id, question_ar, question_en, answer_type, options, is_emergency_trigger)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [symId, q.ar, q.en, q.type, q.options || null, q.em ? 1 : 0]
        );
        added++;
      }
    }
  }

  const [[count]] = await pool.query('SELECT COUNT(*) as total FROM questions');
  console.log(`✓ Added ${added} new clinical questions.`);
  console.log(`✓ Total questions in DB now: ${count.total}`);
  process.exit(0);
}

seedQuestions().catch(err => {
  console.error('Failed to seed questions:', err);
  process.exit(1);
});