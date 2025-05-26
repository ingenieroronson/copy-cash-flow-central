
import React from 'react';
import { ServiceCard } from '../components/ServiceCard';
import { SupplyCard } from '../components/SupplyCard';
import { SummaryCard } from '../components/SummaryCard';
import { Header } from '../components/Header';
import { AuthForm } from '../components/AuthForm';
import { useAuth } from '../hooks/useAuth';
import { usePricing } from '../hooks/usePricing';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { getServicePrice, getSupplyPrice, loading: pricingLoading } = usePricing();

  if (authLoading) {
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

  // Mock data for now - will be connected to database later
  const [services, setServices] = React.useState({
    colorCopies: { yesterday: 0, today: 0 },
    bwCopies: { yesterday: 0, today: 0 },
    colorPrints: { yesterday: 0, today: 0 },
    bwPrints: { yesterday: 0, today: 0 }
  });

  const [supplies, setSupplies] = React.useState({
    coloredFolders: { startStock: 0, endStock: 0 },
    radiographicEnvelopes: { startStock: 0, endStock: 0 }
  });

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
    setSupplies(prev => ({
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
    
    const supplyTotal = 
      calculateSupplyTotal(supplies.coloredFolders, getSupplyPrice('coloredFolders')) +
      calculateSupplyTotal(supplies.radiographicEnvelopes, getSupplyPrice('radiographicEnvelopes'));
    
    return serviceTotal + supplyTotal;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xl text-gray-600">Calculadora de Ventas Diarias</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <SupplyCard
                  title="Carpetas de colores"
                  icon="file"
                  iconColor="text-blue-500"
                  backgroundColor="bg-blue-50"
                  supply={supplies.coloredFolders}
                  onUpdate={(field, value) => updateSupply('coloredFolders', field, value)}
                  total={calculateSupplyTotal(supplies.coloredFolders, getSupplyPrice('coloredFolders'))}
                  sold={Math.max(0, supplies.coloredFolders.startStock - supplies.coloredFolders.endStock)}
                  price={getSupplyPrice('coloredFolders')}
                />
                
                <SupplyCard
                  title="Sobres radiográficos"
                  icon="file"
                  iconColor="text-green-500"
                  backgroundColor="bg-green-50"
                  supply={supplies.radiographicEnvelopes}
                  onUpdate={(field, value) => updateSupply('radiographicEnvelopes', field, value)}
                  total={calculateSupplyTotal(supplies.radiographicEnvelopes, getSupplyPrice('radiographicEnvelopes'))}
                  sold={Math.max(0, supplies.radiographicEnvelopes.startStock - supplies.radiographicEnvelopes.endStock)}
                  price={getSupplyPrice('radiographicEnvelopes')}
                />
              </div>
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
