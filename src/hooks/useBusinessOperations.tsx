
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Business } from '@/types/business';
import type { User } from '@supabase/supabase-js';

export const useBusinessOperations = (user: User | null) => {
  const { toast } = useToast();

  const createDefaultBusiness = async () => {
    if (!user) return;

    try {
      // Create default business
      const { data: businessData, error: businessError } = await supabase
        .from('negocios')
        .insert({
          nombre: 'Mi Negocio',
          descripcion: 'Negocio principal'
        })
        .select()
        .single();

      if (businessError) throw businessError;

      // Assign admin role to current user
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
      console.error('Error creating default business:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el negocio por defecto.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const createBusiness = async (businessData: { nombre: string; descripcion?: string; direccion?: string; telefono?: string; email?: string }) => {
    if (!user) return;

    try {
      const { data: newBusiness, error: businessError } = await supabase
        .from('negocios')
        .insert(businessData)
        .select()
        .single();

      if (businessError) throw businessError;

      // Assign admin role to current user
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
  };
};
