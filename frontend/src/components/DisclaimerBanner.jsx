import React from 'react';
import { useApp } from '../context/AppContext';

export default function DisclaimerBanner({ variant = 'footer' }) {
  const { t } = useApp();

  if (variant === 'footer') {
    return (
      <div className="text-xs sm:text-sm text-center text-gray-500 dark:text-gray-400 py-4 px-4 border-t border-gray-200 dark:border-gray-800">
        ⚠️ {t('disclaimer_banner')}
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-100 rounded-xl p-4">
      <span className="text-2xl">⚠️</span>
      <div>
        <p className="font-bold mb-1">{t('not_a_doctor_title')}</p>
        <p className="text-sm leading-relaxed">{t('not_a_doctor_desc')}</p>
      </div>
    </div>
  );
}
