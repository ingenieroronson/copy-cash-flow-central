
import React from 'react';
import { useAuth } from './useAuth';
import { usePricing } from './usePricing';
import { useSupplies } from './useSupplies';
import { useProcedures } from './useProcedures';
import { useSalesRecords } from './useSalesRecords';
import { usePhotocopierDateState } from './usePhotocopierDateState';
import { useServicesState } from './useServicesState';
import { useSuppliesState } from './useSuppliesState';
import { useProceduresState } from './useProceduresState';
import { calculateServiceTotal, calculateSupplyTotal } from '@/utils/salesCalculations';
import { ServiceState } from '../types/sales';

export const useSalesState = () => {
  const { user, loading: authLoading } = useAuth();
  const { getServicePrice, getSupplyPrice, loading: pricingLoading } = usePricing();
  const { supplies: dbSupplies, loading: suppliesLoading } = useSupplies();
  const { procedures: dbProcedures, getProcedurePrice, loading: proceduresLoading } = useProcedures();
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
    procedures,
    updateProcedure,
    resetProcedures,
    setProceduresData,
    updateProceduresFromDb,
  } = useProceduresState();

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
        
        const salesData = await loadDailySales(selectedDate, selectedPhotocopierId);
        
        if (salesData.services && Object.keys(salesData.services).length > 0) {
          console.log('Found existing sales data for photocopier:', selectedPhotocopierId, salesData.services);
          setServicesData({ ...services, ...salesData.services });
        } else {
          const servicePreload = await loadServiceCounterPreload(selectedPhotocopierId, selectedDate);
          if (servicePreload && Object.keys(servicePreload).length > 0 && 'colorCopies' in servicePreload) {
            const typedPreload = servicePreload as ServiceState;
            console.log('Setting service counter preload from previous day for photocopier:', selectedPhotocopierId, typedPreload);
            setServicesData({
              colorCopies: { yesterday: typedPreload.colorCopies?.yesterday || 0, today: 0, errors: 0 },
              bwCopies: { yesterday: typedPreload.bwCopies?.yesterday || 0, today: 0, errors: 0 },
              colorPrints: { yesterday: typedPreload.colorPrints?.yesterday || 0, today: 0, errors: 0 },
              bwPrints: { yesterday: typedPreload.bwPrints?.yesterday || 0, today: 0, errors: 0 }
            });
          } else {
            console.log('No previous service data found for photocopier:', selectedPhotocopierId, 'setting all values to 0');
            resetServices();
          }
        }
        
        // Handle procedures data
        if (salesData.procedures && Object.keys(salesData.procedures).length > 0) {
          console.log('Found existing procedure data for photocopier:', selectedPhotocopierId, salesData.procedures);
          setProceduresData({ ...procedures, ...salesData.procedures });
        } else {
          console.log('Resetting procedures for photocopier:', selectedPhotocopierId);
          resetProcedures(dbProcedures);
        }
        
        if (salesData.supplies && Object.keys(salesData.supplies).length > 0) {
          console.log('Found existing supply data for photocopier:', selectedPhotocopierId, salesData.supplies);
          setSuppliesDataDirect({ ...suppliesData, ...salesData.supplies });
        } else {
          console.log('Resetting supplies to empty for photocopier:', selectedPhotocopierId);
          resetSupplies(dbSupplies);
        }
      }
    };
    loadExistingSalesAndPreload();
  }, [user, selectedPhotocopierId, selectedDate, dbSupplies, dbProcedures]);

  React.useEffect(() => {
    updateSuppliesFromDb(dbSupplies);
  }, [dbSupplies]);

  React.useEffect(() => {
    updateProceduresFromDb(dbProcedures);
  }, [dbProcedures]);

  const calculateProcedureTotal = (procedure: any, price: number) => {
    const difference = Math.max(0, procedure.today - (procedure.errors || 0) - procedure.yesterday);
    return difference * price;
  };

  const getTotalSales = () => {
    const serviceTotal = 
      calculateServiceTotal(services.colorCopies, getServicePrice('color_copies')) +
      calculateServiceTotal(services.bwCopies, getServicePrice('bw_copies')) +
      calculateServiceTotal(services.colorPrints, getServicePrice('color_prints')) +
      calculateServiceTotal(services.bwPrints, getServicePrice('bw_prints'));
    
    const procedureTotal = Object.entries(procedures).reduce((total, [procedureName, procedureData]) => {
      return total + calculateProcedureTotal(procedureData, getProcedurePrice(procedureName));
    }, 0);
    
    const supplyTotal = Object.entries(suppliesData).reduce((total, [supplyName, supplyData]) => {
      return total + calculateSupplyTotal(supplyData, getSupplyPrice(supplyName));
    }, 0);
    
    return serviceTotal + procedureTotal + supplyTotal;
  };

  const handleSaveSales = async () => {
    if (!selectedPhotocopierId) return;

    const servicePrices = {
      color_copies: getServicePrice('color_copies'),
      bw_copies: getServicePrice('bw_copies'),
      color_prints: getServicePrice('color_prints'),
      bw_prints: getServicePrice('bw_prints')
    };

    const procedurePrices: Record<string, number> = {};
    Object.keys(procedures).forEach(procedureName => {
      procedurePrices[procedureName] = getProcedurePrice(procedureName);
    });

    const supplyPrices: Record<string, number> = {};
    Object.keys(suppliesData).forEach(supplyName => {
      supplyPrices[supplyName] = getSupplyPrice(supplyName);
    });

    await saveDailySales(services, procedures, suppliesData, servicePrices, procedurePrices, supplyPrices, selectedPhotocopierId, selectedDate);
  };

  return {
    // Loading states
    authLoading,
    pricingLoading,
    suppliesLoading,
    proceduresLoading,
    salesLoading,
    photocopiersLoading,
    
    // User and auth
    user,
    
    // Data
    services,
    procedures,
    suppliesData,
    dbSupplies,
    dbProcedures,
    photocopiers,
    selectedPhotocopierId,
    selectedDate,
    
    // Actions
    updateService,
    updateProcedure,
    updateSupply,
    setSelectedPhotocopierId,
    setSelectedDate,
    handleSaveSales,
    
    // Calculations
    calculateServiceTotal,
    calculateProcedureTotal,
    calculateSupplyTotal,
    getTotalSales,
    getServicePrice,
    getProcedurePrice,
    getSupplyPrice,
  };
};
