
export interface ServiceState {
  colorCopies: {
    yesterday: number;
    today: number;
    errors: number;
  };
  bwCopies: {
    yesterday: number;
    today: number;
    errors: number;
  };
  colorPrints: {
    yesterday: number;
    today: number;
    errors: number;
  };
  bwPrints: {
    yesterday: number;
    today: number;
    errors: number;
  };
}

export interface ProcedureState {
  [procedureName: string]: {
    yesterday: number;
    today: number;
    errors: number;
  };
}

export interface SupplyState {
  [supplyName: string]: {
    startStock: number;
    endStock: number;
  };
}

export type Services = ServiceState;
export type Procedures = ProcedureState;
export type Supplies = SupplyState;

export interface ServicePrices {
  color_copies: number;
  bw_copies: number;
  color_prints: number;
  bw_prints: number;
}

export interface ProcedurePrices {
  [procedureName: string]: number;
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
  errores: number;
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

export interface ProcedureRecord {
  usuario_id: string;
  fecha: string;
  fotocopiadora_id: string;
  procedure_name: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
  valor_anterior: number;
  valor_actual: number;
  errores: number;
}
