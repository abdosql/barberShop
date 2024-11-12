import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors } from 'lucide-react';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from '../contexts/LanguageContext';

export default function Navbar() {
  const { translations } = useLanguage();

  return (
    <nav className="fixed w-full z-50 bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Scissors className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-white font-bold">Barbershop</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <Link
              to="/login"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              {translations.navbar.login}
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
            >
              {translations.navbar.register}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}