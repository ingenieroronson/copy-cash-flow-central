
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import type { ItemSalesFilters } from '@/components/ItemSalesSummary';

interface ItemSalesRecord {
  name: string;
  type: 'service' | 'supply' | 'procedure';
  quantity: number;
  total: number;
}

export const useItemSalesData = (filters: ItemSalesFilters) => {
  const [data, setData] = useState<ItemSalesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchItemSalesData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch service sales from ventas table
      let servicesQuery = supabase
        .from('ventas')
        .select('tipo, cantidad, total')
        .eq('usuario_id', user.id)
        .gte('fecha', filters.dateRange.startDate)
        .lte('fecha', filters.dateRange.endDate)
        .not('cantidad', 'is', null)
        .not('total', 'is', null)
        .not('tipo', 'is', null);

      if (filters.photocopierId) {
        servicesQuery = servicesQuery.eq('fotocopiadora_id', filters.photocopierId);
      }

      const { data: servicesData, error: servicesError } = await servicesQuery;
      if (servicesError) throw servicesError;

      // Fetch procedure sales from procedure_sales table
      let proceduresQuery = supabase
        .from('procedure_sales')
        .select('procedure_name, cantidad, total')
        .eq('usuario_id', user.id)
        .gte('fecha', filters.dateRange.startDate)
        .lte('fecha', filters.dateRange.endDate);

      if (filters.photocopierId) {
        proceduresQuery = proceduresQuery.eq('fotocopiadora_id', filters.photocopierId);
      }

      const { data: proceduresData, error: proceduresError } = await proceduresQuery;
      if (proceduresError) throw proceduresError;

      // Fetch supply sales from supply_sales table
      let suppliesQuery = supabase
        .from('supply_sales')
        .select('nombre_insumo, cantidad, total')
        .eq('usuario_id', user.id)
        .gte('fecha', filters.dateRange.startDate)
        .lte('fecha', filters.dateRange.endDate);

      if (filters.photocopierId) {
        suppliesQuery = suppliesQuery.eq('fotocopiadora_id', filters.photocopierId);
      }

      const { data: suppliesData, error: suppliesError } = await suppliesQuery;
      if (suppliesError) throw suppliesError;

      // Process and aggregate services data
      const servicesAggregated = (servicesData || []).reduce((acc, record) => {
        const serviceName = record.tipo || 'Unknown Service';
        if (!acc[serviceName]) {
          acc[serviceName] = { quantity: 0, total: 0 };
        }
        acc[serviceName].quantity += record.cantidad || 0;
        acc[serviceName].total += record.total || 0;
        return acc;
      }, {} as Record<string, { quantity: number; total: number }>);

      // Process and aggregate procedures data
      const proceduresAggregated = (proceduresData || []).reduce((acc, record) => {
        const procedureName = record.procedure_name || 'Unknown Procedure';
        if (!acc[procedureName]) {
          acc[procedureName] = { quantity: 0, total: 0 };
        }
        acc[procedureName].quantity += record.cantidad || 0;
        acc[procedureName].total += record.total || 0;
        return acc;
      }, {} as Record<string, { quantity: number; total: number }>);

      // Process and aggregate supplies data
      const suppliesAggregated = (suppliesData || []).reduce((acc, record) => {
        const supplyName = record.nombre_insumo || 'Unknown Supply';
        if (!acc[supplyName]) {
          acc[supplyName] = { quantity: 0, total: 0 };
        }
        acc[supplyName].quantity += record.cantidad || 0;
        acc[supplyName].total += record.total || 0;
        return acc;
      }, {} as Record<string, { quantity: number; total: number }>);

      // Convert to final format
      const processedData: ItemSalesRecord[] = [
        ...Object.entries(servicesAggregated).map(([name, data]) => ({
          name,
          type: 'service' as const,
          quantity: data.quantity,
          total: data.total
        })),
        ...Object.entries(proceduresAggregated).map(([name, data]) => ({
          name,
          type: 'procedure' as const,
          quantity: data.quantity,
          total: data.total
        })),
        ...Object.entries(suppliesAggregated).map(([name, data]) => ({
          name,
          type: 'supply' as const,
          quantity: data.quantity,
          total: data.total
        }))
      ];

      // Sort by total (highest first)
      processedData.sort((a, b) => b.total - a.total);

      setData(processedData);

    } catch (error) {
      console.error('Error fetching item sales data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de ventas por artículo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchItemSalesData();
    }
  }, [user, filters]);

  return {
    data,
    loading,
    refetch: fetchItemSalesData
  };
};
