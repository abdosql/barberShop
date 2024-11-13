import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageToggle from '../LanguageToggle';

export default function AdminNavbar() {
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
          {/* Left side - Title */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">
              {translations.admin.dashboard.title}
            </span>
          </div>

          {/* Right side - User info and actions */}
          <div className="flex items-center gap-4">
            <LanguageToggle />
            
            {userInfo && (
              <div className="flex items-center gap-4">
                {/* User Info */}
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
                        {userInfo.roles.includes('ROLE_ADMIN') ? 'Administrator' : 'User'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 text-zinc-400 hover:text-white 
                             transition rounded-lg hover:bg-zinc-800"
                    title={translations.auth.logout}
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="hidden sm:inline">
                      {translations.auth.logout}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 