
import React from 'react';
import { usePhotocopiers } from './usePhotocopiers';
import { getTodayInMexicoTimezone } from '@/utils/dateUtils';

export const usePhotocopierDateState = () => {
  const { photocopiers, loading: photocopiersLoading } = usePhotocopiers();
  
  const [selectedPhotocopierId, setSelectedPhotocopierId] = React.useState<string>('');
  
  // Get today's date in Mexico City timezone
  const [selectedDate, setSelectedDate] = React.useState<string>(() => {
    return getTodayInMexicoTimezone();
  });

  // Set default photocopier when photocopiers are loaded
  React.useEffect(() => {
    if (photocopiers.length > 0 && !selectedPhotocopierId) {
      setSelectedPhotocopierId(photocopiers[0].id);
    }
  }, [photocopiers, selectedPhotocopierId]);

  return {
    photocopiers,
    photocopiersLoading,
    selectedPhotocopierId,
    selectedDate,
    setSelectedPhotocopierId,
    setSelectedDate,
  };
};
