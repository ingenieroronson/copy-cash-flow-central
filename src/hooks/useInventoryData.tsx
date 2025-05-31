
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import type { InventoryFilters } from '@/components/InventoryManagement';

interface InventoryRecord {
  name: string;
  type: 'service' | 'supply' | 'procedure';
  totalInventory: number;
  soldQuantity: number;
  availableQuantity: number;
}

export const useInventoryData = (filters: InventoryFilters) => {
  const [data, setData] = useState<InventoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchInventoryData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch service sales
      let servicesQuery = supabase
        .from('ventas')
        .select('tipo, cantidad')
        .eq('usuario_id', user.id)
        .gte('fecha', filters.dateRange.startDate)
        .lte('fecha', filters.dateRange.endDate)
        .not('cantidad', 'is', null)
        .not('tipo', 'is', null);

      if (filters.photocopierId) {
        servicesQuery = servicesQuery.eq('fotocopiadora_id', filters.photocopierId);
      }

      const { data: servicesData, error: servicesError } = await servicesQuery;
      if (servicesError) throw servicesError;

      // Fetch procedure sales
      let proceduresQuery = supabase
        .from('procedure_sales')
        .select('procedure_name, cantidad')
        .eq('usuario_id', user.id)
        .gte('fecha', filters.dateRange.startDate)
        .lte('fecha', filters.dateRange.endDate);

      if (filters.photocopierId) {
        proceduresQuery = proceduresQuery.eq('fotocopiadora_id', filters.photocopierId);
      }

      const { data: proceduresData, error: proceduresError } = await proceduresQuery;
      if (proceduresError) throw proceduresError;

      // Fetch supply sales
      let suppliesQuery = supabase
        .from('supply_sales')
        .select('nombre_insumo, cantidad')
        .eq('usuario_id', user.id)
        .gte('fecha', filters.dateRange.startDate)
        .lte('fecha', filters.dateRange.endDate);

      if (filters.photocopierId) {
        suppliesQuery = suppliesQuery.eq('fotocopiadora_id', filters.photocopierId);
      }

      const { data: suppliesData, error: suppliesError } = await suppliesQuery;
      if (suppliesError) throw suppliesError;

      // Process services data
      const servicesMap = new Map<string, number>();
      servicesData?.forEach(record => {
        const current = servicesMap.get(record.tipo) || 0;
        servicesMap.set(record.tipo, current + (record.cantidad || 0));
      });

      // Process procedures data
      const proceduresMap = new Map<string, number>();
      proceduresData?.forEach(record => {
        const current = proceduresMap.get(record.procedure_name) || 0;
        proceduresMap.set(record.procedure_name, current + (record.cantidad || 0));
      });

      // Process supplies data
      const suppliesMap = new Map<string, number>();
      suppliesData?.forEach(record => {
        const current = suppliesMap.get(record.nombre_insumo) || 0;
        suppliesMap.set(record.nombre_insumo, current + (record.cantidad || 0));
      });

      // Create inventory records with default inventory values
      const inventoryRecords: InventoryRecord[] = [];

      // Add services
      servicesMap.forEach((soldQuantity, serviceName) => {
        const totalInventory = 1000; // Default inventory for services
        inventoryRecords.push({
          name: serviceName,
          type: 'service',
          totalInventory,
          soldQuantity,
          availableQuantity: totalInventory - soldQuantity
        });
      });

      // Add procedures
      proceduresMap.forEach((soldQuantity, procedureName) => {
        const totalInventory = 100; // Default inventory for procedures
        inventoryRecords.push({
          name: procedureName,
          type: 'procedure',
          totalInventory,
          soldQuantity,
          availableQuantity: totalInventory - soldQuantity
        });
      });

      // Add supplies
      suppliesMap.forEach((soldQuantity, supplyName) => {
        const totalInventory = 50; // Default inventory for supplies
        inventoryRecords.push({
          name: supplyName,
          type: 'supply',
          totalInventory,
          soldQuantity,
          availableQuantity: totalInventory - soldQuantity
        });
      });

      // Sort by available quantity (lowest first to highlight issues)
      inventoryRecords.sort((a, b) => a.availableQuantity - b.availableQuantity);

      setData(inventoryRecords);

    } catch (error) {
      console.error('Error fetching inventory data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de inventario.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateInventory = async (itemName: string, itemType: 'service' | 'supply' | 'procedure', newInventory: number) => {
    try {
      // For now, we'll just update the local state
      // In a real implementation, you'd save this to a database
      setData(prev => prev.map(item => 
        item.name === itemName && item.type === itemType
          ? {
              ...item,
              totalInventory: newInventory,
              availableQuantity: newInventory - item.soldQuantity
            }
          : item
      ));

      toast({
        title: "Inventario actualizado",
        description: `Se actualizó el inventario de ${itemName}`,
      });

    } catch (error) {
      console.error('Error updating inventory:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el inventario.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchInventoryData();
    }
  }, [user, filters]);

  return {
    data,
    loading,
    updateInventory,
    refetch: fetchInventoryData
  };
};
