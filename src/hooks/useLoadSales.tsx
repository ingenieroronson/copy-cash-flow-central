
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

  const loadLatestCounters = async (photocopierId?: string) => {
    if (!user || !photocopierId) return {};

    try {
      // Get the latest records for each service type for this photocopier
      const { data: latestRecords, error } = await supabase
        .from('ventas')
        .select('tipo, valor_actual, fecha')
        .eq('usuario_id', user.id)
        .eq('fotocopiadora_id', photocopierId)
        .not('valor_actual', 'is', null)
        .order('fecha', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!latestRecords || latestRecords.length === 0) {
        return {};
      }

      // Group by service type and get the most recent value for each
      const latestCounters: Record<string, number> = {};
      const processedTypes = new Set<string>();

      for (const record of latestRecords) {
        if (record.tipo && !processedTypes.has(record.tipo)) {
          latestCounters[record.tipo] = record.valor_actual || 0;
          processedTypes.add(record.tipo);
        }
      }

      // Map to the format expected by the services state
      const prefillData = {
        colorCopies: { yesterday: latestCounters['copias_color'] || 0, today: 0 },
        bwCopies: { yesterday: latestCounters['copias_bn'] || 0, today: 0 },
        colorPrints: { yesterday: latestCounters['impresion_color'] || 0, today: 0 },
        bwPrints: { yesterday: latestCounters['impresion_bn'] || 0, today: 0 }
      };

      return prefillData;

    } catch (error) {
      console.error('Error loading latest counters:', error);
      return {};
    }
  };

  return {
    loadDailySales,
    loadLatestCounters,
  };
};
