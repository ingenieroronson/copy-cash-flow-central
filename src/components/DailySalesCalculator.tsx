
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { ServiceSection } from './ServiceSection';
import { SupplySection } from './SupplySection';
import { SummaryCard } from './SummaryCard';
import { PhotocopierSelector } from './PhotocopierSelector';
import { DateSelector } from './DateSelector';
import { Photocopier } from '@/hooks/usePhotocopiers';
import { Supply } from '@/hooks/useSupplies';

interface DailySalesCalculatorProps {
  services: {
    colorCopies: { yesterday: number; today: number; errors: number };
    bwCopies: { yesterday: number; today: number; errors: number };
    colorPrints: { yesterday: number; today: number; errors: number };
    bwPrints: { yesterday: number; today: number; errors: number };
  };
  suppliesData: Record<string, { startStock: number; endStock: number }>;
  dbSupplies: Supply[];
  photocopiers: Photocopier[];
  selectedPhotocopierId: string;
  selectedDate: string;
  onUpdateService: (serviceId: string, field: string, value: number) => void;
  onUpdateSupply: (supplyId: string, field: string, value: number) => void;
  onPhotocopierChange: (photocopierId: string) => void;
  onDateChange: (date: string) => void;
  onSaveSales: () => void;
  salesLoading: boolean;
  photocopiersLoading: boolean;
  getServicePrice: (serviceType: string) => number;
  getSupplyPrice: (supplyName: string) => number;
  totalSales: number;
}

export const DailySalesCalculator = ({
  services,
  suppliesData,
  dbSupplies,
  photocopiers,
  selectedPhotocopierId,
  selectedDate,
  onUpdateService,
  onUpdateSupply,
  onPhotocopierChange,
  onDateChange,
  onSaveSales,
  salesLoading,
  photocopiersLoading,
  getServicePrice,
  getSupplyPrice,
  totalSales
}: DailySalesCalculatorProps) => {
  const navigate = useNavigate();

  const calculateServiceTotal = (service: any, price: number) => {
    const difference = Math.max(0, service.today - (service.errors || 0) - service.yesterday);
    return difference * price;
  };

  const calculateSupplyTotal = (supply: any, price: number) => {
    const sold = Math.max(0, supply.startStock - supply.endStock);
    return sold * price;
  };

  const canSaveSales = selectedPhotocopierId && !salesLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="py-4 md:py-6 px-3 md:px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="text-center md:text-left px-2">
              <p className="text-lg md:text-xl text-gray-600">Calculadora de Ventas Diarias</p>
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:gap-3 px-2">
              <Button
                onClick={() => navigate('/settings')}
                variant="outline"
                className="flex-1 md:flex-none text-sm md:text-base py-2 md:py-2.5"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </Button>
              <Button
                onClick={onSaveSales}
                disabled={!canSaveSales}
                className="flex-1 md:flex-none text-sm md:text-base py-2 md:py-2.5"
              >
                <Save className="w-4 h-4 mr-2" />
                {salesLoading ? 'Guardando...' : 'Guardar Ventas'}
              </Button>
            </div>
          </div>

          <div className="space-y-6 md:space-y-8">
            <div className="px-2">
              <PhotocopierSelector
                photocopiers={photocopiers}
                selectedPhotocopierId={selectedPhotocopierId}
                onPhotocopierChange={onPhotocopierChange}
                loading={photocopiersLoading}
              />
            </div>

            <div className="px-2">
              <DateSelector
                selectedDate={selectedDate}
                onDateChange={onDateChange}
              />
            </div>

            {!selectedPhotocopierId && !photocopiersLoading && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4 mx-2">
                <p className="text-yellow-800 text-sm md:text-base">
                  Por favor, selecciona una fotocopiadora antes de registrar ventas.
                </p>
              </div>
            )}

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
