import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/history');
      setHistory(res.data.history || []);
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا التشخيص؟')) return;

    try {
      setDeletingId(id);
      await api.delete(`/history/${id}`);
      setHistory(history.filter((item) => item.id !== id));
      if (selectedRecord?.id === id) setSelectedRecord(null);
    } catch (err) {
      alert('تعذر حذف السجل');
    } finally {
      setDeletingId(null);
    }
  };

  const parseJson = (str, fallback = {}) => {
    try {
      return typeof str === 'string' ? JSON.parse(str) : str || fallback;
    } catch {
      return fallback;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 py-10 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <span>📋</span> سجل التشخيصات والفحوصات الطبية
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              أرشيف كامل لجميع التقييمات السريرية التي أجريتها مع المساعد الذكي
            </p>
          </div>
          <Link
            to="/assessment"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-indigo-500/25 transition-all"
          >
            <span>+</span> إجراء فحص جديد
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-5xl mb-4">🩺</div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">لا توجد تشخيصات مسجلة بعد</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              لم تقم بإجراء أي فحص للأعراض حتى الآن. يمكنك بدء فحص سريري فوري وشامل الآن.
            </p>
            <Link
              to="/assessment"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition-all inline-block"
            >
              ابدأ فحص الأعراض الآن ↗
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map((record) => {
              const symptoms = parseJson(record.selected_symptoms, []);
              const ai = parseJson(record.ai_response, {});
              const topCondition = ai.possible_conditions?.[0] || {};
              const date = new Date(record.created_at).toLocaleDateString('ar-JO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className={`bg-white dark:bg-gray-800 rounded-3xl p-6 border transition-all cursor-pointer hover:shadow-xl relative ${
                    record.is_emergency
                      ? 'border-red-200 dark:border-red-900/60 bg-red-50/20'
                      : 'border-gray-100 dark:border-gray-700 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{record.is_emergency ? '🚨' : '🩺'}</span>
                      <div>
                        <span className="text-xs text-gray-400 font-medium">{date}</span>
                        <h3 className="font-bold text-gray-900 dark:text-white text-base mt-0.5">
                          {topCondition.name_ar || 'تقييم سريري'}
                        </h3>
                      </div>
                    </div>
                    {record.is_emergency ? (
                      <span className="px-2.5 py-1 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded-full text-[11px] font-bold">
                        طوارئ
                      </span>
                    ) : (
                      topCondition.probability_percent && (
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-full text-[11px] font-bold">
                          دقة {topCondition.probability_percent}%
                        </span>
                      )
                    )}
                  </div>

                  {/* Symptoms Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {Array.isArray(symptoms) &&
                      symptoms.slice(0, 4).map((sym, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-xs"
                        >
                          {sym}
                        </span>
                      ))}
                    {Array.isArray(symptoms) && symptoms.length > 4 && (
                      <span className="text-xs text-gray-400 self-center">
                        +{symptoms.length - 4} أعراض أخرى
                      </span>
                    )}
                  </div>

                  {/* Bottom Action */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700 text-xs">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                      عرض التقرير الكامل ←
                    </span>
                    <button
                      onClick={(e) => handleDelete(record.id, e)}
                      disabled={deletingId === record.id}
                      className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg transition-colors"
                      title="حذف من السجل"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Record Detail Modal */}
        {selectedRecord && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedRecord(null)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
                <div>
                  <span className="text-xs text-indigo-600 font-bold">تقرير تشخيص محفوظ</span>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">
                    {parseJson(selectedRecord.ai_response).possible_conditions?.[0]?.name_ar || 'التشخيص الطبي'}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-gray-700 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Conditions List */}
              <div className="space-y-4 mb-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  التشخيصات التفريقية المحتملة
                </h4>
                {parseJson(selectedRecord.ai_response).possible_conditions?.map((cond, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-bold text-gray-900 dark:text-white text-base">
                        {cond.name_ar} <span className="text-xs text-gray-400">({cond.name_en})</span>
                      </h5>
                      <span className="text-xs font-bold px-2.5 py-1 bg-indigo-600 text-white rounded-full">
                        {cond.probability_percent}% احتمال
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                      {cond.explanation_ar}
                    </p>

                    {cond.suggested_investigations_ar && (
                      <div className="mt-2 pt-2 border-t border-gray-200/60 dark:border-gray-700">
                        <span className="text-[11px] font-bold text-gray-500 block mb-1">
                          الفحوصات المخبرية والشعاعية المقترحة:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {cond.suggested_investigations_ar.map((inv, iIdx) => (
                            <span
                              key={iIdx}
                              className="text-[11px] bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-2 py-0.5 rounded-md"
                            >
                              {inv}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white text-xs font-bold rounded-xl transition-all"
                >
                  إغلاق النافذة
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}