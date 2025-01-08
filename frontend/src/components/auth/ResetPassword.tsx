import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageSquare } from 'lucide-react';
import Footer from '../Footer';
import LanguageToggle from '../LanguageToggle';
import { Button } from '../ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import { validatePhoneNumber } from '../../utils/validations';

export default function ResetPassword() {
  const { translations } = useLanguage();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    phone?: string;
    general?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Validate phone number
    const phoneError = validatePhoneNumber(phone);
    if (phoneError) {
      setErrors({ phone: phoneError });
      setIsLoading(false);
      return;
    }

    // TODO: Implement reset password logic
    setIsLoading(false);
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
          {/* Decorative elements */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2" />
          </div>
        </div>

        {/* Content */}
        <div className="w-full max-w-[min(90%,420px)] relative z-10">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 backdrop-blur-xl border border-white/10">
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
              {translations.auth.resetPassword.title || "Reset Password"}
            </h2>
            <p className="text-sm text-zinc-400">
              {translations.auth.resetPassword.description || "Enter your phone number to reset your password"}
            </p>
          </div>

          {/* Form Section */}
          <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/50 rounded-xl p-5 space-y-4">
            {errors.general && (
              <div className="bg-rose-500/10 border border-rose-500/50 text-rose-500 text-sm px-3 py-2 rounded-lg">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Phone Input */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-zinc-300 mb-2">
                  {translations.auth.resetPassword.phoneNumber || "Phone Number"}
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
                      errors.phone ? 'border-rose-500' : 'border-zinc-800 group-focus-within:border-blue-500'
                    } rounded-lg bg-zinc-900/50 text-white placeholder-zinc-500 text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                    transition-all duration-200`}
                    placeholder={translations.auth.resetPassword.enterPhone || "Enter your phone number"}
                    required
                  />
                </div>
                {errors.phone && (
                  <p className="mt-2 text-sm text-rose-500">{errors.phone}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                isLoading={isLoading}
                loadingText={translations.auth.resetPassword.sending || "Sending reset code..."}
                className="w-full py-2.5 text-sm font-medium transition-all duration-200
                         bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
                         focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 focus:ring-offset-zinc-900"
              >
                {translations.auth.resetPassword.sendCode || "Send Reset Code"}
              </Button>

              {/* Back to Login Link */}
              <div className="text-center text-sm pt-2">
                <Link to="/login" className="text-blue-500 hover:text-blue-400 font-medium transition-colors">
                  {translations.auth.resetPassword.backToLogin || "Back to Login"}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 