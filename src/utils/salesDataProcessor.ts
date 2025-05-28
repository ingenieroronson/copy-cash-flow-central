
import type { Services, Supplies, ServicePrices, SupplyPrices, ServiceRecord, SupplyRecord } from '@/types/sales';

export const processServiceRecords = (
  services: Services,
  servicePrices: ServicePrices,
  userId: string,
  date: string,
  photocopierId: string
): ServiceRecord[] => {
  const serviceRecords: ServiceRecord[] = [];

  // Color copies
  if (services.colorCopies && (services.colorCopies.today > 0 || services.colorCopies.yesterday > 0)) {
    const cantidad = Math.max(0, services.colorCopies.today - services.colorCopies.yesterday);
    if (cantidad > 0) {
      serviceRecords.push({
        usuario_id: userId,
        fecha: date,
        tipo: 'copias_color',
        cantidad: cantidad,
        precio_unitario: servicePrices.color_copies || 0,
        total: cantidad * (servicePrices.color_copies || 0),
        valor_anterior: services.colorCopies.yesterday,
        valor_actual: services.colorCopies.today,
        fotocopiadora_id: photocopierId
      });
    }
  }

  // BW copies
  if (services.bwCopies && (services.bwCopies.today > 0 || services.bwCopies.yesterday > 0)) {
    const cantidad = Math.max(0, services.bwCopies.today - services.bwCopies.yesterday);
    if (cantidad > 0) {
      serviceRecords.push({
        usuario_id: userId,
        fecha: date,
        tipo: 'copias_bn',
        cantidad: cantidad,
        precio_unitario: servicePrices.bw_copies || 0,
        total: cantidad * (servicePrices.bw_copies || 0),
        valor_anterior: services.bwCopies.yesterday,
        valor_actual: services.bwCopies.today,
        fotocopiadora_id: photocopierId
      });
    }
  }

  // Color prints
  if (services.colorPrints && (services.colorPrints.today > 0 || services.colorPrints.yesterday > 0)) {
    const cantidad = Math.max(0, services.colorPrints.today - services.colorPrints.yesterday);
    if (cantidad > 0) {
      serviceRecords.push({
        usuario_id: userId,
        fecha: date,
        tipo: 'impresion_color',
        cantidad: cantidad,
        precio_unitario: servicePrices.color_prints || 0,
        total: cantidad * (servicePrices.color_prints || 0),
        valor_anterior: services.colorPrints.yesterday,
        valor_actual: services.colorPrints.today,
        fotocopiadora_id: photocopierId
      });
    }
  }

  // BW prints
  if (services.bwPrints && (services.bwPrints.today > 0 || services.bwPrints.yesterday > 0)) {
    const cantidad = Math.max(0, services.bwPrints.today - services.bwPrints.yesterday);
    if (cantidad > 0) {
      serviceRecords.push({
        usuario_id: userId,
        fecha: date,
        tipo: 'impresion_bn',
        cantidad: cantidad,
        precio_unitario: servicePrices.bw_prints || 0,
        total: cantidad * (servicePrices.bw_prints || 0),
        valor_anterior: services.bwPrints.yesterday,
        valor_actual: services.bwPrints.today,
        fotocopiadora_id: photocopierId
      });
    }
  }

  return serviceRecords;
};

export const processSupplyRecords = (
  supplies: Supplies,
  supplyPrices: SupplyPrices,
  userId: string,
  date: string,
  photocopierId: string
): SupplyRecord[] => {
  const supplyRecords: SupplyRecord[] = [];
  
  Object.entries(supplies).forEach(([supplyName, supplyData]) => {
    if (supplyData.startStock > 0 || supplyData.endStock > 0) {
      const cantidad = Math.max(0, supplyData.startStock - supplyData.endStock);
      if (cantidad > 0) {
        supplyRecords.push({
          usuario_id: userId,
          fecha: date,
          fotocopiadora_id: photocopierId,
          nombre_insumo: supplyName,
          cantidad: cantidad,
          precio_unitario: supplyPrices[supplyName] || 0,
          total: cantidad * (supplyPrices[supplyName] || 0)
        });
      }
    }
  });

  return supplyRecords;
};

export const transformLoadedData = (serviceRecords: any[], supplyRecords: any[]) => {
  const services: Record<string, any> = {};
  const supplies: Record<string, any> = {};

  serviceRecords?.forEach(record => {
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
    }
    
    if (serviceKey) {
      services[serviceKey] = {
        yesterday: record.valor_anterior || 0,
        today: record.valor_actual || 0
      };
    }
  });

  supplyRecords?.forEach(record => {
    const initialStock = record.cantidad || 0;
    supplies[record.nombre_insumo] = {
      startStock: initialStock,
      endStock: 0
    };
  });

  return { services, supplies };
};
