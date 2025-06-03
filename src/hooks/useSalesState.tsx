
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
import { checkAndPerformServiceRollover } from '@/utils/serviceRollover';
import { ServiceState } from '../types/sales';
import { supabase } from '@/integrations/supabase/client';

export const useSalesState = () => {
  const { user, loading: authLoading } = useAuth();
  const { getServicePrice, getSupplyPrice, loading: pricingLoading } = usePricing();
  const { supplies: dbSupplies, loading: suppliesLoading } = useSupplies();
  const { procedures: dbProcedures, getProcedurePrice, loading: proceduresLoading } = useProcedures();
  const { saveDailySales, loadDailySales, loadServiceCounterPreload, loading: salesLoading } = useSalesRecords();
  
  const [procedureDataLoading, setProcedureDataLoading] = React.useState(false);
  const [procedureDataError, setProcedureDataError] = React.useState<string | null>(null);
  
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

  // Load procedure sales data for historical dates
  const loadProcedureSalesData = async (date: string, photocopierId: string) => {
    if (!user || !photocopierId) return {};

    setProcedureDataLoading(true);
    setProcedureDataError(null);

    try {
      const { data: procedureRecords, error } = await supabase
        .from('procedure_sales')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('fecha', date)
        .eq('fotocopiadora_id', photocopierId);

      if (error) throw error;

      if (!procedureRecords || procedureRecords.length === 0) {
        console.log('No procedure sales data found for date:', date, 'photocopier:', photocopierId);
        return {};
      }

      // Transform procedure sales data to the format expected by the UI
      const procedureData: Record<string, any> = {};
      for (const record of procedureRecords) {
        if (record.procedure_name) {
          procedureData[record.procedure_name] = {
            yesterday: record.valor_anterior || 0,
            today: record.valor_actual || 0,
            errors: record.errores || 0
          };
        }
      }

      console.log('Loaded procedure sales data for date:', date, procedureData);
      return procedureData;

    } catch (error) {
      console.error('Error loading procedure sales data:', error);
      setProcedureDataError('Error al cargar datos de procedimientos');
      return {};
    } finally {
      setProcedureDataLoading(false);
    }
  };

  // Load existing sales data and preload service counters when photocopier or date changes
  React.useEffect(() => {
    const loadExistingSalesAndPreload = async () => {
      if (user && selectedPhotocopierId) {
        console.log('Loading sales data and preload for photocopier:', selectedPhotocopierId, 'date:', selectedDate);
        
        const salesData = await loadDailySales(selectedDate, selectedPhotocopierId);
        
        if (salesData.services && Object.keys(salesData.services).length > 0) {
          console.log('Found existing sales data for photocopier:', selectedPhotocopierId, salesData.services);
          
          // Check for rollover before setting existing data
          const rolledOverServices = checkAndPerformServiceRollover(salesData.services as ServiceState);
          if (rolledOverServices) {
            console.log('Applying rollover to existing sales data');
            setServicesData(rolledOverServices);
          } else {
            setServicesData({ ...services, ...salesData.services });
          }
        } else {
          const servicePreload = await loadServiceCounterPreload(selectedPhotocopierId, selectedDate);
          if (servicePreload && Object.keys(servicePreload).length > 0 && 'colorCopies' in servicePreload) {
            const typedPreload = servicePreload as ServiceState;
            console.log('Setting service counter preload from previous day for photocopier:', selectedPhotocopierId, typedPreload);
            
            // Check for rollover before setting preload data
            const rolledOverServices = checkAndPerformServiceRollover(typedPreload);
            if (rolledOverServices) {
              console.log('Applying rollover to preload data');
              setServicesData(rolledOverServices);
            } else {
              setServicesData({
                colorCopies: { yesterday: typedPreload.colorCopies?.yesterday || 0, today: 0, errors: 0 },
                bwCopies: { yesterday: typedPreload.bwCopies?.yesterday || 0, today: 0, errors: 0 },
                colorPrints: { yesterday: typedPreload.colorPrints?.yesterday || 0, today: 0, errors: 0 },
                bwPrints: { yesterday: typedPreload.bwPrints?.yesterday || 0, today: 0, errors: 0 }
              });
            }
          } else {
            console.log('No previous service data found for photocopier:', selectedPhotocopierId, 'setting all values to 0');
            resetServices();
          }
        }
        
        // Handle procedures data - load from procedure_sales table for historical dates
        const procedureSalesData = await loadProcedureSalesData(selectedDate, selectedPhotocopierId);
        
        if (procedureSalesData && Object.keys(procedureSalesData).length > 0) {
          console.log('Found procedure sales data for photocopier:', selectedPhotocopierId, procedureSalesData);
          setProceduresData({ ...procedures, ...procedureSalesData });
        } else if (salesData && 'procedures' in salesData && salesData.procedures && Object.keys(salesData.procedures).length > 0) {
          console.log('Found existing procedure data for photocopier:', selectedPhotocopierId, salesData.procedures);
          setProceduresData({ ...procedures, ...salesData.procedures });
        } else {
          console.log('Resetting procedures for photocopier:', selectedPhotocopierId);
          resetProcedures(dbProcedures);
        }
        
        if (salesData && 'supplies' in salesData && salesData.supplies && Object.keys(salesData.supplies).length > 0) {
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
    proceduresLoading: proceduresLoading || procedureDataLoading,
    salesLoading,
    photocopiersLoading,
    procedureDataError,
    
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
