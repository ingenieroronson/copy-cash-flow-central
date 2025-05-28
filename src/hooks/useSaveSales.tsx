
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useBusinesses } from './useBusinesses';
import { useToast } from '@/hooks/use-toast';
import { processServiceRecords, processSupplyRecords } from '@/utils/salesDataProcessor';

// Define simplified types to avoid deep type instantiation
interface ServiceData {
  yesterday: number;
  today: number;
  errors: number;
}

interface ServicesData {
  colorCopies?: ServiceData;
  bwCopies?: ServiceData;
  colorPrints?: ServiceData;
  bwPrints?: ServiceData;
}

interface SupplyData {
  startStock: number;
  endStock: number;
}

interface SuppliesData {
  [supplyName: string]: SupplyData;
}

interface ServicePricesData {
  color_copies?: number;
  bw_copies?: number;
  color_prints?: number;
  bw_prints?: number;
}

interface SupplyPricesData {
  [supplyName: string]: number;
}

export const useSaveSales = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { currentBusinessId } = useBusinesses();
  const { toast } = useToast();

  const saveDailySales = async (
    services: ServicesData,
    suppliesData: SuppliesData,
    servicePrices: ServicePricesData,
    supplyPrices: SupplyPricesData,
    photocopierId: string,
    selectedDate?: string
  ): Promise<void> => {
    if (!user || !photocopierId || !currentBusinessId) {
      toast({
        title: "Error",
        description: "Usuario, fotocopiadora o negocio no seleccionado.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Use the exact selected date, or today's date in Mexico City timezone if none provided
      const targetDate = selectedDate || new Date().toLocaleDateString('en-CA', {
        timeZone: 'America/Mexico_City'
      });

      console.log('Saving sales for date:', targetDate, 'business:', currentBusinessId);

      // Ensure user exists in usuarios table
      const { error: userError } = await supabase
        .from('usuarios')
        .upsert({ 
          id: user.id, 
          email: user.email || '', 
          nombre: user.user_metadata?.name || user.email || 'Usuario' 
        }, { 
          onConflict: 'id' 
        });

      if (userError) throw userError;

      // Delete existing records for this date, user, and photocopier to prevent duplicates
      const { error: deleteVentasError } = await supabase
        .from('ventas')
        .delete()
        .eq('usuario_id', user.id)
        .eq('fecha', targetDate)
        .eq('fotocopiadora_id', photocopierId)
        .eq('negocio_id', currentBusinessId);

      if (deleteVentasError) throw deleteVentasError;

      const { error: deleteSupplyError } = await supabase
        .from('supply_sales')
        .delete()
        .eq('usuario_id', user.id)
        .eq('fecha', targetDate)
        .eq('fotocopiadora_id', photocopierId)
        .eq('negocio_id', currentBusinessId);

      if (deleteSupplyError) throw deleteSupplyError;

      // Process and save service records with business ID
      const serviceRecords = processServiceRecords(
        services,
        servicePrices,
        user.id,
        targetDate,
        photocopierId,
        currentBusinessId
      );

      if (serviceRecords.length > 0) {
        const { error: serviceError } = await supabase
          .from('ventas')
          .insert(serviceRecords);

        if (serviceError) throw serviceError;
      }

      // Process and save supply records with business ID
      const supplyRecords = processSupplyRecords(
        suppliesData,
        supplyPrices,
        user.id,
        targetDate,
        photocopierId,
        currentBusinessId
      );

      if (supplyRecords.length > 0) {
        const { error: supplyError } = await supabase
          .from('supply_sales')
          .insert(supplyRecords);

        if (supplyError) throw supplyError;
      }

      toast({
        title: "Ventas guardadas",
        description: `Las ventas del día ${targetDate} se han guardado correctamente.`,
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
