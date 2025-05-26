
import React from 'react';
import { ServiceCard } from '../components/ServiceCard';
import { SupplyCard } from '../components/SupplyCard';
import { SummaryCard } from '../components/SummaryCard';
import { Header } from '../components/Header';
import { AuthForm } from '../components/AuthForm';
import { Button } from '@/components/ui/button';
import { useAuth } from '../hooks/useAuth';
import { usePricing } from '../hooks/usePricing';
import { useSupplies } from '../hooks/useSupplies';
import { useSalesRecords } from '../hooks/useSalesRecords';
import { Save, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { getServicePrice, getSupplyPrice, loading: pricingLoading } = usePricing();
  const { supplies: dbSupplies, loading: suppliesLoading } = useSupplies();
  const { saveDailySales, loadDailySales, loading: salesLoading } = useSalesRecords();

  // Move all useState hooks to the top, before any conditional returns
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

  // Now the conditional returns come after all hooks
  if (authLoading || pricingLoading || suppliesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="text-center sm:text-left">
              <p className="text-xl text-gray-600">Calculadora de Ventas Diarias</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={() => navigate('/settings')}
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </Button>
              <Button
                onClick={handleSaveSales}
                disabled={salesLoading}
                className="flex-1 sm:flex-none"
              >
                <Save className="w-4 h-4 mr-2" />
                {salesLoading ? 'Guardando...' : 'Guardar Ventas'}
              </Button>
            </div>
          </div>

          <div className="space-y-8">
            {/* Photocopying Services */}
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">Servicios de Fotocopiado</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <ServiceCard
                  title="Copias a color"
                  icon="printer"
                  iconColor="text-orange-500"
                  backgroundColor="bg-orange-50"
                  service={services.colorCopies}
                  onUpdate={(field, value) => updateService('colorCopies', field, value)}
                  total={calculateServiceTotal(services.colorCopies, getServicePrice('color_copies'))}
                  difference={Math.max(0, services.colorCopies.today - services.colorCopies.yesterday)}
                  price={getServicePrice('color_copies')}
                />
                
                <ServiceCard
                  title="Copias blanco y negro"
                  icon="printer"
                  iconColor="text-gray-600"
                  backgroundColor="bg-gray-50"
                  service={services.bwCopies}
                  onUpdate={(field, value) => updateService('bwCopies', field, value)}
                  total={calculateServiceTotal(services.bwCopies, getServicePrice('bw_copies'))}
                  difference={Math.max(0, services.bwCopies.today - services.bwCopies.yesterday)}
                  price={getServicePrice('bw_copies')}
                />
                
                <ServiceCard
                  title="Impresiones a color"
                  icon="printer"
                  iconColor="text-orange-500"
                  backgroundColor="bg-orange-50"
                  service={services.colorPrints}
                  onUpdate={(field, value) => updateService('colorPrints', field, value)}
                  total={calculateServiceTotal(services.colorPrints, getServicePrice('color_prints'))}
                  difference={Math.max(0, services.colorPrints.today - services.colorPrints.yesterday)}
                  price={getServicePrice('color_prints')}
                />
                
                <ServiceCard
                  title="Impresiones blanco y negro"
                  icon="printer"
                  iconColor="text-gray-600"
                  backgroundColor="bg-gray-50"
                  service={services.bwPrints}
                  onUpdate={(field, value) => updateService('bwPrints', field, value)}
                  total={calculateServiceTotal(services.bwPrints, getServicePrice('bw_prints'))}
                  difference={Math.max(0, services.bwPrints.today - services.bwPrints.yesterday)}
                  price={getServicePrice('bw_prints')}
                />
              </div>
            </div>

            {/* Supply Sales */}
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">Ventas de Suministros</h2>
              {dbSupplies && dbSupplies.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {dbSupplies.map((supply, index) => (
                    <SupplyCard
                      key={supply.id}
                      title={supply.supply_name || 'Suministro'}
                      icon="file"
                      iconColor="text-purple-500"
                      backgroundColor="bg-purple-50"
                      supply={suppliesData[supply.supply_name!] || { startStock: 0, endStock: 0 }}
                      onUpdate={(field, value) => updateSupply(supply.supply_name!, field, value)}
                      total={calculateSupplyTotal(suppliesData[supply.supply_name!] || { startStock: 0, endStock: 0 }, supply.unit_price)}
                      sold={Math.max(0, (suppliesData[supply.supply_name!]?.startStock || 0) - (suppliesData[supply.supply_name!]?.endStock || 0))}
                      price={supply.unit_price}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-500 text-lg mb-4">No hay suministros configurados</p>
                  <Button
                    onClick={() => navigate('/settings')}
                    variant="outline"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Ir a Configuración
                  </Button>
                </div>
              )}
            </div>

            {/* Summary */}
            <SummaryCard total={getTotalSales()} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
