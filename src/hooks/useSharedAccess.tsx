
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface SharedAccess {
  id: string;
  owner_id: string;
  shared_with_id: string;
  fotocopiadora_id: string;
  module_type: 'copias' | 'reportes' | 'historial' | 'configuracion';
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SharedUser {
  id: string;
  email: string;
  nombre: string | null;
}

type ModuleType = 'copias' | 'reportes' | 'historial' | 'configuracion';

export const useSharedAccess = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const findUserByEmail = async (email: string): Promise<SharedUser | null> => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, email, nombre')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // User not found
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  };

  const shareAccess = async (
    email: string,
    fotocopiadoraId: string,
    modules: ModuleType[],
    expiresAt?: string
  ) => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    try {
      // Find the user by email
      const targetUser = await findUserByEmail(email);
      if (!targetUser) {
        throw new Error('Usuario no encontrado con ese email');
      }

      // Check if trying to share with themselves
      if (targetUser.id === user.id) {
        throw new Error('No puedes compartir acceso contigo mismo');
      }

      // Create shared access records for each module
      const sharedAccessRecords = modules.map((module: ModuleType) => ({
        owner_id: user.id,
        shared_with_id: targetUser.id,
        fotocopiadora_id: fotocopiadoraId,
        module_type: module as ModuleType,
        expires_at: expiresAt || null,
      }));

      const { error } = await supabase
        .from('shared_access')
        .upsert(sharedAccessRecords, {
          onConflict: 'owner_id,shared_with_id,fotocopiadora_id,module_type'
        });

      if (error) throw error;

      toast({
        title: "Acceso compartido",
        description: `Se ha compartido el acceso con ${email} exitosamente.`,
      });

      return true;
    } catch (error: any) {
      console.error('Error sharing access:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo compartir el acceso.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getSharedAccess = async (fotocopiadoraId: string) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('shared_access')
        .select(`
          *,
          shared_with:usuarios!shared_access_shared_with_id_fkey(id, email, nombre)
        `)
        .eq('owner_id', user.id)
        .eq('fotocopiadora_id', fotocopiadoraId)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting shared access:', error);
      return [];
    }
  };

  const revokeAccess = async (sharedAccessId: string) => {
    try {
      const { error } = await supabase
        .from('shared_access')
        .update({ is_active: false })
        .eq('id', sharedAccessId)
        .eq('owner_id', user?.id);

      if (error) throw error;

      toast({
        title: "Acceso revocado",
        description: "El acceso compartido ha sido revocado exitosamente.",
      });

      return true;
    } catch (error) {
      console.error('Error revoking access:', error);
      toast({
        title: "Error",
        description: "No se pudo revocar el acceso.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getSharedWithMe = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('shared_access')
        .select(`
          *,
          owner:usuarios!shared_access_owner_id_fkey(id, email, nombre),
          fotocopiadora:fotocopiadoras(id, nombre, ubicacion)
        `)
        .eq('shared_with_id', user.id)
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting shared with me:', error);
      return [];
    }
  };

  return {
    loading,
    findUserByEmail,
    shareAccess,
    getSharedAccess,
    revokeAccess,
    getSharedWithMe,
  };
};
