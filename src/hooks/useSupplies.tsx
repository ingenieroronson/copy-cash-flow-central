
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { useSuppliesActions } from './useSuppliesActions';
import { cleanupDuplicateSupplies, cleanupOrphanedInventoryItems } from '@/utils/suppliesCleanup';

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
      // Clean up duplicates first
      await cleanupDuplicateSupplies(user.id);

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

  const { addSupply, updateSupply, deleteSupply } = useSuppliesActions(user, supplies, setSupplies, fetchSupplies);

  // Run cleanup operations when component mounts or user changes
  useEffect(() => {
    if (user) {
      // Run comprehensive cleanup first, then fetch supplies
      cleanupDuplicateSupplies(user.id).then(() => {
        fetchSupplies();
      });
    }
  }, [user]);

  return {
    supplies,
    loading,
    addSupply,
    updateSupply,
    deleteSupply,
    refetch: fetchSupplies,
    cleanupOrphanedInventoryItems: () => cleanupOrphanedInventoryItems(user?.id || ''),
  };
};
