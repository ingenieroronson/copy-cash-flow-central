
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Header } from '@/components/Header';
import { SalesHistoryTable } from '@/components/SalesHistoryTable';
import { useToast } from '@/hooks/use-toast';
import { AuthForm } from '@/components/AuthForm';

export interface SalesRecord {
  id: string;
  fecha: string;
  tipo: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
  source: 'service' | 'supply';
  supply_name?: string;
}

export interface DailySales {
  date: string;
  totalAmount: number;
  records: SalesRecord[];
}

const SalesHistory = () => {
  const { user, loading: authLoading } = useAuth();
  const [salesData, setSalesData] = useState<DailySales[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadSalesData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load service sales from ventas table
      const { data: serviceRecords, error: serviceError } = await supabase
        .from('ventas')
        .select('*')
        .eq('usuario_id', user.id)
        .order('fecha', { ascending: false });

      if (serviceError) throw serviceError;

      // Load supply sales from supply_sales table
      const { data: supplyRecords, error: supplyError } = await supabase
        .from('supply_sales')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (supplyError) throw supplyError;

      // Transform and combine data
      const allRecords: SalesRecord[] = [
        ...(serviceRecords?.map(record => ({
          id: record.id,
          fecha: record.fecha,
          tipo: record.tipo || '',
          cantidad: record.cantidad || 0,
          precio_unitario: record.precio_unitario || 0,
          total: record.total || 0,
          source: 'service' as const
        })) || []),
        ...(supplyRecords?.map(record => ({
          id: record.id,
          fecha: record.date,
          tipo: 'suministro',
          cantidad: record.quantity_sold || 0,
          precio_unitario: record.unit_price || 0,
          total: record.total || 0,
          source: 'supply' as const,
          supply_name: record.supply_name
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

  useEffect(() => {
    if (user) {
      loadSalesData();
    }
  }, [user]);

  if (authLoading) {
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

        <SalesHistoryTable 
          salesData={salesData} 
          onDeleteRecord={handleDeleteRecord}
        />
      </main>
    </div>
  );
};

export default SalesHistory;
