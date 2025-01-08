import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Scissors, Phone, CheckCircle, Loader2 } from 'lucide-react';
import Footer from '../Footer';
import { useAuth } from '../../contexts/AuthContext';
import LanguageToggle from '../LanguageToggle';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/Button';

interface ValidationError {
  "@context": string;
  "@type": string;
  "violations": Array<{
    propertyPath: string;
    message: string;
    code: string | null;
  }>;
  status: number;
  detail: string;
}

interface FlashMessage {
  type: 'success' | 'error' | 'warning';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function Login() {
  const { translations } = useLanguage();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const registrationSuccess = location.state?.registrationSuccess;
  const userName = location.state?.name;
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const verificationSuccess = location.state?.verificationSuccess;
  const successMessage = location.state?.message;
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [inactiveUserPhone, setInactiveUserPhone] = useState('');
  const [flashMessage, setFlashMessage] = useState<FlashMessage | null>(null);
  const [showResendForm, setShowResendForm] = useState(false);
  const [resendPhone, setResendPhone] = useState('');
  
  // Get the redirect path from location state, or default to home
  const from = (location.state as any)?.from?.pathname || '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Update the success message visibility when registration is successful
  useEffect(() => {
    if (registrationSuccess) {
      setShowSuccess(true);
      
      // Set a timeout to hide the message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccess(false);
        // Clean up location state after animation
        setTimeout(() => {
          window.history.replaceState({}, document.title);
        }, 300); // Wait for fade out animation
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [registrationSuccess]);

  const validatePhoneNumber = (phone: string) => {
    if (!phone) return 'Please enter your phone number.';
    if (phone.length < 10) return 'Phone number must be at least 10 digits.';
    return null;
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Please enter your password.';
    if (password.length < 3) return 'Le mot de passe doit contenir au moins 3 caractères.';
    if (password.length > 64) return 'Le mot de passe ne peut pas dépasser 64 caractères.';
    return null;
  };

  const handleResendClick = () => {
    setShowResendForm(true);
    setResendPhone(inactiveUserPhone);
    setFlashMessage(null);
  };

  const handleBackToLogin = () => {
    setShowResendForm(false);
    setResendPhone('');
    setFlashMessage(null);
  };

  const handleResendVerification = async () => {
    try {
      setIsLoading(true);
      setErrors({});
      console.log('Sending resend verification request for phone:', resendPhone);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/resend_verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: resendPhone,
        }),
      });

      const data = await response.json();
      console.log('Resend verification response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification code');
      }

      // Set verification session without requiring userId
      const verificationSession = {
        phoneNumber: resendPhone,
        userId: data.userId,
        startedAt: Date.now(),
        expiresAt: Date.now() + 600000, // 10 minutes in milliseconds
      };
      console.log('Setting verification session:', verificationSession);
      localStorage.setItem('verificationSession', JSON.stringify(verificationSession));

      // Navigate to verification page with user data
      const navigationState = {
        userData: {
          phoneNumber: resendPhone,
          userId: data.userId
        },
        resendSuccess: true,
        message: data.message || 'Verification code sent successfully'
      };
      console.log('Navigating to verification with state:', navigationState);
      navigate('/verify', { state: navigationState });
    } catch (err) {
      console.error('Resend error:', err);
      setFlashMessage({
        type: 'error',
        message: translations.auth.login.resendVerificationError
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFlashMessage(null);
    setErrors({});

    const phoneError = validatePhoneNumber(resendPhone);
    if (phoneError) {
      setErrors({ phoneNumber: phoneError });
      return;
    }

    await handleResendVerification();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFlashMessage(null);
    setIsLoading(true);

    // Validate inputs
    const phoneError = validatePhoneNumber(phone);
    const passwordError = validatePassword(password);

    if (phoneError || passwordError) {
      setErrors({
        ...(phoneError && { phoneNumber: phoneError }),
        ...(passwordError && { password: passwordError })
      });
      setIsLoading(false);
      return;
    }
    
    try {
      await login(phone, password);
    } catch (err: any) {
      console.log('Login error:', err);
      if (err.code === 'INACTIVE_ACCOUNT') {
        setInactiveUserPhone(phone);
        setFlashMessage({
          type: 'warning',
          message: translations.auth.login.accountNotVerified,
          action: {
            label: translations.auth.login.resendVerification,
            onClick: handleResendClick
          }
        });
      } else if (err.code === 401) {
        setFlashMessage({
          type: 'error',
          message: translations.auth.login.invalidCredentials
        });
      } else {
        setFlashMessage({
          type: 'error',
          message: translations.auth.login.loginError
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-4 right-4 z-50">
        <LanguageToggle />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Success Message */}
        {registrationSuccess && (
          <div
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md
                       transition-all duration-300 ease-in-out
                       ${showSuccess ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
          >
            <div className="bg-zinc-900/90 backdrop-blur-xl border border-green-500/20 rounded-lg p-4 
                          shadow-lg shadow-green-500/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h3 className="text-green-500 font-medium text-sm">
                    Registration Successful!
                  </h3>
                  <p className="text-zinc-400 text-xs mt-0.5">
                    Welcome {userName}! Please login to continue.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Background elements */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-[#0A0A0B]" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=2074')] bg-cover bg-center" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B] via-transparent to-[#0A0A0B]" />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-blue-500/5" />
          {/* New decorative elements */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2" />
          </div>
        </div>

        {/* Content */}
        <div className="w-full max-w-[min(90%,420px)] relative z-10">
          {/* Flash Message */}
          {flashMessage && (
            <div className={`mb-6 transform transition-all duration-300 ease-out ${
              flashMessage.type === 'error' ? 'bg-rose-500/10 border-rose-500/50 text-rose-500' :
              flashMessage.type === 'warning' ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' :
              'bg-green-500/10 border-green-500/50 text-green-500'
            } border rounded-lg px-4 py-3 backdrop-blur-xl shadow-lg`}>
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium">{flashMessage.message}</p>
                {flashMessage.action && (
                  <button
                    onClick={flashMessage.action.onClick}
                    className="ml-4 text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors"
                  >
                    {flashMessage.action.label}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Success Message for Verification */}
          {verificationSuccess && (
            <div className="mb-6 bg-green-500/10 border border-green-500/50 text-green-500 text-sm px-4 py-3 rounded-lg backdrop-blur-xl shadow-lg transform transition-all duration-300 ease-out">
              <p className="font-medium">{successMessage}</p>
              {userName && (
                <p className="text-xs mt-1">
                  {translations.auth.login.welcomeBack}, {userName}!
                </p>
              )}
            </div>
          )}

          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/5">
              <Scissors className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
              {showResendForm ? translations.auth.login.resendVerification : translations.auth.login.welcomeBack}
            </h2>
            <p className="text-sm text-zinc-400">
              {showResendForm ? translations.auth.login.enterPhone : translations.auth.login.signInAccount}
            </p>
          </div>

          {/* Form Section */}
          <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 space-y-5 shadow-2xl shadow-black/10">
            {showResendForm ? (
              <form onSubmit={handleResendSubmit} className="space-y-5">
                {/* Phone Input for Resend */}
                <div>
                  <label htmlFor="resend-phone" className="block text-sm font-medium text-zinc-300 mb-2">
                    {translations.auth.login.phoneNumber}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      type="tel"
                      id="resend-phone"
                      value={resendPhone}
                      onChange={(e) => setResendPhone(e.target.value)}
                      className={`block w-full pl-10 pr-4 py-2.5 border ${
                        errors.phoneNumber ? 'border-rose-500' : 'border-zinc-800 group-focus-within:border-blue-500'
                      } rounded-lg bg-zinc-900/50 text-white placeholder-zinc-500 text-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                      transition-all duration-200`}
                      placeholder={translations.auth.login.enterPhone}
                      required
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="mt-2 text-sm text-rose-500">{errors.phoneNumber}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  isLoading={isLoading}
                  loadingText="Sending code..."
                  className="w-full py-2.5 text-sm font-medium transition-all duration-200
                           bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
                           focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 focus:ring-offset-zinc-900"
                >
                  {translations.auth.login.resendVerification}
                </Button>

                {/* Back to Login Link */}
                <div className="text-center text-sm pt-2">
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="text-blue-500 hover:text-blue-400 font-medium transition-colors"
                  >
                    {translations.auth.login.backToLogin}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Phone Input */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-zinc-300 mb-2">
                    {translations.auth.login.phoneNumber}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`block w-full pl-10 pr-4 py-2.5 border ${
                        errors.phoneNumber ? 'border-rose-500' : 'border-zinc-800 group-focus-within:border-blue-500'
                      } rounded-lg bg-zinc-900/50 text-white placeholder-zinc-500 text-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                      transition-all duration-200`}
                      placeholder={translations.auth.login.enterPhone}
                      required
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="mt-2 text-sm text-rose-500">{errors.phoneNumber}</p>
                  )}
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                    {translations.auth.login.password}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`block w-full pl-10 pr-4 py-2.5 border ${
                        errors.password ? 'border-rose-500' : 'border-zinc-800 group-focus-within:border-blue-500'
                      } rounded-lg bg-zinc-900/50 text-white placeholder-zinc-500 text-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                      transition-all duration-200`}
                      placeholder={translations.auth.login.enterPassword}
                      required
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-rose-500">{errors.password}</p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-blue-500 
                               focus:ring-blue-500 focus:ring-offset-zinc-900 transition-colors"
                    />
                    <label htmlFor="remember-me" className="ml-2 text-sm text-zinc-400">
                      {translations.auth.login.rememberMe}
                    </label>
                  </div>
                  <a href="#" className="text-sm text-blue-500 hover:text-blue-400 transition-colors">
                    {translations.auth.login.forgot}
                  </a>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  isLoading={isLoading}
                  loadingText="Signing in..."
                  className="w-full py-2.5 text-sm font-medium transition-all duration-200
                           bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
                           focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 focus:ring-offset-zinc-900"
                >
                  {translations.auth.login.signIn}
                </Button>
              </form>
            )}

            {/* Register Link */}
            <div className="text-center text-sm pt-2">
              <span className="text-zinc-400">{translations.auth.login.newHere}</span>{' '}
              <Link to="/register" className="text-blue-500 hover:text-blue-400 font-medium transition-colors">
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