
import { useState, useEffect } from 'react';
import { Business, UserBusinessRole } from '@/types/business';
import { useSuperAdmin } from './useSuperAdmin';
import { useBusinessLoader } from './useBusinessLoader';
import type { User } from '@supabase/supabase-js';

export const useBusinessData = (user: User | null) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [userRoles, setUserRoles] = useState<UserBusinessRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { isSuperAdmin } = useSuperAdmin();

  const { 
    loadBusinessesForSuperAdmin, 
    loadBusinessesForRegularUser, 
    isOwner 
  } = useBusinessLoader(user, isSuperAdmin, hasInitialized);

  const loadBusinesses = async () => {
    if (!user) {
      setBusinesses([]);
      setUserRoles([]);
      setLoading(false);
      setHasInitialized(true);
      return;
    }

    try {
      let result;
      if (isSuperAdmin) {
        result = await loadBusinessesForSuperAdmin();
      } else {
        result = await loadBusinessesForRegularUser();
      }
      
      setBusinesses(result.businesses);
      setUserRoles(result.userRoles);
    } finally {
      setLoading(false);
      setHasInitialized(true);
    }
  };

  useEffect(() => {
    if (user && !hasInitialized) {
      loadBusinesses();
    } else if (!user) {
      setBusinesses([]);
      setUserRoles([]);
      setLoading(false);
      setHasInitialized(true);
    }
  }, [user, hasInitialized, isSuperAdmin]);

  return {
    businesses,
    userRoles,
    loading,
    loadBusinesses,
    isOwner: (email?: string) => isOwner(email),
  };
};
