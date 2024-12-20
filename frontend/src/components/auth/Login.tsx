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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
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
      // Navigation will happen automatically due to the effect above
    } catch (err: any) {
      if (err.response?.status === 422) {
        const violations = err.response.data?.violations || [];
        const newErrors: { [key: string]: string } = {};
        
        violations.forEach((violation: { propertyPath: string; message: string }) => {
          // Map backend field names to frontend field names if needed
          const fieldMap: { [key: string]: string } = {
            phoneNumber: 'phoneNumber',
            password: 'password'
          };
          
          const fieldName = fieldMap[violation.propertyPath] || violation.propertyPath;
          newErrors[fieldName] = violation.message;
        });

        if (Object.keys(newErrors).length === 0) {
          // If no specific violations were found, set a general error
          setErrors({ general: 'Une erreur de validation s\'est produite.' });
        } else {
          setErrors(newErrors);
        }
      } else {
        setErrors({ general: 'Une erreur s\'est produite. Veuillez réessayer.' });
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
        {/* Success Message - Updated with animation */}
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
            {errors.general && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-500 text-sm">
                {errors.general}
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
                    className={`block w-full pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 border border-zinc-800 rounded-lg 
                             bg-zinc-900/50 text-white placeholder-zinc-500 text-xs sm:text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             ${errors.phoneNumber ? 'border-red-500' : ''}`}
                    placeholder={translations.auth.login.enterPhone}
                    required
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="mt-2 text-sm text-red-600">{errors.phoneNumber}</p>
                )}
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
                    className={`block w-full pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 border border-zinc-800 rounded-lg 
                             bg-zinc-900/50 text-white placeholder-zinc-500 text-xs sm:text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             ${errors.password ? 'border-red-500' : ''}`}
                    placeholder={translations.auth.login.enterPassword}
                    required
                  />
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                )}
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
              <Button
                type="submit"
                isLoading={isLoading}
                loadingText="Signing in..."
              >
                {translations.auth.login.signIn}
              </Button>
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