
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Crown } from 'lucide-react';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';

export const BusinessSelector = () => {
  const { businesses, currentBusinessId, currentUserRole, switchBusiness, loading } = useBusinesses();
  const { isSuperAdmin } = useSuperAdmin();

  if (loading || businesses.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {isSuperAdmin ? (
        <Crown className="w-4 h-4 text-yellow-500" title="Super Admin" />
      ) : (
        <Building2 className="w-4 h-4 text-gray-500" />
      )}
      <Select value={currentBusinessId} onValueChange={switchBusiness}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Seleccionar negocio" />
        </SelectTrigger>
        <SelectContent>
          {businesses.map((business) => (
            <SelectItem key={business.id} value={business.id}>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span>{business.nombre}</span>
                  {isSuperAdmin && <Crown className="w-3 h-3 text-yellow-500" />}
                </div>
                <span className="text-xs text-gray-500 capitalize">
                  {isSuperAdmin ? 'Super Admin' : currentUserRole}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
