
import React from 'react';
import { ServiceCard } from './ServiceCard';

interface ServiceSectionProps {
  services: {
    colorCopies: { yesterday: number; today: number; errors: number };
    bwCopies: { yesterday: number; today: number; errors: number };
    colorPrints: { yesterday: number; today: number; errors: number };
    bwPrints: { yesterday: number; today: number; errors: number };
  };
  onUpdateService: (serviceId: string, field: string, value: number) => void;
  getServicePrice: (serviceType: string) => number;
  calculateServiceTotal: (service: any, price: number) => number;
}

export const ServiceSection = ({
  services,
  onUpdateService,
  getServicePrice,
  calculateServiceTotal
}: ServiceSectionProps) => {
  return (
    <div>
      <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 mb-4 md:mb-6 px-2">Servicios de Fotocopiado</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6 px-2">
        <ServiceCard
          title="Copias a color"
          icon="printer"
          iconColor="text-orange-500"
          backgroundColor="bg-orange-50"
          service={services.colorCopies}
          onUpdate={(field, value) => onUpdateService('colorCopies', field, value)}
          total={calculateServiceTotal(services.colorCopies, getServicePrice('color_copies'))}
          difference={Math.max(0, services.colorCopies.today - (services.colorCopies.errors || 0) - services.colorCopies.yesterday)}
          price={getServicePrice('color_copies')}
        />
        
        <ServiceCard
          title="Copias blanco y negro"
          icon="printer"
          iconColor="text-gray-600"
          backgroundColor="bg-gray-50"
          service={services.bwCopies}
          onUpdate={(field, value) => onUpdateService('bwCopies', field, value)}
          total={calculateServiceTotal(services.bwCopies, getServicePrice('bw_copies'))}
          difference={Math.max(0, services.bwCopies.today - (services.bwCopies.errors || 0) - services.bwCopies.yesterday)}
          price={getServicePrice('bw_copies')}
        />
        
        <ServiceCard
          title="Impresiones a color"
          icon="printer"
          iconColor="text-orange-500"
          backgroundColor="bg-orange-50"
          service={services.colorPrints}
          onUpdate={(field, value) => onUpdateService('colorPrints', field, value)}
          total={calculateServiceTotal(services.colorPrints, getServicePrice('color_prints'))}
          difference={Math.max(0, services.colorPrints.today - (services.colorPrints.errors || 0) - services.colorPrints.yesterday)}
          price={getServicePrice('color_prints')}
        />
        
        <ServiceCard
          title="Impresiones blanco y negro"
          icon="printer"
          iconColor="text-gray-600"
          backgroundColor="bg-gray-50"
          service={services.bwPrints}
          onUpdate={(field, value) => onUpdateService('bwPrints', field, value)}
          total={calculateServiceTotal(services.bwPrints, getServicePrice('bw_prints'))}
          difference={Math.max(0, services.bwPrints.today - (services.bwPrints.errors || 0) - services.bwPrints.yesterday)}
          price={getServicePrice('bw_prints')}
        />
      </div>
    </div>
  );
};
