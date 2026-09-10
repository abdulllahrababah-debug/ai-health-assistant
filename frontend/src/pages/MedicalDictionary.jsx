import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import api from '../api/client';

export default function MedicalDictionary() {
  const { t, language } = useApp();
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDisease, setSelectedDisease] = useState(null);

  const isEn = language === 'en';

  const categories = [
    { id: '', label: isEn ? 'All' : 'الكل' },
    { id: 'تنفسي', label: isEn ? 'Respiratory 🫁' : 'الجهاز التنفسي 🫁' },
    { id: 'جهاز هضمي', label: isEn ? 'Digestive 🤢' : 'الجهاز الهضمي 🤢' },
    { id: 'قلب وأوعية دموية', label: isEn ? 'Cardiology 💓' : 'القلب والشرايين 💓' },
    { id: 'غدد صماء ومناعة', label: isEn ? 'Endocrine & Diabetes 🩺' : 'الغدد والسكري 🩺' },
    { id: 'أعصاب', label: isEn ? 'Neurology 🧠' : 'المخ والأعصاب 🧠' },
    { id: 'أنف وأذن وحنجرة', label: isEn ? 'ENT 👂' : 'أنف وأذن 👂' },
    { id: 'عظام ومفاصل', label: isEn ? 'Musculoskeletal 🦴' : 'العظام والمفاصل 🦴' },
    { id: 'كلى ومسالك بولية', label: isEn ? 'Urology 🚽' : 'المسالك البولية 🚽' },
  ];

  useEffect(() => {
    fetchDiseases();
  }, [selectedCategory]);

  const fetchDiseases = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/knowledge/diseases', { params });
      setDiseases(res.data.diseases || []);
    } catch (err) {
      console.error('Failed to load dictionary', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDiseases();
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 py-10 px-4" dir={isEn ? 'ltr' : 'rtl'}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-3xl rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-4">
            📚
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            {isEn ? 'Comprehensive Medical Dictionary & Encyclopedia' : 'القاموس والموسوعة الطبية الشاملة'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {isEn
              ? 'Reliable, patient-friendly medical guide explaining common conditions, causes, symptoms, and clinical treatments'
              : 'دليل إرشادي موثوق ومبسط يشرح الأمراض الشائعة، أسبابها، أعراضها، وأساليب العلاج والوقاية السريرية'}
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mb-6 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isEn ? 'Search any disease, symptom, or condition...' : 'ابحث عن أي مرض، عارض، أو تشخيص...'}
              className="w-full px-5 py-3.5 pe-11 ps-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm text-sm"
            />
            <span className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-400 text-base">
              🔍
            </span>
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm shadow-md transition-all cursor-pointer"
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
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-105'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Diseases Grid */}
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : diseases.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {isEn ? 'No matching conditions found. Try different keywords.' : 'لم يتم العثور على نتائج تطابق بحثك. جرّب كلمات أخرى.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {diseases.map((d) => (
              <div
                key={d.id}
                onClick={() => setSelectedDisease(d)}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 hover:border-indigo-300 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-full">
                        {d.category || (isEn ? 'General Medicine' : 'طب عام')}
                      </span>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg mt-1">
                        {isEn ? (d.name_en || d.name_ar) : d.name_ar}
                      </h3>
                      <span className="text-xs text-gray-400 font-medium">
                        {isEn ? d.name_ar : d.name_en}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        d.severity === 'high'
                          ? 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                          : d.severity === 'medium'
                          ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {d.severity === 'high'
                        ? (isEn ? 'High Priority' : 'أولوية عالية')
                        : d.severity === 'medium'
                        ? (isEn ? 'Moderate' : 'متوسط')
                        : (isEn ? 'Mild' : 'خفيف')}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3 mb-4">
                    {isEn ? (d.description_en || d.description_ar) : d.description_ar}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">
                    {isEn ? 'Specialist: ' : 'التخصص: '}{d.specialist}
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                    {isEn ? 'Details & Management →' : 'التفاصيل والعلاج ←'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedDisease && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedDisease(null)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-5">
                <div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {selectedDisease.category}
                  </span>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                    {isEn ? (selectedDisease.name_en || selectedDisease.name_ar) : selectedDisease.name_ar}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {isEn ? selectedDisease.name_ar : selectedDisease.name_en}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDisease(null)}
                  className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-sm leading-relaxed">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 mb-1">
                    {isEn ? 'About the Condition' : 'عن المرض'}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-200">
                    {isEn ? (selectedDisease.description_en || selectedDisease.description_ar) : selectedDisease.description_ar}
                  </p>
                </div>

                <div className="p-4 bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 rounded-2xl">
                  <h4 className="text-xs font-bold text-rose-700 dark:text-rose-300 mb-1">
                    {isEn ? 'Common Symptoms & Clinical Signs' : 'الأعراض والعلامات الشائعة'}
                  </h4>
                  <p className="text-xs text-rose-900 dark:text-rose-200">{selectedDisease.symptoms}</p>
                </div>

                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 rounded-2xl">
                  <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-1">
                    {isEn ? 'Recommended Treatment & Management' : 'أساليب العلاج المعتمدة'}
                  </h4>
                  <p className="text-xs text-indigo-900 dark:text-indigo-200">{selectedDisease.treatment}</p>
                </div>

                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-2xl">
                  <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-1">
                    {isEn ? 'Prevention & Lifestyle Measures' : 'طرق الوقاية وتغيير نمط الحياة'}
                  </h4>
                  <p className="text-xs text-emerald-900 dark:text-emerald-200">{selectedDisease.prevention}</p>
                </div>

                <div className="flex items-center gap-2 pt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-bold">{isEn ? 'Recommended Medical Specialty:' : 'التخصص الطبي الموصى بمراجعته:'}</span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full font-bold text-gray-800 dark:text-gray-200">
                    {selectedDisease.specialist}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-5 border-t border-gray-100 dark:border-gray-700 mt-6">
                <button
                  onClick={() => setSelectedDisease(null)}
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