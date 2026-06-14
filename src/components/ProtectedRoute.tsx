/**
 * TwinLink - Protected Route Guard
 * Redirects unauthenticated users to login
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../lib/store';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
