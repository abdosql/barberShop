import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scissors, Phone, LogOut, User, Menu, X, Settings, QrCode } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';
import InstallQRCode from './InstallQRCode';
import { SocialLinksContext } from '../App';
import styled from '@emotion/styled';

const BrandName = styled.span`
  @font-face {
    font-family: 'RichTheBarber';
    src: url('/fonts/RichTheBarberPersonalUse-gx824.ttf') format('truetype');
  }
  font-family: 'RichTheBarber', serif;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

/**
 * Navbar Component
 * Responsive navigation bar that handles user authentication state, language selection,
 * and mobile menu functionality.
 */
export default function Navbar() {
  // State for controlling mobile menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isQRVisible, setIsQRVisible] = useState(false);

  // Get social links context
  const { showSocial, setShowSocial } = useContext(SocialLinksContext);

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
            <BrandName className="text-white text-2xl tracking-wide">
              <span className="font-light">{translations.navbar.brandName.first}</span>
              <span className="text-blue-400 ml-1">{translations.navbar.brandName.second}</span>
            </BrandName>
          </Link>

          {/* Desktop navigation menu */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageToggle />
            
            {/* QR Code button */}
            <div className="relative group">
              <button
                className="flex items-center gap-2 text-zinc-300 hover:text-white transition px-3 py-2 rounded-lg hover:bg-zinc-800/50"
                onClick={() => setIsQRVisible(!isQRVisible)}
                title={translations.navbar.qrCode.title}
              >
                <QrCode className="w-4 h-4" />
              </button>
              {isQRVisible && (
                <div className="absolute right-0 mt-2 z-50">
                  <InstallQRCode />
                </div>
              )}
            </div>

            {/* Conditional rendering based on authentication state */}
            {userInfo ? (
              <div className="flex items-center gap-4">
                {/* User profile section */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-500" />
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
                        translations.navbar.guest
                      )}
                    </p>
                    <p className="text-xs text-zinc-400">{userInfo.phoneNumber}</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  {/* Admin Dashboard Link */}
                  {userInfo.roles?.includes('ROLE_ADMIN') && (
                    <Link
                      to="/admin"
                      className="px-3 py-2 text-blue-400 hover:text-blue-300 transition rounded-lg hover:bg-zinc-800"
                      title={translations.navbar.adminPanel}
                    >
                      <Settings className="w-4 h-4" />
                    </Link>
                  )}

                  {/* Contact button */}
                  <button
                    onClick={() => setShowSocial(true)}
                    className="flex items-center gap-2 text-zinc-300 hover:text-white transition px-3 py-2 rounded-lg hover:bg-zinc-800/50"
                    title={translations.navbar.contact}
                  >
                    <Phone className="w-4 h-4" />
                  </button>

                  {/* Logout button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-zinc-300 hover:text-white transition px-3 py-2 rounded-lg hover:bg-zinc-800/50"
                    title={translations.auth.logout}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="relative px-4 py-2 text-zinc-400 hover:text-white transition-all duration-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-500 hover:after:w-full after:transition-all after:duration-300"
                >
                  {translations.navbar.login}
                </Link>
                <Link
                  to="/register"
                  className="relative overflow-hidden bg-blue-500 text-white px-6 py-2 rounded-lg group"
                >
                  <span className="relative z-10 transition-transform duration-300 group-hover:scale-110 inline-block">
                    {translations.navbar.register}
                  </span>
                  <div className="absolute inset-0 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageToggle />
            
            <button
              className="p-2 text-zinc-400 hover:text-white transition rounded-lg hover:bg-zinc-800"
              onClick={() => setIsQRVisible(!isQRVisible)}
              title={translations.navbar.qrCode.title}
            >
              <QrCode className="w-6 h-6" />
            </button>

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

        {/* Mobile QR Code dropdown */}
        {isQRVisible && (
          <div className="md:hidden border-t border-zinc-800 py-4">
            <InstallQRCode />
          </div>
        )}

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
                        translations.navbar.guest
                      )}
                    </p>
                    <p className="text-xs text-zinc-400">{userInfo.phoneNumber}</p>
                  </div>
                </div>

                {/* Mobile menu actions */}
                <div className="space-y-2">
                  {/* Admin Dashboard Link */}
                  {userInfo.roles?.includes('ROLE_ADMIN') && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-2 text-blue-400 hover:text-blue-300 hover:bg-zinc-800/50"
                    >
                      <Settings className="w-5 h-5" />
                      <span>{translations.navbar.adminPanel}</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setShowSocial(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800/50"
                  >
                    <Phone className="w-5 h-5" />
                    <span>{translations.navbar.contact}</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800/50"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>{translations.auth.logout}</span>
                  </button>
                </div>
              </div>
            ) : (
              // Mobile menu content for non-authenticated users
              <div className="space-y-2 px-4">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center justify-center py-2 text-zinc-400 hover:text-white transition-all duration-300 relative after:content-[''] after:absolute after:bottom-0 after:left-1/4 after:h-[2px] after:w-0 after:bg-blue-500 hover:after:w-1/2 after:transition-all after:duration-300"
                >
                  {translations.navbar.login}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center justify-center py-2 bg-blue-500 text-white rounded-lg relative overflow-hidden group"
                >
                  <span className="relative z-10 transition-transform duration-300 group-hover:scale-110 inline-block">
                    {translations.navbar.register}
                  </span>
                  <div className="absolute inset-0 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}