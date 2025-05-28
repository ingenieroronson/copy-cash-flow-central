
import { useState } from 'react';
import { ProcedureState } from '@/types/sales';

export const useProceduresState = () => {
  const [procedures, setProcedures] = useState<ProcedureState>({});

  const updateProcedure = (procedureName: string, field: string, value: number) => {
    setProcedures(prev => ({
      ...prev,
      [procedureName]: {
        ...prev[procedureName],
        [field]: value
      }
    }));
  };

  const resetProcedures = (dbProcedures: Array<{ name: string }>) => {
    const initialState: ProcedureState = {};
    dbProcedures.forEach(procedure => {
      initialState[procedure.name] = {
        yesterday: 0,
        today: 0,
        errors: 0
      };
    });
    setProcedures(initialState);
  };

  const setProceduresData = (data: ProcedureState) => {
    setProcedures(data);
  };

  const updateProceduresFromDb = (dbProcedures: Array<{ name: string }>) => {
    setProcedures(prev => {
      const updated = { ...prev };
      dbProcedures.forEach(procedure => {
        if (!updated[procedure.name]) {
          updated[procedure.name] = {
            yesterday: 0,
            today: 0,
            errors: 0
          };
        }
      });
      return updated;
    });
  };

  return {
    procedures,
    updateProcedure,
    resetProcedures,
    setProceduresData,
    updateProceduresFromDb,
  };
};
