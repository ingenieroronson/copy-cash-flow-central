
import { supabase } from '@/integrations/supabase/client';

export interface SharedUser {
  id: string;
  email: string;
  nombre: string | null;
}

type ModuleType = 'copias' | 'reportes' | 'historial' | 'configuracion';

export const findUserByEmail = async (email: string): Promise<SharedUser | null> => {
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

export const createSharedAccessRecords = async (
  ownerId: string,
  targetUserId: string,
  fotocopiadoraId: string,
  modules: ModuleType[],
  expiresAt?: string
) => {
  const sharedAccessRecords = modules.map((module: ModuleType) => ({
    owner_id: ownerId,
    shared_with_id: targetUserId,
    fotocopiadora_id: fotocopiadoraId,
    module_type: module,
    expires_at: expiresAt || null,
    is_active: true,
  }));

  const { error } = await supabase
    .from('shared_access')
    .upsert(sharedAccessRecords, {
      onConflict: 'owner_id,shared_with_id,fotocopiadora_id,module_type'
    });

  if (error) {
    console.error('Supabase error sharing access:', error);
    throw error;
  }

  return true;
};
