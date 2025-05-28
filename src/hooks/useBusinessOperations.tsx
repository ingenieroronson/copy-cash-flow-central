
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSuperAdmin } from './useSuperAdmin';
import { useOwnerBusinessCreation } from './useOwnerBusinessCreation';
import type { User } from '@supabase/supabase-js';

export const useBusinessOperations = (user: User | null) => {
  const { toast } = useToast();
  const { isSuperAdmin } = useSuperAdmin();
  const { createOwnerDefaultBusiness, isOwner } = useOwnerBusinessCreation(user, isSuperAdmin);

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

    try {
      const newBusiness = await createOwnerDefaultBusiness();
      if (newBusiness) {
        toast({
          title: "Negocio creado",
          description: "Se ha creado tu negocio principal.",
        });
      }
      return newBusiness;
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el negocio por defecto.",
        variant: "destructive",
      });
      throw error;
    }
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
