
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

  const initializeInventoryFromSupplies = async (negocioId: string) => {
    if (!user) return;

    try {
      // Get user's existing supplies from pricing table (active supplies)
      const { data: userSupplies, error: suppliesError } = await supabase
        .from('pricing')
        .select('supply_name, unit_price')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .not('supply_name', 'is', null);

      if (suppliesError) throw suppliesError;

      // Prepare inventory items from user supplies
      const inventoryItems = [];

      // Add user's existing supplies
      if (userSupplies && userSupplies.length > 0) {
        userSupplies.forEach(supply => {
          if (supply.supply_name) {
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

      // Check if "Hojas Blancas" already exists in supplies
      const hasHojasBlancas = userSupplies?.some(s => s.supply_name === 'Hojas Blancas');
      
      // Add default "Hojas Blancas" item only if it doesn't exist
      if (!hasHojasBlancas) {
        inventoryItems.push({
          negocio_id: negocioId,
          supply_name: 'Hojas Blancas',
          quantity: 0,
          unit_cost: 0,
          threshold_quantity: 2,
          unit_type: 'blocks',
          sheets_per_block: 500
        });
      }

      // Insert all items at once, but check for duplicates first
      if (inventoryItems.length > 0) {
        for (const item of inventoryItems) {
          const { data: existingItem, error: checkError } = await supabase
            .from('inventory')
            .select('id')
            .eq('negocio_id', negocioId)
            .eq('supply_name', item.supply_name)
            .maybeSingle();

          if (checkError) throw checkError;

          // Only insert if item doesn't exist
          if (!existingItem) {
            const { error: insertError } = await supabase
              .from('inventory')
              .insert(item);

            if (insertError) throw insertError;
          }
        }
        
        console.log(`Initialized inventory with supplies for business ${negocioId}`);
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

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    if (!user) return;

    try {
      // Only allow updates to specific fields (no price changes)
      const { unit_price, supply_name, ...allowedUpdates } = updates;
      
      const { error } = await supabase
        .from('inventory')
        .update(allowedUpdates)
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

      // Deduct white paper if sheets were used (look for "Hojas Blancas")
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
