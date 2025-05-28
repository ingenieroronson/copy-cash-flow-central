
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { processServiceRecords, processSupplyRecords } from '@/utils/salesDataProcessor';
import type { Services, Procedures, Supplies, ServicePrices, ProcedurePrices, SupplyPrices } from '@/types/sales';

const processProcedureRecords = (
  procedures: Procedures,
  procedurePrices: ProcedurePrices,
  userId: string,
  targetDate: string,
  photocopierId: string
) => {
  const records: any[] = [];

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

export const useSaveSales = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const saveDailySales = async (
    services: Services,
    procedures: Procedures,
    suppliesData: Supplies,
    servicePrices: ServicePrices,
    procedurePrices: ProcedurePrices,
    supplyPrices: SupplyPrices,
    photocopierId: string,
    selectedDate?: string
  ) => {
    if (!user || !photocopierId) {
      toast({
        title: "Error",
        description: "Usuario o fotocopiadora no seleccionada.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const targetDate = selectedDate || new Date().toLocaleDateString('en-CA', {
        timeZone: 'America/Mexico_City'
      });

      console.log('Saving sales for date:', targetDate);

      await supabase
        .from('usuarios')
        .upsert({ 
          id: user.id, 
          email: user.email || '', 
          nombre: user.user_metadata?.name || user.email || 'Usuario' 
        }, { 
          onConflict: 'id' 
        });

      // Delete existing records for this date, user, and photocopier
      await supabase
        .from('ventas')
        .delete()
        .eq('usuario_id', user.id)
        .eq('fecha', targetDate)
        .eq('fotocopiadora_id', photocopierId);

      await supabase
        .from('supply_sales')
        .delete()
        .eq('usuario_id', user.id)
        .eq('fecha', targetDate)
        .eq('fotocopiadora_id', photocopierId);

      await supabase
        .from('procedure_sales')
        .delete()
        .eq('usuario_id', user.id)
        .eq('fecha', targetDate)
        .eq('fotocopiadora_id', photocopierId);

      // Process and save service records
      const serviceRecords = processServiceRecords(
        services,
        servicePrices,
        user.id,
        targetDate,
        photocopierId
      );

      if (serviceRecords.length > 0) {
        const { error: serviceError } = await supabase
          .from('ventas')
          .insert(serviceRecords);

        if (serviceError) throw serviceError;
      }

      // Process and save procedure records
      const procedureRecords = processProcedureRecords(
        procedures,
        procedurePrices,
        user.id,
        targetDate,
        photocopierId
      );

      if (procedureRecords.length > 0) {
        const { error: procedureError } = await supabase
          .from('procedure_sales')
          .insert(procedureRecords);

        if (procedureError) throw procedureError;
      }

      // Process and save supply records
      const supplyRecords = processSupplyRecords(
        suppliesData,
        supplyPrices,
        user.id,
        targetDate,
        photocopierId
      );

      if (supplyRecords.length > 0) {
        const { error: supplyError } = await supabase
          .from('supply_sales')
          .insert(supplyRecords);

        if (supplyError) throw supplyError;
      }

      toast({
        title: "Ventas guardadas",
        description: `Las ventas del día ${targetDate} se han guardado correctamente.`,
      });

    } catch (error) {
      console.error('Error saving sales:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las ventas del día.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    saveDailySales,
  };
};
