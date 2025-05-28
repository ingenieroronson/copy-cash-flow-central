
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Business, UserBusinessRole } from '@/types/business';
import { useOwnerBusinessCreation } from './useOwnerBusinessCreation';
import type { User } from '@supabase/supabase-js';

export const useBusinessLoader = (
  user: User | null, 
  isSuperAdmin: boolean,
  hasInitialized: boolean
) => {
  const { toast } = useToast();
  const { createOwnerDefaultBusiness, isOwner } = useOwnerBusinessCreation(user, isSuperAdmin);

  const loadBusinessesForSuperAdmin = async (): Promise<{
    businesses: Business[];
    userRoles: UserBusinessRole[];
  }> => {
    console.log('Loading all businesses for super admin using database check');
    
    try {
      // Load all businesses directly for super admin
      const { data: allBusinesses, error: businessError } = await supabase
        .from('negocios')
        .select('*');

      if (businessError) throw businessError;

      // Create mock admin roles for all businesses for super admin
      const mockUserRoles = allBusinesses?.map(business => ({
        id: `super-admin-${business.id}`,
        usuario_id: user!.id,
        negocio_id: business.id,
        role: 'admin' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        negocios: business
      })) || [];

      // If no businesses exist and user is super admin, create default business
      if ((!allBusinesses || allBusinesses.length === 0) && !hasInitialized) {
        console.log('No businesses found for super admin, creating default business');
        try {
          await createOwnerDefaultBusiness();
          // Reload businesses after creation
          return await loadBusinessesForSuperAdmin();
        } catch (error) {
          console.error('Failed to create default business for super admin:', error);
        }
      }

      return {
        businesses: allBusinesses || [],
        userRoles: mockUserRoles,
      };
    } catch (error) {
      console.error('Error loading businesses for super admin:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los negocios.",
        variant: "destructive",
      });
      return {
        businesses: [],
        userRoles: [],
      };
    }
  };

  const loadBusinessesForRegularUser = async (): Promise<{
    businesses: Business[];
    userRoles: UserBusinessRole[];
  }> => {
    console.log('Loading businesses for regular user via usuarios_negocios');
    
    try {
      const { data: userBusinessData, error: userBusinessError } = await supabase
        .from('usuarios_negocios')
        .select(`
          *,
          negocios:negocio_id (*)
        `)
        .eq('usuario_id', user!.id);

      if (userBusinessError) throw userBusinessError;

      // Check if user has any business relationships
      if (!userBusinessData || userBusinessData.length === 0) {
        console.log('No business relationships found for regular user');
        
        // First login logic: only create business for owner
        if (isOwner(user!.email) && !hasInitialized) {
          console.log('Owner detected with no businesses, creating default business');
          
          try {
            await createOwnerDefaultBusiness();
            // Reload businesses after creation
            return await loadBusinessesForRegularUser();
          } catch (error) {
            console.error('Failed to create default business for owner:', error);
          }
        }
        
        // For non-owners or if business creation failed, set empty state
        return {
          businesses: [],
          userRoles: [],
        };
      } else {
        // User has business relationships
        const businessList = userBusinessData.map(ub => ub.negocios).filter(Boolean) as Business[];
        return {
          businesses: businessList,
          userRoles: userBusinessData,
        };
      }
    } catch (error) {
      console.error('Error loading businesses for regular user:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los negocios.",
        variant: "destructive",
      });
      return {
        businesses: [],
        userRoles: [],
      };
    }
  };

  return {
    loadBusinessesForSuperAdmin,
    loadBusinessesForRegularUser,
    isOwner,
  };
};
