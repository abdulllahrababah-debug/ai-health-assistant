import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../api/client';

export default function Login() {
  const { t, login } = useApp();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister ? form : { email: form.email, password: form.password };
      const { data } = await api.post(endpoint, payload);
      login(data.user, data.token);
      navigate(data.user.role === 'admin' ? '/admin' : '/assessment');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (isRegister
            ? 'تعذر إنشاء الحساب. تأكد من صحة البيانات أو أن البريد غير مسجل مسبقاً.'
            : 'بيانات الدخول غير صحيحة، يرجى التحقق من البريد وكلمة المرور.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-primary-900/5 border border-gray-100 dark:border-gray-700 p-8 sm:p-10 transition-all">
        {/* Header with App Brand Icon */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-primary-600 to-primary-400 text-white flex items-center justify-center text-2xl shadow-md shadow-primary-500/20">
            🩺
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            {isRegister ? t('create_account') : t('welcome_back')}
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {isRegister ? t('create_account_subtitle') : t('welcome_subtitle')}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-2xl bg-gray-100 dark:bg-gray-700/60 p-1 mb-6">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError('');
            }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
              !isRegister
                ? 'bg-white dark:bg-gray-800 text-primary-700 dark:text-primary-300 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            {t('login')}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError('');
            }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
              isRegister
                ? 'bg-white dark:bg-gray-800 text-primary-700 dark:text-primary-300 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            {t('register')}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 flex items-start gap-2.5 text-sm text-danger-700 dark:text-danger-400 bg-danger-500/10 border border-danger-200 dark:border-danger-800/50 rounded-2xl p-3.5 animate-shake">
            <span className="text-base leading-none">⚠️</span>
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                {t('full_name')}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 start-0 flex items-center ps-3.5 text-gray-400">
                  👤
                </span>
                <input
                  name="full_name"
                  type="text"
                  required
                  placeholder="مثال: د. عبد الله"
                  value={form.full_name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700/80 dark:text-white ps-10 pe-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              {t('email')}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 start-0 flex items-center ps-3.5 text-gray-400">
                ✉️
              </span>
              <input
                type="email"
                name="email"
                required
                placeholder="name@example.com"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700/80 dark:text-white ps-10 pe-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                {t('password')}
              </label>
              {isRegister && (
                <span className="text-[11px] text-gray-400">
                  {t('password_hint')}
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 start-0 flex items-center ps-3.5 text-gray-400">
                🔒
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700/80 dark:text-white ps-10 pe-11 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                title={showPassword ? t('hide_password') : t('show_password')}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {!isRegister && (
              <div className="text-end mt-1.5">
                <Link
                  to="/reset-password"
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white text-sm font-bold shadow-md shadow-primary-500/25 hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>جاري المعالجة...</span>
              </>
            ) : isRegister ? (
              t('create_account')
            ) : (
              t('login')
            )}
          </button>
        </form>

        {/* Separator */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <span className="relative bg-white dark:bg-gray-800 px-3 text-xs text-gray-400 font-medium">
            {isRegister ? t('already_have_account') : t('dont_have_account')}
          </span>
        </div>

        {/* Switch tab link */}
        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setError('');
          }}
          className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-center block"
        >
          {isRegister ? t('login') : t('create_account')}
        </button>

        {/* Guest direct check link */}
        <div className="mt-5 text-center">
          <Link
            to="/assessment"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
          >
            <span>🩺</span>
            {t('continue_as_guest')} →
          </Link>
        </div>
      </div>
    </div>
  );
}
