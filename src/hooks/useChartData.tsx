
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import type { ChartDataPoint } from '@/components/SalesChart';
import type { SummaryData } from '@/components/ChartSummary';
import type { ChartFilters } from '@/components/ChartFilters';

export const useChartData = (filters: ChartFilters) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData>({
    services: 0,
    supplies: 0,
    total: 0,
    dateRange: filters.dateRange
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchChartData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch service sales data
      let servicesQuery = supabase
        .from('ventas')
        .select('fecha, total')
        .eq('usuario_id', user.id)
        .gte('fecha', filters.dateRange.startDate)
        .lte('fecha', filters.dateRange.endDate)
        .not('total', 'is', null);

      if (filters.photocopierId) {
        servicesQuery = servicesQuery.eq('fotocopiadora_id', filters.photocopierId);
      }

      const { data: servicesData, error: servicesError } = await servicesQuery;
      if (servicesError) throw servicesError;

      // Fetch supply sales data
      let suppliesQuery = supabase
        .from('supply_sales')
        .select('fecha, total')
        .eq('usuario_id', user.id)
        .gte('fecha', filters.dateRange.startDate)
        .lte('fecha', filters.dateRange.endDate);

      if (filters.photocopierId) {
        suppliesQuery = suppliesQuery.eq('fotocopiadora_id', filters.photocopierId);
      }

      const { data: suppliesData, error: suppliesError } = await suppliesQuery;
      if (suppliesError) throw suppliesError;

      // Group data by date
      const dailyTotals = new Map<string, { services: number; supplies: number }>();

      // Process service data
      (servicesData || []).forEach(record => {
        if (!dailyTotals.has(record.fecha)) {
          dailyTotals.set(record.fecha, { services: 0, supplies: 0 });
        }
        dailyTotals.get(record.fecha)!.services += record.total || 0;
      });

      // Process supply data
      (suppliesData || []).forEach(record => {
        if (!dailyTotals.has(record.fecha)) {
          dailyTotals.set(record.fecha, { services: 0, supplies: 0 });
        }
        dailyTotals.get(record.fecha)!.supplies += record.total || 0;
      });

      // Convert to chart data format and sort by date
      const chartPoints: ChartDataPoint[] = Array.from(dailyTotals.entries())
        .map(([date, totals]) => ({
          date,
          services: totals.services,
          supplies: totals.supplies,
          total: totals.services + totals.supplies
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setChartData(chartPoints);

      // Calculate summary data
      const totalServices = chartPoints.reduce((sum, point) => sum + point.services, 0);
      const totalSupplies = chartPoints.reduce((sum, point) => sum + point.supplies, 0);
      const grandTotal = totalServices + totalSupplies;

      setSummaryData({
        services: totalServices,
        supplies: totalSupplies,
        total: grandTotal,
        dateRange: filters.dateRange
      });

    } catch (error) {
      console.error('Error fetching chart data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del gráfico.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchChartData();
    }
  }, [user, filters]);

  return {
    chartData,
    summaryData,
    loading,
    refetch: fetchChartData
  };
};
