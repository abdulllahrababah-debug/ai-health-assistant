import React, { createContext, useContext, useEffect, useState } from 'react';
import translations from '../i18n/translations';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [language, setLanguage] = useState(localStorage.getItem('lang') || 'ar');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('dark') === 'true');
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('lang', language);
  }, [language]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('dark', darkMode);
  }, [darkMode]);

  const t = (key) => translations[language][key] || key;

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwtToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        darkMode,
        setDarkMode,
        t,
        user,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
