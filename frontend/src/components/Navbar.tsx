import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scissors, Phone, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';
import SocialLinks from './SocialLinks';

export default function Navbar() {
  const [showSocial, setShowSocial] = useState(false);
  const { userInfo, logout } = useAuth();
  const { translations } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
            
            {userInfo ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium text-white">
                        {userInfo.firstName} {userInfo.lastName}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {userInfo.phoneNumber}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-zinc-400 hover:text-white transition rounded-lg hover:bg-zinc-800"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
                <button 
                  onClick={() => setShowSocial(true)}
                  className="inline-flex items-center gap-2 text-zinc-300 hover:text-white transition px-3 py-2 rounded-lg hover:bg-zinc-800/50"
                >
                  <Phone className="w-5 h-5" />
                  <span className="hidden sm:inline">Contact</span>
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
      {showSocial && <SocialLinks onClose={() => setShowSocial(false)} />}
    </nav>
  );
}