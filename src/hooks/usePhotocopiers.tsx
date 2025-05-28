
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Photocopier {
  id: string;
  nombre: string | null;
  ubicacion: string | null;
  usuario_id: string | null;
}

export const usePhotocopiers = () => {
  const [photocopiers, setPhotocopiers] = useState<Photocopier[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadPhotocopiers = async () => {
    if (!user) {
      setPhotocopiers([]);
      setLoading(false);
      return;
    }

    try {
      // First, ensure user exists in usuarios table
      const { error: userInsertError } = await supabase
        .from('usuarios')
        .upsert({ 
          id: user.id, 
          email: user.email || '', 
          nombre: user.user_metadata?.name || user.email || 'Usuario' 
        }, { 
          onConflict: 'id' 
        });

      if (userInsertError) {
        console.error('Error ensuring user exists:', userInsertError);
      }

      // Load photocopiers
      const { data, error } = await supabase
        .from('fotocopiadoras')
        .select('*')
        .eq('usuario_id', user.id)
        .order('nombre');

      if (error) throw error;

      // If no photocopiers exist, create a default one
      if (!data || data.length === 0) {
        const { data: newPhotocopier, error: createError } = await supabase
          .from('fotocopiadoras')
          .insert({
            usuario_id: user.id,
            nombre: 'Fotocopiadora Principal',
            ubicacion: 'Oficina'
          })
          .select()
          .single();

        if (createError) throw createError;
        setPhotocopiers([newPhotocopier]);
      } else {
        setPhotocopiers(data);
      }
    } catch (error) {
      console.error('Error loading photocopiers:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las fotocopiadoras.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadPhotocopiers();
    } else {
      setPhotocopiers([]);
      setLoading(false);
    }
  }, [user]);

  return {
    photocopiers,
    loading,
    refetch: loadPhotocopiers,
  };
};
