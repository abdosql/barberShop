import React, { useState } from 'react';
import { Scissors, Phone } from 'lucide-react';
import SocialLinks from './SocialLinks';

export default function Navbar() {
  const [showSocial, setShowSocial] = useState(false);

  return (
    <>
      <nav className="fixed w-full z-50 bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Scissors className="w-6 h-6 text-blue-500" />
              <span className="text-white font-bold text-lg sm:text-xl">Jalal</span>
            </div>
            
            <button 
              onClick={() => setShowSocial(true)}
              className="inline-flex items-center gap-2 text-zinc-300 hover:text-white transition px-3 py-2 rounded-lg hover:bg-zinc-800/50"
            >
              <Phone className="w-5 h-5" />
              <span className="hidden sm:inline">Contact</span>
            </button>
          </div>
        </div>
      </nav>

      <SocialLinks 
        isOpen={showSocial} 
        onClose={() => setShowSocial(false)} 
      />
    </>
  );
}