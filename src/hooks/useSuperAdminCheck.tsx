
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useSuperAdminCheck = () => {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkSuperAdmin = async () => {
      if (!user) {
        setIsSuperAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .rpc('is_super_admin', { _user_id: user.id });

        if (error) {
          console.error('Error checking super admin status:', error);
          setIsSuperAdmin(false);
        } else if (typeof data === 'boolean') {
          setIsSuperAdmin(data);
        } else {
          console.error('Invalid super admin check result:', data);
          setIsSuperAdmin(false);
        }
      } catch (error) {
        console.error('Error checking super admin status:', error);
        setIsSuperAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkSuperAdmin();
  }, [user]);

  return {
    isSuperAdmin,
    loading,
  };
};
