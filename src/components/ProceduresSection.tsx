
import React from 'react';
import { ServiceCard } from './ServiceCard';

interface ProcedureState {
  yesterday: number;
  today: number;
  errors: number;
}

interface ProceduresSectionProps {
  procedures: Record<string, ProcedureState>;
  dbProcedures: Array<{ id: string; name: string; unit_price: number; is_active: boolean }>;
  onUpdateProcedure: (procedureName: string, field: string, value: number) => void;
  getProcedurePrice: (procedureName: string) => number;
  calculateProcedureTotal: (procedure: ProcedureState, price: number) => number;
  procedureDataError?: string | null;
  proceduresLoading?: boolean;
}

export const ProceduresSection = ({
  procedures,
  dbProcedures,
  onUpdateProcedure,
  getProcedurePrice,
  calculateProcedureTotal,
  procedureDataError,
  proceduresLoading
}: ProceduresSectionProps) => {
  const activeProcedures = dbProcedures.filter(p => p.is_active);

  if (activeProcedures.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <p className="text-gray-600">No hay procedimientos configurados. Ve a Configuración para agregar algunos.</p>
      </div>
    );
  }

  if (procedureDataError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600">{procedureDataError}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 mb-4 md:mb-6 px-2">
        Servicios - Procedimientos
        {proceduresLoading && (
          <span className="ml-2 text-sm text-gray-500">Cargando...</span>
        )}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4 lg:gap-6 px-2">
        {activeProcedures.map((dbProcedure) => {
          const procedureState = procedures[dbProcedure.name] || { yesterday: 0, today: 0, errors: 0 };
          const price = getProcedurePrice(dbProcedure.name);
          
          return (
            <ServiceCard
              key={dbProcedure.id}
              title={dbProcedure.name}
              icon="file-text"
              iconColor="text-blue-500"
              backgroundColor="bg-blue-50"
              service={procedureState}
              onUpdate={(field, value) => onUpdateProcedure(dbProcedure.name, field, value)}
              total={calculateProcedureTotal(procedureState, price)}
              difference={Math.max(0, procedureState.today - (procedureState.errors || 0) - procedureState.yesterday)}
              price={price}
            />
          );
        })}
      </div>
    </div>
  );
};
