
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePhotocopiers } from '@/hooks/usePhotocopiers';
import { Badge } from '@/components/ui/badge';
import { Users, Printer } from 'lucide-react';

interface PhotocopierSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  includeAll?: boolean;
  moduleFilter?: string; // Filter photocopiers by module access
}

export const PhotocopierSelector = ({ 
  value, 
  onValueChange, 
  label = "Fotocopiadora",
  placeholder = "Selecciona una fotocopiadora",
  includeAll = false,
  moduleFilter
}: PhotocopierSelectorProps) => {
  const { allPhotocopiers, loading, hasModuleAccess } = usePhotocopiers();

  // Filter photocopiers based on module access if moduleFilter is provided
  const availablePhotocopiers = allPhotocopiers.filter(photocopier => {
    if (!moduleFilter) return true;
    return hasModuleAccess(photocopier.id, moduleFilter);
  });

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="h-10 bg-gray-100 rounded-md animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {includeAll && (
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4" />
                Todas las fotocopiadoras
              </div>
            </SelectItem>
          )}
          {availablePhotocopiers.map((photocopier) => (
            <SelectItem key={photocopier.id} value={photocopier.id}>
              <div className="flex items-center gap-2 w-full">
                <Printer className="w-4 h-4" />
                <span className="flex-1">
                  {photocopier.nombre || 'Sin nombre'}
                  {photocopier.ubicacion && (
                    <span className="text-gray-500 text-sm ml-1">
                      - {photocopier.ubicacion}
                    </span>
                  )}
                </span>
                {photocopier.isShared && (
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                      <Users className="w-3 h-3 mr-1" />
                      Compartida
                    </Badge>
                    <span className="text-xs text-gray-500">
                      ({photocopier.ownerName || photocopier.ownerEmail})
                    </span>
                  </div>
                )}
              </div>
            </SelectItem>
          ))}
          {availablePhotocopiers.length === 0 && (
            <SelectItem value="" disabled>
              No hay fotocopiadoras disponibles
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      {moduleFilter && (
        <p className="text-xs text-gray-500">
          Mostrando solo fotocopiadoras con acceso al módulo de {moduleFilter}
        </p>
      )}
    </div>
  );
};
