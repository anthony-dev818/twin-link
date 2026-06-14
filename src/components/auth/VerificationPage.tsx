/**
 * TwinLink - Email Verification Page
 * Enter 6-digit code sent to email after registration
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Loader2, AlertCircle, Check, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../lib/store';

export default function VerificationPage() {
  const navigate = useNavigate();
  const { 
    verifyEmail, 
    resendCode, 
    pendingEmail, 
    isLoading, 
    error, 
    clearError,
    isAuthenticated,
    requiresVerification 
  } = useAuthStore();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if not pending verification
  useEffect(() => {
    if (!requiresVerification && !pendingEmail) {
      navigate('/login');
    }
  }, [requiresVerification, pendingEmail, navigate]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleChange = useCallback((index: number, value: string) => {
    clearError();

    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only keep last digit
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (index === 5 && value) {
      const fullCode = [...newCode.slice(0, 5), value.slice(-1)].join('');
      if (fullCode.length === 6) {
        handleVerify(fullCode);
      }
    }
  }, [code, clearError]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [code]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    clearError();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

    const newCode = ['', '', '', '', '', ''];
    pasted.split('').forEach((digit, i) => {
      if (i < 6) newCode[i] = digit;
    });
    setCode(newCode);

    // Focus appropriate input
    if (pasted.length < 6) {
      inputRefs.current[pasted.length]?.focus();
    } else {
      inputRefs.current[5]?.focus();
      handleVerify(pasted);
    }
  }, [clearError]);

  const handleVerify = useCallback(async (fullCode?: string) => {
    const codeToVerify = fullCode || code.join('');

    if (codeToVerify.length !== 6) {
      return;
    }

    if (!pendingEmail) {
      return;
    }

    await verifyEmail(pendingEmail, codeToVerify);
  }, [code, pendingEmail, verifyEmail]);

  const handleResend = useCallback(async () => {
    if (!canResend || !pendingEmail) return;

    setCanResend(false);
    setResendTimer(60);
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();

    await resendCode(pendingEmail);
  }, [canResend, pendingEmail, resendCode]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleVerify();
  }, [handleVerify]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-dark p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Back button */}
        <button
          onClick={() => navigate('/register')}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to registration</span>
        </button>

        {/* Icon */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-4"
          >
            <Mail className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="text-2xl font-bold">Verify your email</h1>
          <p className="text-white/50 text-sm mt-2 text-center">
            We sent a 6-digit code to<br />
            <span className="text-primary font-medium">{pendingEmail}</span>
          </p>
        </div>

        {/* Code Inputs */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-14 text-center text-xl font-bold bg-dark-surface border-2 border-white/10 
                  rounded-xl text-white outline-none transition-all duration-200
                  focus:border-primary focus:ring-2 focus:ring-primary/20
                  placeholder:text-white/10"
                aria-label={`Digit ${index + 1}`}
                disabled={isLoading}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Verify Button */}
          <button
            type="submit"
            disabled={isLoading || code.join('').length !== 6}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Verify Email
              </>
            )}
          </button>
        </form>

        {/* Resend */}
        <div className="text-center mt-6">
          <p className="text-white/40 text-sm">
            Didn't receive the code?{' '}
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={isLoading}
                className="text-primary hover:text-primary-light font-medium transition-colors inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Resend
              </button>
            ) : (
              <span className="text-white/30">
                Resend in {resendTimer}s
              </span>
            )}
          </p>
        </div>

        {/* Help */}
        <div className="mt-8 p-4 bg-dark-surface/50 rounded-xl border border-white/5">
          <p className="text-xs text-white/30 text-center">
            Check your spam folder if you don't see the email. 
            Make sure <span className="text-white/50">{pendingEmail}</span> is correct.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
