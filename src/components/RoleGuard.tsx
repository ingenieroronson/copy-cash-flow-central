
import React from 'react';
import { useBusinesses } from '@/hooks/useBusinesses';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: 'admin' | 'operador' | 'viewer';
  fallback?: React.ReactNode;
}

export const RoleGuard = ({ children, requiredRole, fallback }: RoleGuardProps) => {
  const { hasPermission, loading } = useBusinesses();

  if (loading) return null;

  if (!hasPermission(requiredRole)) {
    return fallback || (
      <div className="text-center py-8">
        <p className="text-gray-500">No tienes permisos para acceder a esta función.</p>
        <p className="text-sm text-gray-400">Requiere rol: {requiredRole}</p>
      </div>
    );
  }

  return <>{children}</>;
};
