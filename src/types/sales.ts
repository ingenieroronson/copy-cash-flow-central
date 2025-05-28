
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
