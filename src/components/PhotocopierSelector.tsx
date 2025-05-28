
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer } from 'lucide-react';
import { Photocopier } from '@/hooks/usePhotocopiers';

interface PhotocopierSelectorProps {
  photocopiers: Photocopier[];
  selectedPhotocopierId: string;
  onPhotocopierChange: (photocopierId: string) => void;
  loading?: boolean;
}

export const PhotocopierSelector = ({ 
  photocopiers, 
  selectedPhotocopierId, 
  onPhotocopierChange,
  loading = false 
}: PhotocopierSelectorProps) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <Printer className="w-5 h-5 text-orange-500" />
          <span className="text-gray-600">Cargando fotocopiadoras...</span>
        </div>
      </div>
    );
  }

  if (photocopiers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <Printer className="w-5 h-5 text-orange-500" />
          <span className="text-gray-600">No hay fotocopiadoras configuradas</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <Printer className="w-5 h-5 text-orange-500" />
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Seleccionar Fotocopiadora
          </label>
          <Select value={selectedPhotocopierId} onValueChange={onPhotocopierChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona una fotocopiadora" />
            </SelectTrigger>
            <SelectContent>
              {photocopiers.map((photocopier) => (
                <SelectItem key={photocopier.id} value={photocopier.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{photocopier.nombre || 'Sin nombre'}</span>
                    {photocopier.ubicacion && (
                      <span className="text-sm text-gray-500">{photocopier.ubicacion}</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
