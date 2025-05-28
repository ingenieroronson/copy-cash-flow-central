
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Business } from '@/types/business';
import { useSuperAdmin } from './useSuperAdmin';
import type { User } from '@supabase/supabase-js';

const OWNER_EMAIL = 'ingeieroeduardoochoa@gmail.com';

export const useBusinessOperations = (user: User | null) => {
  const { toast } = useToast();
  const { isSuperAdmin } = useSuperAdmin();

  const isOwner = (email: string | undefined) => {
    return email === OWNER_EMAIL;
  };

  const createOwnerDefaultBusiness = async () => {
    if (!user || (!isOwner(user.email) && !isSuperAdmin)) {
      console.log('User is not the owner or super admin, cannot create default business');
      return null;
    }

    try {
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

      toast({
        title: "Negocio creado",
        description: "Se ha creado tu negocio principal.",
      });

      return businessData;
    } catch (error) {
      console.error('Error creating owner default business:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el negocio por defecto.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const createDefaultBusiness = async () => {
    // Only the owner or super admin can create default businesses
    if (!user || (!isOwner(user.email) && !isSuperAdmin)) {
      toast({
        title: "Sin permisos",
        description: "Solo el propietario puede crear negocios.",
        variant: "destructive",
      });
      return null;
    }

    return createOwnerDefaultBusiness();
  };

  const createBusiness = async (businessData: { nombre: string; descripcion?: string; direccion?: string; telefono?: string; email?: string }) => {
    // Only the owner or super admin can create new businesses
    if (!user || (!isOwner(user.email) && !isSuperAdmin)) {
      toast({
        title: "Sin permisos",
        description: "Solo el propietario puede crear negocios.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data: newBusiness, error: businessError } = await supabase
        .from('negocios')
        .insert(businessData)
        .select()
        .single();

      if (businessError) throw businessError;

      // Assign admin role to owner/super admin
      const { error: roleError } = await supabase
        .from('usuarios_negocios')
        .insert({
          usuario_id: user.id,
          negocio_id: newBusiness.id,
          role: 'admin'
        });

      if (roleError) throw roleError;

      toast({
        title: "Negocio creado",
        description: "El nuevo negocio se ha creado correctamente.",
      });

      return newBusiness;
    } catch (error) {
      console.error('Error creating business:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el negocio.",
        variant: "destructive",
      });
    }
  };

  return {
    createDefaultBusiness,
    createBusiness,
    createOwnerDefaultBusiness,
    isOwner: (email?: string) => isOwner(email),
  };
};
