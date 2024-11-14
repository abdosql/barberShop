import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scissors, Phone, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';
import SocialLinks from './SocialLinks';

/**
 * Navbar Component
 * Responsive navigation bar that handles user authentication state, language selection,
 * and mobile menu functionality.
 */
export default function Navbar() {
  // State for controlling social links modal and mobile menu
  const [showSocial, setShowSocial] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Get authentication and language context
  const { userInfo, logout } = useAuth();
  const { translations } = useLanguage();
  const navigate = useNavigate();

  /**
   * Handles user logout functionality
   * Logs out user, redirects to login page, and closes mobile menu
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed w-full z-50 bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main navbar content */}
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand name */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Scissors className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-white font-bold">Barbershop</span>
          </Link>
          
          {/* Desktop navigation menu */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageToggle />
            
            {/* Conditional rendering based on authentication state */}
            {userInfo ? (
              <>
                {/* User profile section */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-500" />
                    </div>
                    {/* User information display */}
                    <div>
                      <p className="text-sm font-medium text-white">
                        {/* Logic to display user's name or "Guest" */}
                        {userInfo.firstName || userInfo.lastName ? (
                          <>
                            {userInfo.firstName === userInfo.lastName ? (
                              userInfo.firstName
                            ) : (
                              <>
                                {userInfo.firstName}
                                {userInfo.firstName && userInfo.lastName && " "}
                                {userInfo.lastName}
                              </>
                            )}
                          </>
                        ) : (
                          "Guest"
                        )}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {userInfo.phoneNumber}
                      </p>
                    </div>
                  </div>
                  {/* Logout button */}
                  <button
                    onClick={handleLogout}
                    className="p-2 text-zinc-400 hover:text-white transition rounded-lg hover:bg-zinc-800"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
                {/* Contact button */}
                <button 
                  onClick={() => setShowSocial(true)}
                  className="inline-flex items-center gap-2 text-zinc-300 hover:text-white transition px-3 py-2 rounded-lg hover:bg-zinc-800/50"
                >
                  <Phone className="w-5 h-5" />
                  <span>Contact</span>
                </button>
              </>
            ) : (
              // Login and Register links for non-authenticated users
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

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-zinc-400 hover:text-white transition rounded-lg hover:bg-zinc-800"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-zinc-800 py-4">
            {userInfo ? (
              // Mobile menu content for authenticated users
              <div className="space-y-4">
                {/* User profile section */}
                <div className="flex items-center gap-3 px-4">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {/* Logic to display user's name or "Guest" */}
                      {userInfo.firstName || userInfo.lastName ? (
                        <>
                          {userInfo.firstName === userInfo.lastName ? (
                            userInfo.firstName
                          ) : (
                            <>
                              {userInfo.firstName}
                              {userInfo.firstName && userInfo.lastName && " "}
                              {userInfo.lastName}
                            </>
                          )}
                        </>
                      ) : (
                        "Guest"
                      )}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {userInfo.phoneNumber}
                    </p>
                  </div>
                </div>
                
                {/* Mobile menu actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setShowSocial(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800/50"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Contact</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800/50"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              // Mobile menu content for non-authenticated users
              <div className="space-y-2 px-4">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center justify-center py-2 text-zinc-400 hover:text-white transition-colors"
                >
                  {translations.navbar.login}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center justify-center py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
                >
                  {translations.navbar.register}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Social links modal */}
      {showSocial && (
        <SocialLinks 
          isOpen={showSocial} 
          onClose={() => setShowSocial(false)} 
        />
      )}
    </nav>
  );
}