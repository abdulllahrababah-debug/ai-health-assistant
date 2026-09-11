import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import api from '../api/client';

export default function MedicineGuide() {
  const { t, language } = useApp();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMed, setSelectedMed] = useState(null);

  const isEn = language === 'en';

  const categories = [
    { id: '', label: isEn ? 'All (85+)' : 'الكل (85+ دواء)' },
    { id: 'مسكن', label: isEn ? 'Pain & NSAIDs 💊' : 'مسكنات ومضادات التهاب 💊' },
    { id: 'مضاد', label: isEn ? 'Antibiotics & Antimicrobials 🦠' : 'مضادات حيوية وفطريات 🦠' },
    { id: 'القلب', label: isEn ? 'Cardiovascular & BP 💓' : 'أدوية القلب والضغط 💓' },
    { id: 'السكري', label: isEn ? 'Diabetes & Endocrine 🩺' : 'السكري والغدد 🩺' },
    { id: 'المعدة', label: isEn ? 'Digestive & Stomach 🤢' : 'الجهاز الهضمي والقولون 🤢' },
    { id: 'الصدر', label: isEn ? 'Respiratory & Asthma 🫁' : 'الجهاز التنفسي والربو 🫁' },
    { id: 'الحساسية', label: isEn ? 'Allergy & Antihistamine 🤧' : 'مضادات الحساسية 🤧' },
    { id: 'الأعصاب', label: isEn ? 'Neurology & Mood 🧠' : 'الأعصاب والصحة النفسية 🧠' },
    { id: 'مراهم', label: isEn ? 'Topical & Drops 🧴' : 'مراهم وقطرات عيون 🧴' },
    { id: 'فيتامين', label: isEn ? 'Vitamins & Minerals 🍎' : 'فيتامينات ومكملات 🍎' },
  ];

  useEffect(() => {
    fetchMedicines();
  }, [selectedCategory]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (search.trim()) params.search = search.trim();
      const res = await api.get('/knowledge/medicines', { params });
      setMedicines(res.data.medicines || []);
    } catch (err) {
      console.error('Failed to load medicines', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMedicines();
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 py-10 px-4" dir={isEn ? 'ltr' : 'rtl'}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-600 to-teal-600 text-white text-3xl rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-4">
            💊
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            {isEn ? 'Medicine Guide & Safe Usage' : 'دليل الأدوية والاستخدام الآمن'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {isEn
              ? 'Quick clinical reference for common medications, recommended adult dosages, contraindications, and warnings'
              : 'مرجع دوائي سريع للأدوية الأكثر شيوعاً، جرعات البالغين الموصى بها، موانع الاستعمال، والتحذيرات السريرية'}
          </p>
        </div>

        {/* Warning Alert */}
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl flex items-center gap-3 text-xs text-amber-900 dark:text-amber-200 font-medium">
          <span className="text-2xl">⚠️</span>
          <span>
            {isEn
              ? 'Notice: This guide is for pharmacological education only. Never start, modify, or discontinue any medication without consulting your prescribing physician or licensed pharmacist.'
              : 'تنبيه: هذا الدليل للتثقيف الدوائي وزيادة الوعي الصحي فقط. لا تبدأ أو تعدل أي جرعة دوائية دون استشارة الطبيب المعالج أو الصيدلاني المرخص.'}
          </span>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isEn ? 'Search medicine by trade or generic name (e.g. Paracetamol, Metformin)...' : 'ابحث باسم الدواء التجاري أو العلمي (مثال: باراسيتامول، فنتولين)...'}
              className="w-full px-5 py-3.5 pe-11 ps-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm text-sm"
            />
            <span className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-400 text-base">
              🔍
            </span>
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm shadow-md transition-all cursor-pointer"
          >
            {isEn ? 'Search' : 'بحث'}
          </button>
        </form>

        {/* Categories Bar */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 scale-105'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Medicines List */}
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : medicines.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {isEn ? 'No medicines match your search.' : 'لم يتم العثور على أدوية مطابقة للبحث.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medicines.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedMed(m)}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 hover:border-emerald-300 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
                        {m.category || (isEn ? 'General' : 'دواء')}
                      </span>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg mt-1">
                        {isEn ? (m.name_en || m.name_ar) : m.name_ar}
                      </h3>
                      <span className="text-xs text-gray-400 font-medium">
                        {isEn ? m.name_ar : m.name_en}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mt-3 text-xs">
                    <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                      <strong className="text-gray-800 dark:text-gray-100">
                        {isEn ? 'Primary Uses: ' : 'الاستخدام الأساسي: '}
                      </strong>
                      {m.uses}
                    </p>
                    <p className="text-emerald-700 dark:text-emerald-300 font-semibold line-clamp-1">
                      💊 {isEn ? 'Adult Dosage: ' : 'الجرعة الشائعة: '}{m.dosage_adult}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs mt-4">
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    ⚠️ {isEn ? 'Important Warnings' : 'تحذيرات هامة'}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {isEn ? 'Full Details →' : 'التفاصيل كاملة ←'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {selectedMed && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedMed(null)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-5">
                <div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedMed.category}
                  </span>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                    {isEn ? (selectedMed.name_en || selectedMed.name_ar) : selectedMed.name_ar}
                  </h2>
                  <p className="text-xs text-gray-400">{isEn ? selectedMed.name_ar : selectedMed.name_en}</p>
                </div>
                <button
                  onClick={() => setSelectedMed(null)}
                  className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 flex items-center justify-center font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-sm leading-relaxed">
                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-2xl">
                  <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                    {isEn ? 'Indications & Uses' : 'دواعي الاستعمال'}
                  </h4>
                  <p className="text-xs text-emerald-950 dark:text-emerald-200">{selectedMed.uses}</p>
                </div>

                <div className="p-4 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-2xl">
                  <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-1">
                    {isEn ? 'Recommended Adult Dosage' : 'الجرعة المعتادة للبالغين'}
                  </h4>
                  <p className="text-xs text-blue-950 dark:text-blue-200">{selectedMed.dosage_adult}</p>
                </div>

                <div className="p-4 bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 rounded-2xl">
                  <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
                    {isEn ? 'Clinical Warnings & Contraindications' : 'موانع الاستعمال والتحذيرات'}
                  </h4>
                  <p className="text-xs text-amber-950 dark:text-amber-200">{selectedMed.warnings}</p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 rounded-2xl">
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {isEn ? 'Possible Side Effects' : 'الآثار الجانبية المحتملة'}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{selectedMed.side_effects}</p>
                </div>
              </div>

              <div className="flex justify-end pt-5 border-t border-gray-100 dark:border-gray-700 mt-6">
                <button
                  onClick={() => setSelectedMed(null)}
                  className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold cursor-pointer"
                >
                  {isEn ? 'Close' : 'إغلاق'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}