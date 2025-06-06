
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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

  const selectedPhotocopier = photocopiers.find(p => p.id === selectedPhotocopierId);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Printer className="w-5 h-5 text-orange-500" />
          {selectedPhotocopier?.isShared && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-medium text-gray-700">
              Seleccionar Fotocopiadora
            </label>
            {selectedPhotocopier?.isShared && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                <Users className="w-3 h-3 mr-1" />
                Compartida
              </Badge>
            )}
          </div>
          <Select value={selectedPhotocopierId} onValueChange={onPhotocopierChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona una fotocopiadora" />
            </SelectTrigger>
            <SelectContent>
              {photocopiers.map((photocopier) => (
                <SelectItem key={photocopier.id} value={photocopier.id}>
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{photocopier.nombre || 'Sin nombre'}</span>
                        {photocopier.isShared && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                            <Users className="w-2 h-2 mr-1" />
                            Compartida
                          </Badge>
                        )}
                      </div>
                      {photocopier.ubicacion && (
                        <span className="text-sm text-gray-500">{photocopier.ubicacion}</span>
                      )}
                      {photocopier.isShared && photocopier.ownerEmail && (
                        <span className="text-xs text-blue-600">Por: {photocopier.ownerEmail}</span>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedPhotocopier?.isShared && (
            <div className="mt-2 p-2 bg-blue-50 rounded-md">
              <p className="text-xs text-blue-700">
                <strong>Módulos compartidos:</strong> {selectedPhotocopier.sharedModules?.join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
