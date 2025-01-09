import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Lock } from 'lucide-react';
import { Button } from '../ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import Footer from '../Footer';
import LanguageToggle from '../LanguageToggle';

interface NewPasswordFormProps {
  onSubmit: (password: string) => void;
  isLoading: boolean;
  error?: string;
}

function NewPasswordForm({ onSubmit, isLoading, error }: NewPasswordFormProps) {
  const { translations } = useLanguage();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(undefined);

    if (password.length < 3) {
      setValidationError(translations.auth.resetPassword.passwordTooShort || 'Password must be at least 3 characters');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError(translations.auth.resetPassword.passwordsDoNotMatch || 'Passwords do not match');
      return;
    }

    onSubmit(password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="new-password" className="block text-sm font-medium text-zinc-300 mb-2">
          {translations.auth.resetPassword.newPassword || "New Password"}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-4 w-4 text-zinc-500" />
          </div>
          <input
            type="password"
            id="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 border border-zinc-800 rounded-lg bg-zinc-900/50 text-white placeholder-zinc-500 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            placeholder={translations.auth.resetPassword.enterNewPassword || "Enter new password"}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-zinc-300 mb-2">
          {translations.auth.resetPassword.confirmPassword || "Confirm Password"}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-4 w-4 text-zinc-500" />
          </div>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 border border-zinc-800 rounded-lg bg-zinc-900/50 text-white placeholder-zinc-500 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            placeholder={translations.auth.resetPassword.confirmNewPassword || "Confirm new password"}
            required
          />
        </div>
      </div>

      {(validationError || error) && (
        <div className="bg-rose-500/10 border border-rose-500/50 text-rose-500 text-sm px-3 py-2 rounded-lg">
          {validationError || error}
        </div>
      )}

      <Button
        type="submit"
        isLoading={isLoading}
        loadingText={translations.auth.resetPassword.updating || "Updating password..."}
        className="w-full"
      >
        {translations.auth.resetPassword.updatePassword || "Update Password"}
      </Button>
    </form>
  );
}

export default function PhoneVerification() {
  const { translations } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordError, setPasswordError] = useState<string>();
  const isPasswordReset = location.state?.resetPassword;

  // Get user data from location state
  const userData = location.state?.userData;

  // Ensure translations exist or provide fallbacks
  const t = {
    title: translations?.auth?.verification?.title ?? "Phone Verification",
    description: translations?.auth?.verification?.description ?? "Enter the 6-digit code we sent to your WhatsApp",
    verify: translations?.auth?.verification?.verify ?? "Verify Phone Number",
    verifying: translations?.auth?.verification?.verifying ?? "Verifying...",
    invalidCode: translations?.auth?.verification?.invalidCode ?? "Invalid verification code. Please try again.",
    timeRemaining: translations?.auth?.verification?.timeRemaining ?? "Time remaining",
    resend: translations?.auth?.verification?.resend ?? "Resend Code",
    resendError: translations?.auth?.verification?.resendError ?? "Failed to resend code. Please try again.",
    verificationSuccess: translations?.auth?.verification?.verificationSuccess ?? "Verification successful",
    verificationFailed: translations?.auth?.verification?.verificationFailed ?? "Verification failed",
    resetPassword: {
      newPassword: translations?.auth?.resetPassword?.newPassword ?? "New Password",
      confirmPassword: translations?.auth?.resetPassword?.confirmPassword ?? "Confirm Password",
      passwordsDoNotMatch: translations?.auth?.resetPassword?.passwordsDoNotMatch ?? "Passwords do not match",
      passwordTooShort: translations?.auth?.resetPassword?.passwordTooShort ?? "Password must be at least 3 characters",
      updating: translations?.auth?.resetPassword?.updating ?? "Updating password...",
      updatePassword: translations?.auth?.resetPassword?.updatePassword ?? "Update Password",
      success: translations?.auth?.resetPassword?.success ?? "Password has been reset successfully"
    }
  };

  // Initialize and manage timer
  useEffect(() => {
    const verificationSession = localStorage.getItem('verificationSession');
    if (!verificationSession) {
      navigate('/register');
      return;
    }

    const session = JSON.parse(verificationSession);
    const now = Date.now();
    const expiresAt = session.expiresAt;
    
    // Calculate remaining time in seconds
    const remainingTime = Math.max(0, Math.floor((expiresAt - now) / 1000));
    
    if (remainingTime <= 0) {
      setCanResend(true);
      setTimeLeft(0);
      return;
    }

    setTimeLeft(remainingTime);
    setCanResend(false);

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < 6; i++) {
      newCode[i] = i < pastedData.length ? pastedData[i] : code[i];
    }
    setCode(newCode);
    // Focus the next empty input or the last input if all are filled
    const nextEmptyIndex = Math.min(pastedData.length, 5);
    const nextInput = document.getElementById(`code-${nextEmptyIndex}`);
    nextInput?.focus();
  };

  const handleCodeChange = (index: number, value: string) => {
    // Handle single digit input
    if (!/^\d*$/.test(value)) return;

    setCode((prevCode) => {
      const newCode = [...prevCode];
      newCode[index] = value;
      return newCode;
    });

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const verificationCode = code.join('');
    if (!verificationCode || verificationCode.length !== 6) {
      setError(t.invalidCode);
      setIsLoading(false);
      return;
    }

    try {
      if (isPasswordReset) {
        // First verify the code
        const verifyResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/verify_code`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: verificationCode,
            user: userData?.userId
          }),
        });

        const verifyData = await verifyResponse.json();

        if (!verifyResponse.ok) {
          throw new Error(verifyData.error || 'Verification failed');
        }

        // Then create a reset token
        const tokenResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/create_reset_token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user: userData?.userId
          }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
          throw new Error(tokenData.error || 'Failed to create reset token');
        }

        // Store the reset token in state
        localStorage.setItem('resetToken', JSON.stringify({
          token: tokenData.resetToken,
          expiresAt: tokenData.expiresAt
        }));

        // Show the password form
        setShowPasswordForm(true);
      } else {
        // Account verification logic
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/verify_code`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: verificationCode,
            user: userData?.userId
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Verification failed');
        }

        // Clear verification session
        localStorage.removeItem('verificationSession');

        // Navigate back to login with success message
        navigate('/login', {
          state: {
            verificationSuccess: true,
            message: data.message || t.verificationSuccess
          }
        });
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || t.verificationFailed);
      setShowPasswordForm(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (newPassword: string) => {
    setPasswordError(undefined);
    setIsLoading(true);

    try {
      const resetTokenData = localStorage.getItem('resetToken');
      if (!resetTokenData) {
        throw new Error('Reset token not found. Please try again.');
      }

      const { token } = JSON.parse(resetTokenData);

      // Send reset password request
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reset_password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resetToken: token,
          user: userData?.userId,
          newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      // Clear verification session and reset token
      localStorage.removeItem('verificationSession');
      localStorage.removeItem('resetToken');

      // Navigate back to login with success message
      navigate('/login', {
        state: {
          verificationSuccess: true,
          message: translations.auth.resetPassword.success || 'Password has been reset successfully'
        }
      });
    } catch (err: any) {
      console.error('Password reset error:', err);
      setPasswordError(err.message || translations.auth.resetPassword.error || 'Failed to reset password');
      // If the error is due to invalid token, go back to code input
      if (err.message?.toLowerCase().includes('invalid token') || err.message?.toLowerCase().includes('expired token')) {
        setShowPasswordForm(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Completely separate resend handler
  const handleResend = async () => {
    if (!canResend || isResending) return;
    
    setIsResending(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/resend_verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: userData.phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend code');
      }

      // Reset verification session with 10 minutes expiry
      const verificationSession = {
        phoneNumber: userData.phoneNumber,
        userId: data.userId,
        startedAt: Date.now(),
        expiresAt: Date.now() + 600000, // 10 minutes in milliseconds
        type: isPasswordReset ? 'password_reset' : 'account_verification'
      };
      localStorage.setItem('verificationSession', JSON.stringify(verificationSession));
      
      setTimeLeft(600); // Reset to 10 minutes
      setCanResend(false);
      setError(data.message || translations?.auth?.verification?.codeSent || "New verification code sent successfully!");

    } catch (err: any) {
      console.error('Resend error:', err);
      setError(err.message || t.resendError);
      setCanResend(true);
    } finally {
      setIsResending(false);
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
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=2070')] bg-cover bg-center" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B] via-transparent to-[#0A0A0B]" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5" />
        </div>

        {/* Content */}
        <div className="w-full max-w-[min(90%,420px)] relative z-10">
          {/* Logo Section */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 backdrop-blur-xl border border-white/10">
              <MessageSquare className="w-7 h-7 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {t.title}
            </h2>
            <p className="text-sm text-zinc-400">
              {t.description}
            </p>
          </div>

          {/* Verification Form */}
          <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/50 rounded-xl p-5 space-y-4">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/50 text-rose-500 text-sm px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            {showPasswordForm ? (
              <NewPasswordForm
                onSubmit={handlePasswordSubmit}
                isLoading={isLoading}
                error={passwordError}
              />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex justify-center space-x-2">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-12 h-12 text-center text-lg font-medium text-white bg-zinc-900/50 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ))}
                </div>

                <Button
                  type="submit"
                  isLoading={isLoading}
                  loadingText={t.verifying}
                  className="w-full"
                >
                  {t.verify}
                </Button>
              </form>
            )}
          </div>

          {/* Completely separate resend section - Only show when not in password form */}
          {!showPasswordForm && (
            <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/50 rounded-xl p-5 mt-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-zinc-400">
                  {timeLeft > 0 ? `${t.timeRemaining}: ${formatTime(timeLeft)}` : "Code expired"}
                </p>
                {canResend && (
                  <div 
                    onClick={handleResend}
                    className={`text-sm transition-colors cursor-pointer ${
                      isResending
                        ? 'text-zinc-500 cursor-not-allowed'
                        : 'text-blue-500 hover:text-blue-400'
                    }`}
                  >
                    {isResending 
                      ? (translations?.auth?.verification?.resending || "Resending...") 
                      : (translations?.auth?.verification?.resend || "Resend verification code")}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
} 