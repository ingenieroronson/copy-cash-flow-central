
import React from 'react';

export const useSuppliesState = () => {
  const [suppliesData, setSuppliesData] = React.useState<Record<string, { startStock: number; endStock: number }>>({});

  const updateSupply = (supplyId: string, field: string, value: number) => {
    setSuppliesData(prev => ({
      ...prev,
      [supplyId]: {
        ...prev[supplyId],
        [field]: value
      }
    }));
  };

  const resetSupplies = (supplies: any[]) => {
    const emptySupplies: Record<string, { startStock: number; endStock: number }> = {};
    if (supplies?.length > 0) {
      supplies.forEach(supply => {
        if (supply.supply_name) {
          emptySupplies[supply.supply_name] = { startStock: 0, endStock: 0 };
        }
      });
    }
    setSuppliesData(emptySupplies);
  };

  const setSuppliesDataDirect = (newSuppliesData: Record<string, { startStock: number; endStock: number }>) => {
    setSuppliesData(newSuppliesData);
  };

  const updateSuppliesFromDb = (dbSupplies: any[]) => {
    if (dbSupplies?.length > 0) {
      const dynamicSupplies: Record<string, { startStock: number; endStock: number }> = {};
      dbSupplies.forEach(supply => {
        if (supply.supply_name) {
          dynamicSupplies[supply.supply_name] = suppliesData[supply.supply_name] || { startStock: 0, endStock: 0 };
        }
      });
      setSuppliesData(prev => ({ ...prev, ...dynamicSupplies }));
    }
  };

  return {
    suppliesData,
    updateSupply,
    resetSupplies,
    setSuppliesDataDirect,
    updateSuppliesFromDb,
  };
};
