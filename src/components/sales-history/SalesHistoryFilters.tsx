import React from 'react';
import { PhotocopierSelector } from '@/components/PhotocopierSelector';

interface SalesHistoryFiltersProps {
  selectedPhotocopierId: string;
  onPhotocopierChange: (id: string) => void;
}

export const SalesHistoryFilters = ({
  selectedPhotocopierId,
  onPhotocopierChange,
}: SalesHistoryFiltersProps) => {
  return (
    <div className="mb-6">
      <PhotocopierSelector
        value={selectedPhotocopierId}
        onValueChange={onPhotocopierChange}
        label="Fotocopiadora"
        placeholder="Selecciona una fotocopiadora"
        includeAll={true}
      />
    </div>
  );
};