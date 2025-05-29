
import React from 'react';
import { Settings as SettingsIcon, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PhotocopierManagement } from '@/components/PhotocopierManagement';
import { SharedModulesView } from '@/components/SharedModulesView';
import { SharedAccessSummary } from '@/components/SharedAccessSummary';
import { ServicePricesSection } from '@/components/ServicePricesSection';
import { ProcedureManagementSection } from '@/components/ProcedureManagementSection';
import { SupplyManagementSection } from '@/components/SupplyManagementSection';

export const SettingsLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-orange-500" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Configuración</h1>
          </div>
          
          <Button
            onClick={() => navigate('/home')}
            className="bg-orange-500 hover:bg-orange-600 flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Ir al Panel Principal
          </Button>
        </div>

        <div className="space-y-8">
          {/* Photocopier Management */}
          <PhotocopierManagement />

          {/* Shared Access Management - Consolidated */}
          <SharedAccessSummary />

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
  );
};
