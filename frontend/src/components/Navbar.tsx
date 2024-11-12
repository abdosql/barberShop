import React, { useState } from 'react';
import { Scissors, Phone, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SocialLinks from './SocialLinks';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [showSocial, setShowSocial] = useState(false);
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="fixed w-full z-50 bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Scissors className="w-6 h-6 text-blue-500" />
              <span className="text-white font-bold text-lg sm:text-xl">Jalal</span>
            </div>
            
            <div className="flex items-center gap-4">
              {userInfo && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="text-zinc-300 hidden sm:inline">
                      {userInfo.firstName} {userInfo.lastName}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-zinc-400 hover:text-white transition"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              )}
              <button 
                onClick={() => setShowSocial(true)}
                className="inline-flex items-center gap-2 text-zinc-300 hover:text-white transition px-3 py-2 rounded-lg hover:bg-zinc-800/50"
              >
                <Phone className="w-5 h-5" />
                <span className="hidden sm:inline">Contact</span>
              </button>
            </div>
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