
import React from 'react';
import { ServiceState } from '../types/sales';

export const useServicesState = () => {
  const [services, setServices] = React.useState<ServiceState>({
    colorCopies: { yesterday: 0, today: 0 },
    bwCopies: { yesterday: 0, today: 0 },
    colorPrints: { yesterday: 0, today: 0 },
    bwPrints: { yesterday: 0, today: 0 }
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

  const resetServices = () => {
    setServices({
      colorCopies: { yesterday: 0, today: 0 },
      bwCopies: { yesterday: 0, today: 0 },
      colorPrints: { yesterday: 0, today: 0 },
      bwPrints: { yesterday: 0, today: 0 }
    });
  };

  const setServicesData = (newServices: ServiceState) => {
    setServices(newServices);
  };

  return {
    services,
    updateService,
    resetServices,
    setServicesData,
  };
};
