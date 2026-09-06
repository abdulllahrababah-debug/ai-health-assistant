import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import api from '../api/client';

export default function Profile() {
  const { user, login, token } = useApp();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [personal, setPersonal] = useState({
    full_name: user?.full_name || '',
  });

  const [medical, setMedical] = useState({
    age: '',
    gender: 'male',
    height_cm: '',
    weight_kg: '',
    blood_type: '',
    chronic_diseases: '',
    current_medications: '',
    drug_allergies: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profile');
      if (res.data.user) {
        setPersonal({ full_name: res.data.user.full_name });
      }
      if (res.data.medicalHistory) {
        const m = res.data.medicalHistory;
        setMedical({
          age: m.age || '',
          gender: m.gender || 'male',
          height_cm: m.height_cm || '',
          weight_kg: m.weight_kg || '',
          blood_type: m.blood_type || '',
          chronic_diseases: m.chronic_diseases || '',
          current_medications: m.current_medications || '',
          drug_allergies: m.drug_allergies || '',
        });
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      await api.put('/profile', personal);
      login({ ...user, full_name: personal.full_name }, token);
      setSuccess('تم تحديث بياناتك الشخصية بنجاح!');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تحديث البيانات');
    } finally {
      setSaving(false);
    }
  };

  const handleMedicalSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      await api.post('/profile/medical-history', medical);
      setSuccess('تم حفظ التاريخ الطبي بنجاح! سيتم اعتماده آلياً في تحسين دقة جميع تشخيصاتك.');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل حفظ التاريخ الطبي');
    } finally {
      setSaving(false);
    }
  };

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 py-10 px-4" dir="rtl">
      <div className="max-w-3xl mx-auto">
        {/* Profile Card Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl shadow-inner border-2 border-white/30">
            👤
          </div>
          <div className="text-center sm:text-right flex-1">
            <h1 className="text-2xl sm:text-3xl font-black">{user?.full_name}</h1>
            <p className="text-indigo-200 text-sm mt-1">{user?.email}</p>
            <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
              <span className="px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold">
                {user?.role === 'admin' ? '👑 مسؤول النظام (Admin)' : '👤 مستخدم معتمد'}
              </span>
              {medical.blood_type && (
                <span className="px-3 py-1 bg-rose-500/80 rounded-full text-xs font-bold">
                  فصيلة الدم: {medical.blood_type}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Notifications */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-200 text-sm font-medium flex items-center gap-3">
            <span className="text-xl">✅</span>
            <div>{success}</div>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-800 dark:text-rose-200 text-sm font-medium flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>{error}</div>
          </div>
        )}

        {/* Tab Buttons */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 gap-2">
          <button
            onClick={() => setActiveTab('personal')}
            className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'personal'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>👤</span> المعلومات الأساسية
          </button>
          <button
            onClick={() => setActiveTab('medical')}
            className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'medical'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>🩺</span> التاريخ والملف الطبي الذكي
          </button>
        </div>

        {/* Tab 1: Personal Info */}
        {activeTab === 'personal' && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              تعديل الاسم والبيانات
            </h2>
            <form onSubmit={handlePersonalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  required
                  value={personal.full_name}
                  onChange={(e) => setPersonal({ ...personal, full_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  البريد الإلكتروني (غير قابل للتعديل)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-sm cursor-not-allowed"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-500/20 text-sm transition-all disabled:opacity-50"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Medical Profile */}
        {activeTab === 'medical' && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6 p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 rounded-2xl">
              <span className="text-2xl">💡</span>
              <p className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed font-medium">
                هذه البيانات الطبية تحفظ بشكل آمن ومحمي، ويقوم الذكاء الاصطناعي بربطها تلقائياً بأي عوارض تفحصها لإعطاء تشخيص سريري متقدم يراعي تاريخك الصحي وأدويتك.
              </p>
            </div>

            <form onSubmit={handleMedicalSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                    العمر (بالسنوات)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    required
                    value={medical.age}
                    onChange={(e) => setMedical({ ...medical, age: e.target.value })}
                    placeholder="مثال: 32"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                    الجنس
                  </label>
                  <select
                    value={medical.gender}
                    onChange={(e) => setMedical({ ...medical, gender: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                  >
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                    الطول (سم)
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="250"
                    value={medical.height_cm}
                    onChange={(e) => setMedical({ ...medical, height_cm: e.target.value })}
                    placeholder="مثال: 175"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                    الوزن (كغ)
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="300"
                    value={medical.weight_kg}
                    onChange={(e) => setMedical({ ...medical, weight_kg: e.target.value })}
                    placeholder="مثال: 72"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                    فصيلة الدم
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {bloodTypes.map((bt) => (
                      <button
                        type="button"
                        key={bt}
                        onClick={() => setMedical({ ...medical, blood_type: bt })}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          medical.blood_type === bt
                            ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
                            : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {bt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  الأمراض المزمنة السابقة (إن وجدت)
                </label>
                <textarea
                  rows="2"
                  value={medical.chronic_diseases}
                  onChange={(e) => setMedical({ ...medical, chronic_diseases: e.target.value })}
                  placeholder="مثال: سكري من النوع 2، ارتفاع ضغط الدم، ربو، خمول غدة درقية..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  الأدوية التي تتناولها حالياً بانتظام
                </label>
                <textarea
                  rows="2"
                  value={medical.current_medications}
                  onChange={(e) => setMedical({ ...medical, current_medications: e.target.value })}
                  placeholder="مثال: جلوكوفاج 500 ملغ، أسبرين 81، ليفوثيروكسين..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  الحساسية من أدوية أو أطعمة معينة
                </label>
                <textarea
                  rows="2"
                  value={medical.drug_allergies}
                  onChange={(e) => setMedical({ ...medical, drug_allergies: e.target.value })}
                  placeholder="مثال: حساسية شديدة للبنسلين، السلفا، حساسية الفول السوداني..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm leading-relaxed"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/25 text-sm transition-all disabled:opacity-50"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ وتحديث الملف الطبي الذكي 💾'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}