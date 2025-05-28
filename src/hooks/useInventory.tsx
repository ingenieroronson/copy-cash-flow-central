
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

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

export interface InventoryTransaction {
  id: string;
  inventory_id: string;
  transaction_type: 'purchase' | 'sale' | 'adjustment';
  quantity_change: number;
  unit_cost?: number;
  reference_id?: string;
  reference_type?: string;
  notes?: string;
  created_at: string;
}

export const useInventory = (negocioId?: string) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchInventory = async () => {
    if (!user || !negocioId) return;

    try {
      // Clean up duplicate inventory items first
      await cleanupDuplicateInventoryItems(negocioId);

      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('negocio_id', negocioId)
        .order('supply_name');

      if (error) throw error;
      
      // If no inventory exists, auto-populate with user's supplies and default items
      if (!data || data.length === 0) {
        await initializeInventoryFromSupplies(negocioId);
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

  const cleanupDuplicateInventoryItems = async (negocioId: string) => {
    try {
      // Get all inventory items for this business
      const { data: inventoryItems, error: fetchError } = await supabase
        .from('inventory')
        .select('id, supply_name, created_at')
        .eq('negocio_id', negocioId)
        .order('supply_name, created_at');

      if (fetchError) throw fetchError;

      if (inventoryItems && inventoryItems.length > 0) {
        // Group by supply_name to find duplicates
        const groupedItems = inventoryItems.reduce((acc, item) => {
          if (!acc[item.supply_name]) {
            acc[item.supply_name] = [];
          }
          acc[item.supply_name].push(item);
          return acc;
        }, {} as Record<string, typeof inventoryItems>);

        // For each supply with duplicates, keep only the oldest one
        for (const [supplyName, items] of Object.entries(groupedItems)) {
          if (items.length > 1) {
            const itemsToDelete = items.slice(1).map(item => item.id);
            
            console.log(`Found ${items.length} duplicate "${supplyName}" items, keeping oldest and removing ${itemsToDelete.length}`);
            
            // Delete duplicate items
            if (itemsToDelete.length > 0) {
              await supabase
                .from('inventory')
                .delete()
                .in('id', itemsToDelete);
                
              console.log(`Successfully cleaned up duplicate inventory items for ${supplyName}`);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up duplicate inventory items:', error);
      // Don't throw error to avoid blocking the main fetch
    }
  };

  const initializeInventoryFromSupplies = async (negocioId: string) => {
    if (!user) return;

    try {
      // Clean up any duplicate inventory items first
      await cleanupDuplicateInventoryItems(negocioId);

      // Get user's existing supplies from pricing table (active supplies)
      const { data: userSupplies, error: suppliesError } = await supabase
        .from('pricing')
        .select('supply_name, unit_price')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .not('supply_name', 'is', null);

      if (suppliesError) throw suppliesError;

      // Get current inventory to avoid duplicates
      const { data: currentInventory, error: inventoryError } = await supabase
        .from('inventory')
        .select('supply_name')
        .eq('negocio_id', negocioId);

      if (inventoryError) throw inventoryError;

      const existingSupplyNames = new Set(currentInventory?.map(item => item.supply_name) || []);

      // Prepare inventory items from user supplies
      const inventoryItems = [];

      // Add user's existing supplies that don't already exist in inventory
      if (userSupplies && userSupplies.length > 0) {
        userSupplies.forEach(supply => {
          if (supply.supply_name && !existingSupplyNames.has(supply.supply_name)) {
            inventoryItems.push({
              negocio_id: negocioId,
              supply_name: supply.supply_name,
              quantity: 0,
              unit_cost: supply.unit_price || 0,
              threshold_quantity: 5,
              unit_type: 'units'
            });
          }
        });
      }

      // Add default "Hojas Blancas" item only if it doesn't exist
      if (!existingSupplyNames.has('Hojas Blancas')) {
        inventoryItems.push({
          negocio_id: negocioId,
          supply_name: 'Hojas Blancas',
          quantity: 0,
          unit_cost: 0,
          threshold_quantity: 2,
          unit_type: 'bloques',
          sheets_per_block: 500
        });
      }

      // Insert all new items
      if (inventoryItems.length > 0) {
        const { error: insertError } = await supabase
          .from('inventory')
          .insert(inventoryItems);

        if (insertError) throw insertError;
        
        console.log(`Initialized inventory with ${inventoryItems.length} supplies for business ${negocioId}`);
      }
    } catch (error) {
      console.error('Error initializing inventory from supplies:', error);
      // Don't throw error to avoid blocking the main inventory fetch
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

  const addInventoryTransaction = async (transaction: Omit<InventoryTransaction, 'id' | 'created_at'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('inventory_transactions')
        .insert(transaction);

      if (error) throw error;
      
      await fetchInventory();
    } catch (error) {
      console.error('Error adding inventory transaction:', error);
      throw error;
    }
  };

  const deductInventoryForSales = async (
    servicesData: any,
    suppliesData: any,
    photocopierId: string,
    salesDate: string
  ) => {
    if (!user || !negocioId) return;

    try {
      // Calculate total sheets used for white paper
      let totalSheetsUsed = 0;
      
      // Sum sheets from services (copies, prints, and errors)
      Object.values(servicesData).forEach((service: any) => {
        if (service && typeof service === 'object') {
          const sold = Math.max(0, service.today - service.yesterday);
          const errors = service.errors || 0;
          totalSheetsUsed += sold + errors;
        }
      });

      // Deduct "Hojas Blancas" if sheets were used
      if (totalSheetsUsed > 0) {
        const whitePaperItem = inventory.find(item => item.supply_name === 'Hojas Blancas');
        if (whitePaperItem && whitePaperItem.sheets_per_block) {
          const blocksUsed = totalSheetsUsed / whitePaperItem.sheets_per_block;
          
          await addInventoryTransaction({
            inventory_id: whitePaperItem.id,
            transaction_type: 'sale',
            quantity_change: -blocksUsed,
            reference_type: 'service_sale',
            notes: `Deducción automática: ${totalSheetsUsed} hojas (${blocksUsed.toFixed(2)} bloques) usadas en servicios de fotocopiado`
          });
        }
      }

      // Deduct other supplies based on sold quantities
      for (const [supplyName, supplyData] of Object.entries(suppliesData)) {
        if (supplyData && typeof supplyData === 'object') {
          const sold = Math.max(0, (supplyData as any).startStock - (supplyData as any).endStock);
          
          if (sold > 0) {
            const inventoryItem = inventory.find(item => item.supply_name === supplyName);
            if (inventoryItem) {
              await addInventoryTransaction({
                inventory_id: inventoryItem.id,
                transaction_type: 'sale',
                quantity_change: -sold,
                reference_type: 'supply_sale',
                notes: `Deducción automática: ${sold} unidades vendidas`
              });
            }
          }
        }
      }

    } catch (error) {
      console.error('Error deducting inventory for sales:', error);
      // Don't throw error to avoid blocking sales save
      toast({
        title: "Advertencia",
        description: "Las ventas se guardaron pero no se pudo actualizar el inventario automáticamente",
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
