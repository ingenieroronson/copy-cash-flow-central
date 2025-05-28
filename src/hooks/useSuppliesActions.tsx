
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cleanupDuplicateSupplies, removeSupplyFromAllBusinesses, syncSupplyToAllBusinesses } from '@/utils/suppliesCleanup';
import { Supply } from './useSupplies';

export const useSuppliesActions = (user: any, supplies: Supply[], setSupplies: (supplies: Supply[]) => void, fetchSupplies: () => Promise<void>) => {
  const { toast } = useToast();

  const addSupply = async (name: string, price: number) => {
    if (!user) return;

    try {
      // Clean up duplicates first
      await cleanupDuplicateSupplies(user.id);

      // Check for duplicates after cleanup
      const { data: existingSupply, error: checkError } = await supabase
        .from('pricing')
        .select('id')
        .eq('user_id', user.id)
        .eq('supply_name', name)
        .eq('is_active', true)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingSupply) {
        toast({
          title: "Error",
          description: "Ya existe un suministro con ese nombre",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('pricing')
        .insert({
          user_id: user.id,
          supply_name: name,
          unit_price: price,
          is_active: true
        });

      if (error) throw error;
      
      // Auto-sync to inventory for all businesses
      await syncSupplyToAllBusinesses(name, price);
      
      await fetchSupplies();
      
      toast({
        title: "Suministro agregado",
        description: "El suministro se agregó correctamente y se sincronizó con el inventario",
      });
    } catch (error) {
      console.error('Error adding supply:', error);
      throw error;
    }
  };

  const updateSupply = async (id: string, updates: Partial<Supply>) => {
    try {
      const { error } = await supabase
        .from('pricing')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      // If supply name or price changed, sync to inventory
      if (updates.supply_name || updates.unit_price !== undefined) {
        const supply = supplies.find(s => s.id === id);
        if (supply && supply.supply_name) {
          await syncSupplyToAllBusinesses(
            updates.supply_name || supply.supply_name,
            updates.unit_price !== undefined ? updates.unit_price : supply.unit_price
          );
        }
      }
      
      setSupplies(prev => prev.map(supply => 
        supply.id === id ? { ...supply, ...updates } : supply
      ));
    } catch (error) {
      console.error('Error updating supply:', error);
      throw error;
    }
  };

  const deleteSupply = async (supplyName: string) => {
    if (!user) return;

    try {
      // First, remove from all business inventories
      await removeSupplyFromAllBusinesses(supplyName);

      // Then, soft delete from pricing
      const { error } = await supabase
        .from('pricing')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('supply_name', supplyName);

      if (error) throw error;
      await fetchSupplies();
      
      toast({
        title: "Suministro eliminado",
        description: "El suministro y sus registros de inventario han sido eliminados completamente",
      });
    } catch (error) {
      console.error('Error deleting supply:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el suministro completamente",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    addSupply,
    updateSupply,
    deleteSupply,
  };
};
