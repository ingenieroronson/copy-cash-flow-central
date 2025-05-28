
export interface ServiceData {
  yesterday: number;
  today: number;
}

export interface ServiceState {
  colorCopies: ServiceData;
  bwCopies: ServiceData;
  colorPrints: ServiceData;
  bwPrints: ServiceData;
}

export interface Services {
  colorCopies?: ServiceData;
  bwCopies?: ServiceData;
  colorPrints?: ServiceData;
  bwPrints?: ServiceData;
}

export interface SupplyData {
  startStock: number;
  endStock: number;
}

export interface Supplies {
  [supplyName: string]: SupplyData;
}

export interface ServicePrices {
  color_copies?: number;
  bw_copies?: number;
  color_prints?: number;
  bw_prints?: number;
}

export interface SupplyPrices {
  [supplyName: string]: number;
}

export interface ServiceRecord {
  usuario_id: string;
  fecha: string;
  tipo: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
  valor_anterior: number;
  valor_actual: number;
  fotocopiadora_id: string;
}

export interface SupplyRecord {
  usuario_id: string;
  fecha: string;
  fotocopiadora_id: string;
  nombre_insumo: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
}
