import { supabase } from '@/integrations/supabase/client';

export const cleanupOrphanedInventoryItems = async (negocioId: string, userId: string) => {
  try {
    console.log(`Cleaning up orphaned inventory items for business ${negocioId}...`);

    // Get all active supplies for this user
    const { data: activeSupplies, error: suppliesError } = await supabase
      .from('pricing')
      .select('supply_name')
      .eq('user_id', userId)
      .eq('is_active', true)
      .is('service_type', null)
      .not('supply_name', 'is', null);

    if (suppliesError) throw suppliesError;

    const activeSupplyNames = new Set(
      activeSupplies?.map(s => s.supply_name).filter(Boolean) || []
    );

    // Add "Hojas Blancas" as a protected default item
    activeSupplyNames.add('Hojas Blancas');

    // Get all inventory items for this business
    const { data: businessInventory, error: inventoryError } = await supabase
      .from('inventory')
      .select('id, supply_name')
      .eq('negocio_id', negocioId);

    if (inventoryError) throw inventoryError;

    if (businessInventory && businessInventory.length > 0) {
      // Find orphaned items (inventory items without corresponding active supplies)
      const orphanedItems = businessInventory.filter(
        item => !activeSupplyNames.has(item.supply_name)
      );

      if (orphanedItems.length > 0) {
        console.log(`Found ${orphanedItems.length} orphaned inventory items in business ${negocioId}:`, 
          orphanedItems.map(item => item.supply_name));

        // Delete orphaned items
        const orphanedIds = orphanedItems.map(item => item.id);
        const { error: deleteError } = await supabase
          .from('inventory')
          .delete()
          .in('id', orphanedIds);

        if (deleteError) throw deleteError;
        
        console.log(`Successfully removed ${orphanedItems.length} orphaned inventory items from business ${negocioId}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up orphaned inventory items:', error);
    // Don't throw to avoid blocking other operations
  }
};

export const cleanupDuplicateInventoryItems = async (negocioId: string) => {
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
