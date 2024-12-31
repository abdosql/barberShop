import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en.json';
import fr from '../locales/fr.json';
import ar from '../locales/ar.json';

type Language = 'en' | 'fr' | 'ar';
type Translations = typeof en;

interface LanguageContextType {
  language: Language;
  translations: Translations;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const [translations, setTranslations] = useState(en);

  useEffect(() => {
    // Update translations based on language
    const loadTranslations = () => {
      switch (language) {
        case 'fr':
          setTranslations(fr);
          break;
        case 'ar':
          setTranslations(ar);
          break;
        default:
          setTranslations(en);
      }
    };

    loadTranslations();
    localStorage.setItem('language', language);
    
    // Set the language attribute on the HTML element
    document.documentElement.lang = language;
    
    // Add appropriate text direction
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, translations, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 