import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', short: 'EN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', short: 'HI' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', short: 'TE' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', short: 'TA' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', short: 'KN' }
];

const STORAGE_KEY = 'darshanease_lang';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const isSupported = LANGUAGES.some((l) => l.code === saved);
      return isSupported ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const changeLanguage = (code) => {
    if (LANGUAGES.some((l) => l.code === code)) {
      setLanguageState(code);
      try {
        localStorage.setItem(STORAGE_KEY, code);
      } catch (err) {
        console.warn('Could not save language preference:', err);
      }
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  /**
   * Translates a key path (e.g. "home.heroTitlePrefix").
   * Falls back to English if missing, or returns the key if not found in English.
   */
  const t = (path, params = {}) => {
    if (!path || typeof path !== 'string') return '';

    const keys = path.split('.');
    
    // 1. Try current language
    let result = keys.reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : undefined), translations[language]);

    // 2. Fallback to English
    if (result === undefined && language !== 'en') {
      result = keys.reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : undefined), translations['en']);
    }

    // 3. Fallback to path itself
    if (result === undefined) {
      return path;
    }

    // If string, replace params: {count}, {name}, etc.
    if (typeof result === 'string') {
      return Object.entries(params).reduce((str, [k, v]) => {
        return str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }, result);
    }

    return result;
  };

  const currentLanguageObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        t,
        languages: LANGUAGES,
        currentLanguageObj
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
