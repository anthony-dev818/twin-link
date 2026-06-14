/**
 * TwinLink - Login Page
 * Authenticated login with email/password and Google OAuth
 */

import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { isValidEmail } from '../../utils';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  const { login, googleLogin, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email.trim() || !password.trim()) return;

    await login({ email: email.trim(), password, rememberMe });
  }, [email, password, rememberMe, login, clearError]);

  const handleGoogleLogin = useCallback(() => {
    // In production, redirect to backend Google OAuth endpoint
    // window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;

    // For demo, simulate Google login
    googleLogin('google-demo-token');
  }, [googleLogin]);

  const emailError = touched.email && !isValidEmail(email) ? 'Please enter a valid email' : '';
  const passwordError = touched.password && password.length < 6 ? 'Password must be at least 6 characters' : '';

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-dark p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/30"
          >
            <Heart className="w-8 h-8 text-white" fill="white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gradient">TwinLink</h1>
          <p className="text-white/50 text-sm mt-1">Find your perfect connection</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError(); }}
              onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
              placeholder="Email address"
              className={`input-field ${emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              required
              autoComplete="email"
              aria-label="Email address"
              aria-invalid={!!emailError}
            />
            {emailError && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {emailError}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError(); }}
              onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
              placeholder="Password"
              className={`input-field pr-12 ${passwordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              required
              autoComplete="current-password"
              aria-label="Password"
              aria-invalid={!!passwordError}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            {passwordError && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {passwordError}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-dark-surface text-primary focus:ring-primary/20"
              />
              <span className="text-white/60">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-primary hover:text-primary-light transition-colors">
              Forgot password?
            </Link>
          </div>

          {/* Error Message */}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2"
            aria-label="Sign in"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-sm">Or continue with</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Social Login */}
        <div className="flex gap-3">
          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="flex-1 btn-secondary flex items-center justify-center gap-2 py-2.5 hover:bg-white/10 transition-colors"
            aria-label="Sign in with Google"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#4285F4" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-sm">Google</span>
          </button>

          {/* Apple Button */}
          <button
            type="button"
            className="flex-1 btn-secondary flex items-center justify-center gap-2 py-2.5"
            aria-label="Sign in with Apple"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            <span className="text-sm">Apple</span>
          </button>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-white/50 text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:text-primary-light font-semibold transition-colors">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
