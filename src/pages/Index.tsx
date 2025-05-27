
import React from 'react';
import { AuthForm } from '../components/AuthForm';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { DailySalesCalculator } from '../components/DailySalesCalculator';
import { useAuth } from '../hooks/useAuth';
import { usePricing } from '../hooks/usePricing';
import { useSupplies } from '../hooks/useSupplies';
import { useSalesRecords } from '../hooks/useSalesRecords';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { getServicePrice, getSupplyPrice, loading: pricingLoading } = usePricing();
  const { supplies: dbSupplies, loading: suppliesLoading } = useSupplies();
  const { saveDailySales, loadDailySales, loading: salesLoading } = useSalesRecords();

  const [services, setServices] = React.useState({
    colorCopies: { yesterday: 0, today: 0 },
    bwCopies: { yesterday: 0, today: 0 },
    colorPrints: { yesterday: 0, today: 0 },
    bwPrints: { yesterday: 0, today: 0 }
  });

  const [suppliesData, setSuppliesData] = React.useState<Record<string, { startStock: number; endStock: number }>>({});

  // Load existing sales data when component mounts
  React.useEffect(() => {
    const loadExistingSales = async () => {
      if (user) {
        const salesData = await loadDailySales();
        if (salesData.services && Object.keys(salesData.services).length > 0) {
          setServices(prev => ({ ...prev, ...salesData.services }));
        }
        if (salesData.supplies && Object.keys(salesData.supplies).length > 0) {
          setSuppliesData(prev => ({ ...prev, ...salesData.supplies }));
        }
      }
    };
    loadExistingSales();
  }, [user]);

  // Update supplies state when dynamic supplies are loaded
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

  if (authLoading || pricingLoading || suppliesLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthForm />;
  }

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

    await saveDailySales(services, suppliesData, servicePrices, supplyPrices);
  };

  return (
    <DailySalesCalculator
      services={services}
      suppliesData={suppliesData}
      dbSupplies={dbSupplies}
      onUpdateService={updateService}
      onUpdateSupply={updateSupply}
      onSaveSales={handleSaveSales}
      salesLoading={salesLoading}
      getServicePrice={getServicePrice}
      getSupplyPrice={getSupplyPrice}
      totalSales={getTotalSales()}
    />
  );
};

export default Index;
