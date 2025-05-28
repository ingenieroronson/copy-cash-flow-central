
import type { Services, Supplies, ServicePrices, SupplyPrices, ServiceRecord, SupplyRecord } from '@/types/sales';

export const processServiceRecords = (
  services: Services,
  servicePrices: ServicePrices,
  userId: string,
  date: string,
  photocopierId: string
): ServiceRecord[] => {
  const records: ServiceRecord[] = [];

  Object.entries(services).forEach(([serviceKey, serviceData]) => {
    if (!serviceData) return;

    let serviceType = '';
    let price = 0;

    switch (serviceKey) {
      case 'colorCopies':
        serviceType = 'copias_color';
        price = servicePrices.color_copies || 0;
        break;
      case 'bwCopies':
        serviceType = 'copias_bn';
        price = servicePrices.bw_copies || 0;
        break;
      case 'colorPrints':
        serviceType = 'impresion_color';
        price = servicePrices.color_prints || 0;
        break;
      case 'bwPrints':
        serviceType = 'impresion_bn';
        price = servicePrices.bw_prints || 0;
        break;
      default:
        return;
    }

    const quantity = Math.max(0, serviceData.today - serviceData.yesterday);
    const total = quantity * price;

    if (quantity > 0) {
      records.push({
        usuario_id: userId,
        fecha: date,
        tipo: serviceType,
        cantidad: quantity,
        precio_unitario: price,
        total: total,
        valor_anterior: serviceData.yesterday,
        valor_actual: serviceData.today,
        fotocopiadora_id: photocopierId
      });
    }
  });

  return records;
};

export const processSupplyRecords = (
  suppliesData: Supplies,
  supplyPrices: SupplyPrices,
  userId: string,
  date: string,
  photocopierId: string
): SupplyRecord[] => {
  const records: SupplyRecord[] = [];

  Object.entries(suppliesData).forEach(([supplyName, supplyData]) => {
    if (!supplyData) return;

    const quantity = Math.max(0, supplyData.startStock - supplyData.endStock);
    const price = supplyPrices[supplyName] || 0;
    const total = quantity * price;

    if (quantity > 0) {
      records.push({
        usuario_id: userId,
        fecha: date,
        fotocopiadora_id: photocopierId, // Ensure photocopier ID is always included
        nombre_insumo: supplyName,
        cantidad: quantity,
        precio_unitario: price,
        total: total
      });
    }
  });

  return records;
};

export const transformLoadedData = (
  serviceRecords: any[],
  supplyRecords: any[]
) => {
  const services: Services = {};
  const supplies: Supplies = {};

  // Process service records
  serviceRecords.forEach(record => {
    let serviceKey = '';
    
    switch (record.tipo) {
      case 'copias_color':
        serviceKey = 'colorCopies';
        break;
      case 'copias_bn':
        serviceKey = 'bwCopies';
        break;
      case 'impresion_color':
        serviceKey = 'colorPrints';
        break;
      case 'impresion_bn':
        serviceKey = 'bwPrints';
        break;
      default:
        return;
    }

    services[serviceKey] = {
      yesterday: record.valor_anterior || 0,
      today: record.valor_actual || 0
    };
  });

  // Process supply records
  supplyRecords.forEach(record => {
    if (record.nombre_insumo) {
      // Calculate start and end stock from quantity sold
      const quantitySold = record.cantidad || 0;
      supplies[record.nombre_insumo] = {
        startStock: quantitySold, // This would need to be calculated properly in a real scenario
        endStock: 0
      };
    }
  });

  return { services, supplies };
};
