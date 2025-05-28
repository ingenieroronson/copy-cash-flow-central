
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Supply {
  id: string;
  supply_name: string | null;
  unit_price: number;
  is_active: boolean | null;
}

export const useSupplies = () => {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSupplies = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('pricing')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .is('service_type', null)
        .not('supply_name', 'is', null);

      if (error) throw error;
      setSupplies(data || []);
    } catch (error) {
      console.error('Error fetching supplies:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los suministros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const syncSupplyToAllBusinesses = async (supplyName: string, unitPrice: number) => {
    if (!user) return;

    try {
      // Get all businesses that the user has access to
      const { data: businesses, error: businessError } = await supabase
        .from('negocios')
        .select('id');

      if (businessError) throw businessError;

      if (businesses && businesses.length > 0) {
        // For each business, check if inventory item exists and create if not
        for (const business of businesses) {
          const { data: existingItem, error: checkError } = await supabase
            .from('inventory')
            .select('id')
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
            // Update the unit cost if item exists
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

  const removeSupplyFromAllBusinesses = async (supplyName: string) => {
    if (!user) return;

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
      // Don't throw error to avoid blocking supply deletion
    }
  };

  const addSupply = async (name: string, price: number) => {
    if (!user) return;

    try {
      // Check for duplicates before adding
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
        description: "El suministro y sus registros de inventario han sido eliminados",
      });
    } catch (error) {
      console.error('Error deleting supply:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchSupplies();
    }
  }, [user]);

  return {
    supplies,
    loading,
    addSupply,
    updateSupply,
    deleteSupply,
    refetch: fetchSupplies,
  };
};
