
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Procedure {
  id: string;
  name: string;
  unit_price: number;
  is_active: boolean;
}

export const useProcedures = () => {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProcedures = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('procedures')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setProcedures(data || []);
    } catch (error) {
      console.error('Error fetching procedures:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los procedimientos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProcedures();
    }
  }, [user]);

  const addProcedure = async (name: string, unitPrice: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('procedures')
        .insert({
          user_id: user.id,
          name,
          unit_price: unitPrice,
        });

      if (error) throw error;
      await fetchProcedures();
    } catch (error) {
      console.error('Error adding procedure:', error);
      throw error;
    }
  };

  const updateProcedure = async (id: string, updates: Partial<Procedure>) => {
    try {
      const { error } = await supabase
        .from('procedures')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchProcedures();
    } catch (error) {
      console.error('Error updating procedure:', error);
      throw error;
    }
  };

  const deleteProcedure = async (name: string) => {
    try {
      const { error } = await supabase
        .from('procedures')
        .update({ is_active: false })
        .eq('name', name)
        .eq('user_id', user?.id);

      if (error) throw error;
      await fetchProcedures();
    } catch (error) {
      console.error('Error deleting procedure:', error);
      throw error;
    }
  };

  const getProcedurePrice = (procedureName: string) => {
    const procedure = procedures.find(p => p.name === procedureName);
    return procedure?.unit_price || 0;
  };

  return {
    procedures,
    loading,
    addProcedure,
    updateProcedure,
    deleteProcedure,
    getProcedurePrice,
    refetch: fetchProcedures,
  };
};
