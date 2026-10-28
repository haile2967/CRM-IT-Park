import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Detect if an authentication session exists or is currently completing code exchange from Keycloak
  const hasAuthHint = Boolean(
    localStorage.getItem('crm_token') ||
      window.location.hash.includes('code=') ||
      window.location.search.includes('code=')
  );

  // During brief initialization:
  // If the user has an active session or is returning from Keycloak login, render destination page directly
  if (isLoading) {
    if (hasAuthHint) {
      return <Outlet />;
    }
    return <div className="min-h-screen bg-slate-50" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
