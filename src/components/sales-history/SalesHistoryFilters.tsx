
import React from 'react';
import { PhotocopierSelector } from '@/components/PhotocopierSelector';
import { Photocopier } from '@/hooks/usePhotocopiers';

interface SalesHistoryFiltersProps {
  allPhotocopiers: Photocopier[];
  selectedPhotocopierId: string;
  onPhotocopierChange: (id: string) => void;
  loading: boolean;
}

export const SalesHistoryFilters = ({
  allPhotocopiers,
  selectedPhotocopierId,
  onPhotocopierChange,
  loading
}: SalesHistoryFiltersProps) => {
  // Filter out photocopiers with invalid IDs
  const validPhotocopiers = allPhotocopiers.filter(p => p && p.id && p.id.trim() !== '');

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
