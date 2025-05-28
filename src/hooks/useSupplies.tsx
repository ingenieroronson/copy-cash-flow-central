
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

  useEffect(() => {
    if (user) {
      fetchSupplies();
    }
  }, [user]);

  const addSupply = async (name: string, price: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('pricing')
        .insert({
          user_id: user.id,
          supply_name: name,
          unit_price: price,
          is_active: true
        });

      if (error) throw error;
      
      // Auto-sync to inventory for all user's businesses
      await syncSupplyToInventory(name, price);
      
      await fetchSupplies();
    } catch (error) {
      console.error('Error adding supply:', error);
      throw error;
    }
  };

  const syncSupplyToInventory = async (supplyName: string, unitPrice: number) => {
    if (!user) return;

    try {
      // Get all businesses (for now, all businesses until proper ownership is implemented)
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
          }
        }
      }
    } catch (error) {
      console.error('Error syncing supply to inventory:', error);
      // Don't throw error to avoid blocking supply creation
    }
  };

  const updateSupply = async (id: string, updates: Partial<Supply>) => {
    try {
      const { error } = await supabase
        .from('pricing')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
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
      const { error } = await supabase
        .from('pricing')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('supply_name', supplyName);

      if (error) throw error;
      await fetchSupplies();
    } catch (error) {
      console.error('Error deleting supply:', error);
      throw error;
    }
  };

  return {
    supplies,
    loading,
    addSupply,
    updateSupply,
    deleteSupply,
    refetch: fetchSupplies,
  };
};
