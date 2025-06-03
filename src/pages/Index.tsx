
import React from 'react';
import { AppWrapper } from '../components/AppWrapper';
import { DailySalesCalculator } from '../components/DailySalesCalculator';
import { useSalesState } from '../hooks/useSalesState';

const Index = () => {
  const {
    // Loading states
    authLoading,
    pricingLoading,
    suppliesLoading,
    proceduresLoading,
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
  } = useSalesState();

  return (
    <AppWrapper
      authLoading={authLoading}
      pricingLoading={pricingLoading || proceduresLoading}
      suppliesLoading={suppliesLoading}
      user={user}
    >
      <DailySalesCalculator
        services={services}
        procedures={procedures}
        suppliesData={suppliesData}
        dbSupplies={dbSupplies}
        dbProcedures={dbProcedures}
        photocopiers={photocopiers}
        selectedPhotocopierId={selectedPhotocopierId}
        selectedDate={selectedDate}
        onUpdateService={updateService}
        onUpdateProcedure={updateProcedure}
        onUpdateSupply={updateSupply}
        onPhotocopierChange={setSelectedPhotocopierId}
        onDateChange={setSelectedDate}
        onSaveSales={handleSaveSales}
        salesLoading={salesLoading}
        photocopiersLoading={photocopiersLoading}
        getServicePrice={getServicePrice}
        getProcedurePrice={getProcedurePrice}
        getSupplyPrice={getSupplyPrice}
        totalSales={getTotalSales()}
        procedureDataError={procedureDataError}
        proceduresLoading={proceduresLoading}
      />
    </AppWrapper>
  );
};

export default Index;
