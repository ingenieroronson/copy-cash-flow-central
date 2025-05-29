
import React from 'react';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/AuthForm';
import { SettingsLayout } from '@/components/SettingsLayout';
import { SettingsLoadingState } from '@/components/SettingsLoadingState';

const Settings = () => {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return <SettingsLoadingState />;
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <SettingsLayout />
    </div>
  );
};

export default Settings;
