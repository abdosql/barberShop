import React, { useEffect } from 'react';
import { Facebook, Instagram, X } from 'lucide-react';

interface SocialLinksProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SocialLinks({ isOpen, onClose }: SocialLinksProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const socialLinks = [
    {
      icon: Facebook,
      href: "https://facebook.com/your-page",
      color: "hover:text-blue-500",
      label: "Facebook"
    },
    {
      icon: Instagram,
      href: "https://instagram.com/your-handle",
      color: "hover:text-pink-500",
      label: "Instagram"
    },
    {
      component: () => (
        <svg 
          viewBox="0 0 24 24" 
          className="w-5 h-5"
          fill="currentColor"
        >
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      ),
      href: "https://tiktok.com/@your-handle",
      color: "hover:text-white",
      label: "TikTok"
    }
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <div 
            className="bg-zinc-900 p-4 sm:p-6 rounded-2xl shadow-xl w-full max-w-[280px] sm:max-w-sm mx-auto"
            onClick={e => {
              e.stopPropagation(); // This prevents the click from reaching the parent
            }}
          >
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-white">Follow Us</h3>
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent event bubbling
                  onClose();
                }}
                className="text-zinc-400 hover:text-white transition-colors p-2"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 sm:gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    text-zinc-400 transition-all duration-200 ${social.color}
                    flex items-center sm:flex-col sm:items-center gap-3 sm:gap-2
                    p-4 bg-zinc-800/50 rounded-xl
                    hover:scale-105 hover:bg-zinc-800
                    focus:outline-none focus:ring-2 focus:ring-amber-500
                  `}
                >
                  {social.component ? <social.component /> : <social.icon className="w-5 h-5" />}
                  <span className="text-sm">{social.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 