import { supabase } from '@/integrations/supabase/client';

export const cleanupDuplicateSupplies = async (userId: string) => {
  try {
    // Get all supplies for this user
    const { data: allSupplies, error: fetchError } = await supabase
      .from('pricing')
      .select('id, supply_name, unit_price, created_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .is('service_type', null)
      .not('supply_name', 'is', null)
      .order('supply_name, created_at');

    if (fetchError) throw fetchError;

    if (allSupplies && allSupplies.length > 0) {
      // Group by supply_name to find duplicates
      const groupedSupplies = allSupplies.reduce((acc, supply) => {
        if (supply.supply_name) {
          if (!acc[supply.supply_name]) {
            acc[supply.supply_name] = [];
          }
          acc[supply.supply_name].push(supply);
        }
        return acc;
      }, {} as Record<string, typeof allSupplies>);

      // For each supply with duplicates, keep only the oldest one
      for (const [supplyName, supplies] of Object.entries(groupedSupplies)) {
        if (supplies.length > 1) {
          const suppliesToDelete = supplies.slice(1).map(supply => supply.id);
          
          console.log(`Found ${supplies.length} duplicate "${supplyName}" supplies, keeping oldest and removing ${suppliesToDelete.length}`);
          
          // Remove corresponding inventory items first
          await removeSupplyFromAllBusinesses(supplyName);
          
          // Soft delete duplicate supplies
          if (suppliesToDelete.length > 0) {
            await supabase
              .from('pricing')
              .update({ is_active: false })
              .in('id', suppliesToDelete);
              
            console.log(`Successfully cleaned up duplicate supplies for ${supplyName}`);
          }
          
          // Re-sync the remaining supply to inventory with correct unit_price
          const remainingSupply = supplies[0];
          await syncSupplyToAllBusinesses(supplyName, remainingSupply.unit_price || 0);
        }
      }
    }

    // Clean up any orphaned inventory items after duplicate cleanup
    await cleanupOrphanedInventoryItems(userId);
  } catch (error) {
    console.error('Error cleaning up duplicate supplies:', error);
    // Don't throw error to avoid blocking the main fetch
  }
};

export const cleanupOrphanedInventoryItems = async (userId: string) => {
  try {
    console.log('Starting cleanup of orphaned inventory items...');

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

    // Get all inventory items across all businesses
    const { data: allInventoryItems, error: inventoryError } = await supabase
      .from('inventory')
      .select('id, supply_name, negocio_id');

    if (inventoryError) throw inventoryError;

    if (allInventoryItems && allInventoryItems.length > 0) {
      // Find orphaned items (inventory items without corresponding active supplies)
      const orphanedItems = allInventoryItems.filter(
        item => !activeSupplyNames.has(item.supply_name)
      );

      if (orphanedItems.length > 0) {
        console.log(`Found ${orphanedItems.length} orphaned inventory items to remove:`, 
          orphanedItems.map(item => item.supply_name));

        // Delete orphaned items
        const orphanedIds = orphanedItems.map(item => item.id);
        const { error: deleteError } = await supabase
          .from('inventory')
          .delete()
          .in('id', orphanedIds);

        if (deleteError) throw deleteError;
        
        console.log(`Successfully removed ${orphanedItems.length} orphaned inventory items`);
      } else {
        console.log('No orphaned inventory items found');
      }
    }
  } catch (error) {
    console.error('Error cleaning up orphaned inventory items:', error);
    // Don't throw to avoid blocking other operations
  }
};

export const removeSupplyFromAllBusinesses = async (supplyName: string) => {
  try {
    // Delete all inventory items with this supply name across all businesses
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('supply_name', supplyName);

    if (error) throw error;
    console.log(`Removed inventory items for ${supplyName} from all businesses`);
  } catch (error) {
    console.error('Error removing supply from inventory:', error);
    throw error; // Throw error to prevent supply deletion if inventory cleanup fails
  }
};

export const syncSupplyToAllBusinesses = async (supplyName: string, unitPrice: number) => {
  try {
    // Get all businesses
    const { data: businesses, error: businessError } = await supabase
      .from('negocios')
      .select('id');

    if (businessError) throw businessError;

    if (businesses && businesses.length > 0) {
      // For each business, check if inventory item exists and create if not
      for (const business of businesses) {
        // Check for existing item to avoid duplicates
        const { data: existingItem, error: checkError } = await supabase
          .from('inventory')
          .select('id, unit_cost')
          .eq('negocio_id', business.id)
          .eq('supply_name', supplyName)
          .maybeSingle();

        if (checkError) throw checkError;

        // If item doesn't exist, create it
        if (!existingItem) {
          const { error: insertError } = await supabase
            .from('inventory')
            .insert({
              negocio_id: business.id,
              supply_name: supplyName,
              quantity: 0,
              unit_cost: unitPrice,
              threshold_quantity: 5,
              unit_type: 'units'
            });

          if (insertError) throw insertError;
          console.log(`Auto-created inventory item for ${supplyName} in business ${business.id}`);
        } else {
          // Update the unit cost if item exists (but don't change selling price)
          const { error: updateError } = await supabase
            .from('inventory')
            .update({ unit_cost: unitPrice })
            .eq('id', existingItem.id);

          if (updateError) throw updateError;
          console.log(`Updated unit cost for ${supplyName} in business ${business.id}`);
        }
      }
    }
  } catch (error) {
    console.error('Error syncing supply to inventory:', error);
    // Don't throw error to avoid blocking supply creation
  }
};
