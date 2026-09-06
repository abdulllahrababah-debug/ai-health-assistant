import React from 'react';
import { useApp } from '../context/AppContext';

export default function EmergencyAlert({ reason }) {
  const { t } = useApp();
  return (
    <div className="relative overflow-hidden rounded-2xl border-4 border-danger-500 bg-danger-500/10 dark:bg-danger-500/20 p-6 mb-6 animate-pulse">
      <div className="flex items-start gap-4">
        <span className="text-4xl">🚨</span>
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-danger-600 dark:text-red-300 mb-2">
            {t('emergency_title')}
          </h3>
          <p className="text-danger-700 dark:text-red-200 leading-relaxed">
            {reason || t('emergency_desc')}
          </p>
        </div>
      </div>
    </div>
  );
}
