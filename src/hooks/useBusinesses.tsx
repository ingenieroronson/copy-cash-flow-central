
import { useState } from 'react';
import { useAuth } from './useAuth';
import { useBusinessData } from './useBusinessData';
import { useBusinessOperations } from './useBusinessOperations';
import { useRoleManagement } from './useRoleManagement';
import { useSuperAdmin } from './useSuperAdmin';
import { BusinessRole } from '@/types/business';

export const useBusinesses = () => {
  const [currentBusinessId, setCurrentBusinessId] = useState<string>('');
  const [currentUserRole, setCurrentUserRole] = useState<BusinessRole | null>(null);
  const { user } = useAuth();
  const { isSuperAdmin } = useSuperAdmin();

  const { businesses, userRoles, loading, loadBusinesses, isOwner } = useBusinessData(user);
  const { createDefaultBusiness, createBusiness, createOwnerDefaultBusiness } = useBusinessOperations(user);
  const { hasPermission } = useRoleManagement(currentUserRole);

  const switchBusiness = (businessId: string) => {
    if (isSuperAdmin) {
      // For super admin, always set role as admin regardless of usuarios_negocios
      setCurrentBusinessId(businessId);
      setCurrentUserRole('admin');
    } else {
      // For regular users, find their actual role
      const userRole = userRoles.find(ur => ur.negocio_id === businessId);
      setCurrentBusinessId(businessId);
      setCurrentUserRole(userRole?.role || null);
    }
  };

  // Auto-select first business if none selected and businesses are available
  // For super admin, this ensures they can access businesses even without usuarios_negocios entries
  if (!currentBusinessId && businesses.length > 0 && !loading) {
    const firstBusiness = businesses[0];
    
    if (isSuperAdmin) {
      // Super admin gets admin access to the first business automatically
      setCurrentBusinessId(firstBusiness.id);
      setCurrentUserRole('admin');
    } else {
      // Regular user logic - find their role or set null if no access
      const userRole = userRoles.find(ur => ur.negocio_id === firstBusiness.id);
      setCurrentBusinessId(firstBusiness.id);
      setCurrentUserRole(userRole?.role || null);
    }
  }

  const handleCreateBusiness = async (businessData: { nombre: string; descripcion?: string; direccion?: string; telefono?: string; email?: string }) => {
    const newBusiness = await createBusiness(businessData);
    if (newBusiness) {
      await loadBusinesses();
    }
    return newBusiness;
  };

  const handleCreateDefaultBusiness = async () => {
    const newBusiness = await createDefaultBusiness();
    if (newBusiness) {
      await loadBusinesses();
    }
    return newBusiness;
  };

  const handleCreateOwnerDefaultBusiness = async () => {
    const newBusiness = await createOwnerDefaultBusiness();
    if (newBusiness) {
      await loadBusinesses();
    }
    return newBusiness;
  };

  return {
    businesses,
    userRoles,
    currentBusinessId,
    currentUserRole,
    loading,
    switchBusiness,
    createBusiness: handleCreateBusiness,
    createDefaultBusiness: handleCreateDefaultBusiness,
    createOwnerDefaultBusiness: handleCreateOwnerDefaultBusiness,
    hasPermission,
    refetch: loadBusinesses,
    isOwner: (email?: string) => isOwner(email),
  };
};

// Export types for backward compatibility
export type { Business, UserBusinessRole } from '@/types/business';
