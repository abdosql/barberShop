import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Scissors, User, Phone, Loader2 } from 'lucide-react';
import Footer from '../Footer';
import LanguageToggle from '../LanguageToggle';
import { Button } from '../ui/Button';
import { validatePhoneNumber, validatePassword } from '../../utils/validations';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Register() {
  const { translations } = useLanguage();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    phone?: string;
    password?: string;
    general?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate first name
    if (!firstName.trim()) {
      newErrors.firstName = translations.auth.register.errors.firstNameRequired;
    }

    // Validate last name
    if (!lastName.trim()) {
      newErrors.lastName = translations.auth.register.errors.lastNameRequired;
    }

    // Validate phone number
    const phoneError = validatePhoneNumber(phone);
    if (phoneError) {
      newErrors.phone = phoneError;
    }

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/ld+json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phoneNumber: phone,
          password,
          roles: ["ROLE_USER"]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 422) {
          const violations = errorData?.violations || [];
          const newErrors: { [key: string]: string } = {};
          
          violations.forEach((violation: { propertyPath: string; message: string }) => {
            switch (violation.propertyPath) {
              case 'phoneNumber':
                newErrors.phone = violation.message;
                break;
              case 'password':
                newErrors.password = violation.message;
                break;
              case 'firstName':
                newErrors.firstName = violation.message;
                break;
              case 'lastName':
                newErrors.lastName = violation.message;
                break;
              default:
                newErrors.general = translations.auth.register.errors.registrationFailed;
            }
          });

          if (Object.keys(newErrors).length === 0) {
            setErrors({ general: translations.auth.register.errors.registrationFailed });
          } else {
            setErrors(newErrors);
          }
        } else if (errorData?.['hydra:description']?.includes('phone number')) {
          setErrors({ phone: translations.auth.register.errors.phoneExists });
        } else {
          setErrors({ general: translations.auth.register.errors.registrationFailed });
        }
        setIsLoading(false);
        return;
      }

      navigate('/login', { 
        state: { 
          registrationSuccess: true,
          name: firstName + ' ' + lastName
        } 
      });

    } catch (err) {
      setErrors({ general: translations.auth.register.errors.registrationFailed });
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
        {/* Background elements remain the same */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-[#0A0A0B]" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=2070')] bg-cover bg-center" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B] via-transparent to-[#0A0A0B]" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5" />
        </div>

        {/* Content - Added responsive sizing */}
        <div className="w-full max-w-[min(90%,420px)] relative z-10">
          {/* Logo Section - Responsive sizing */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500/20 to-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 backdrop-blur-xl border border-white/10">
              <Scissors className="w-6 h-6 sm:w-7 sm:h-7 text-blue-500" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{translations.auth.register.joinBarber}</h2>
            <p className="text-xs sm:text-sm text-zinc-400">{translations.auth.register.createToStart}</p>
          </div>

          {/* Form Section - Responsive padding and spacing */}
          <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/50 rounded-xl p-4 sm:p-5 space-y-3 sm:space-y-4">
            {/* Error Message */}
            {errors.general && (
              <div className="bg-rose-500/10 border border-rose-500/50 text-rose-500 text-xs sm:text-sm px-3 py-2 rounded-lg">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* First Name Input */}
              <div>
                <label htmlFor="firstName" className="block text-xs sm:text-sm font-medium text-zinc-300 mb-1">
                  {translations.auth.register.firstName}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-500" />
                  </div>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`block w-full pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 border ${
                      errors.firstName ? 'border-rose-500' : 'border-zinc-800'
                    } rounded-lg bg-zinc-900/50 text-white placeholder-zinc-500 text-xs sm:text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder={translations.auth.register.enterFirstName}
                    required
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-rose-500">{errors.firstName}</p>
                  )}
                </div>
              </div>

              {/* Last Name Input */}
              <div>
                <label htmlFor="lastName" className="block text-xs sm:text-sm font-medium text-zinc-300 mb-1">
                  {translations.auth.register.lastName}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-500" />
                  </div>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`block w-full pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 border ${
                      errors.lastName ? 'border-rose-500' : 'border-zinc-800'
                    } rounded-lg bg-zinc-900/50 text-white placeholder-zinc-500 text-xs sm:text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder={translations.auth.register.enterLastName}
                    required
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-rose-500">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Phone Input */}
              <div>
                <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-zinc-300 mb-1">
                  {translations.auth.register.phoneNumber}
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
                    className={`block w-full pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 border ${
                      errors.phone ? 'border-rose-500' : 'border-zinc-800'
                    } rounded-lg bg-zinc-900/50 text-white placeholder-zinc-500 text-xs sm:text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder={translations.auth.register.enterPhone}
                    required
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-rose-500">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-zinc-300 mb-1">
                  {translations.auth.register.password}
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
                    className={`block w-full pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 border ${
                      errors.password ? 'border-rose-500' : 'border-zinc-800'
                    } rounded-lg bg-zinc-900/50 text-white placeholder-zinc-500 text-xs sm:text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder={translations.auth.register.createPassword}
                    required
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-rose-500">{errors.password}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                isLoading={isLoading}
                loadingText={translations.auth.register.creatingAccount}
              >
                {translations.auth.register.createBtn}
              </Button>
            </form>

            {/* Sign in Link */}
            <div className="text-center text-xs sm:text-sm pt-1">
              <span className="text-zinc-400">{translations.auth.register.haveAccount}</span>{' '}
              <Link to="/login" className="text-blue-500 hover:text-blue-400 font-medium">
                {translations.auth.register.signIn}
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}