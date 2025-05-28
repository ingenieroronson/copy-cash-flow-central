
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { processServiceRecords, processSupplyRecords } from '@/utils/salesDataProcessor';
import type { Services, Supplies, ServicePrices, SupplyPrices } from '@/types/sales';

export const useSaveSales = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const saveDailySales = async (
    services: Services,
    suppliesData: Supplies,
    servicePrices: ServicePrices,
    supplyPrices: SupplyPrices,
    photocopierId: string,
    selectedDate?: string
  ) => {
    if (!user || !photocopierId) {
      toast({
        title: "Error",
        description: "Usuario o fotocopiadora no seleccionada.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const today = selectedDate || new Date().toISOString().split('T')[0];

      // Ensure user exists in usuarios table
      await supabase
        .from('usuarios')
        .upsert({ 
          id: user.id, 
          email: user.email || '', 
          nombre: user.user_metadata?.name || user.email || 'Usuario' 
        }, { 
          onConflict: 'id' 
        });

      // Delete existing records for this date, user, and photocopier to prevent duplicates
      await supabase
        .from('ventas')
        .delete()
        .eq('usuario_id', user.id)
        .eq('fecha', today)
        .eq('fotocopiadora_id', photocopierId);

      await supabase
        .from('supply_sales')
        .delete()
        .eq('usuario_id', user.id)
        .eq('fecha', today)
        .eq('fotocopiadora_id', photocopierId);

      // Process and save service records
      const serviceRecords = processServiceRecords(
        services,
        servicePrices,
        user.id,
        today,
        photocopierId
      );

      if (serviceRecords.length > 0) {
        const { error: serviceError } = await supabase
          .from('ventas')
          .insert(serviceRecords);

        if (serviceError) throw serviceError;
      }

      // Process and save supply records with photocopier ID
      const supplyRecords = processSupplyRecords(
        suppliesData,
        supplyPrices,
        user.id,
        today,
        photocopierId // This ensures photocopier ID is always included
      );

      if (supplyRecords.length > 0) {
        const { error: supplyError } = await supabase
          .from('supply_sales')
          .insert(supplyRecords);

        if (supplyError) throw supplyError;
      }

      toast({
        title: "Ventas guardadas",
        description: "Las ventas del día se han guardado correctamente.",
      });

    } catch (error) {
      console.error('Error saving sales:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las ventas del día.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    saveDailySales,
  };
};
