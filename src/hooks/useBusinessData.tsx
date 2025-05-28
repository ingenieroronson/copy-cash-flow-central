
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Business, UserBusinessRole } from '@/types/business';
import { useSuperAdmin } from './useSuperAdmin';
import type { User } from '@supabase/supabase-js';

const OWNER_EMAIL = 'ingenieroeduardoochoa@gmail.com';

export const useBusinessData = (user: User | null) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [userRoles, setUserRoles] = useState<UserBusinessRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { toast } = useToast();
  const { isSuperAdmin } = useSuperAdmin();

  const isOwner = (email: string | undefined) => {
    return email === OWNER_EMAIL;
  };

  const createOwnerDefaultBusiness = async () => {
    if (!user || !isOwner(user.email)) {
      return null;
    }

    try {
      console.log('Creating default business for owner');
      
      // Create default business for owner
      const { data: businessData, error: businessError } = await supabase
        .from('negocios')
        .insert({
          nombre: 'Fotocopiadora Issste',
          descripcion: 'Negocio principal del propietario'
        })
        .select()
        .single();

      if (businessError) throw businessError;

      // Assign admin role to owner
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

  const loadBusinesses = async () => {
    if (!user) {
      setBusinesses([]);
      setUserRoles([]);
      setLoading(false);
      setHasInitialized(true);
      return;
    }

    try {
      if (isSuperAdmin) {
        // Super admin gets access to ALL businesses
        console.log('Loading all businesses for super admin');
        
        const { data: allBusinesses, error: businessError } = await supabase
          .from('negocios')
          .select('*');

        if (businessError) throw businessError;

        // Create mock admin roles for all businesses for super admin
        const mockUserRoles = allBusinesses?.map(business => ({
          id: `super-admin-${business.id}`,
          usuario_id: user.id,
          negocio_id: business.id,
          role: 'admin' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          negocios: business
        })) || [];

        setBusinesses(allBusinesses || []);
        setUserRoles(mockUserRoles);
      } else {
        // Regular user logic
        const { data: userBusinessData, error: userBusinessError } = await supabase
          .from('usuarios_negocios')
          .select(`
            *,
            negocios:negocio_id (*)
          `)
          .eq('usuario_id', user.id);

        if (userBusinessError) throw userBusinessError;

        // Check if user has any business relationships
        if (!userBusinessData || userBusinessData.length === 0) {
          console.log('No business relationships found for user');
          
          // First login logic: only create business for owner
          if (isOwner(user.email) && !hasInitialized) {
            console.log('Owner detected with no businesses, creating default business');
            
            try {
              const newBusiness = await createOwnerDefaultBusiness();
              if (newBusiness) {
                // Reload businesses after creation
                await loadBusinesses();
                return;
              }
            } catch (error) {
              console.error('Failed to create default business for owner:', error);
            }
          }
          
          // For non-owners or if business creation failed, set empty state
          setBusinesses([]);
          setUserRoles([]);
        } else {
          // User has business relationships
          const businessList = userBusinessData.map(ub => ub.negocios).filter(Boolean) as Business[];
          setBusinesses(businessList);
          setUserRoles(userBusinessData);
        }
      }
    } catch (error) {
      console.error('Error loading businesses:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los negocios.",
        variant: "destructive",
      });
      setBusinesses([]);
      setUserRoles([]);
    } finally {
      setLoading(false);
      setHasInitialized(true);
    }
  };

  useEffect(() => {
    if (user && !hasInitialized) {
      loadBusinesses();
    } else if (!user) {
      setBusinesses([]);
      setUserRoles([]);
      setLoading(false);
      setHasInitialized(true);
    }
  }, [user, hasInitialized, isSuperAdmin]);

  return {
    businesses,
    userRoles,
    loading,
    loadBusinesses,
    isOwner: (email?: string) => isOwner(email),
  };
};
