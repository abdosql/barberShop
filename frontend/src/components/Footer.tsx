import React from 'react';
import { ExternalLink, Scissors } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full py-6 px-4 border-t border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        {/* Logo and Brand Section */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-blue-500" />
            <span className="text-white font-bold">Barbershop</span>
          </div>
        </div>

        {/* Decorative Line */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="px-4 bg-zinc-900/50 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            </div>
          </div>
        </div>

        {/* Credits Section */}
        <div className="mt-6 flex flex-col items-center justify-center gap-4">
          <p className="text-zinc-400 text-sm flex items-center gap-2">
            Built by{' '}
            <a
              href="...." // Replace with your actual portfolio URL
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-400 transition-colors inline-flex items-center gap-1 font-medium"
            >
              Abdelilah
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
          <p className="text-zinc-500 text-xs">
            © {new Date().getFullYear()} All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
} 