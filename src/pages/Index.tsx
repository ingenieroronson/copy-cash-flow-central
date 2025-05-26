
import React, { useState } from 'react';
import { ServiceCard } from '../components/ServiceCard';
import { SupplyCard } from '../components/SupplyCard';
import { SummaryCard } from '../components/SummaryCard';
import { Printer } from 'lucide-react';

const Index = () => {
  const [services, setServices] = useState({
    colorCopies: { yesterday: 0, today: 0, price: 0.50 },
    bwCopies: { yesterday: 0, today: 0, price: 0.10 },
    colorPrints: { yesterday: 0, today: 0, price: 0.25 },
    bwPrints: { yesterday: 0, today: 0, price: 0.15 }
  });

  const [supplies, setSupplies] = useState({
    coloredFolders: { startStock: 0, endStock: 0, price: 2.50 },
    radiographicEnvelopes: { startStock: 0, endStock: 0, price: 1.75 }
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

  const calculateServiceTotal = (service) => {
    const difference = Math.max(0, service.today - service.yesterday);
    return difference * service.price;
  };

  const calculateSupplyTotal = (supply) => {
    const sold = Math.max(0, supply.startStock - supply.endStock);
    return sold * supply.price;
  };

  const getTotalSales = () => {
    const serviceTotal = Object.values(services).reduce((sum, service) => 
      sum + calculateServiceTotal(service), 0
    );
    const supplyTotal = Object.values(supplies).reduce((sum, supply) => 
      sum + calculateSupplyTotal(supply), 0
    );
    return serviceTotal + supplyTotal;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Printer className="w-8 h-8 text-orange-500" />
            <h1 className="text-4xl font-bold text-gray-800">Integracopias</h1>
          </div>
          <p className="text-xl text-gray-600">Calculadora de Ventas Diarias</p>
        </div>

        <div className="space-y-8">
          {/* Photocopying Services */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Servicios de Fotocopiado</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ServiceCard
                title="Copias a color"
                icon="printer"
                iconColor="text-orange-500"
                backgroundColor="bg-orange-50"
                service={services.colorCopies}
                onUpdate={(field, value) => updateService('colorCopies', field, value)}
                total={calculateServiceTotal(services.colorCopies)}
                difference={Math.max(0, services.colorCopies.today - services.colorCopies.yesterday)}
              />
              
              <ServiceCard
                title="Copias blanco y negro"
                icon="printer"
                iconColor="text-gray-600"
                backgroundColor="bg-gray-50"
                service={services.bwCopies}
                onUpdate={(field, value) => updateService('bwCopies', field, value)}
                total={calculateServiceTotal(services.bwCopies)}
                difference={Math.max(0, services.bwCopies.today - services.bwCopies.yesterday)}
              />
              
              <ServiceCard
                title="Impresiones a color"
                icon="printer"
                iconColor="text-orange-500"
                backgroundColor="bg-orange-50"
                service={services.colorPrints}
                onUpdate={(field, value) => updateService('colorPrints', field, value)}
                total={calculateServiceTotal(services.colorPrints)}
                difference={Math.max(0, services.colorPrints.today - services.colorPrints.yesterday)}
              />
              
              <ServiceCard
                title="Impresiones blanco y negro"
                icon="printer"
                iconColor="text-gray-600"
                backgroundColor="bg-gray-50"
                service={services.bwPrints}
                onUpdate={(field, value) => updateService('bwPrints', field, value)}
                total={calculateServiceTotal(services.bwPrints)}
                difference={Math.max(0, services.bwPrints.today - services.bwPrints.yesterday)}
              />
            </div>
          </div>

          {/* Supply Sales */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Ventas de Suministros</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SupplyCard
                title="Carpetas de colores"
                icon="file"
                iconColor="text-blue-500"
                backgroundColor="bg-blue-50"
                supply={supplies.coloredFolders}
                onUpdate={(field, value) => updateSupply('coloredFolders', field, value)}
                total={calculateSupplyTotal(supplies.coloredFolders)}
                sold={Math.max(0, supplies.coloredFolders.startStock - supplies.coloredFolders.endStock)}
              />
              
              <SupplyCard
                title="Sobres radiográficos"
                icon="file"
                iconColor="text-green-500"
                backgroundColor="bg-green-50"
                supply={supplies.radiographicEnvelopes}
                onUpdate={(field, value) => updateSupply('radiographicEnvelopes', field, value)}
                total={calculateSupplyTotal(supplies.radiographicEnvelopes)}
                sold={Math.max(0, supplies.radiographicEnvelopes.startStock - supplies.radiographicEnvelopes.endStock)}
              />
            </div>
          </div>

          {/* Summary */}
          <SummaryCard total={getTotalSales()} />
        </div>
      </div>
    </div>
  );
};

export default Index;
