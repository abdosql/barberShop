import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Scissors, Phone } from 'lucide-react';
import Footer from '../Footer';
import { useAuth } from '../../contexts/AuthContext';
import LanguageToggle from '../LanguageToggle';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Login() {
  const { translations } = useLanguage();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state, or default to home
  const from = (location.state as any)?.from?.pathname || '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(phone, password);
      // Navigation will happen automatically due to the effect above
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-4 right-4 z-50">
        <LanguageToggle />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background elements */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-[#0A0A0B]" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=2074')] bg-cover bg-center" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B] via-transparent to-[#0A0A0B]" />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-blue-500/5" />
        </div>

        {/* Content */}
        <div className="w-full max-w-[min(90%,420px)] relative z-10">
          {/* Compact Logo Section */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500/20 to-amber-500/20 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 backdrop-blur-xl border border-white/10">
              <Scissors className="w-6 h-6 sm:w-7 sm:h-7 text-blue-500" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
              {translations.auth.login.welcomeBack}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              {translations.auth.login.signInAccount}
            </p>
          </div>

          {/* Compact Form Section */}
          <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/50 rounded-xl p-4 sm:p-5 space-y-3 sm:space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-500 text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* Phone Input */}
              <div>
                <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-zinc-300 mb-1">
                  {translations.auth.login.phoneNumber}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-500" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 border border-zinc-800 rounded-lg 
                             bg-zinc-900/50 text-white placeholder-zinc-500 text-xs sm:text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={translations.auth.login.enterPhone}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-zinc-300 mb-1">
                  {translations.auth.login.password}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-500" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 border border-zinc-800 rounded-lg 
                             bg-zinc-900/50 text-white placeholder-zinc-500 text-xs sm:text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={translations.auth.login.enterPassword}
                    required
                  />
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border-zinc-700 bg-zinc-900 text-blue-500 
                             focus:ring-blue-500 focus:ring-offset-zinc-900"
                  />
                  <label htmlFor="remember-me" className="ml-2 text-zinc-400">
                    {translations.auth.login.rememberMe}
                  </label>
                </div>
                <a href="#" className="text-blue-500 hover:text-blue-400">
                  {translations.auth.login.forgot}
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-400 transition"
              >
                {translations.auth.login.signIn}
              </button>
            </form>

            {/* Register Link */}
            <div className="text-center text-xs sm:text-sm pt-1">
              <span className="text-zinc-400">{translations.auth.login.newHere}</span>{' '}
              <Link to="/register" className="text-blue-500 hover:text-blue-400 font-medium">
                {translations.auth.login.createAccount}
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}