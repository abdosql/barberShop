import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { FaCalendarTimes } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import Footer from './Footer';
import { Button } from './ui/Button';
import LanguageToggle from './LanguageToggle';

export default function CancelAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { translations } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    async function validateUrl() {
      // Check if required query params exist
      const expiration = searchParams.get('_expiration');
      const hash = searchParams.get('_hash');

      if (!expiration || !hash) {
        navigate('/404', { replace: true });
        return;
      }

      try {
        // Send URL to backend for validation
        const urlToCheck = `${location.pathname.substring(1)}${location.search}`;
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/url/appointment/cancellation/checker`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Check-Url': urlToCheck
          }
        });

        // If response is not 200 OK, redirect to 404
        if (!response.ok) {
          navigate('/404', { replace: true });
          return;
        }

        // URL is valid, we can show the form
        setIsValidating(false);
      } catch (err) {
        // Any error means invalid URL
        navigate('/404', { replace: true });
      }
    }

    validateUrl();
  }, [location, navigate, searchParams]);

  const handleCancel = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get the URL path and query parameters
      const urlToCancel = `${location.pathname.substring(1)}${location.search}`;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/appointment/cancel`, {
        method: 'PATCH',
        headers: {
          'accept': 'application/ld+json',
          'Content-Type': 'application/merge-patch+json',
        },
        body: JSON.stringify({
          url: urlToCancel
        })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel appointment');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setError(translations.home.appointments.cancelError);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while validating URL
  if (isValidating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0B]">
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="mt-4 text-zinc-400">{translations.common.loading}</p>
      </div>
    );
  }

  // Main content (only shown if URL is valid)
  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-4 right-4 z-50">
        <LanguageToggle />
      </div>

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
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-[min(90%,420px)]">
          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-black/20 backdrop-blur border border-rose-500/20 rounded-lg overflow-hidden">
              <div className="px-4 py-3 text-sm text-rose-500">
                {error}
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 bg-black/20 backdrop-blur border border-green-500/20 rounded-lg overflow-hidden">
              <div className="px-4 py-3 text-sm text-green-500">
                {translations.home.appointments.cancelSuccess}
              </div>
            </div>
          )}

          {/* Main Card */}
          <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/50 rounded-xl p-8 text-center">
            {/* Icon */}
            <div className="w-16 h-16 bg-gradient-to-br from-rose-500/20 to-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/5">
              <FaCalendarTimes className="w-8 h-8 text-rose-500" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">
              {translations.home.appointments.cancelTitle}
            </h2>

            {/* Description */}
            <p className="text-zinc-400 mb-8">
              {translations.home.appointments.cancelConfirmation}
            </p>

            {/* Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleCancel}
                isLoading={isLoading}
                loadingText={translations.home.appointments.cancelling}
                className="w-full py-2.5 text-sm font-medium transition-all duration-200
                         bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700
                         focus:ring-2 focus:ring-rose-500/20 focus:ring-offset-2 focus:ring-offset-zinc-900"
                disabled={isLoading || success}
              >
                {translations.home.appointments.confirmCancel}
              </Button>

              <button
                onClick={() => navigate('/')}
                className="w-full py-2.5 px-4 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                disabled={isLoading}
              >
                {translations.common.goBack}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
} 