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
  const { saveDailySales, loadDailySales, loadServiceCounterPreload, loading: salesLoading } = useSalesRecords();
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

  // Load existing sales data and preload service counters when photocopier or date changes
  React.useEffect(() => {
    const loadExistingSalesAndPreload = async () => {
      if (user && selectedPhotocopierId) {
        console.log('Loading sales data and preload for photocopier:', selectedPhotocopierId, 'date:', selectedDate);
        
        // First, load existing sales for the selected date and photocopier
        const salesData = await loadDailySales(selectedDate, selectedPhotocopierId);
        
        // If there are existing sales for this date and photocopier, use them
        if (salesData.services && Object.keys(salesData.services).length > 0) {
          console.log('Found existing sales data for photocopier:', selectedPhotocopierId, salesData.services);
          setServices(prev => ({ ...prev, ...salesData.services }));
        } else {
          // If no existing sales, preload service counters from previous day's "Hoy" values
          const servicePreload = await loadServiceCounterPreload(selectedPhotocopierId, selectedDate);
          if (servicePreload && Object.keys(servicePreload).length > 0 && 'colorCopies' in servicePreload) {
            const typedPreload = servicePreload as ServiceState;
            console.log('Setting service counter preload from previous day for photocopier:', selectedPhotocopierId, typedPreload);
            setServices({
              colorCopies: { yesterday: typedPreload.colorCopies?.yesterday || 0, today: 0 },
              bwCopies: { yesterday: typedPreload.bwCopies?.yesterday || 0, today: 0 },
              colorPrints: { yesterday: typedPreload.colorPrints?.yesterday || 0, today: 0 },
              bwPrints: { yesterday: typedPreload.bwPrints?.yesterday || 0, today: 0 }
            });
          } else {
            // No previous data found, reset to zeros for this photocopier
            console.log('No previous service data found for photocopier:', selectedPhotocopierId, 'resetting to zeros');
            setServices({
              colorCopies: { yesterday: 0, today: 0 },
              bwCopies: { yesterday: 0, today: 0 },
              colorPrints: { yesterday: 0, today: 0 },
              bwPrints: { yesterday: 0, today: 0 }
            });
          }
        }
        
        // For supplies, only load existing data for the selected date and photocopier - NEVER preload from previous days
        if (salesData.supplies && Object.keys(salesData.supplies).length > 0) {
          console.log('Found existing supply data for photocopier:', selectedPhotocopierId, salesData.supplies);
          setSuppliesData(prev => ({ ...prev, ...salesData.supplies }));
        } else {
          // Reset supplies to empty for new dates/photocopiers - NO PREFILLING from previous days
          const emptySupplies: Record<string, { startStock: number; endStock: number }> = {};
          if (dbSupplies?.length > 0) {
            dbSupplies.forEach(supply => {
              if (supply.supply_name) {
                emptySupplies[supply.supply_name] = { startStock: 0, endStock: 0 };
              }
            });
          }
          console.log('Resetting supplies to empty for photocopier:', selectedPhotocopierId);
          setSuppliesData(emptySupplies);
        }
      }
    };
    loadExistingSalesAndPreload();
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
