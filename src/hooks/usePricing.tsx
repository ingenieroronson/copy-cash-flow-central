
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface PricingData {
  id: string;
  service_type?: 'color_copies' | 'bw_copies' | 'color_prints' | 'bw_prints';
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

  const getServicePrice = (serviceType: 'color_copies' | 'bw_copies' | 'color_prints' | 'bw_prints') => {
    const priceData = pricing.find(p => p.service_type === serviceType);
    return priceData?.unit_price || 0;
  };

  const getSupplyPrice = (supplyName: string) => {
    const priceData = pricing.find(p => p.supply_name === supplyName);
    return priceData?.unit_price || 0;
  };

  const updateServicePrice = async (serviceType: 'color_copies' | 'bw_copies' | 'color_prints' | 'bw_prints', price: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('pricing')
        .update({ unit_price: price })
        .eq('user_id', user.id)
        .eq('service_type', serviceType);

      if (error) throw error;
      await fetchPricing();
    } catch (error) {
      console.error('Error updating service price:', error);
      throw error;
    }
  };

  const updateSupplyPrice = async (supplyName: string, price: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('pricing')
        .update({ unit_price: price })
        .eq('user_id', user.id)
        .eq('supply_name', supplyName);

      if (error) throw error;
      await fetchPricing();
    } catch (error) {
      console.error('Error updating supply price:', error);
      throw error;
    }
  };

  return {
    pricing,
    loading,
    getServicePrice,
    getSupplyPrice,
    updateServicePrice,
    updateSupplyPrice,
    refetch: fetchPricing,
  };
};
