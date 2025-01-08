import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Footer from './Footer';
import LanguageToggle from './LanguageToggle';

export default function NotFound() {
  const { translations } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-4 right-4 z-50">
        <LanguageToggle />
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background elements */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-[#0A0A0B]" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=2070')] bg-cover bg-center" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B] via-transparent to-[#0A0A0B]" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5" />
        </div>

        {/* Content */}
        <div className="w-full max-w-[min(90%,420px)] relative z-10">
          {/* Icon Section */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-500/20 to-rose-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 backdrop-blur-xl border border-white/10">
              <AlertTriangle className="w-7 h-7 text-rose-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {translations?.notFound?.title || "404 - Page Not Found"}
            </h2>
            <p className="text-sm text-zinc-400">
              {translations?.notFound?.description || "The page you're looking for doesn't exist or has been moved."}
            </p>
          </div>

          {/* Action Section */}
          <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/50 rounded-xl p-5">
            <Link 
              to="/"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>{translations?.notFound?.backHome || "Back to Home"}</span>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 