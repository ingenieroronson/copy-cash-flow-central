
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

        // Clean up any duplicate "Negocio Principal" entries first
        await cleanupDuplicatePrincipalBusinesses();

        // Check for existing businesses after cleanup
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
        
        // Check if "Negocio Principal" already exists
        const principalBusiness = existingBusinesses?.find(b => b.nombre === 'Negocio Principal');

        // Auto-create business if user has photocopiers but no "Negocio Principal" exists
        if (hasPhotocopiers && !principalBusiness) {
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
            .eq('usuario_id', user.id)
            .is('negocio_id', null);

          if (linkError) throw linkError;

          console.log('Successfully created business and linked photocopiers');
          
          // Update the businesses list to include the new one
          const updatedBusinesses = existingBusinesses ? [...existingBusinesses, newBusiness] : [newBusiness];
          setBusinesses(updatedBusinesses);
        } else if (existingBusinesses && existingBusinesses.length > 0) {
          // For now, let users access all businesses until we implement proper ownership
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

    const cleanupDuplicatePrincipalBusinesses = async () => {
      try {
        // Find all "Negocio Principal" entries
        const { data: principalBusinesses, error: findError } = await supabase
          .from('negocios')
          .select('id, created_at')
          .eq('nombre', 'Negocio Principal')
          .order('created_at', { ascending: true });

        if (findError) throw findError;

        // If there are duplicates, keep only the first one and delete the rest
        if (principalBusinesses && principalBusinesses.length > 1) {
          const businessesToDelete = principalBusinesses.slice(1).map(b => b.id);
          
          console.log(`Found ${principalBusinesses.length} duplicate "Negocio Principal" entries, cleaning up...`);
          
          // Update any photocopiers linked to duplicate businesses to use the first one
          if (businessesToDelete.length > 0) {
            await supabase
              .from('fotocopiadoras')
              .update({ negocio_id: principalBusinesses[0].id })
              .in('negocio_id', businessesToDelete);

            // Update any inventory linked to duplicate businesses
            await supabase
              .from('inventory')
              .update({ negocio_id: principalBusinesses[0].id })
              .in('negocio_id', businessesToDelete);

            // Delete duplicate businesses
            await supabase
              .from('negocios')
              .delete()
              .in('id', businessesToDelete);
              
            console.log('Successfully cleaned up duplicate businesses');
          }
        }
      } catch (error) {
        console.error('Error cleaning up duplicate businesses:', error);
        // Don't throw error to avoid blocking the main fetch
      }
    };

    fetchUserBusinesses();
  }, [user]);

  return {
    businesses,
    loading,
  };
};
