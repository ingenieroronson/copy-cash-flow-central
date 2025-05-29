import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Header } from '@/components/Header';
import { SalesHistoryTable } from '@/components/SalesHistoryTable';
import { useToast } from '@/hooks/use-toast';
import { AuthForm } from '@/components/AuthForm';
import { usePhotocopiers } from '@/hooks/usePhotocopiers';
import { SalesHistoryHeader } from '@/components/sales-history/SalesHistoryHeader';
import { SalesHistoryFilters } from '@/components/sales-history/SalesHistoryFilters';
import { AccessRestrictedView } from '@/components/sales-history/AccessRestrictedView';

export interface SalesRecord {
  id: string;
  fecha: string;
  tipo: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
  source: 'service' | 'supply' | 'procedure';
  supply_name?: string;
  procedure_name?: string;
  fotocopiadora_id?: string;
  errors?: number;
}

export interface DailySales {
  date: string;
  totalAmount: number;
  records: SalesRecord[];
}

const SalesHistory = () => {
  const { user, loading: authLoading } = useAuth();
  const { allPhotocopiers, loading: photocopiersLoading, hasModuleAccess } = usePhotocopiers();
  const [selectedPhotocopierId, setSelectedPhotocopierId] = useState<string>('');
  const [salesData, setSalesData] = useState<DailySales[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Set default photocopier when photocopiers are loaded
  useEffect(() => {
    if (allPhotocopiers.length > 0 && !selectedPhotocopierId) {
      setSelectedPhotocopierId(allPhotocopiers[0].id);
    }
  }, [allPhotocopiers, selectedPhotocopierId]);

  // Check if user has access to historial module for selected photocopier
  const hasHistorialAccess = selectedPhotocopierId ? hasModuleAccess(selectedPhotocopierId, 'historial') : false;

  const loadSalesData = async () => {
    if (!user || !selectedPhotocopierId || !hasHistorialAccess) return;

    setLoading(true);
    try {
      // Ensure user exists in usuarios table
      await supabase
        .from('usuarios')
        .upsert({ 
          id: user.id, 
          email: user.email || '', 
          nombre: user.user_metadata?.name || user.email || 'Usuario' 
        }, { 
          onConflict: 'id' 
        });

      // Check if this is a shared photocopier
      const selectedPhotocopier = allPhotocopiers.find(p => p.id === selectedPhotocopierId);
      const isSharedPhotocopier = selectedPhotocopier?.isShared || false;

      // Load service sales from ventas table with error information
      let serviceQuery = supabase
        .from('ventas')
        .select('*')
        .eq('fotocopiadora_id', selectedPhotocopierId)
        .order('fecha', { ascending: false });

      // If it's not a shared photocopier, filter by user_id
      if (!isSharedPhotocopier) {
        serviceQuery = serviceQuery.eq('usuario_id', user.id);
      }

      const { data: serviceRecords, error: serviceError } = await serviceQuery;

      if (serviceError) throw serviceError;

      // Load procedure sales from procedure_sales table
      let procedureQuery = supabase
        .from('procedure_sales')
        .select('*')
        .eq('fotocopiadora_id', selectedPhotocopierId)
        .order('fecha', { ascending: false });

      if (!isSharedPhotocopier) {
        procedureQuery = procedureQuery.eq('usuario_id', user.id);
      }

      const { data: procedureRecords, error: procedureError } = await procedureQuery;

      if (procedureError) throw procedureError;

      // Load supply sales from supply_sales table
      let supplyQuery = supabase
        .from('supply_sales')
        .select('*')
        .eq('fotocopiadora_id', selectedPhotocopierId)
        .order('fecha', { ascending: false });

      if (!isSharedPhotocopier) {
        supplyQuery = supplyQuery.eq('usuario_id', user.id);
      }

      const { data: supplyRecords, error: supplyError } = await supplyQuery;

      if (supplyError) throw supplyError;

      // Transform and combine data with error information
      const allRecords: SalesRecord[] = [
        ...(serviceRecords?.map(record => ({
          id: record.id,
          fecha: record.fecha,
          tipo: record.tipo || '',
          cantidad: record.cantidad || 0,
          precio_unitario: record.precio_unitario || 0,
          total: record.total || 0,
          source: 'service' as const,
          fotocopiadora_id: record.fotocopiadora_id,
          errors: record.errores || 0
        })) || []),
        ...(procedureRecords?.map(record => ({
          id: record.id,
          fecha: record.fecha,
          tipo: 'procedimiento',
          cantidad: record.cantidad || 0,
          precio_unitario: record.precio_unitario || 0,
          total: record.total || 0,
          source: 'procedure' as const,
          procedure_name: record.procedure_name,
          fotocopiadora_id: record.fotocopiadora_id,
          errors: record.errores || 0
        })) || []),
        ...(supplyRecords?.map(record => ({
          id: record.id,
          fecha: record.fecha,
          tipo: 'suministro',
          cantidad: record.cantidad || 0,
          precio_unitario: record.precio_unitario || 0,
          total: record.total || 0,
          source: 'supply' as const,
          supply_name: record.nombre_insumo,
          fotocopiadora_id: record.fotocopiadora_id
        })) || [])
      ];

      // Group by date
      const groupedByDate = allRecords.reduce((acc, record) => {
        const date = record.fecha;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(record);
        return acc;
      }, {} as Record<string, SalesRecord[]>);

      // Transform to DailySales format
      const dailySales: DailySales[] = Object.entries(groupedByDate)
        .map(([date, records]) => ({
          date,
          totalAmount: records.reduce((sum, record) => sum + record.total, 0),
          records: records.sort((a, b) => b.total - a.total)
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setSalesData(dailySales);
    } catch (error) {
      console.error('Error loading sales data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de ventas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (record: SalesRecord) => {
    // Only allow deletion if user owns the photocopier
    const selectedPhotocopier = allPhotocopiers.find(p => p.id === selectedPhotocopierId);
    if (selectedPhotocopier?.isShared) {
      toast({
        title: "Error",
        description: "No puedes eliminar registros de fotocopiadoras compartidas.",
        variant: "destructive",
      });
      return;
    }

    try {
      let deleteQuery;
      if (record.source === 'supply') {
        deleteQuery = supabase
          .from('supply_sales')
          .delete()
          .eq('id', record.id);
      } else if (record.source === 'procedure') {
        deleteQuery = supabase
          .from('procedure_sales')
          .delete()
          .eq('id', record.id);
      } else {
        deleteQuery = supabase
          .from('ventas')
          .delete()
          .eq('id', record.id);
      }

      const { error } = await deleteQuery;
      if (error) throw error;

      toast({
        title: "Registro eliminado",
        description: "El registro de venta se ha eliminado correctamente.",
      });

      // Reload data
      loadSalesData();
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAllRecordsForDate = async (date: string) => {
    const selectedPhotocopier = allPhotocopiers.find(p => p.id === selectedPhotocopierId);
    if (selectedPhotocopier?.isShared) {
      toast({
        title: "Error",
        description: "No puedes eliminar registros de fotocopiadoras compartidas.",
        variant: "destructive",
      });
      return;
    }

    if (!user || !selectedPhotocopierId) {
      toast({
        title: "Error",
        description: "Usuario o fotocopiadora no seleccionada.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Delete all service records for this date, user, and photocopier
      const { error: serviceError } = await supabase
        .from('ventas')
        .delete()
        .eq('usuario_id', user.id)
        .eq('fecha', date)
        .eq('fotocopiadora_id', selectedPhotocopierId);

      if (serviceError) throw serviceError;

      // Delete all procedure records for this date, user, and photocopier
      const { error: procedureError } = await supabase
        .from('procedure_sales')
        .delete()
        .eq('usuario_id', user.id)
        .eq('fecha', date)
        .eq('fotocopiadora_id', selectedPhotocopierId);

      if (procedureError) throw procedureError;

      // Delete all supply records for this date, user, and photocopier
      const { error: supplyError } = await supabase
        .from('supply_sales')
        .delete()
        .eq('usuario_id', user.id)
        .eq('fecha', date)
        .eq('fotocopiadora_id', selectedPhotocopierId);

      if (supplyError) throw supplyError;

      toast({
        title: "Registros eliminados",
        description: "Todos los registros del día se han eliminado correctamente.",
      });

      // Reload data
      loadSalesData();
    } catch (error) {
      console.error('Error deleting all records for date:', error);
      toast({
        title: "Error",
        description: "No se pudieron eliminar todos los registros del día.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user && selectedPhotocopierId && hasHistorialAccess) {
      loadSalesData();
    }
  }, [user, selectedPhotocopierId, hasHistorialAccess]);

  if (authLoading || photocopiersLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthForm />;
  }

  if (!hasHistorialAccess && selectedPhotocopierId) {
    return <AccessRestrictedView />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <SalesHistoryHeader />
        
        <SalesHistoryFilters
          allPhotocopiers={allPhotocopiers}
          selectedPhotocopierId={selectedPhotocopierId}
          onPhotocopierChange={setSelectedPhotocopierId}
          loading={photocopiersLoading}
        />

        <SalesHistoryTable 
          salesData={salesData} 
          onDeleteRecord={handleDeleteRecord}
          onDeleteAllForDate={handleDeleteAllRecordsForDate}
        />
      </main>
    </div>
  );
};

export default SalesHistory;
