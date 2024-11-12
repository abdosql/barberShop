import React, { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from '../locales/en.json';
import frTranslations from '../locales/fr.json';
import arTranslations from '../locales/ar.json';

type Language = 'en' | 'fr' | 'ar';
type Translations = typeof enTranslations;

interface LanguageContextType {
  language: Language;
  translations: Translations;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage as Language) || 'en';
  });

  const [translations, setTranslations] = useState<Translations>(
    language === 'en' ? enTranslations : 
    language === 'fr' ? frTranslations : 
    arTranslations
  );

  useEffect(() => {
    localStorage.setItem('language', language);
    setTranslations(
      language === 'en' ? enTranslations : 
      language === 'fr' ? frTranslations : 
      arTranslations
    );
    // Set RTL direction for Arabic
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