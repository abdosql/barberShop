import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = {
    en: 'English',
    fr: 'Français',
    ar: 'العربية'
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 
                 border border-zinc-700 text-zinc-400 hover:text-white 
                 transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{languages[language]}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-32 bg-zinc-800 border border-zinc-700 
                      rounded-lg shadow-lg overflow-hidden z-50">
          {Object.entries(languages).map(([code, name]) => (
            <button
              key={code}
              onClick={() => {
                setLanguage(code as 'en' | 'fr' | 'ar');
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-sm text-left hover:bg-zinc-700 transition-colors
                         ${language === code ? 'text-blue-500' : 'text-zinc-400'}`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 