
import React from 'react';
import { useAuth } from './useAuth';
import { usePricing } from './usePricing';
import { useSupplies } from './useSupplies';
import { useSalesRecords } from './useSalesRecords';
import { usePhotocopiers } from './usePhotocopiers';
import { getTodayInMexicoTimezone } from '@/utils/dateUtils';
import { ServiceState } from '../types/sales';

export const useSalesState = () => {
  const { user, loading: authLoading } = useAuth();
  const { getServicePrice, getSupplyPrice, loading: pricingLoading } = usePricing();
  const { supplies: dbSupplies, loading: suppliesLoading } = useSupplies();
  const { saveDailySales, loadDailySales, loadLatestCounters, loading: salesLoading } = useSalesRecords();
  const { photocopiers, loading: photocopiersLoading } = usePhotocopiers();

  const [selectedPhotocopierId, setSelectedPhotocopierId] = React.useState<string>('');
  
  // Get today's date in Mexico City timezone
  const [selectedDate, setSelectedDate] = React.useState<string>(() => {
    return getTodayInMexicoTimezone();
  });
  
  const [services, setServices] = React.useState<ServiceState>({
    colorCopies: { yesterday: 0, today: 0 },
    bwCopies: { yesterday: 0, today: 0 },
    colorPrints: { yesterday: 0, today: 0 },
    bwPrints: { yesterday: 0, today: 0 }
  });

  const [suppliesData, setSuppliesData] = React.useState<Record<string, { startStock: number; endStock: number }>>({});

  // Set default photocopier when photocopiers are loaded
  React.useEffect(() => {
    if (photocopiers.length > 0 && !selectedPhotocopierId) {
      setSelectedPhotocopierId(photocopiers[0].id);
    }
  }, [photocopiers, selectedPhotocopierId]);

  // Load existing sales data and prefill "yesterday" values for services only when photocopier or date changes
  React.useEffect(() => {
    const loadExistingSales = async () => {
      if (user && selectedPhotocopierId) {
        // First, load existing sales for the selected date
        const salesData = await loadDailySales(selectedDate, selectedPhotocopierId);
        
        // If there are existing sales for this date, use them
        if (salesData.services && Object.keys(salesData.services).length > 0) {
          setServices(prev => ({ ...prev, ...salesData.services }));
        } else {
          // If no existing sales, prefill "yesterday" values for services only from previous day's records
          const latestCounters = await loadLatestCounters(selectedPhotocopierId, selectedDate);
          if (latestCounters && Object.keys(latestCounters).length > 0 && 'colorCopies' in latestCounters) {
            const typedCounters = latestCounters as ServiceState;
            setServices(prev => ({
              colorCopies: { yesterday: typedCounters.colorCopies?.yesterday || 0, today: prev.colorCopies.today },
              bwCopies: { yesterday: typedCounters.bwCopies?.yesterday || 0, today: prev.bwCopies.today },
              colorPrints: { yesterday: typedCounters.colorPrints?.yesterday || 0, today: prev.colorPrints.today },
              bwPrints: { yesterday: typedCounters.bwPrints?.yesterday || 0, today: prev.bwPrints.today }
            }));
          }
        }
        
        // For supplies, only load existing data for the selected date - never preload from previous days
        if (salesData.supplies && Object.keys(salesData.supplies).length > 0) {
          setSuppliesData(prev => ({ ...prev, ...salesData.supplies }));
        } else {
          // Reset supplies to empty for new dates - no prefilling from previous days
          const emptySupplies: Record<string, { startStock: number; endStock: number }> = {};
          if (dbSupplies?.length > 0) {
            dbSupplies.forEach(supply => {
              if (supply.supply_name) {
                emptySupplies[supply.supply_name] = { startStock: 0, endStock: 0 };
              }
            });
          }
          setSuppliesData(emptySupplies);
        }
      }
    };
    loadExistingSales();
  }, [user, selectedPhotocopierId, selectedDate, dbSupplies]);

  // Update supplies state when dynamic supplies are loaded (only if not already set)
  React.useEffect(() => {
    if (dbSupplies?.length > 0) {
      const dynamicSupplies: Record<string, { startStock: number; endStock: number }> = {};
      dbSupplies.forEach(supply => {
        if (supply.supply_name) {
          dynamicSupplies[supply.supply_name] = suppliesData[supply.supply_name] || { startStock: 0, endStock: 0 };
        }
      });
      setSuppliesData(prev => ({ ...prev, ...dynamicSupplies }));
    }
  }, [dbSupplies]);

  const updateService = (serviceId: string, field: string, value: number) => {
    setServices(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        [field]: value
      }
    }));
  };

  const updateSupply = (supplyId: string, field: string, value: number) => {
    setSuppliesData(prev => ({
      ...prev,
      [supplyId]: {
        ...prev[supplyId],
        [field]: value
      }
    }));
  };

  const calculateServiceTotal = (service: any, price: number) => {
    const difference = Math.max(0, service.today - service.yesterday);
    return difference * price;
  };

  const calculateSupplyTotal = (supply: any, price: number) => {
    const sold = Math.max(0, supply.startStock - supply.endStock);
    return sold * price;
  };

  const getTotalSales = () => {
    const serviceTotal = 
      calculateServiceTotal(services.colorCopies, getServicePrice('color_copies')) +
      calculateServiceTotal(services.bwCopies, getServicePrice('bw_copies')) +
      calculateServiceTotal(services.colorPrints, getServicePrice('color_prints')) +
      calculateServiceTotal(services.bwPrints, getServicePrice('bw_prints'));
    
    const supplyTotal = Object.entries(suppliesData).reduce((total, [supplyName, supplyData]) => {
      return total + calculateSupplyTotal(supplyData, getSupplyPrice(supplyName));
    }, 0);
    
    return serviceTotal + supplyTotal;
  };

  const handleSaveSales = async () => {
    if (!selectedPhotocopierId) return;

    const servicePrices = {
      color_copies: getServicePrice('color_copies'),
      bw_copies: getServicePrice('bw_copies'),
      color_prints: getServicePrice('color_prints'),
      bw_prints: getServicePrice('bw_prints')
    };

    const supplyPrices: Record<string, number> = {};
    Object.keys(suppliesData).forEach(supplyName => {
      supplyPrices[supplyName] = getSupplyPrice(supplyName);
    });

    await saveDailySales(services, suppliesData, servicePrices, supplyPrices, selectedPhotocopierId, selectedDate);
  };

  return {
    // Loading states
    authLoading,
    pricingLoading,
    suppliesLoading,
    salesLoading,
    photocopiersLoading,
    
    // User and auth
    user,
    
    // Data
    services,
    suppliesData,
    dbSupplies,
    photocopiers,
    selectedPhotocopierId,
    selectedDate,
    
    // Actions
    updateService,
    updateSupply,
    setSelectedPhotocopierId,
    setSelectedDate,
    handleSaveSales,
    
    // Calculations
    calculateServiceTotal,
    calculateSupplyTotal,
    getTotalSales,
    getServicePrice,
    getSupplyPrice,
  };
};
