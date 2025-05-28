
import { BusinessRole } from '@/types/business';

export const useRoleManagement = (currentUserRole: BusinessRole | null) => {
  const hasPermission = (requiredRole: BusinessRole) => {
    if (!currentUserRole) return false;
    
    const roleHierarchy = { 'admin': 3, 'operador': 2, 'viewer': 1 };
    return roleHierarchy[currentUserRole] >= roleHierarchy[requiredRole];
  };

  return {
    hasPermission,
  };
};
