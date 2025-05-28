import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Header } from '@/components/Header';
import { SalesHistoryTable } from '@/components/SalesHistoryTable';
import { useToast } from '@/hooks/use-toast';
import { AuthForm } from '@/components/AuthForm';
import { usePhotocopiers } from '@/hooks/usePhotocopiers';
import { PhotocopierSelector } from '@/components/PhotocopierSelector';

export interface SalesRecord {
  id: string;
  fecha: string;
  tipo: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
  source: 'service' | 'supply';
  supply_name?: string;
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
  const { photocopiers, loading: photocopiersLoading } = usePhotocopiers();
  const [selectedPhotocopierId, setSelectedPhotocopierId] = useState<string>('');
  const [salesData, setSalesData] = useState<DailySales[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Set default photocopier when photocopiers are loaded
  useEffect(() => {
    if (photocopiers.length > 0 && !selectedPhotocopierId) {
      setSelectedPhotocopierId(photocopiers[0].id);
    }
  }, [photocopiers, selectedPhotocopierId]);

  const loadSalesData = async () => {
    if (!user) return;

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

      // Load service sales from ventas table with error information
      let serviceQuery = supabase
        .from('ventas')
        .select('*')
        .eq('usuario_id', user.id)
        .order('fecha', { ascending: false });

      if (selectedPhotocopierId) {
        serviceQuery = serviceQuery.eq('fotocopiadora_id', selectedPhotocopierId);
      }

      const { data: serviceRecords, error: serviceError } = await serviceQuery;

      if (serviceError) throw serviceError;

      // Load supply sales from supply_sales table
      let supplyQuery = supabase
        .from('supply_sales')
        .select('*')
        .eq('usuario_id', user.id)
        .order('fecha', { ascending: false });

      if (selectedPhotocopierId) {
        supplyQuery = supplyQuery.eq('fotocopiadora_id', selectedPhotocopierId);
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
    try {
      const tableName = record.source === 'service' ? 'ventas' : 'supply_sales';
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', record.id);

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
    if (user && selectedPhotocopierId) {
      loadSalesData();
    }
  }, [user, selectedPhotocopierId]);

  if (authLoading || photocopiersLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthForm />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Historial de Ventas</h1>
          <p className="text-gray-600">Revisa todas tus ventas organizadas por fecha</p>
        </div>

        <div className="mb-6">
          <PhotocopierSelector
            photocopiers={photocopiers}
            selectedPhotocopierId={selectedPhotocopierId}
            onPhotocopierChange={setSelectedPhotocopierId}
            loading={photocopiersLoading}
          />
        </div>

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
