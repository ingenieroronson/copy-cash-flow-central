
import type { Services, Supplies, Procedures, ServicePrices, SupplyPrices, ProcedurePrices, ServiceRecord, SupplyRecord, ProcedureRecord } from '@/types/sales';

export const processServiceRecords = (
  services: Services,
  servicePrices: ServicePrices,
  userId: string,
  targetDate: string,
  photocopierId: string
): ServiceRecord[] => {
  const records: ServiceRecord[] = [];

  Object.entries(services).forEach(([serviceKey, serviceData]) => {
    if (!serviceData) return;

    const serviceTypeMap: Record<string, string> = {
      'colorCopies': 'copias_color',
      'bwCopies': 'copias_bn',
      'colorPrints': 'impresion_color',
      'bwPrints': 'impresion_bn'
    };

    const priceKey = serviceKey.replace(/([A-Z])/g, '_$1').toLowerCase() as keyof ServicePrices;
    const unitPrice = servicePrices[priceKey] || 0;
    const quantity = Math.max(0, serviceData.today - (serviceData.errors || 0) - serviceData.yesterday);
    const total = quantity * unitPrice;

    if (quantity > 0) {
      records.push({
        usuario_id: userId,
        fecha: targetDate,
        tipo: serviceTypeMap[serviceKey],
        cantidad: quantity,
        precio_unitario: unitPrice,
        total: total,
        valor_anterior: serviceData.yesterday,
        valor_actual: serviceData.today,
        fotocopiadora_id: photocopierId,
        errores: serviceData.errors || 0
      });
    }
  });

  return records;
};

export const processProcedureRecords = (
  procedures: Procedures,
  procedurePrices: ProcedurePrices,
  userId: string,
  targetDate: string,
  photocopierId: string
): ProcedureRecord[] => {
  const records: ProcedureRecord[] = [];

  Object.entries(procedures).forEach(([procedureName, procedureData]) => {
    if (procedureData.today || procedureData.yesterday || procedureData.errors) {
      const quantity = Math.max(0, procedureData.today - (procedureData.errors || 0) - procedureData.yesterday);
      const unitPrice = procedurePrices[procedureName] || 0;
      const total = quantity * unitPrice;

      records.push({
        usuario_id: userId,
        fecha: targetDate,
        fotocopiadora_id: photocopierId,
        procedure_name: procedureName,
        cantidad: quantity,
        precio_unitario: unitPrice,
        total: total,
        valor_anterior: procedureData.yesterday,
        valor_actual: procedureData.today,
        errores: procedureData.errors || 0
      });
    }
  });

  return records;
};

export const processSupplyRecords = (
  suppliesData: Supplies,
  supplyPrices: SupplyPrices,
  userId: string,
  targetDate: string,
  photocopierId: string
): SupplyRecord[] => {
  const records: SupplyRecord[] = [];

  Object.entries(suppliesData).forEach(([supplyName, supplyData]) => {
    if (!supplyData) return;

    const unitPrice = supplyPrices[supplyName] || 0;
    const quantity = Math.max(0, supplyData.startStock - supplyData.endStock);
    const total = quantity * unitPrice;

    if (quantity > 0) {
      records.push({
        usuario_id: userId,
        fecha: targetDate,
        fotocopiadora_id: photocopierId,
        nombre_insumo: supplyName,
        cantidad: quantity,
        precio_unitario: unitPrice,
        total: total
      });
    }
  });

  return records;
};

export const transformLoadedData = (
  serviceRecords: any[],
  supplyRecords: any[],
  procedureRecords: any[] = []
): { services: Services; supplies: Supplies; procedures: Procedures } => {
  const services: Services = {
    colorCopies: { yesterday: 0, today: 0, errors: 0 },
    bwCopies: { yesterday: 0, today: 0, errors: 0 },
    colorPrints: { yesterday: 0, today: 0, errors: 0 },
    bwPrints: { yesterday: 0, today: 0, errors: 0 }
  };
  const supplies: Supplies = {};
  const procedures: Procedures = {};

  // Transform service records back to Services format
  serviceRecords.forEach(record => {
    const serviceKeyMap: Record<string, keyof Services> = {
      'copias_color': 'colorCopies',
      'copias_bn': 'bwCopies',
      'impresion_color': 'colorPrints',
      'impresion_bn': 'bwPrints'
    };

    const serviceKey = serviceKeyMap[record.tipo];
    if (serviceKey) {
      services[serviceKey] = {
        yesterday: record.valor_anterior || 0,
        today: record.valor_actual || 0,
        errors: record.errores || 0
      };
    }
  });

  // Transform procedure records back to Procedures format
  procedureRecords.forEach(record => {
    procedures[record.procedure_name] = {
      yesterday: record.valor_anterior || 0,
      today: record.valor_actual || 0,
      errors: record.errores || 0
    };
  });

  // Transform supply records back to Supplies format
  supplyRecords.forEach(record => {
    // For loaded supply data, we need to reconstruct the stock values
    // Since we only store the sold quantity, we'll use it as the difference
    supplies[record.nombre_insumo] = {
      startStock: record.cantidad || 0, // Use quantity as start stock approximation
      endStock: 0 // End stock will be 0 since quantity was sold
    };
  });

  return { services, supplies, procedures };
};
