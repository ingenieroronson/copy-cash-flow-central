
import React from 'react';
import { SupplyCard } from './SupplyCard';
import { EmptySuppliesState } from './EmptySuppliesState';

interface Supply {
  id: string;
  supply_name: string | null;
  unit_price: number;
  is_active: boolean | null;
}

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
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">Ventas de Suministros</h2>
      {dbSupplies && dbSupplies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
        <EmptySuppliesState />
      )}
    </div>
  );
};
