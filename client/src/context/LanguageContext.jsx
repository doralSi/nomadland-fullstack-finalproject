import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  // Load language from localStorage or default to 'he'
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('nomadland_language');
    return saved || 'he';
  });

  // Save to localStorage whenever language changes
  useEffect(() => {
    localStorage.setItem('nomadland_language', language);
  }, [language]);

  const setLanguage = (lang) => {
    if (lang === 'he' || lang === 'en') {
      setLanguageState(lang);
    }
  };

  // Helper: check if current language is Hebrew
  const isHebrew = () => {
    return language === 'he';
  };

  // Helper: get effective languages for filtering content
  // Hebrew mode → show he + en
  // English mode → show en only
  const effectiveLanguages = () => {
    if (language === 'he') {
      return ['he', 'en'];
    }
    return ['en'];
  };

  const value = {
    language,
    setLanguage,
    isHebrew,
    effectiveLanguages
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
