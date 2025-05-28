
import React from 'react';
import { AuthForm } from './AuthForm';
import { LoadingSpinner } from './LoadingSpinner';

interface AppWrapperProps {
  authLoading: boolean;
  pricingLoading: boolean;
  suppliesLoading: boolean;
  user: any;
  children: React.ReactNode;
}

export const AppWrapper = ({ 
  authLoading, 
  pricingLoading, 
  suppliesLoading, 
  user, 
  children 
}: AppWrapperProps) => {
  if (authLoading || pricingLoading || suppliesLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthForm />;
  }

  return <>{children}</>;
};
