
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Photocopier {
  id: string;
  nombre: string | null;
  ubicacion: string | null;
  usuario_id: string | null;
  isShared?: boolean;
  sharedModules?: string[];
  ownerEmail?: string;
}

export const usePhotocopiers = () => {
  const [photocopiers, setPhotocopiers] = useState<Photocopier[]>([]);
  const [allPhotocopiers, setAllPhotocopiers] = useState<Photocopier[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadPhotocopiers = async () => {
    if (!user) {
      setPhotocopiers([]);
      setAllPhotocopiers([]);
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

      // Load owned photocopiers
      const { data: ownedData, error: ownedError } = await supabase
        .from('fotocopiadoras')
        .select('*')
        .eq('usuario_id', user.id)
        .order('nombre');

      if (ownedError) throw ownedError;

      let ownedPhotocopiers = ownedData || [];

      // If no photocopiers exist, create a default one
      if (ownedPhotocopiers.length === 0) {
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
        ownedPhotocopiers = [newPhotocopier];
      }

      // Load shared photocopiers with full details
      const { data: sharedData, error: sharedError } = await supabase
        .from('shared_access')
        .select(`
          fotocopiadora_id,
          module_type,
          fotocopiadora:fotocopiadoras(id, nombre, ubicacion, usuario_id),
          owner:usuarios!shared_access_owner_id_fkey(email, nombre)
        `)
        .eq('shared_with_id', user.id)
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

      if (sharedError) throw sharedError;

      // Group shared photocopiers by fotocopiadora_id and include all available modules
      const sharedPhotocopiersMap = (sharedData || []).reduce((acc, item) => {
        const id = item.fotocopiadora_id;
        if (!acc[id]) {
          acc[id] = {
            ...item.fotocopiadora,
            isShared: true,
            sharedModules: [],
            ownerEmail: item.owner?.email,
          };
        }
        acc[id].sharedModules.push(item.module_type);
        return acc;
      }, {} as Record<string, Photocopier>);

      const sharedPhotocopiers = Object.values(sharedPhotocopiersMap);

      // Combine owned and shared photocopiers
      const allPhotocopyMachines = [
        ...ownedPhotocopiers.map(p => ({ ...p, isShared: false })),
        ...sharedPhotocopiers,
      ];

      console.log('Loaded photocopiers:', {
        owned: ownedPhotocopiers.length,
        shared: sharedPhotocopiers.length,
        total: allPhotocopyMachines.length
      });

      setPhotocopiers(ownedPhotocopiers);
      setAllPhotocopiers(allPhotocopyMachines);
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
      setAllPhotocopiers([]);
      setLoading(false);
    }
  }, [user]);

  // Check if user has access to a specific module for a photocopier
  const hasModuleAccess = (photocopierId: string, moduleType: string) => {
    const photocopier = allPhotocopiers.find(p => p.id === photocopierId);
    if (!photocopier) return false;
    
    // If it's their own photocopier, they have access to all modules
    if (!photocopier.isShared) return true;
    
    // If it's shared, check if they have access to the specific module
    return photocopier.sharedModules?.includes(moduleType) || false;
  };

  return {
    photocopiers, // Only owned photocopiers
    allPhotocopiers, // Owned + shared photocopiers
    loading,
    refetch: loadPhotocopiers,
    hasModuleAccess, // Helper function to check module access
  };
};
