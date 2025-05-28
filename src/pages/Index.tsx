
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
  } = useSalesState();

  return (
    <AppWrapper
      authLoading={authLoading}
      pricingLoading={pricingLoading}
      suppliesLoading={suppliesLoading}
      user={user}
    >
      <DailySalesCalculator
        services={services}
        suppliesData={suppliesData}
        dbSupplies={dbSupplies}
        photocopiers={photocopiers}
        selectedPhotocopierId={selectedPhotocopierId}
        selectedDate={selectedDate}
        onUpdateService={updateService}
        onUpdateSupply={updateSupply}
        onPhotocopierChange={setSelectedPhotocopierId}
        onDateChange={setSelectedDate}
        onSaveSales={handleSaveSales}
        salesLoading={salesLoading}
        photocopiersLoading={photocopiersLoading}
        getServicePrice={getServicePrice}
        getSupplyPrice={getSupplyPrice}
        totalSales={getTotalSales()}
      />
    </AppWrapper>
  );
};

export default Index;
