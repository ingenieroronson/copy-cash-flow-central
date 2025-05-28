
import { useMemo } from 'react';
import { useAuth } from './useAuth';

const SUPER_ADMIN_EMAIL = 'ingenieroeduardoochoa@gmail.com';

export const useSuperAdmin = () => {
  const { user } = useAuth();

  const isSuperAdmin = useMemo(() => {
    return user?.email === SUPER_ADMIN_EMAIL;
  }, [user?.email]);

  return {
    isSuperAdmin,
    SUPER_ADMIN_EMAIL,
  };
};
