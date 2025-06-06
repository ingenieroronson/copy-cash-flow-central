
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
  return (
    <div className="mb-6">
      <PhotocopierSelector
        items={allPhotocopiers}
        selectedPhotocopierId={selectedPhotocopierId}
        onPhotocopierChange={onPhotocopierChange}
        loading={loading}
      />
    </div>
  );
};