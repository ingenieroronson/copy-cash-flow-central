
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { ServiceSection } from './ServiceSection';
import { SupplySection } from './SupplySection';
import { SummaryCard } from './SummaryCard';

interface Supply {
  id: string;
  supply_name: string | null;
  unit_price: number;
  is_active: boolean | null;
}

interface DailySalesCalculatorProps {
  services: {
    colorCopies: { yesterday: number; today: number };
    bwCopies: { yesterday: number; today: number };
    colorPrints: { yesterday: number; today: number };
    bwPrints: { yesterday: number; today: number };
  };
  suppliesData: Record<string, { startStock: number; endStock: number }>;
  dbSupplies: Supply[];
  onUpdateService: (serviceId: string, field: string, value: number) => void;
  onUpdateSupply: (supplyId: string, field: string, value: number) => void;
  onSaveSales: () => void;
  salesLoading: boolean;
  getServicePrice: (serviceType: string) => number;
  getSupplyPrice: (supplyName: string) => number;
  totalSales: number;
}

export const DailySalesCalculator = ({
  services,
  suppliesData,
  dbSupplies,
  onUpdateService,
  onUpdateSupply,
  onSaveSales,
  salesLoading,
  getServicePrice,
  getSupplyPrice,
  totalSales
}: DailySalesCalculatorProps) => {
  const navigate = useNavigate();

  const calculateServiceTotal = (service: any, price: number) => {
    const difference = Math.max(0, service.today - service.yesterday);
    return difference * price;
  };

  const calculateSupplyTotal = (supply: any, price: number) => {
    const sold = Math.max(0, supply.startStock - supply.endStock);
    return sold * price;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="text-center sm:text-left">
              <p className="text-xl text-gray-600">Calculadora de Ventas Diarias</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={() => navigate('/settings')}
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </Button>
              <Button
                onClick={onSaveSales}
                disabled={salesLoading}
                className="flex-1 sm:flex-none"
              >
                <Save className="w-4 h-4 mr-2" />
                {salesLoading ? 'Guardando...' : 'Guardar Ventas'}
              </Button>
            </div>
          </div>

          <div className="space-y-8">
            <ServiceSection
              services={services}
              onUpdateService={onUpdateService}
              getServicePrice={getServicePrice}
              calculateServiceTotal={calculateServiceTotal}
            />

            <SupplySection
              dbSupplies={dbSupplies}
              suppliesData={suppliesData}
              onUpdateSupply={onUpdateSupply}
              calculateSupplyTotal={calculateSupplyTotal}
            />

            <SummaryCard total={totalSales} />
          </div>
        </div>
      </div>
    </div>
  );
};
