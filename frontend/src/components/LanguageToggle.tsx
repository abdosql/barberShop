import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const FlagUK = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="w-5 h-5">
    <clipPath id="s">
      <path d="M0,0 v30 h60 v-30 z"/>
    </clipPath>
    <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
    <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#s)" stroke="#C8102E" strokeWidth="4"/>
    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
  </svg>
);

const FlagFrance = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className="w-5 h-5">
    <path fill="#EC1920" d="M0 0h3v2H0z"/>
    <path fill="#fff" d="M1 0h1v2H1z"/>
    <path fill="#051440" d="M0 0h1v2H0z"/>
  </svg>
);

const FlagMorocco = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" className="w-5 h-5">
    <path fill="#c1272d" d="M0 0h900v600H0z"/>
    <path fill="none" stroke="#006233" strokeWidth="40" d="M450 191.459l-89.236 274.541 233.236-169.459H305.764l233.236 169.459z"/>
  </svg>
);

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = {
    en: {
      flag: FlagUK,
      name: 'English'
    },
    fr: {
      flag: FlagFrance,
      name: 'Français'
    },
    ar: {
      flag: FlagMorocco,
      name: 'العربية'
    }
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
        {React.createElement(languages[language].flag)}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-32 bg-zinc-800 border border-zinc-700 
                      rounded-lg shadow-lg overflow-hidden z-50">
          {Object.entries(languages).map(([code, { flag: Flag, name }]) => (
            <button
              key={code}
              onClick={() => {
                setLanguage(code as 'en' | 'fr' | 'ar');
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-sm text-left hover:bg-zinc-700 transition-colors
                         flex items-center gap-2
                         ${language === code ? 'text-blue-500' : 'text-zinc-400'}`}
            >
              <Flag />
              <span>{name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 