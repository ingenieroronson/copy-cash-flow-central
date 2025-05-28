
import type { Services, Supplies, ServicePrices, SupplyPrices, ServiceRecord, SupplyRecord } from '@/types/sales';

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
