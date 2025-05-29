
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
  console.log('AppWrapper: Estado de carga - auth:', authLoading, 'pricing:', pricingLoading, 'supplies:', suppliesLoading, 'user:', user ? 'presente' : 'ausente');

  if (authLoading) {
    console.log('AppWrapper: Mostrando loading por authLoading');
    return <LoadingSpinner />;
  }

  if (pricingLoading) {
    console.log('AppWrapper: Mostrando loading por pricingLoading');
    return <LoadingSpinner />;
  }

  if (suppliesLoading) {
    console.log('AppWrapper: Mostrando loading por suppliesLoading');
    return <LoadingSpinner />;
  }

  if (!user) {
    console.log('AppWrapper: Mostrando formulario de autenticación - usuario no presente');
    return <AuthForm />;
  }

  console.log('AppWrapper: Renderizando aplicación principal - usuario autenticado');
  return <>{children}</>;
};
