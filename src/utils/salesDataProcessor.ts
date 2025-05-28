
// Simplified type definitions to avoid deep instantiation issues
type SimpleServiceData = {
  yesterday: number;
  today: number;
  errors: number;
};

type SimpleServices = {
  colorCopies?: SimpleServiceData;
  bwCopies?: SimpleServiceData;
  colorPrints?: SimpleServiceData;
  bwPrints?: SimpleServiceData;
};

type SimpleSupplies = {
  [supplyName: string]: {
    startStock: number;
    endStock: number;
  };
};

type SimpleServicePrices = {
  color_copies?: number;
  bw_copies?: number;
  color_prints?: number;
  bw_prints?: number;
};

type SimpleSupplyPrices = {
  [supplyName: string]: number;
};

type SimpleServiceRecord = {
  usuario_id: string;
  fecha: string;
  tipo: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
  valor_anterior: number;
  valor_actual: number;
  fotocopiadora_id: string;
  negocio_id: string;
  errores: number;
};

type SimpleSupplyRecord = {
  usuario_id: string;
  fecha: string;
  fotocopiadora_id: string;
  nombre_insumo: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
  negocio_id: string;
};

export const processServiceRecords = (
  services: SimpleServices,
  servicePrices: SimpleServicePrices,
  userId: string,
  targetDate: string,
  photocopierId: string,
  negocioId: string
): SimpleServiceRecord[] => {
  const records: SimpleServiceRecord[] = [];

  Object.entries(services).forEach(([serviceKey, serviceData]) => {
    if (!serviceData) return;

    const serviceTypeMap: Record<string, string> = {
      'colorCopies': 'copias_color',
      'bwCopies': 'copias_bn',
      'colorPrints': 'impresion_color',
      'bwPrints': 'impresion_bn'
    };

    const priceKey = serviceKey.replace(/([A-Z])/g, '_$1').toLowerCase() as keyof SimpleServicePrices;
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
        negocio_id: negocioId,
        errores: serviceData.errors || 0
      });
    }
  });

  return records;
};

export const processSupplyRecords = (
  suppliesData: SimpleSupplies,
  supplyPrices: SimpleSupplyPrices,
  userId: string,
  targetDate: string,
  photocopierId: string,
  negocioId: string
): SimpleSupplyRecord[] => {
  const records: SimpleSupplyRecord[] = [];

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
        total: total,
        negocio_id: negocioId
      });
    }
  });

  return records;
};

export const transformLoadedData = (
  serviceRecords: any[],
  supplyRecords: any[]
): { services: SimpleServices; supplies: SimpleSupplies } => {
  const services: SimpleServices = {};
  const supplies: SimpleSupplies = {};

  // Transform service records back to Services format
  serviceRecords.forEach(record => {
    const serviceKeyMap: Record<string, keyof SimpleServices> = {
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

  // Transform supply records back to Supplies format
  supplyRecords.forEach(record => {
    // For loaded supply data, we need to reconstruct the stock values
    // Since we only store the sold quantity, we'll use it as the difference
    supplies[record.nombre_insumo] = {
      startStock: record.cantidad || 0, // Use quantity as start stock approximation
      endStock: 0 // End stock will be 0 since quantity was sold
    };
  });

  return { services, supplies };
};
