
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

        // Check for existing businesses
        const { data: existingBusinesses, error: fetchError } = await supabase
          .from('negocios')
          .select('id, nombre')
          .order('nombre');

        if (fetchError) throw fetchError;

        // Check if user has photocopiers
        const { data: userPhotocopiers, error: photocopiersError } = await supabase
          .from('fotocopiadoras')
          .select('id')
          .eq('usuario_id', user.id);

        if (photocopiersError) throw photocopiersError;

        const hasPhotocopiers = userPhotocopiers && userPhotocopiers.length > 0;
        const hasNoBusinesses = !existingBusinesses || existingBusinesses.length === 0;

        // Auto-create business if user has photocopiers but no businesses
        if (hasPhotocopiers && hasNoBusinesses) {
          console.log('Auto-creating default business for user with photocopiers');
          
          const { data: newBusiness, error: createError } = await supabase
            .from('negocios')
            .insert({
              nombre: 'Negocio Principal',
              descripcion: 'Negocio principal creado automáticamente'
            })
            .select('id, nombre')
            .single();

          if (createError) throw createError;

          // Link all user's photocopiers to the new business
          const { error: linkError } = await supabase
            .from('fotocopiadoras')
            .update({ negocio_id: newBusiness.id })
            .eq('usuario_id', user.id);

          if (linkError) throw linkError;

          console.log('Successfully created business and linked photocopiers');
          setBusinesses([newBusiness]);
        } else if (existingBusinesses && existingBusinesses.length > 0) {
          // For now, let users access all businesses until we implement proper ownership
          // In a production app, you'd want to filter by actual ownership
          setBusinesses(existingBusinesses);
        } else {
          // No businesses and no photocopiers - empty state
          setBusinesses([]);
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
