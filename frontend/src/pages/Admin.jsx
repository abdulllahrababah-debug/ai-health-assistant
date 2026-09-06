import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import api from '../api/client';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [users, setUsers] = useState([]);
  const [weeklyReport, setWeeklyReport] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, reportRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/report/weekly'),
      ]);

      setStats(statsRes.data.stats);
      setCharts(statsRes.data.charts);
      setUsers(usersRes.data.users);
      setWeeklyReport(reportRes.data.report || []);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      setActionLoading(userId);
      const res = await api.patch(`/admin/users/${userId}/toggle-active`);
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, is_active: res.data.is_active } : u))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'فشل تعديل حالة المستخدم');
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangeRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`هل أنت متأكد من تغيير صلاحية المستخدم إلى ${newRole}؟`)) return;

    try {
      setActionLoading(userId);
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (err) {
      alert(err.response?.data?.message || 'فشل تعديل الصلاحية');
    } finally {
      setActionLoading(null);
    }
  };

  // Chart 1: Top Symptoms Bar Chart
  const topSymptomsData = {
    labels: charts?.topSymptoms?.map((s) => s.symptom) || [],
    datasets: [
      {
        label: 'عدد مرات البلاغ',
        data: charts?.topSymptoms?.map((s) => s.count) || [],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(14, 165, 233, 0.8)',
        ],
        borderRadius: 10,
      },
    ],
  };

  // Chart 2: Daily Assessments Trend
  const trendLabels = charts?.dailyAssessments?.map((d) => d.day?.split('T')[0]) || [
    'الأحد',
    'الإثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
    'السبت',
  ];
  const trendCounts = charts?.dailyAssessments?.map((d) => d.count) || [4, 7, 5, 12, 9, 14, 18];

  const trendData = {
    labels: trendLabels,
    datasets: [
      {
        fill: true,
        label: 'الفحوصات السريرية المكتملة',
        data: trendCounts,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        tension: 0.35,
        pointBackgroundColor: '#4f46e5',
        pointBorderColor: '#fff',
        pointRadius: 5,
      },
    ],
  };

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchUser.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 py-10 px-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl text-white flex items-center justify-center text-2xl shadow-md">
                👑
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                  لوحة الإدارة والتحكم الشاملة
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  إحصائيات وبائية، رسوم بيانية، إدارة المستخدمين، وسجلات التشخيص
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={fetchDashboardData}
            className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl hover:bg-gray-50 shadow-sm flex items-center gap-2 self-start"
          >
            <span>🔄</span> تحديث البيانات
          </button>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <span className="text-xs text-gray-400 font-bold block mb-1">إجمالي المستخدمين</span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {stats?.totalUsers || 0}
            </span>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <span className="text-xs text-gray-400 font-bold block mb-1">المستخدمين النشطين</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {stats?.activeUsers || 0}
            </span>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <span className="text-xs text-gray-400 font-bold block mb-1">إجمالي الفحوصات</span>
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
              {stats?.totalAssessments || 0}
            </span>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <span className="text-xs text-gray-400 font-bold block mb-1">حالات الطوارئ 🚨</span>
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {stats?.emergencyAssessments || 0}
            </span>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm col-span-2 lg:col-span-1">
            <span className="text-xs text-gray-400 font-bold block mb-1">الأعراض في النظام</span>
            <span className="text-2xl font-black text-sky-600 dark:text-sky-400">
              {stats?.totalSymptoms || 0} عرضاً
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 gap-2">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>📊</span> التحليلات والرسوم البيانية
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'users'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>👥</span> إدارة المستخدمين والصلاحيات
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'reports'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>📑</span> سجل التشخيصات الأسبوعي
          </button>
        </div>

        {/* Tab 1: Charts & Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart: Most Reported Symptoms */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">
                      الأعراض الأكثر تسجيلاً وبلاغاً
                    </h3>
                    <p className="text-xs text-gray-400">توزيع تكرار الأعراض بين المستخدمين</p>
                  </div>
                  <span className="text-xl">🩺</span>
                </div>
                <div className="h-72 flex items-center justify-center">
                  <Bar
                    data={topSymptomsData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                    }}
                  />
                </div>
              </div>

              {/* Line Chart: Daily Assessments */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">
                      نشاط الفحوصات اليومية
                    </h3>
                    <p className="text-xs text-gray-400">معدل إجراء التقييمات السريرية خلال الأسبوع</p>
                  </div>
                  <span className="text-xl">📈</span>
                </div>
                <div className="h-72 flex items-center justify-center">
                  <Line
                    data={trendData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: User Management */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  قائمة الحسابات والمستخدمين ({filteredUsers.length})
                </h3>
                <p className="text-xs text-gray-400">يمكنك حظر أو تنشيط أي حساب وترقية الصلاحيات</p>
              </div>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="بحث بالاسم أو البريد..."
                  className="w-full px-4 py-2.5 pr-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                  🔍
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400 font-bold">
                    <th className="pb-3 px-3">المستخدم</th>
                    <th className="pb-3 px-3">البريد الإلكتروني</th>
                    <th className="pb-3 px-3">الصلاحية</th>
                    <th className="pb-3 px-3">الحالة</th>
                    <th className="pb-3 px-3">تاريخ التسجيل</th>
                    <th className="pb-3 px-3 text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-750">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-750/50">
                      <td className="py-3 px-3 font-bold text-gray-900 dark:text-white">
                        {u.full_name}
                      </td>
                      <td className="py-3 px-3 text-gray-500 dark:text-gray-400">{u.email}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {u.role === 'admin' ? '👑 مشرف' : '👤 مستخدم'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            u.is_active
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'
                          }`}
                        >
                          {u.is_active ? 'نشط' : 'محظور'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-400">
                        {new Date(u.created_at).toLocaleDateString('ar-JO')}
                      </td>
                      <td className="py-3 px-3 text-left">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleChangeRole(u.id, u.role)}
                            disabled={actionLoading === u.id}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-lg text-[11px] font-bold transition-colors"
                          >
                            {u.role === 'admin' ? 'تخفيض لمستخدم' : 'ترقية لمشرف'}
                          </button>

                          <button
                            onClick={() => handleToggleActive(u.id)}
                            disabled={actionLoading === u.id}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                              u.is_active
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            }`}
                          >
                            {u.is_active ? 'حظر الحساب' : 'فك الحظر'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Weekly Report */}
        {activeTab === 'reports' && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  تقرير الفحوصات والتشخيصات الحديثة
                </h3>
                <p className="text-xs text-gray-400">آخر 100 فحص تم إجراؤه في النظام</p>
              </div>

              <span className="text-xs px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full font-bold">
                {weeklyReport.length} تقرير مسجل
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400 font-bold">
                    <th className="pb-3 px-3">رقم الفحص</th>
                    <th className="pb-3 px-3">المريض / المستخدم</th>
                    <th className="pb-3 px-3">الأعراض المبلغة</th>
                    <th className="pb-3 px-3">تصنيف الحالة</th>
                    <th className="pb-3 px-3">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-750">
                  {weeklyReport.map((rep) => {
                    let syms = [];
                    try {
                      syms =
                        typeof rep.selected_symptoms === 'string'
                          ? JSON.parse(rep.selected_symptoms)
                          : rep.selected_symptoms;
                    } catch (e) {}

                    return (
                      <tr key={rep.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-750/50">
                        <td className="py-3 px-3 font-mono font-bold text-indigo-600">
                          #{rep.id}
                        </td>
                        <td className="py-3 px-3 font-bold text-gray-900 dark:text-white">
                          {rep.full_name || 'زائر (ضيف)'}
                        </td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-300">
                          {Array.isArray(syms) ? syms.slice(0, 3).join('، ') : '-'}
                        </td>
                        <td className="py-3 px-3">
                          {rep.is_emergency ? (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-bold">
                              🚨 طارئة
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">
                              عادية
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-gray-400">
                          {new Date(rep.created_at).toLocaleDateString('ar-JO', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}