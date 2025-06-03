
import React from 'react';
import { ServiceState } from '../types/sales';
import { checkAndPerformServiceRollover } from '@/utils/serviceRollover';

export const useServicesState = () => {
  const [services, setServices] = React.useState<ServiceState>({
    colorCopies: { yesterday: 0, today: 0, errors: 0 },
    bwCopies: { yesterday: 0, today: 0, errors: 0 },
    colorPrints: { yesterday: 0, today: 0, errors: 0 },
    bwPrints: { yesterday: 0, today: 0, errors: 0 }
  });

  // Check for rollover on mount and whenever services change
  React.useEffect(() => {
    const rolledOverServices = checkAndPerformServiceRollover(services);
    if (rolledOverServices) {
      console.log('Applying automatic service rollover');
      setServices(rolledOverServices);
    }
  }, []); // Only run on mount to avoid infinite loops

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
      colorCopies: { yesterday: 0, today: 0, errors: 0 },
      bwCopies: { yesterday: 0, today: 0, errors: 0 },
      colorPrints: { yesterday: 0, today: 0, errors: 0 },
      bwPrints: { yesterday: 0, today: 0, errors: 0 }
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
