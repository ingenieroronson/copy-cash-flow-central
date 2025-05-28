
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

  const loadLatestCounters = async (photocopierId?: string, selectedDate?: string) => {
    if (!user || !photocopierId || !selectedDate) return {};

    try {
      // Calculate previous date in Mexico City timezone
      const selectedDateObj = new Date(selectedDate + 'T12:00:00-06:00'); // Noon Mexico City time to avoid DST issues
      const previousDay = new Date(selectedDateObj);
      previousDay.setDate(selectedDateObj.getDate() - 1);
      
      // Format as YYYY-MM-DD
      const previousDayString = previousDay.toISOString().split('T')[0];

      console.log('Loading latest counters for photocopier:', photocopierId, 'from previous day:', previousDayString);

      // Get the "Hoy" values from the previous day for this specific photocopier
      // These will become the "Ayer" values for the current date
      const { data: previousRecords, error } = await supabase
        .from('ventas')
        .select('tipo, valor_actual')
        .eq('usuario_id', user.id)
        .eq('fotocopiadora_id', photocopierId)
        .eq('fecha', previousDayString)
        .not('valor_actual', 'is', null);

      if (error) throw error;

      if (!previousRecords || previousRecords.length === 0) {
        console.log('No previous records found for photocopier:', photocopierId, 'on date:', previousDayString);
        return {};
      }

      // Map the previous day's "Hoy" values to become today's "Ayer" values
      const previousCounters: Record<string, number> = {};
      
      for (const record of previousRecords) {
        if (record.tipo && record.valor_actual !== null) {
          previousCounters[record.tipo] = record.valor_actual;
        }
      }

      console.log('Previous day "Hoy" values found for photocopier:', photocopierId, previousCounters);

      // Map to the format expected by the services state
      // Previous day's "Hoy" becomes current day's "Ayer"
      const prefillData = {
        colorCopies: { yesterday: previousCounters['copias_color'] || 0, today: 0 },
        bwCopies: { yesterday: previousCounters['copias_bn'] || 0, today: 0 },
        colorPrints: { yesterday: previousCounters['impresion_color'] || 0, today: 0 },
        bwPrints: { yesterday: previousCounters['impresion_bn'] || 0, today: 0 }
      };

      console.log('Prefill data for photocopier:', photocopierId, 'on date:', selectedDate, prefillData);

      return prefillData;

    } catch (error) {
      console.error('Error loading latest counters for photocopier:', photocopierId, error);
      return {};
    }
  };

  return {
    loadDailySales,
    loadLatestCounters,
  };
};
