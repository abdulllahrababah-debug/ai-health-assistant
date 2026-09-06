import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api/client';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [mockResetUrl, setMockResetUrl] = useState('');

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setMockResetUrl('');

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSuccessMessage(res.data.message || 'إذا كان هذا البريد مسجلاً، فقد تم إرسال رابط الاسترداد.');
      if (res.data.mockLink) {
        setMockResetUrl(res.data.mockLink);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'تعذر إرسال رابط الاسترداد، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage('كلمتا المرور غير متطابقتين');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('كلمة المرور يجب ألا تقل عن 6 أحرف');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await api.post('/auth/reset-password', { token, password });
      setSuccessMessage(res.data.message || 'تم تحديث كلمة المرور بنجاح! جاري التوجيه...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'الرابط غير صالح أو انتهت صلاحيته');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4" dir="rtl">
      <div className="max-w-md w-full">
        {/* Logo Card */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-4 text-3xl text-white">
            🔐
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            {token ? 'تعيين كلمة مرور جديدة' : 'استعادة كلمة المرور'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {token ? 'أدخل كلمة المرور الجديدة لحسابك' : 'أدخل بريدك الإلكتروني المسجل لنرسل لك رابط الاسترداد'}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-200 text-sm font-medium flex items-center gap-3">
              <span className="text-xl">✅</span>
              <div>{successMessage}</div>
            </div>
          )}

          {mockResetUrl && (
            <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-2xl">
              <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200 mb-2 flex items-center gap-1.5">
                <span>⚡</span>
                <span>رابط الاسترداد المباشر (وضع التجربة):</span>
              </div>
              <p className="text-xs text-indigo-700 dark:text-indigo-300 mb-3">
                اضغط على الزر أدناه لإكمال تعيين كلمة المرور الجديدة لحسابك:
              </p>
              <a
                href={mockResetUrl}
                className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition"
              >
                🔐 المتابعة لإعادة تعيين كلمة المرور الآن
              </a>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-800 dark:text-rose-200 text-sm font-medium flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>{errorMessage}</div>
            </div>
          )}

          {!token ? (
            <form onSubmit={handleForgotSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  البريد الإلكتروني المسجل
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all duration-200 disabled:opacity-60 text-sm flex items-center justify-center gap-2"
              >
                {loading ? 'جاري المعالجة...' : 'إرسال رابط الاسترداد 📨'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm pr-4 pl-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                  >
                    {showPassword ? 'إخفاء' : 'عرض'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  تأكيد كلمة المرور الجديدة
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/25 transition-all duration-200 disabled:opacity-60 text-sm flex items-center justify-center gap-2"
              >
                {loading ? 'جاري الحفظ...' : 'تحديث كلمة المرور والدخول 🔒'}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
            <Link
              to="/login"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              ← العودة لصفحة تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}