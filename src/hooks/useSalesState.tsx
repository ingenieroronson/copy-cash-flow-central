
import React from 'react';
import { useAuth } from './useAuth';
import { usePricing } from './usePricing';
import { useSupplies } from './useSupplies';
import { useSalesRecords } from './useSalesRecords';
import { usePhotocopierDateState } from './usePhotocopierDateState';
import { useServicesState } from './useServicesState';
import { useSuppliesState } from './useSuppliesState';
import { calculateServiceTotal, calculateSupplyTotal } from '@/utils/salesCalculations';
import { ServiceState } from '../types/sales';

export const useSalesState = () => {
  const { user, loading: authLoading } = useAuth();
  const { getServicePrice, getSupplyPrice, loading: pricingLoading } = usePricing();
  const { supplies: dbSupplies, loading: suppliesLoading } = useSupplies();
  const { saveDailySales, loadDailySales, loadServiceCounterPreload, loading: salesLoading } = useSalesRecords();
  
  const {
    photocopiers,
    photocopiersLoading,
    selectedPhotocopierId,
    selectedDate,
    setSelectedPhotocopierId,
    setSelectedDate,
  } = usePhotocopierDateState();

  const {
    services,
    updateService,
    resetServices,
    setServicesData,
  } = useServicesState();

  const {
    suppliesData,
    updateSupply,
    resetSupplies,
    setSuppliesDataDirect,
    updateSuppliesFromDb,
  } = useSuppliesState();

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
          setServicesData({ ...services, ...salesData.services });
        } else {
          // If no existing sales, preload service counters from previous day's "Hoy" values
          // This loads ONLY the "Ayer" field, leaving "Hoy" and "errors" empty for new data entry
          const servicePreload = await loadServiceCounterPreload(selectedPhotocopierId, selectedDate);
          if (servicePreload && Object.keys(servicePreload).length > 0 && 'colorCopies' in servicePreload) {
            const typedPreload = servicePreload as ServiceState;
            console.log('Setting service counter preload from previous day for photocopier:', selectedPhotocopierId, typedPreload);
            // Ensure "Hoy" (today) and "errors" values are always 0 for new entries
            setServicesData({
              colorCopies: { yesterday: typedPreload.colorCopies?.yesterday || 0, today: 0, errors: 0 },
              bwCopies: { yesterday: typedPreload.bwCopies?.yesterday || 0, today: 0, errors: 0 },
              colorPrints: { yesterday: typedPreload.colorPrints?.yesterday || 0, today: 0, errors: 0 },
              bwPrints: { yesterday: typedPreload.bwPrints?.yesterday || 0, today: 0, errors: 0 }
            });
          } else {
            // No previous data found, set "Ayer", "Hoy", and "errors" to 0 for this photocopier
            console.log('No previous service data found for photocopier:', selectedPhotocopierId, 'setting all values to 0');
            resetServices();
          }
        }
        
        // For supplies, only load existing data for the selected date and photocopier - NEVER preload from previous days
        if (salesData.supplies && Object.keys(salesData.supplies).length > 0) {
          console.log('Found existing supply data for photocopier:', selectedPhotocopierId, salesData.supplies);
          setSuppliesDataDirect({ ...suppliesData, ...salesData.supplies });
        } else {
          // Reset supplies to empty for new dates/photocopiers - NO PREFILLING from previous days
          console.log('Resetting supplies to empty for photocopier:', selectedPhotocopierId);
          resetSupplies(dbSupplies);
        }
      }
    };
    loadExistingSalesAndPreload();
  }, [user, selectedPhotocopierId, selectedDate, dbSupplies]);

  // Update supplies state when dynamic supplies are loaded (only if not already set)
  React.useEffect(() => {
    updateSuppliesFromDb(dbSupplies);
  }, [dbSupplies]);

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
