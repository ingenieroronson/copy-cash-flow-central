
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { transformLoadedData } from '@/utils/salesDataProcessor';

export const useLoadSales = () => {
  const { user } = useAuth();

  const loadDailySales = async (date?: string, photocopierId?: string) => {
    if (!user) return { services: {}, supplies: {} };

    const targetDate = date || new Date().toISOString().split('T')[0];

    try {
      // Load service records from ventas table
      let serviceQuery = supabase
        .from('ventas')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('fecha', targetDate);

      if (photocopierId) {
        serviceQuery = serviceQuery.eq('fotocopiadora_id', photocopierId);
      }

      const { data: serviceRecords, error: serviceError } = await serviceQuery;

      if (serviceError) throw serviceError;

      // Load supply records from supply_sales table
      let supplyQuery = supabase
        .from('supply_sales')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('fecha', targetDate);

      if (photocopierId) {
        supplyQuery = supplyQuery.eq('fotocopiadora_id', photocopierId);
      }

      const { data: supplyRecords, error: supplyError } = await supplyQuery;

      if (supplyError) throw supplyError;

      return transformLoadedData(serviceRecords || [], supplyRecords || []);

    } catch (error) {
      console.error('Error loading sales:', error);
      return { services: {}, supplies: {} };
    }
  };

  return {
    loadDailySales,
  };
};
