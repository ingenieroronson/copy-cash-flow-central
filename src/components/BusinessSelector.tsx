
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2 } from 'lucide-react';
import { useBusinesses } from '@/hooks/useBusinesses';

export const BusinessSelector = () => {
  const { businesses, currentBusinessId, currentUserRole, switchBusiness, loading } = useBusinesses();

  if (loading || businesses.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Building2 className="w-4 h-4 text-gray-500" />
      <Select value={currentBusinessId} onValueChange={switchBusiness}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Seleccionar negocio" />
        </SelectTrigger>
        <SelectContent>
          {businesses.map((business) => (
            <SelectItem key={business.id} value={business.id}>
              <div className="flex flex-col">
                <span>{business.nombre}</span>
                <span className="text-xs text-gray-500 capitalize">{currentUserRole}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
