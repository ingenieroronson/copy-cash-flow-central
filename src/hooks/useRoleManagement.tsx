
import { BusinessRole } from '@/types/business';
import { useSuperAdmin } from './useSuperAdmin';

export const useRoleManagement = (currentUserRole: BusinessRole | null) => {
  const { isSuperAdmin } = useSuperAdmin();

  const hasPermission = (requiredRole: BusinessRole) => {
    // Super admin always has all permissions
    if (isSuperAdmin) {
      return true;
    }

    if (!currentUserRole) return false;
    
    const roleHierarchy = { 'admin': 3, 'operador': 2, 'viewer': 1 };
    return roleHierarchy[currentUserRole] >= roleHierarchy[requiredRole];
  };

  return {
    hasPermission,
  };
};
