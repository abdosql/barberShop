import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
  const { language, translations } = useLanguage();
  const directionClass = language === 'ar' ? 'flex-row-reverse' : 'flex-row';

  return (
    <footer className="w-full py-4 px-4 bg-gradient-to-b from-zinc-900/80 to-zinc-900/95 backdrop-blur-sm border-t border-zinc-800/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left side - Credits */}
          <div className={`flex items-center gap-2 ${directionClass}`}>
            {language === 'ar' ? (
              <>
                <a
                  href="https://mharziabdelilah.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group text-blue-400 hover:text-blue-300 transition-all duration-300 inline-flex items-center gap-1 font-medium ${directionClass}`}
                >
                  Abdelilah
                  <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                </a>
                <span className="text-zinc-400">{translations.footer.madeBy}</span>
              </>
            ) : (
              <>
                <span className="text-zinc-400">{translations.footer.builtBy}</span>
                <a
                  href="https://mharziabdelilah.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group text-blue-400 hover:text-blue-300 transition-all duration-300 inline-flex items-center gap-1 font-medium ${directionClass}`}
                >
                  Abdelilah
                  <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                </a>
              </>
            )}
          </div>

          {/* Center - Decorative Line with Dot */}
          <div className="flex items-center gap-1.5 mb-2 md:mb-0 group">
            <div className="w-8 h-px bg-blue-400/30 transition-all duration-300 group-hover:bg-blue-400/60 group-hover:w-12"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400/50 transition-all duration-300 group-hover:bg-blue-400/80 group-hover:scale-125"></div>
            <div className="w-8 h-px bg-blue-400/30 transition-all duration-300 group-hover:bg-blue-400/60 group-hover:w-12"></div>
          </div>

          {/* Right side - Copyright */}
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} {translations.footer.allRightsReserved}
          </p>
        </div>
      </div>
    </footer>
  );
} 