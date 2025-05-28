
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Business, UserBusinessRole } from '@/types/business';
import type { User } from '@supabase/supabase-js';

export const useBusinessData = (user: User | null) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [userRoles, setUserRoles] = useState<UserBusinessRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadBusinesses = async () => {
    if (!user) {
      setBusinesses([]);
      setUserRoles([]);
      setLoading(false);
      return;
    }

    try {
      // Load user's business relationships
      const { data: userBusinessData, error: userBusinessError } = await supabase
        .from('usuarios_negocios')
        .select(`
          *,
          negocios:negocio_id (*)
        `)
        .eq('usuario_id', user.id);

      if (userBusinessError) throw userBusinessError;

      if (userBusinessData && userBusinessData.length > 0) {
        const businessList = userBusinessData.map(ub => ub.negocios).filter(Boolean) as Business[];
        setBusinesses(businessList);
        setUserRoles(userBusinessData);
      } else {
        setBusinesses([]);
        setUserRoles([]);
      }
    } catch (error) {
      console.error('Error loading businesses:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los negocios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadBusinesses();
    } else {
      setBusinesses([]);
      setUserRoles([]);
      setLoading(false);
    }
  }, [user]);

  return {
    businesses,
    userRoles,
    loading,
    loadBusinesses,
  };
};
