/**
 * TwinLink - Google OAuth Callback Handler
 * Receives token from backend after Google sign-in
 */

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../../lib/store';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { googleLogin } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google auth error:', error);
      navigate('/login?error=google_auth_failed');
      return;
    }

    if (token) {
      // Store token and log user in
      googleLogin(token).then(() => {
        navigate('/');
      }).catch((err) => {
        console.error('Login error:', err);
        navigate('/login?error=auth_failed');
      });
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, googleLogin]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-dark">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-white/60 text-sm">Completing sign in...</p>
      </motion.div>
    </div>
  );
}
