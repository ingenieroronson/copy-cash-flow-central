
import { supabase } from '@/integrations/supabase/client';
import { cleanupDuplicateInventoryItems } from './inventorySync';

export const initializeInventoryFromSupplies = async (negocioId: string, userId: string) => {
  try {
    // Clean up any duplicate inventory items first
    await cleanupDuplicateInventoryItems(negocioId);

    // Get user's existing supplies from pricing table (active supplies)
    const { data: userSupplies, error: suppliesError } = await supabase
      .from('pricing')
      .select('supply_name, unit_price')
      .eq('user_id', userId)
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
