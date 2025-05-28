
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useBusinesses } from './useBusinesses';
import { useToast } from '@/hooks/use-toast';

export interface Supply {
  id: string;
  supply_name: string | null;
  unit_price: number;
  is_active: boolean | null;
  negocio_id: string | null;
}

export const useSupplies = () => {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { currentBusinessId } = useBusinesses();
  const { toast } = useToast();

  const fetchSupplies = async () => {
    if (!user || !currentBusinessId) {
      setSupplies([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('pricing')
        .select('*')
        .eq('user_id', user.id)
        .eq('negocio_id', currentBusinessId)
        .eq('is_active', true)
        .is('service_type', null)
        .not('supply_name', 'is', null);

      if (error) throw error;
      
      // Transform the data to match the Supply interface
      const transformedData: Supply[] = (data || []).map(item => ({
        id: item.id,
        supply_name: item.supply_name,
        unit_price: item.unit_price,
        is_active: item.is_active,
        negocio_id: item.negocio_id
      }));
      
      setSupplies(transformedData);
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
    if (user && currentBusinessId) {
      fetchSupplies();
    }
  }, [user, currentBusinessId]);

  const addSupply = async (name: string, price: number) => {
    if (!user || !currentBusinessId) return;

    try {
      const { error } = await supabase
        .from('pricing')
        .insert({
          user_id: user.id,
          negocio_id: currentBusinessId,
          supply_name: name,
          unit_price: price,
          is_active: true
        });

      if (error) throw error;
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
      
      setSupplies(prev => prev.map(supply => 
        supply.id === id ? { ...supply, ...updates } : supply
      ));
    } catch (error) {
      console.error('Error updating supply:', error);
      throw error;
    }
  };

  const deleteSupply = async (supplyName: string) => {
    if (!user || !currentBusinessId) return;

    try {
      const { error } = await supabase
        .from('pricing')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('negocio_id', currentBusinessId)
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
