
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserBusiness {
  id: string;
  nombre: string;
}

export const useUserBusinesses = () => {
  const [businesses, setBusinesses] = useState<UserBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserBusinesses = async () => {
      if (!user) {
        setBusinesses([]);
        setLoading(false);
        return;
      }

      try {
        // First, ensure user exists in usuarios table
        await supabase
          .from('usuarios')
          .upsert({ 
            id: user.id, 
            email: user.email || '', 
            nombre: user.user_metadata?.name || user.email || 'Usuario' 
          }, { 
            onConflict: 'id' 
          });

        // Get businesses the user has created directly (where they don't have a negocio_id yet)
        // For now, we'll create a default business for each user if none exists
        const { data: existingBusinesses, error: fetchError } = await supabase
          .from('negocios')
          .select('id, nombre')
          .order('nombre');

        if (fetchError) throw fetchError;

        // If no businesses exist at all, create a default one for this user
        if (!existingBusinesses || existingBusinesses.length === 0) {
          const { data: newBusiness, error: createError } = await supabase
            .from('negocios')
            .insert({
              nombre: `Negocio de ${user.user_metadata?.name || user.email || 'Usuario'}`,
              descripcion: 'Negocio principal'
            })
            .select('id, nombre')
            .single();

          if (createError) throw createError;
          setBusinesses([newBusiness]);
        } else {
          // For now, let users access all businesses until we implement proper ownership
          // In a production app, you'd want to filter by actual ownership
          setBusinesses(existingBusinesses);
        }
      } catch (error) {
        console.error('Error fetching user businesses:', error);
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBusinesses();
  }, [user]);

  return {
    businesses,
    loading,
  };
};
