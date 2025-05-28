
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Business {
  id: string;
  nombre: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface UserBusinessRole {
  id: string;
  usuario_id: string;
  negocio_id: string;
  role: 'admin' | 'operador' | 'viewer';
  created_at: string;
  updated_at: string;
  negocios?: Business;
  usuarios?: {
    id: string;
    nombre: string;
    email: string;
  };
}

export const useBusinesses = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [userRoles, setUserRoles] = useState<UserBusinessRole[]>([]);
  const [currentBusinessId, setCurrentBusinessId] = useState<string>('');
  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'operador' | 'viewer' | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadBusinesses = async () => {
    if (!user) {
      setBusinesses([]);
      setUserRoles([]);
      setLoading(false);
      return;
    }

    try {
      // Load user's business relationships
      const { data: userBusinessData, error: userBusinessError } = await supabase
        .from('usuarios_negocios')
        .select(`
          *,
          negocios:negocio_id (*)
        `)
        .eq('usuario_id', user.id);

      if (userBusinessError) throw userBusinessError;

      if (userBusinessData && userBusinessData.length > 0) {
        const businessList = userBusinessData.map(ub => ub.negocios).filter(Boolean) as Business[];
        setBusinesses(businessList);
        setUserRoles(userBusinessData);

        // Set default business if none selected
        if (!currentBusinessId && businessList.length > 0) {
          const firstBusiness = businessList[0];
          const userRole = userBusinessData.find(ub => ub.negocio_id === firstBusiness.id);
          setCurrentBusinessId(firstBusiness.id);
          setCurrentUserRole(userRole?.role || null);
        }
      } else {
        // No businesses found, create a default one for the user
        await createDefaultBusiness();
      }
    } catch (error) {
      console.error('Error loading businesses:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los negocios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

      // Reload businesses
      await loadBusinesses();

      toast({
        title: "Negocio creado",
        description: "Se ha creado tu negocio principal.",
      });
    } catch (error) {
      console.error('Error creating default business:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el negocio por defecto.",
        variant: "destructive",
      });
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

      await loadBusinesses();

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

  const switchBusiness = (businessId: string) => {
    const userRole = userRoles.find(ur => ur.negocio_id === businessId);
    setCurrentBusinessId(businessId);
    setCurrentUserRole(userRole?.role || null);
  };

  const hasPermission = (requiredRole: 'admin' | 'operador' | 'viewer') => {
    if (!currentUserRole) return false;
    
    const roleHierarchy = { 'admin': 3, 'operador': 2, 'viewer': 1 };
    return roleHierarchy[currentUserRole] >= roleHierarchy[requiredRole];
  };

  useEffect(() => {
    if (user) {
      loadBusinesses();
    } else {
      setBusinesses([]);
      setUserRoles([]);
      setCurrentBusinessId('');
      setCurrentUserRole(null);
      setLoading(false);
    }
  }, [user]);

  return {
    businesses,
    userRoles,
    currentBusinessId,
    currentUserRole,
    loading,
    switchBusiness,
    createBusiness,
    hasPermission,
    refetch: loadBusinesses,
  };
};
