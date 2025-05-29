
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { SettingsLoadingState } from '@/components/SettingsLoadingState';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <SettingsLoadingState />;
  }

  if (!user) {
    return <Navigate to="/settings" replace />;
  }

  return <>{children}</>;
};
