
import { useMemo, useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useSuperAdmin = () => {
  const { user } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSuperAdminStatus = async () => {
      if (!user) {
        setIsSuperAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Check if user exists in usuarios table and has super admin privileges
        const { data, error } = await supabase
          .from('usuarios')
          .select('is_super_admin')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking super admin status:', error);
          setIsSuperAdmin(false);
        } else {
          setIsSuperAdmin(data?.is_super_admin || false);
        }
      } catch (error) {
        console.error('Error in super admin check:', error);
        setIsSuperAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkSuperAdminStatus();
  }, [user]);

  return {
    isSuperAdmin,
    loading,
  };
};
