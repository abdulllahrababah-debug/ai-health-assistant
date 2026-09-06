import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function Home() {
  const { t } = useApp();

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-primary-50 to-white dark:from-primary-900 dark:to-gray-900 py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block mb-4 text-6xl">🩺</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-primary-800 dark:text-white mb-4 leading-tight">
            {t('home_title')}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            {t('home_subtitle')}
          </p>
          <Link
            to="/assessment"
            className="inline-block px-8 py-4 rounded-full bg-primary-600 hover:bg-primary-700 text-white font-bold text-lg shadow-lg shadow-primary-500/30 transition"
          >
            {t('start_btn')} →
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-primary-800 dark:text-white mb-10">
          {t('how_it_works')}
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { icon: '📝', title: t('step1_title'), desc: t('step1_desc') },
            { icon: '🧩', title: t('step2_title'), desc: t('step2_desc') },
            { icon: '🤖', title: t('step3_title'), desc: t('step3_desc') },
          ].map((step, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition"
            >
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="font-bold text-lg text-primary-700 dark:text-primary-200 mb-2">{step.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <DisclaimerBanner variant="box" />
      </section>
    </div>
  );
}
