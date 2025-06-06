
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { findUserByEmail, createSharedAccessRecords, SharedUser } from './useSharedAccessHelpers';

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

type ModuleType = 'copias' | 'reportes' | 'historial' | 'configuracion';

export const useSharedAccess = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

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
      await createSharedAccessRecords(
        user.id,
        targetUser.id,
        fotocopiadoraId,
        modules,
        expiresAt
      );

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
      console.log('Getting shared access for photocopier:', fotocopiadoraId);
      
      const { data, error } = await supabase
        .from('shared_access')
        .select(`
          *,
          shared_with:usuarios!shared_access_shared_with_id_fkey(id, email, nombre)
        `)
        .eq('owner_id', user.id)
        .eq('fotocopiadora_id', fotocopiadoraId)
        .eq('is_active', true);

      if (error) {
        console.error('Error getting shared access:', error);
        throw error;
      }
      
      console.log('Shared access data for photocopier', fotocopiadoraId, ':', data);
      return data || [];
    } catch (error) {
      console.error('Error getting shared access:', error);
      return [];
    }
  };

  const revokeAccess = async (sharedAccessId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      console.log('Revoking access for:', sharedAccessId);
      
      const { error } = await supabase
        .from('shared_access')
        .update({ is_active: false })
        .eq('id', sharedAccessId)
        .eq('owner_id', user.id);

      if (error) {
        console.error('Error revoking access:', error);
        throw error;
      }

      toast({
        title: "Acceso revocado",
        description: "El acceso compartido ha sido revocado exitosamente.",
      });

      return true;
    } catch (error: any) {
      console.error('Error revoking access:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo revocar el acceso.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getSharedWithMe = async () => {
    if (!user) {
      console.log('No user found');
      return [];
    }

    try {
      console.log('Getting shared with me for user:', user.id);
      
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

      if (error) {
        console.error('Error getting shared with me:', error);
        throw error;
      }
      
      console.log('Raw shared with me data:', data);
      
      // Additional filtering to ensure data integrity
      const validData = (data || []).filter(item => 
        item.owner && item.fotocopiadora && item.is_active
      );
      
      console.log('Filtered shared with me data:', validData);
      return validData;
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
