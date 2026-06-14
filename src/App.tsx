/**
 * TwinLink - Main App Component
 * Handles routing, auth state, and initializes demo data
 */

import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, useChatStore, useMatchStore, useDiscoveryStore } from './lib/store';
import { useOnlineStatus } from './hooks';

// Pages
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import VerificationPage from './components/auth/VerificationPage';
import GoogleCallback from './components/auth/GoogleCallback';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { isAuthenticated, user, requiresVerification } = useAuthStore();
  const { initializeDemoChats } = useChatStore();
  const { initializeDemoMatches } = useMatchStore();
  const { initializeDemoProfiles } = useDiscoveryStore();
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (isAuthenticated && user) {
      initializeDemoChats();
      initializeDemoMatches();
      initializeDemoProfiles();
    }
  }, [isAuthenticated, user, initializeDemoChats, initializeDemoMatches, initializeDemoProfiles]);

  useEffect(() => {
    if (!isOnline) {
      console.warn('You are offline. Some features may not work.');
    }
  }, [isOnline]);

  return (
    <div className="h-screen w-screen bg-dark overflow-hidden">
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} 
        />
        <Route 
          path="/verify" 
          element={
            isAuthenticated ? <Navigate to="/" replace /> : 
            requiresVerification ? <VerificationPage /> : 
            <Navigate to="/register" replace />
          } 
        />
        <Route 
          path="/auth/callback" 
          element={<GoogleCallback />} 
        />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/*" element={<MainLayout />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
