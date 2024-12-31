import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Hero() {
  const { translations } = useLanguage();

  return (
    <div className="relative bg-zinc-900 pt-16">
      <div className="h-[400px] w-full absolute top-0 left-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=2074"
          alt="Barber Shop"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/0 to-zinc-900"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pt-32 pb-64">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white text-center">
          {translations.home.hero.professionalGrooming}
          <span className="block text-amber-500">{translations.home.hero.clickAway}</span>
        </h1>
        <p className="mt-6 text-xl text-zinc-400 text-center max-w-2xl mx-auto">
          {translations.home.hero.bookPremium}
        </p>
      </div>
    </div>
  );
}