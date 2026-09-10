import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { t, language, setLanguage, darkMode, setDarkMode, user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/assessment', label: t('nav_assessment') || 'فحص الأعراض', icon: '🩺' },
    { path: '/chat', label: t('nav_chat') || 'طبيب AI', icon: '🤖' },
    { path: '/dictionary', label: t('nav_dictionary') || 'القاموس الطبي', icon: '📚' },
    { path: '/medicines', label: t('nav_medicines') || 'دليل الأدوية', icon: '💊' },
  ];

  const userLinks = [
    { path: '/history', label: t('nav_history') || 'سجل الفحوصات', icon: '📋' },
    { path: '/profile', label: t('nav_profile') || 'الملف الطبي', icon: '👤' },
  ];

  const isActive = (p) => location.pathname === p;

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link to={user ? "/assessment" : "/login"} className="flex items-center gap-2 font-black text-indigo-600 dark:text-indigo-400 text-lg sm:text-xl">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xl shadow-md shadow-indigo-500/25">
              🩺
            </span>
            <span className="tracking-tight">{t('appName') || 'المساعد الصحي'}</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive(link.path)
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}

            {user &&
              userLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive(link.path)
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive('/admin')
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300'
                    : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30'
                }`}
              >
                <span>👑</span>
                <span>{t('nav_admin') || 'لوحة الإدارة'}</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center gap-2">
          {/* Nearest Hospital Emergency GPS Button */}
          <button
            onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=hospital+near+me', '_blank')}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title={language === 'ar' ? 'العثور على أقرب مستشفى وطوارئ عبر خرائط GPS' : 'Find Nearest Hospital & ER via GPS'}
          >
            <span className="animate-pulse">🚨</span>
            <span className="hidden sm:inline">{language === 'ar' ? 'أقرب مستشفى (GPS)' : 'Nearest ER (GPS)'}</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {language === 'ar' ? 'English' : 'عربي'}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {/* User Profile / Auth State */}
          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/profile"
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 transition"
              >
                {(t('nav_greeting') || 'مرحباً') + '، ' + (user.full_name?.split(' ')[0] || '')}
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="text-xs px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 font-bold transition"
              >
                {t('nav_logout') || 'خروج'}
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20 transition"
            >
              {t('nav_auth_btn') || 'دخول / حساب جديد'}
            </Link>
          )}

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 p-3 rounded-2xl text-sm font-bold ${
                isActive(link.path)
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}

          {user && (
            <>
              {userLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl text-sm font-bold ${
                    isActive(link.path)
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}

              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 p-3 rounded-2xl text-sm font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/40"
                >
                  <span>👑</span>
                  <span>{t('nav_admin') || 'لوحة الإدارة'}</span>
                </Link>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full text-start p-3 rounded-2xl text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                🚪 {t('nav_logout') || 'تسجيل الخروج'} ({user.full_name})
              </button>
            </>
          )}

          {!user && (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center p-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md mt-2"
            >
              {t('nav_auth_btn') || 'دخول / حساب جديد'}
            </Link>
          )}
        </div>
      )}
    </header>
  );
}