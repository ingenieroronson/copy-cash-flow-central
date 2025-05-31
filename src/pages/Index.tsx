import React, { useEffect } from 'react';
import { AppWrapper } from '../components/AppWrapper';
import { DailySalesCalculator } from '../components/DailySalesCalculator';
import { useSalesState } from '../hooks/useSalesState';

const Index = () => {
  // Redirección automática a /settings
  useEffect(() => {
    window.location.replace('/settings');
  }, []);

  const {
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
  } = useSalesState();

  // Retorna null porque nunca se mostrará esta pantalla
  return null;
};

export default Index;

