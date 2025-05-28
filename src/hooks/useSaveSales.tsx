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
    selectedDate?: string,
    negocioId?: string
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
      // Use the exact selected date, or today's date in Mexico City timezone if none provided
      const targetDate = selectedDate || new Date().toLocaleDateString('en-CA', {
        timeZone: 'America/Mexico_City'
      });

      console.log('Saving sales for date:', targetDate);

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
        .eq('fecha', targetDate)
        .eq('fotocopiadora_id', photocopierId);

      await supabase
        .from('supply_sales')
        .delete()
        .eq('usuario_id', user.id)
        .eq('fecha', targetDate)
        .eq('fotocopiadora_id', photocopierId);

      // Process and save service records
      const serviceRecords = processServiceRecords(
        services,
        servicePrices,
        user.id,
        targetDate,
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
        targetDate,
        photocopierId
      );

      if (supplyRecords.length > 0) {
        const { error: supplyError } = await supabase
          .from('supply_sales')
          .insert(supplyRecords);

        if (supplyError) throw supplyError;
      }

      // Automatically deduct inventory if negocioId is provided
      if (negocioId) {
        await deductInventoryForSales(services, suppliesData, photocopierId, targetDate, negocioId);
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

  const deductInventoryForSales = async (
    servicesData: Services,
    suppliesData: Supplies,
    photocopierId: string,
    salesDate: string,
    negocioId: string
  ) => {
    try {
      // Get inventory for this business
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .eq('negocio_id', negocioId);

      if (inventoryError) throw inventoryError;

      // Calculate total sheets used for white paper
      let totalSheetsUsed = 0;
      
      // Sum sheets from services (copies, prints, and errors)
      Object.values(servicesData).forEach((service: any) => {
        if (service && typeof service === 'object') {
          const sold = Math.max(0, service.today - service.yesterday);
          const errors = service.errors || 0;
          totalSheetsUsed += sold + errors;
        }
      });

      // Deduct white paper if sheets were used
      if (totalSheetsUsed > 0) {
        const whitePaperItem = inventory?.find(item => item.supply_name === 'white_paper');
        if (whitePaperItem && whitePaperItem.sheets_per_block) {
          const blocksUsed = totalSheetsUsed / whitePaperItem.sheets_per_block;
          
          const { error: transactionError } = await supabase
            .from('inventory_transactions')
            .insert({
              inventory_id: whitePaperItem.id,
              transaction_type: 'sale',
              quantity_change: -blocksUsed,
              reference_type: 'service_sale',
              notes: `Automatic deduction: ${totalSheetsUsed} sheets (${blocksUsed.toFixed(2)} blocks) used for photocopying services on ${salesDate}`
            });

          if (transactionError) throw transactionError;
        }
      }

      // Deduct other supplies based on sold quantities
      for (const [supplyName, supplyData] of Object.entries(suppliesData)) {
        if (supplyData && typeof supplyData === 'object') {
          const sold = Math.max(0, supplyData.startStock - supplyData.endStock);
          
          if (sold > 0) {
            const inventoryItem = inventory?.find(item => item.supply_name === supplyName);
            if (inventoryItem) {
              const { error: transactionError } = await supabase
                .from('inventory_transactions')
                .insert({
                  inventory_id: inventoryItem.id,
                  transaction_type: 'sale',
                  quantity_change: -sold,
                  reference_type: 'supply_sale',
                  notes: `Automatic deduction: ${sold} units sold on ${salesDate}`
                });

              if (transactionError) throw transactionError;
            }
          }
        }
      }

    } catch (error) {
      console.error('Error deducting inventory for sales:', error);
      // Don't throw error to avoid blocking sales save
      toast({
        title: "Advertencia",
        description: "Las ventas se guardaron pero no se pudo actualizar el inventario automáticamente",
        variant: "destructive",
      });
    }
  };

  return {
    loading,
    saveDailySales,
  };
};
