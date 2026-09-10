import React from 'react';
import { useApp } from '../context/AppContext';

export default function EmergencyAlert({ reason }) {
  const { t, language } = useApp();

  const openNearestHospital = () => {
    window.open('https://www.google.com/maps/search/?api=1&query=hospital+near+me', '_blank');
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border-4 border-rose-500 bg-rose-500/10 dark:bg-rose-950/40 p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="text-4xl animate-bounce">🚨</span>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mb-1">
              {t('emergency_title')}
            </h3>
            <p className="text-rose-700 dark:text-rose-200 text-sm leading-relaxed">
              {reason || t('emergency_desc')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openNearestHospital}
          className="w-full sm:w-auto shrink-0 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>🏥</span>
          <span>{t('nearest_hospital_btn') || (language === 'en' ? 'Find Nearest Hospital & ER (GPS Maps)' : 'العثور على أقرب مستشفى وطوارئ (خرائط GPS)')}</span>
          <span>↗</span>
        </button>
      </div>
    </div>
  );
}

