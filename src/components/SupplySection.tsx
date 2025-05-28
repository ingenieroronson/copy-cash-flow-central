
import React from 'react';
import { SupplyCard } from './SupplyCard';
import { EmptySuppliesState } from './EmptySuppliesState';
import { Supply } from '@/hooks/useSupplies';

interface SupplySectionProps {
  dbSupplies: Supply[];
  suppliesData: Record<string, { startStock: number; endStock: number }>;
  onUpdateSupply: (supplyId: string, field: string, value: number) => void;
  calculateSupplyTotal: (supply: any, price: number) => number;
}

export const SupplySection = ({
  dbSupplies,
  suppliesData,
  onUpdateSupply,
  calculateSupplyTotal
}: SupplySectionProps) => {
  return (
    <div>
      <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 mb-4 md:mb-6 px-2">Ventas de Suministros</h2>
      {dbSupplies && dbSupplies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4 lg:gap-6 px-2">
          {dbSupplies.map((supply) => (
            <SupplyCard
              key={supply.id}
              title={supply.supply_name || 'Suministro'}
              icon="file"
              iconColor="text-purple-500"
              backgroundColor="bg-purple-50"
              supply={suppliesData[supply.supply_name!] || { startStock: 0, endStock: 0 }}
              onUpdate={(field, value) => onUpdateSupply(supply.supply_name!, field, value)}
              total={calculateSupplyTotal(suppliesData[supply.supply_name!] || { startStock: 0, endStock: 0 }, supply.unit_price)}
              sold={Math.max(0, (suppliesData[supply.supply_name!]?.startStock || 0) - (suppliesData[supply.supply_name!]?.endStock || 0))}
              price={supply.unit_price}
            />
          ))}
        </div>
      ) : (
        <div className="px-2">
          <EmptySuppliesState />
        </div>
      )}
    </div>
  );
};
