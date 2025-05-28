
import { useState } from 'react';
import { useAuth } from './useAuth';
import { useBusinessData } from './useBusinessData';
import { useBusinessOperations } from './useBusinessOperations';
import { useRoleManagement } from './useRoleManagement';
import { BusinessRole } from '@/types/business';

export const useBusinesses = () => {
  const [currentBusinessId, setCurrentBusinessId] = useState<string>('');
  const [currentUserRole, setCurrentUserRole] = useState<BusinessRole | null>(null);
  const { user } = useAuth();

  const { businesses, userRoles, loading, loadBusinesses } = useBusinessData(user);
  const { createDefaultBusiness, createBusiness } = useBusinessOperations(user);
  const { hasPermission } = useRoleManagement(currentUserRole);

  const switchBusiness = (businessId: string) => {
    const userRole = userRoles.find(ur => ur.negocio_id === businessId);
    setCurrentBusinessId(businessId);
    setCurrentUserRole(userRole?.role || null);
  };

  // Auto-select first business if none selected and businesses are available
  if (!currentBusinessId && businesses.length > 0 && !loading) {
    const firstBusiness = businesses[0];
    const userRole = userRoles.find(ur => ur.negocio_id === firstBusiness.id);
    setCurrentBusinessId(firstBusiness.id);
    setCurrentUserRole(userRole?.role || null);
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

  return {
    businesses,
    userRoles,
    currentBusinessId,
    currentUserRole,
    loading,
    switchBusiness,
    createBusiness: handleCreateBusiness,
    createDefaultBusiness: handleCreateDefaultBusiness,
    hasPermission,
    refetch: loadBusinesses,
  };
};

// Export types for backward compatibility
export type { Business, UserBusinessRole } from '@/types/business';
