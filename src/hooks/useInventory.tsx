
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { useInventoryTransactions } from './useInventoryTransactions';
import { useInventoryDeductions } from './useInventoryDeductions';
import { cleanupDuplicateInventoryItems, cleanupOrphanedInventoryItems } from '@/utils/inventorySync';
import { initializeInventoryFromSupplies } from '@/utils/inventoryInitialization';

export interface InventoryItem {
  id: string;
  negocio_id: string;
  supply_name: string;
  quantity: number;
  unit_cost: number;
  threshold_quantity: number;
  unit_type: string;
  sheets_per_block?: number;
  created_at: string;
  updated_at: string;
}

export const useInventory = (negocioId?: string) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const { addInventoryTransaction } = useInventoryTransactions();
  const { deductInventoryForSales } = useInventoryDeductions(inventory);

  const fetchInventory = async () => {
    if (!user || !negocioId) return;

    try {
      // Clean up duplicate inventory items first
      await cleanupDuplicateInventoryItems(negocioId);
      
      // Clean up orphaned inventory items
      await cleanupOrphanedInventoryItems(negocioId, user.id);

      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('negocio_id', negocioId)
        .order('supply_name');

      if (error) throw error;
      
      // If no inventory exists, auto-populate with user's supplies and default items
      if (!data || data.length === 0) {
        await initializeInventoryFromSupplies(negocioId, user.id);
        // Refetch after initialization
        const { data: newData, error: refetchError } = await supabase
          .from('inventory')
          .select('*')
          .eq('negocio_id', negocioId)
          .order('supply_name');

        if (refetchError) throw refetchError;
        setInventory(newData || []);
      } else {
        setInventory(data);
      }
      
      // Check for low stock items
      const lowStock = (data || []).filter(item => item.quantity < item.threshold_quantity);
      setLowStockItems(lowStock);
      
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el inventario",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user || !negocioId) return;

    try {
      // Check for duplicates before adding
      const { data: existingItem, error: checkError } = await supabase
        .from('inventory')
        .select('id')
        .eq('negocio_id', negocioId)
        .eq('supply_name', item.supply_name)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingItem) {
        toast({
          title: "Error",
          description: "Ya existe un artículo con ese nombre en el inventario",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('inventory')
        .insert({
          ...item,
          negocio_id: negocioId
        });

      if (error) throw error;
      
      await fetchInventory();
      
      toast({
        title: "Inventario agregado",
        description: "El artículo se agregó correctamente al inventario",
      });
    } catch (error) {
      console.error('Error adding inventory item:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el artículo al inventario",
        variant: "destructive",
      });
    }
  };

  const updateInventoryItem = async (id: string, updates: Partial<Pick<InventoryItem, 'quantity' | 'unit_cost' | 'threshold_quantity' | 'unit_type' | 'sheets_per_block'>>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('inventory')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      await fetchInventory();
      
      toast({
        title: "Inventario actualizado",
        description: "El artículo se actualizó correctamente",
      });
    } catch (error) {
      console.error('Error updating inventory item:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el artículo",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (negocioId) {
      fetchInventory();
    }
  }, [user, negocioId]);

  return {
    inventory,
    loading,
    lowStockItems,
    addInventoryItem,
    updateInventoryItem,
    addInventoryTransaction,
    deductInventoryForSales,
    refetch: fetchInventory,
  };
};
