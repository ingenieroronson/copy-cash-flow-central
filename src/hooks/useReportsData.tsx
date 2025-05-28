
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import type { ReportFilters } from '@/pages/Reports';
import type { SummaryData } from '@/components/SalesSummaryCards';
import type { DetailedSalesRecord } from '@/components/DetailedReportsTable';

export const useReportsData = (filters: ReportFilters) => {
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalSales: 0,
    servicesSales: 0,
    proceduresSales: 0,
    suppliesSales: 0,
    totalTransactions: 0
  });
  const [detailedData, setDetailedData] = useState<DetailedSalesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchReportsData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch service sales from ventas table with error information
      let servicesQuery = supabase
        .from('ventas')
        .select(`
          fecha,
          tipo,
          cantidad,
          precio_unitario,
          total,
          errores,
          fotocopiadora_id,
          fotocopiadoras!ventas_fotocopiadora_id_fkey(nombre)
        `)
        .eq('usuario_id', user.id)
        .gte('fecha', filters.dateRange.startDate)
        .lte('fecha', filters.dateRange.endDate)
        .not('cantidad', 'is', null)
        .not('total', 'is', null);

      if (filters.photocopierId) {
        servicesQuery = servicesQuery.eq('fotocopiadora_id', filters.photocopierId);
      }

      const { data: servicesData, error: servicesError } = await servicesQuery;
      if (servicesError) throw servicesError;

      // Fetch procedure sales from procedure_sales table
      let proceduresQuery = supabase
        .from('procedure_sales')
        .select(`
          fecha,
          procedure_name,
          cantidad,
          precio_unitario,
          total,
          errores,
          fotocopiadora_id
        `)
        .eq('usuario_id', user.id)
        .gte('fecha', filters.dateRange.startDate)
        .lte('fecha', filters.dateRange.endDate);

      if (filters.photocopierId) {
        proceduresQuery = proceduresQuery.eq('fotocopiadora_id', filters.photocopierId);
      }

      const { data: proceduresData, error: proceduresError } = await proceduresQuery;
      if (proceduresError) throw proceduresError;

      // Fetch photocopiers to get names for procedures
      const { data: photocopiersData, error: photocopiersError } = await supabase
        .from('fotocopiadoras')
        .select('id, nombre')
        .eq('usuario_id', user.id);

      if (photocopiersError) throw photocopiersError;

      // Create a map of photocopier ID to name
      const photocopierMap = new Map();
      photocopiersData?.forEach(pc => {
        photocopierMap.set(pc.id, pc.nombre || 'N/A');
      });

      // Fetch supply sales from supply_sales table with photocopier information
      let suppliesQuery = supabase
        .from('supply_sales')
        .select(`
          fecha,
          nombre_insumo,
          cantidad,
          precio_unitario,
          total,
          fotocopiadora_id,
          fotocopiadoras!supply_sales_fotocopiadora_id_fkey(nombre)
        `)
        .eq('usuario_id', user.id)
        .gte('fecha', filters.dateRange.startDate)
        .lte('fecha', filters.dateRange.endDate);

      if (filters.photocopierId) {
        suppliesQuery = suppliesQuery.eq('fotocopiadora_id', filters.photocopierId);
      }

      const { data: suppliesData, error: suppliesError } = await suppliesQuery;
      if (suppliesError) throw suppliesError;

      // Process services data with error information
      const processedServicesData: DetailedSalesRecord[] = (servicesData || []).map(record => ({
        date: record.fecha,
        type: 'service' as const,
        service_type: record.tipo || '',
        quantity: record.cantidad || 0,
        unit_price: record.precio_unitario || 0,
        total: record.total || 0,
        photocopier_name: record.fotocopiadoras?.nombre || 'N/A',
        errors: record.errores || 0
      }));

      // Process procedures data
      const processedProceduresData: DetailedSalesRecord[] = (proceduresData || []).map(record => ({
        date: record.fecha,
        type: 'procedure' as const,
        procedure_name: record.procedure_name,
        quantity: record.cantidad,
        unit_price: record.precio_unitario,
        total: record.total,
        photocopier_name: photocopierMap.get(record.fotocopiadora_id) || 'N/A',
        errors: record.errores || 0
      }));

      // Process supplies data
      const processedSuppliesData: DetailedSalesRecord[] = (suppliesData || []).map(record => ({
        date: record.fecha,
        type: 'supply' as const,
        supply_name: record.nombre_insumo,
        quantity: record.cantidad,
        unit_price: record.precio_unitario,
        total: record.total,
        photocopier_name: record.fotocopiadoras?.nombre || 'N/A'
      }));

      // Combine all data
      const allDetailedData = [...processedServicesData, ...processedProceduresData, ...processedSuppliesData];
      setDetailedData(allDetailedData);

      // Calculate summary data
      const servicesSales = processedServicesData.reduce((sum, record) => sum + record.total, 0);
      const proceduresSales = processedProceduresData.reduce((sum, record) => sum + record.total, 0);
      const suppliesSales = processedSuppliesData.reduce((sum, record) => sum + record.total, 0);
      const totalSales = servicesSales + proceduresSales + suppliesSales;
      
      // Count distinct days with sales instead of total transactions
      const uniqueDates = new Set(allDetailedData.map(record => record.date));
      const daysWithSales = uniqueDates.size;

      setSummaryData({
        totalSales,
        servicesSales,
        proceduresSales,
        suppliesSales,
        totalTransactions: daysWithSales
      });

    } catch (error) {
      console.error('Error fetching reports data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del reporte.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReportsData();
    }
  }, [user, filters]);

  return {
    summaryData,
    detailedData,
    loading,
    refetch: fetchReportsData
  };
};
