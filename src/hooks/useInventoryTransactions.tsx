
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

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

export const useInventoryTransactions = () => {
  const { user } = useAuth();

  const addInventoryTransaction = async (transaction: Omit<InventoryTransaction, 'id' | 'created_at'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('inventory_transactions')
        .insert(transaction);

      if (error) throw error;
    } catch (error) {
      console.error('Error adding inventory transaction:', error);
      throw error;
    }
  };

  return {
    addInventoryTransaction,
  };
};
