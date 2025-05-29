
import React from 'react';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { Settings as SettingsIcon } from 'lucide-react';
import { AuthForm } from '@/components/AuthForm';
import { PhotocopierManagement } from '@/components/PhotocopierManagement';
import { SharedModulesView } from '@/components/SharedModulesView';
import { ServicePricesSection } from '@/components/ServicePricesSection';
import { ProcedureManagementSection } from '@/components/ProcedureManagementSection';
import { SupplyManagementSection } from '@/components/SupplyManagementSection';

const Settings = () => {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <SettingsIcon className="w-8 h-8 text-orange-500" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Configuración</h1>
          </div>

          <div className="space-y-8">
            {/* Photocopier Management */}
            <PhotocopierManagement />

            {/* Shared Modules View */}
            <SharedModulesView />

            {/* Service Prices */}
            <ServicePricesSection />

            {/* Procedure Management */}
            <ProcedureManagementSection />

            {/* Supply Management */}
            <SupplyManagementSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
