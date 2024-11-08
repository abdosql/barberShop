import React from 'react';
import { User } from 'lucide-react';

export default function AdminNavbar() {
  return (
    <nav className="fixed w-full z-50 bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-xl">Admin Panel</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-zinc-400">Admin</span>
            <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-500" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 