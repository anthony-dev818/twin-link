/**
 * TwinLink - Registration Page
 * New user registration with validation → redirects to verification
 */

import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Eye, EyeOff, Loader2, AlertCircle, Check, ChevronLeft } from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { isValidEmail, getPasswordStrength } from '../../utils';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError, requiresVerification, pendingEmail } = useAuthStore();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    bio: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Redirect to verification if registration succeeded
  useEffect(() => {
    if (requiresVerification && pendingEmail) {
      navigate('/verify');
    }
  }, [requiresVerification, pendingEmail, navigate]);

  const updateField = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError();
  }, [clearError]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      age: parseInt(formData.age),
      bio: formData.bio,
    });
  }, [formData, register, clearError]);

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColor = {
    weak: 'bg-red-500',
    medium: 'bg-yellow-500',
    strong: 'bg-emerald-500',
  }[passwordStrength];

  const canProceed = () => {
    if (step === 1) {
      return formData.name.trim().length >= 2 && 
             isValidEmail(formData.email) && 
             formData.password.length >= 6 &&
             formData.password === formData.confirmPassword;
    }
    return formData.age.trim() !== '' && formData.bio.trim().length >= 10;
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-dark p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5 text-white/60" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <h1 className="text-xl font-bold text-gradient">TwinLink</h1>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {[1, 2].map(s => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? 'gradient-primary' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Step Title */}
        <h2 className="text-lg font-semibold mb-1">
          {step === 1 ? 'Create your account' : 'Tell us about yourself'}
        </h2>
        <p className="text-white/50 text-sm mb-6">
          {step === 1 ? 'Start your journey to find your perfect match' : 'Help others get to know you better'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 ? (
            <>
              {/* Name */}
              <div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                  placeholder="Full name"
                  className="input-field"
                  required
                  aria-label="Full name"
                />
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                  placeholder="Email address"
                  className="input-field"
                  required
                  aria-label="Email address"
                />
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                    placeholder="Password"
                    className="input-field pr-12"
                    required
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {/* Password Strength */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 h-1">
                      {[1, 2, 3].map(i => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-all duration-300 ${
                            (passwordStrength === 'weak' && i === 1) ||
                            (passwordStrength === 'medium' && i <= 2) ||
                            (passwordStrength === 'strong')
                              ? strengthColor
                              : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs mt-1 capitalize" style={{ color: 
                      passwordStrength === 'weak' ? '#EF4444' :
                      passwordStrength === 'medium' ? '#EAB308' : '#10B981'
                    }}>
                      {passwordStrength} password
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
                  placeholder="Confirm password"
                  className={`input-field ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }`}
                  required
                  aria-label="Confirm password"
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Age */}
              <div>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateField('age', e.target.value)}
                  placeholder="Age"
                  min="18"
                  max="100"
                  className="input-field"
                  required
                  aria-label="Age"
                />
              </div>

              {/* Bio */}
              <div>
                <textarea
                  value={formData.bio}
                  onChange={(e) => updateField('bio', e.target.value)}
                  placeholder="Tell us about yourself... (min 10 characters)"
                  rows={4}
                  className="input-field resize-none"
                  required
                  aria-label="Bio"
                />
                <p className="text-right text-xs text-white/30 mt-1">
                  {formData.bio.length}/500
                </p>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-400" />
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Actions */}
          {step === 1 ? (
            <button
              type="button"
              onClick={() => canProceed() && setStep(2)}
              disabled={!canProceed()}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Continue
              <ChevronLeft className="w-4 h-4 rotate-180" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading || !canProceed()}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          )}
        </form>

        {/* Login Link */}
        <p className="text-center text-white/50 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary-light font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
