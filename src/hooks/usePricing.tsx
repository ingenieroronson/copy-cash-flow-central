
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface PricingData {
  id: string;
  service_type?: string;
  supply_name?: string;
  unit_price: number;
}

export const usePricing = () => {
  const [pricing, setPricing] = useState<PricingData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPricing = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('pricing')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      setPricing(data || []);
    } catch (error) {
      console.error('Error fetching pricing:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los precios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPricing();
    }
  }, [user]);

  const getServicePrice = (serviceType: string) => {
    const priceData = pricing.find(p => p.service_type === serviceType);
    return priceData?.unit_price || 0;
  };

  const getSupplyPrice = (supplyName: string) => {
    const priceData = pricing.find(p => p.supply_name === supplyName);
    return priceData?.unit_price || 0;
  };

  return {
    pricing,
    loading,
    getServicePrice,
    getSupplyPrice,
    refetch: fetchPricing,
  };
};
