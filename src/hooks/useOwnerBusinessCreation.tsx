
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Business } from '@/types/business';
import type { User } from '@supabase/supabase-js';

const OWNER_EMAIL = 'ingenieroeduardoochoa@gmail.com';

export const useOwnerBusinessCreation = (user: User | null, isSuperAdmin: boolean) => {
  const { toast } = useToast();

  const isOwner = (email: string | undefined) => {
    return email === OWNER_EMAIL;
  };

  const createOwnerDefaultBusiness = async (): Promise<Business | null> => {
    if (!user || (!isOwner(user.email) && !isSuperAdmin)) {
      return null;
    }

    try {
      console.log('Creating default business for owner/super admin');
      
      // Create default business for owner/super admin
      const { data: businessData, error: businessError } = await supabase
        .from('negocios')
        .insert({
          nombre: 'Copias ISSSTE',
          descripcion: 'Negocio principal del propietario'
        })
        .select()
        .single();

      if (businessError) throw businessError;

      // Assign admin role to owner/super admin
      const { error: roleError } = await supabase
        .from('usuarios_negocios')
        .insert({
          usuario_id: user.id,
          negocio_id: businessData.id,
          role: 'admin'
        });

      if (roleError) throw roleError;

      console.log('Default business created successfully');
      return businessData;
    } catch (error) {
      console.error('Error creating owner default business:', error);
      throw error;
    }
  };

  return {
    createOwnerDefaultBusiness,
    isOwner,
  };
};
