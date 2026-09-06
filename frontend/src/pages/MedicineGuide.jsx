import React, { useState, useEffect } from 'react';
import api from '../api/client';

export default function MedicineGuide() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMed, setSelectedMed] = useState(null);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const params = {};
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
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 py-10 px-4" dir="rtl">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-600 to-teal-600 text-white text-3xl rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-4">
            💊
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            دليل الأدوية والاستخدام الآمن
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            مرجع دوائي سريع للأدوية الأكثر شيوعاً، جرعات البالغين الموصى بها، موانع الاستعمال، والتحذيرات السريرية
          </p>
        </div>

        {/* Warning Alert */}
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl flex items-center gap-3 text-xs text-amber-900 dark:text-amber-200 font-medium">
          <span className="text-2xl">⚠️</span>
          <span>
            تنبيه: هذا الدليل للتثقيف الدوائي وزيادة الوعي الصحي فقط. لا تبدأ أو تعدل أي جرعة دوائية دون استشارة الطبيب المعالج أو الصيدلاني المرخص.
          </span>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم الدواء (العلمي أو التجاري) أو دواعي الاستعمال..."
              className="w-full px-5 py-3.5 pr-11 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm text-sm"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-base">
              🔍
            </span>
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm shadow-md transition-all"
          >
            بحث
          </button>
        </form>

        {/* Medicines Grid */}
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medicines.map((med) => (
              <div
                key={med.id}
                onClick={() => setSelectedMed(med)}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 hover:border-emerald-300 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
                        {med.category}
                      </span>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg mt-1">
                        {med.name_ar}
                      </h3>
                      <span className="text-xs text-gray-400 font-medium">{med.name_en}</span>
                    </div>
                    <span className="text-2xl">💊</span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div>
                      <span className="font-bold text-gray-700 dark:text-gray-300 block mb-0.5">
                        الاستخدام:
                      </span>
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{med.uses}</p>
                    </div>

                    <div className="p-2.5 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-xl">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-0.5">
                        الجرعة الاعتيادية للبالغين:
                      </span>
                      <p className="text-emerald-900 dark:text-emerald-200">{med.dosage_adult}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs mt-4">
                  <span className="text-red-500 font-bold flex items-center gap-1">
                    <span>⚠️</span> تحذيرات هامة
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    عرض ورقة الدواء ←
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
                    {selectedMed.name_ar}
                  </h2>
                  <p className="text-xs text-gray-400">{selectedMed.name_en}</p>
                </div>
                <button
                  onClick={() => setSelectedMed(null)}
                  className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-sm leading-relaxed">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 mb-1">دواعي الاستعمال</h4>
                  <p className="text-gray-800 dark:text-gray-200">{selectedMed.uses}</p>
                </div>

                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                  <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                    الجرعة الموصى بها للبالغين
                  </h4>
                  <p className="text-xs text-emerald-900 dark:text-emerald-200 font-medium">
                    {selectedMed.dosage_adult}
                  </p>
                </div>

                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl">
                  <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300 mb-1 flex items-center gap-1.5">
                    <span>🛑</span> موانع الاستعمال والتحذيرات السريرية
                  </h4>
                  <p className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed font-medium">
                    {selectedMed.warnings}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700 rounded-2xl">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                    الآثار الجانبية المحتملة
                  </h4>
                  <p className="text-xs text-gray-700 dark:text-gray-300">{selectedMed.side_effects}</p>
                </div>
              </div>

              <div className="flex justify-end pt-5 border-t border-gray-100 dark:border-gray-700 mt-6">
                <button
                  onClick={() => setSelectedMed(null)}
                  className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}