import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import api from '../api/client';
import jsPDF from 'jspdf';
import ProgressSteps from '../components/ProgressSteps';
import EmergencyAlert from '../components/EmergencyAlert';
import DisclaimerBanner from '../components/DisclaimerBanner';
import SYMPTOMS_FALLBACK from '../data/symptomsData';

const EMERGENCY_CODES = [
  'chest_pain',
  'shortness_of_breath',
  'loss_of_consciousness',
  'stroke_symptoms',
  'vomiting_blood',
  'stiff_neck',
];

const STEPS = { PROFILE: 0, SYMPTOMS: 1, FOLLOWUP: 2, RESULTS: 3 };

const CATEGORIES = [
  { id: 'all', label_ar: 'الكل', label_en: 'All', icon: '✨' },
  { id: 'general', label_ar: 'عام وحيوي', label_en: 'General', icon: '🌡️' },
  { id: 'respiratory', label_ar: 'تنفسي وصدر', label_en: 'Respiratory', icon: '🫁' },
  { id: 'digestive', label_ar: 'هضمي وباطني', label_en: 'Digestive', icon: '🤢' },
  { id: 'neurological', label_ar: 'رأس وأعصاب', label_en: 'Neurological', icon: '🧠' },
  { id: 'musculoskeletal', label_ar: 'عظام ومفاصل', label_en: 'Muscles & Joints', icon: '🦴' },
  { id: 'dermatological', label_ar: 'جلدي وبولي', label_en: 'Skin & Urinary', icon: '🧴' },
  { id: 'emergency', label_ar: 'علامات طوارئ', label_en: 'Emergency', icon: '🚨' },
];

const getQuestionOptions = (options) => {
  if (Array.isArray(options)) return options;
  if (typeof options !== 'string' || !options.trim()) return [];

  try {
    const parsed = JSON.parse(options);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [options];
  }
};

export default function Assessment() {
  const { t, language } = useApp();
  const [step, setStep] = useState(STEPS.PROFILE);
  const [symptomsList, setSymptomsList] = useState(SYMPTOMS_FALLBACK);
  const [followupQuestions, setFollowupQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // Symptoms filter & search
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [profile, setProfile] = useState({
    age: '',
    gender: 'male',
    height_cm: '',
    weight_kg: '',
    chronic_diseases: '',
    current_medications: '',
    drug_allergies: '',
  });

  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('mild');
  const [followupAnswers, setFollowupAnswers] = useState({});

  // Load symptoms: always start with full fallback list (51 symptoms),
  // then enrich with any EXTRA symptoms from the DB that aren't already in the fallback.
  // This ensures all symptoms are always visible even if the Render DB is partially seeded.
  useEffect(() => {
    api
      .get('/symptoms')
      .then(({ data }) => {
        if (Array.isArray(data) && data.length) {
          // Build a set of codes already in the fallback
          const fallbackCodes = new Set(SYMPTOMS_FALLBACK.map((f) => f.code));
          // Find DB symptoms that are NOT in the fallback (genuinely new ones)
          const extras = data
            .filter((sym) => !fallbackCodes.has(sym.code))
            .map((sym) => ({
              ...sym,
              icon: sym.icon || '🩹',
              category: sym.category || 'general',
              emergency: Boolean(sym.emergency || sym.is_emergency_flag),
            }));
          // Always use the full fallback + any extras from DB
          setSymptomsList([...SYMPTOMS_FALLBACK, ...extras]);
        }
        // If DB returns empty array, SYMPTOMS_FALLBACK is already set as default
      })
      .catch(() => {
        // Network error: fallback is already set as default state, nothing to do
      });
  }, []);

  const toggleSymptom = (code) => {
    setSelectedSymptoms((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // Filtered symptoms based on category and search query
  const filteredSymptoms = useMemo(() => {
    return symptomsList.filter((s) => {
      const isEmergency = Boolean(s.emergency || s.is_emergency_flag || EMERGENCY_CODES.includes(s.code));
      const matchCategory =
        activeCategory === 'all'
          ? true
          : activeCategory === 'emergency'
          ? isEmergency
          : s.category === activeCategory;

      if (!matchCategory) return false;

      if (!searchQuery.trim()) return true;
      const query = searchQuery.trim().toLowerCase();
      const nameAr = (s.name_ar || '').toLowerCase();
      const nameEn = (s.name_en || '').toLowerCase();
      return nameAr.includes(query) || nameEn.includes(query);
    });
  }, [symptomsList, activeCategory, searchQuery]);

  const goToFollowup = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/diagnosis/dynamic-questions', {
        profile,
        symptoms: selectedSymptoms,
        duration,
        severity,
        language,
      });

      if (Array.isArray(data) && data.length > 0) {
        setFollowupQuestions(data);
      } else {
        const { data: fbData } = await api.post('/symptoms/followup-questions', { codes: selectedSymptoms });
        setFollowupQuestions(Array.isArray(fbData) ? fbData : []);
      }
      setStep(STEPS.FOLLOWUP);
    } catch (err) {
      console.warn('Fallback clinical questions active');
      setFollowupQuestions([
        {
          id: 'clin_q1',
          question_ar: 'هل بدأت هذه الأعراض بشكل مفاجئ وحاد جداً خلال دقائق؟',
          question_en: 'Did these symptoms begin suddenly and acutely within minutes?',
          answer_type: 'boolean',
          is_emergency_trigger: true,
        },
        {
          id: 'clin_q2',
          question_ar: 'هل تزداد حدة الأعراض عند الحركة أو بذل مجهود بدني؟',
          question_en: 'Do the symptoms worsen with movement or physical exertion?',
          answer_type: 'boolean',
          is_emergency_trigger: false,
        },
        {
          id: 'clin_q3',
          question_ar: 'هل يصاحب ذلك أي غثيان، دوار، أو شعور بالتشوش؟',
          question_en: 'Is there accompanying nausea, dizziness, or confusion?',
          answer_type: 'boolean',
          is_emergency_trigger: false,
        },
      ]);
      setStep(STEPS.FOLLOWUP);
    } finally {
      setLoading(false);
    }
  };

  const submitAssessment = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        age: Number(profile.age),
        gender: profile.gender,
        height_cm: profile.height_cm ? Number(profile.height_cm) : null,
        weight_kg: profile.weight_kg ? Number(profile.weight_kg) : null,
        chronic_diseases: profile.chronic_diseases
          ? profile.chronic_diseases.split(',').map((s) => s.trim())
          : [],
        current_medications: profile.current_medications
          ? profile.current_medications.split(',').map((s) => s.trim())
          : [],
        drug_allergies: profile.drug_allergies
          ? profile.drug_allergies.split(',').map((s) => s.trim())
          : [],
        symptoms: selectedSymptoms,
        followup_answers: { ...followupAnswers, duration, severity },
        language,
      };
      const { data } = await api.post('/diagnosis/assess', payload);
      setResult(data);
      setStep(STEPS.RESULTS);
    } catch (err) {
      setError(err.response?.data?.message || 'تعذر إجراء التقييم الذكي حالياً. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setStep(STEPS.PROFILE);
    setSelectedSymptoms([]);
    setFollowupAnswers({});
    setResult(null);
    setDuration('');
    setSeverity('mild');
    setSearchQuery('');
    setActiveCategory('all');
  };

  const exportPDF = () => {
    if (!result) return;
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('AI Health Assistant - Clinical Assessment Report', 14, 20);
      doc.setFontSize(10);
      doc.text(`Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 28);
      doc.text(`Patient Age: ${profile.age || 'N/A'} | Gender: ${profile.gender || 'N/A'}`, 14, 34);
      doc.text(`Severity: ${severity || 'N/A'} | Duration: ${duration || 'N/A'}`, 14, 40);

      doc.setFontSize(12);
      doc.text('Reported Symptoms:', 14, 50);
      doc.setFontSize(10);
      const symNames = selectedSymptoms.join(', ');
      doc.text(symNames || 'None', 14, 56);

      doc.setFontSize(12);
      doc.text('Diagnostic Possibilities (Differential Diagnosis):', 14, 68);

      let y = 76;
      (result.possible_conditions || []).forEach((c, idx) => {
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFontSize(11);
        doc.text(`${idx + 1}. ${c.name_en || c.name_ar} (Confidence: ${c.probability_percent || 0}%)`, 14, y);
        y += 6;
        doc.setFontSize(9);
        const explanation = c.explanation_en || c.explanation_ar || '';
        const splitText = doc.splitTextToSize(explanation, 180);
        doc.text(splitText, 14, y);
        y += splitText.length * 5 + 4;
      });

      if (result.doctor_specialty_recommended_en || result.doctor_specialty_recommended_ar) {
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFontSize(11);
        doc.text(`Recommended Medical Specialty: ${result.doctor_specialty_recommended_en || result.doctor_specialty_recommended_ar}`, 14, y);
        y += 8;
      }

      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFontSize(8);
      doc.text('Notice: This assessment is generated for educational and triage purposes only.', 14, y + 10);
      doc.text('Always consult a licensed medical professional for definitive diagnosis and treatment.', 14, y + 15);

      doc.save(`clinical-report-${Date.now()}.pdf`);
    } catch (e) {
      console.error('PDF export error:', e);
      alert('تعذر إنشاء ملف PDF');
    }
  };

  const hasEmergencySymptomSelected = selectedSymptoms.some((c) => {
    const sym = symptomsList.find((s) => s.code === c);
    return EMERGENCY_CODES.includes(c) || Boolean(sym?.emergency || sym?.is_emergency_flag);
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Quick Emergency Hospital Access Bar */}
      <div className="mb-6 p-3.5 sm:p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2.5 text-rose-800 dark:text-rose-200">
          <span className="text-xl animate-bounce">🚨</span>
          <span className="font-bold">
            {language === 'ar'
              ? 'في حال الشعور بأعراض حرجة أو ألم صدري حاد، لا تنتظر الفحص — توجه فوراً للطوارئ.'
              : 'In critical life-threatening situations, do not wait for the assessment — seek immediate ER care.'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=hospital+near+me', '_blank')}
          className="shrink-0 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-sm flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <span>🏥</span>
          <span>{language === 'ar' ? 'العثور على أقرب مستشفى وطوارئ (خرائط GPS)' : 'Find Nearest Hospital & ER (GPS)'}</span>
          <span>↗</span>
        </button>
      </div>

      {step !== STEPS.RESULTS && <ProgressSteps current={step + 1} total={4} />}

      {error && (
        <div className="mb-6 text-sm text-danger-700 dark:text-danger-300 bg-danger-500/10 border border-danger-200 dark:border-danger-800 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* STEP 0: PATIENT PROFILE */}
      {step === STEPS.PROFILE && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/60 text-primary-600 dark:text-primary-300 flex items-center justify-center text-xl font-bold">
              1
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                {t('profile_title')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {t('step1_desc')}
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label={t('age')}>
              <input
                type="number"
                min="1"
                max="120"
                required
                placeholder={t('placeholder_age') || (language === 'en' ? 'e.g. 32' : 'مثال: 32')}
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                className="input"
              />
            </Field>
            <Field label={t('gender')}>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="input"
              >
                <option value="male">{t('male')}</option>
                <option value="female">{t('female')}</option>
                <option value="other">{t('other')}</option>
              </select>
            </Field>
            <Field label={t('height')}>
              <input
                type="number"
                placeholder={t('placeholder_height') || (language === 'en' ? 'e.g. 175' : 'مثال: 175')}
                value={profile.height_cm}
                onChange={(e) => setProfile({ ...profile, height_cm: e.target.value })}
                className="input"
              />
            </Field>
            <Field label={t('weight')}>
              <input
                type="number"
                placeholder={t('placeholder_weight') || (language === 'en' ? 'e.g. 70' : 'مثال: 70')}
                value={profile.weight_kg}
                onChange={(e) => setProfile({ ...profile, weight_kg: e.target.value })}
                className="input"
              />
            </Field>
            <Field label={t('chronic_diseases')} full>
              <input
                placeholder={t('placeholder_chronic') || (language === 'en' ? 'e.g. Hypertension, Diabetes, Asthma...' : 'مثال: ضغط دم مرتفع، سكري، ربو...')}
                value={profile.chronic_diseases}
                onChange={(e) => setProfile({ ...profile, chronic_diseases: e.target.value })}
                className="input"
              />
            </Field>
            <Field label={t('current_medications')} full>
              <input
                placeholder={t('placeholder_meds') || (language === 'en' ? 'e.g. Aspirin, Metformin, Omeprazole...' : 'مثال: أسبرين، بنادول، أوميبرازول...')}
                value={profile.current_medications}
                onChange={(e) => setProfile({ ...profile, current_medications: e.target.value })}
                className="input"
              />
            </Field>
            <Field label={t('drug_allergies')} full>
              <input
                placeholder={t('placeholder_allergies') || (language === 'en' ? 'e.g. Penicillin allergy, Sulfa drugs...' : 'مثال: حساسية بنسلين، حساسية سلفا...')}
                value={profile.drug_allergies}
                onChange={(e) => setProfile({ ...profile, drug_allergies: e.target.value })}
                className="input"
              />
            </Field>
          </div>

          <button
            disabled={!profile.age}
            onClick={() => setStep(STEPS.SYMPTOMS)}
            className="mt-8 w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 disabled:opacity-50 text-white font-bold text-base shadow-md shadow-primary-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>{t('next')}</span>
            <span>←</span>
          </button>
        </div>
      )}

      {/* STEP 1: SYMPTOMS SELECTION */}
      {step === STEPS.SYMPTOMS && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/60 text-primary-600 dark:text-primary-300 flex items-center justify-center text-xl font-bold">
                2
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                  {t('symptoms_title')}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {t('symptoms_subtitle') || (language === 'en' ? 'Select all symptoms you are currently experiencing (over 60 symptoms available)' : 'حدد جميع الأعراض التي تشعر بها حالياً (تتوفر أكثر من 60 عرضاً)')}
                </p>
              </div>
            </div>

            {/* Selected counter badge */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                {t('selected_symptoms_count')}: {selectedSymptoms.length}
              </span>
              {selectedSymptoms.length > 0 && (
                <button
                  onClick={() => setSelectedSymptoms([])}
                  className="text-xs text-danger-600 hover:underline"
                >
                  {t('clear_selection')}
                </button>
              )}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative mb-5">
            <span className="absolute inset-y-0 start-0 flex items-center ps-4 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder={t('search_symptoms_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700/60 dark:text-white ps-11 pe-10 py-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category tabs filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/30'
                      : 'bg-gray-100 dark:bg-gray-700/70 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{language === 'ar' ? cat.label_ar : cat.label_en}</span>
                </button>
              );
            })}
          </div>

          {/* Symptoms grid */}
          {filteredSymptoms.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl mb-6">
              <span className="text-3xl mb-2 block">🩹</span>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {t('no_symptoms_found')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8 max-h-[440px] overflow-y-auto p-1">
              {filteredSymptoms.map((s) => {
                const active = selectedSymptoms.includes(s.code);
                const isEmergency = Boolean(s.emergency || s.is_emergency_flag || EMERGENCY_CODES.includes(s.code));
                return (
                  <button
                    type="button"
                    key={s.code}
                    onClick={() => toggleSymptom(s.code)}
                    className={`relative p-3.5 sm:p-4 rounded-2xl border-2 text-center transition-all duration-150 flex flex-col items-center justify-center min-h-[100px] ${
                      active
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/80 text-primary-900 dark:text-primary-100 shadow-sm scale-[1.02]'
                        : 'border-gray-200/90 dark:border-gray-700/80 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-gray-50/50'
                    } ${isEmergency ? 'ring-1 ring-danger-400/40' : ''}`}
                  >
                    {isEmergency && (
                      <span className="absolute top-2 end-2 text-[10px] font-bold text-danger-600 dark:text-danger-400 bg-danger-50 dark:bg-danger-950/80 px-1.5 py-0.5 rounded-full border border-danger-200 dark:border-danger-800">
                        {t('emergency_badge') || 'طوارئ'}
                      </span>
                    )}
                    <span className="text-2xl sm:text-3xl mb-1.5">{s.icon || '🩹'}</span>
                    <span className="text-xs sm:text-sm font-bold line-clamp-2">
                      {language === 'ar' ? s.name_ar : s.name_en}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {hasEmergencySymptomSelected && (
            <div className="mb-6 text-sm text-danger-700 dark:text-danger-300 bg-danger-500/10 border border-danger-300 dark:border-danger-800 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <strong className="block font-bold mb-0.5">
                  {language === 'en' ? 'Potential Emergency Warning:' : 'تنبيه طوارئ محتمل:'}
                </strong>
                <span className="text-xs leading-relaxed">{t('emergency_desc')}</span>
              </div>
            </div>
          )}

          {/* Duration and Severity */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8 bg-gray-50 dark:bg-gray-700/30 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-gray-700">
            <Field label={t('symptoms_duration')}>
              <input
                placeholder={t('duration_placeholder')}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="input"
              />
            </Field>
            <Field label={t('symptoms_severity')}>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="input"
              >
                <option value="mild">{t('severity_mild')}</option>
                <option value="moderate">{t('severity_moderate')}</option>
                <option value="severe">{t('severity_severe')}</option>
              </select>
            </Field>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(STEPS.PROFILE)}
              className="flex-1 py-3.5 rounded-2xl border border-gray-300 dark:border-gray-600 font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {t('back')}
            </button>
            <button
              disabled={selectedSymptoms.length === 0 || loading}
              onClick={goToFollowup}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 disabled:opacity-50 text-white font-bold transition shadow-md shadow-primary-500/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t('preparing_questions') || 'جاري تحضير الأسئلة الذكية...'}</span>
                </>
              ) : (
                <>
                  <span>{t('next')}</span>
                  <span>←</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DOCTOR-LIKE FOLLOW-UP QUESTIONS */}
      {step === STEPS.FOLLOWUP && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/60 text-primary-600 dark:text-primary-300 flex items-center justify-center text-xl font-bold">
              3
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                {t('followup_title')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {t('followup_subtitle')}
              </p>
            </div>
          </div>

          <div className="my-6 p-4 rounded-2xl bg-primary-50/70 dark:bg-primary-950/40 border border-primary-200/60 dark:border-primary-800/40 flex items-center gap-3">
            <span className="text-2xl">🩺</span>
            <div className="text-xs text-primary-900 dark:text-primary-200 leading-relaxed font-medium">
              {language === 'ar'
                ? 'يقوم الطبيب الذكي الآن بطرح أسئلة استقصائية مخصصة لتحديد التشخيص الأدق واستبعاد الأسباب المحتملة الأخرى.'
                : 'The AI clinician is asking targeted clinical questions to rule out competing conditions and confirm the most accurate diagnosis.'}
            </div>
          </div>

          <div className="space-y-6 mb-8">
            {followupQuestions.map((q, idx) => {
              const qId = q.id || `q_${idx}`;
              const options = getQuestionOptions(q.options);
              return (
                <div
                  key={qId}
                  className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-700/20"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                      <span className="text-primary-600 dark:text-primary-400 me-2">#{idx + 1}</span>
                      {language === 'ar' ? q.question_ar : q.question_en}
                    </p>
                    {q.is_emergency_trigger && (
                      <span className="text-[11px] font-bold text-danger-600 dark:text-danger-400 bg-danger-50 dark:bg-danger-950 px-2 py-0.5 rounded-full border border-danger-200 dark:border-danger-800 shrink-0">
                        {t('critical_indicator') || 'مؤشر حرج'}
                      </span>
                    )}
                  </div>

                  {q.clinical_purpose && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 italic">
                      🎯 {t('clinical_purpose_label') || (language === 'en' ? 'Clinical Purpose' : 'الهدف السريري')}: {q.clinical_purpose}
                    </p>
                  )}

                  {/* Boolean (Yes / No) */}
                  {q.answer_type === 'boolean' && (
                    <div className="flex gap-3">
                      {[
                        { label: t('yes'), val: true, color: 'text-primary-600' },
                        { label: t('no'), val: false, color: 'text-gray-600' },
                      ].map((btn) => {
                        const active = followupAnswers[qId] === btn.val;
                        return (
                          <button
                            type="button"
                            key={String(btn.val)}
                            onClick={() =>
                              setFollowupAnswers({ ...followupAnswers, [qId]: btn.val })
                            }
                            className={`flex-1 py-2.5 px-4 rounded-xl border-2 text-sm font-bold transition flex items-center justify-center gap-2 ${
                              active
                                ? 'border-primary-500 bg-primary-600 text-white shadow-sm'
                                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-primary-300'
                            }`}
                          >
                            <span>{btn.val ? '✓' : '✗'}</span>
                            <span>{btn.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Single choice with options */}
                  {q.answer_type === 'single_choice' && options.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-2">
                      {options.map((opt) => {
                        const active = followupAnswers[qId] === opt;
                        return (
                          <button
                            type="button"
                            key={opt}
                            onClick={() =>
                              setFollowupAnswers({ ...followupAnswers, [qId]: opt })
                            }
                            className={`p-3 rounded-xl border-2 text-xs sm:text-sm font-semibold transition text-start ${
                              active
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-900 dark:text-primary-100'
                                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-primary-300'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Text input */}
                  {q.answer_type === 'text' && (
                    <input
                      className="input"
                      placeholder={language === 'en' ? 'Type your answer here...' : 'اكتب إجابتك هنا...'}
                      value={followupAnswers[qId] || ''}
                      onChange={(e) =>
                        setFollowupAnswers({ ...followupAnswers, [qId]: e.target.value })
                      }
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(STEPS.SYMPTOMS)}
              className="flex-1 py-3.5 rounded-2xl border border-gray-300 dark:border-gray-600 font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {t('back')}
            </button>
            <button
              disabled={loading}
              onClick={submitAssessment}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 disabled:opacity-50 text-white font-bold transition shadow-md shadow-primary-500/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t('analyzing')}</span>
                </>
              ) : (
                <>
                  <span>{t('submit')}</span>
                  <span>✓</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: HIGH CONFIDENCE DIAGNOSTIC RESULTS */}
      {step === STEPS.RESULTS && result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Emergency Alert Banner */}
          {result.is_emergency && (
            <EmergencyAlert
              reason={language === 'ar' ? result.emergency_reason_ar : result.emergency_reason_en}
            />
          )}

          {/* Header Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-6 mb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-100 dark:bg-primary-900/60 text-primary-800 dark:text-primary-200 mb-2">
                  <span>👨‍⚕️</span> {t('high_confidence')}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                  {t('results_title')}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {result.doctor_specialty_recommended_ar && (
                  <div className="bg-primary-50 dark:bg-primary-950 p-3 rounded-2xl border border-primary-200/70 dark:border-primary-800/60">
                    <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block mb-0.5">
                      {t('recommended_specialist')}
                    </span>
                    <span className="text-sm font-extrabold text-primary-700 dark:text-primary-300">
                      🩺 {language === 'ar' ? result.doctor_specialty_recommended_ar : result.doctor_specialty_recommended_en}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={exportPDF}
                  className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition cursor-pointer"
                >
                  <span>📄</span>
                  <span>{t('export_pdf_btn') || (language === 'en' ? 'Export PDF Report' : 'تصدير تقرير PDF')}</span>
                </button>
              </div>
            </div>

            {/* Conditions List */}
            <div className="space-y-5">
              {(result.possible_conditions || []).map((cond, idx) => {
                const prob = cond.probability_percent || 50;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6 bg-gray-50/40 dark:bg-gray-800/80 transition hover:shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs font-black flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <h3 className="font-black text-lg sm:text-xl text-gray-900 dark:text-white">
                          {language === 'ar' ? cond.name_ar : cond.name_en}
                        </h3>
                      </div>

                      {/* Probability badge & bar */}
                      <div className="flex items-center gap-3">
                        <div className="w-24 sm:w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              prob >= 75
                                ? 'bg-emerald-500'
                                : prob >= 50
                                ? 'bg-primary-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(prob, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs sm:text-sm font-black text-primary-700 dark:text-primary-300 whitespace-nowrap">
                          {prob}% {t('probability')}
                        </span>
                      </div>
                    </div>

                    {/* Basic Explanation */}
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4">
                      {language === 'ar' ? cond.explanation_ar : cond.explanation_en}
                    </p>

                    {/* Clinical Rationale (Doctor's diagnostic reasoning) */}
                    {(cond.clinical_rationale_ar || cond.clinical_rationale_en) && (
                      <div className="mb-4 p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/50">
                        <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 mb-1 flex items-center gap-1.5">
                          <span>🔬</span>
                          <span>{t('clinical_rationale')}</span>
                        </h4>
                        <p className="text-xs text-blue-800 dark:text-blue-200/90 leading-relaxed">
                          {language === 'ar' ? cond.clinical_rationale_ar : cond.clinical_rationale_en}
                        </p>
                      </div>
                    )}

                    {/* Suggested Investigations / Tests */}
                    {Array.isArray(cond.suggested_investigations_ar) && cond.suggested_investigations_ar.length > 0 && (
                      <div className="mb-4">
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400 block mb-2">
                          📋 {t('suggested_investigations')}:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(language === 'ar' ? cond.suggested_investigations_ar : cond.suggested_investigations_en || cond.suggested_investigations_ar).map(
                            (test, tIdx) => (
                              <span
                                key={tIdx}
                                className="px-3 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 shadow-2xs"
                              >
                                {test}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {cond.recommend_doctor_visit && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-accent-700 dark:text-accent-300">
                        <span>👨‍⚕️</span>
                        <span>{t('recommend_doctor')}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Recommended Medical Specialty Card */}
            {(result.doctor_specialty_recommended_ar || result.doctor_specialty_recommended_en) && (
              <div className="mt-8 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-cyan-950/40 border-2 border-emerald-300 dark:border-emerald-700/60 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-3xl shadow-md shrink-0">
                  👨‍⚕️
                </div>
                <div>
                  <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block mb-1">
                    {language === 'ar' ? 'التخصص الطبي المقترح للمراجعة والفحص السريري' : 'Recommended Medical Specialty'}
                  </span>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">
                    {language === 'ar' ? result.doctor_specialty_recommended_ar : result.doctor_specialty_recommended_en || result.doctor_specialty_recommended_ar}
                  </h3>
                </div>
              </div>
            )}

            {/* General Advice */}
            {(result.general_advice_ar || result.general_advice_en) && (
              <div className="mt-8 bg-primary-50/80 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800/70 rounded-2xl p-5 sm:p-6">
                <h4 className="font-extrabold text-primary-900 dark:text-primary-100 mb-2 flex items-center gap-2">
                  <span>💡</span>
                  <span>{t('general_advice')}</span>
                </h4>
                <p className="text-sm text-primary-800 dark:text-primary-200 leading-relaxed">
                  {language === 'ar' ? result.general_advice_ar : result.general_advice_en}
                </p>
              </div>
            )}

            {/* Red flags if present */}
            {Array.isArray(result.red_flags_ar) && result.red_flags_ar.length > 0 && (
              <div className="mt-4 bg-danger-50/60 dark:bg-danger-950/40 border border-danger-200 dark:border-danger-800/60 rounded-2xl p-5">
                <h4 className="font-bold text-danger-900 dark:text-danger-200 mb-2 text-xs flex items-center gap-1.5">
                  <span>🚨</span>
                  <span>{t('red_flags_alert')}</span>
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-danger-800 dark:text-danger-300">
                  {(language === 'ar' ? result.red_flags_ar : result.red_flags_en || result.red_flags_ar).map(
                    (flag, fIdx) => (
                      <li key={fIdx}>{flag}</li>
                    )
                  )}
                </ul>
              </div>
            )}

            <div className="mt-8">
              <DisclaimerBanner variant="box" />
            </div>

            <button
              onClick={restart}
              className="mt-8 w-full py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold text-base shadow-md shadow-primary-500/20 transition-all"
            >
              🔄 {t('restart')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children, full }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block text-xs sm:text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-200">
        {label}
      </label>
      {children}
    </div>
  );
}
