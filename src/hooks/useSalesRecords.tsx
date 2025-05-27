
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export const useSalesRecords = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const saveDailySales = async (
    services: any,
    suppliesData: any,
    servicePrices: any,
    supplyPrices: any
  ) => {
    if (!user) return;

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      // Save service records to ventas table
      const serviceRecords = [];
      
      // Color copies
      if (services.colorCopies && (services.colorCopies.today > 0 || services.colorCopies.yesterday > 0)) {
        const cantidad = Math.max(0, services.colorCopies.today - services.colorCopies.yesterday);
        if (cantidad > 0) {
          serviceRecords.push({
            usuario_id: user.id,
            fecha: today,
            tipo: 'copias_color',
            cantidad: cantidad,
            precio_unitario: servicePrices.color_copies || 0,
            total: cantidad * (servicePrices.color_copies || 0),
            valor_anterior: services.colorCopies.yesterday,
            valor_actual: services.colorCopies.today
          });
        }
      }

      // BW copies
      if (services.bwCopies && (services.bwCopies.today > 0 || services.bwCopies.yesterday > 0)) {
        const cantidad = Math.max(0, services.bwCopies.today - services.bwCopies.yesterday);
        if (cantidad > 0) {
          serviceRecords.push({
            usuario_id: user.id,
            fecha: today,
            tipo: 'copias_bn',
            cantidad: cantidad,
            precio_unitario: servicePrices.bw_copies || 0,
            total: cantidad * (servicePrices.bw_copies || 0),
            valor_anterior: services.bwCopies.yesterday,
            valor_actual: services.bwCopies.today
          });
        }
      }

      // Color prints
      if (services.colorPrints && (services.colorPrints.today > 0 || services.colorPrints.yesterday > 0)) {
        const cantidad = Math.max(0, services.colorPrints.today - services.colorPrints.yesterday);
        if (cantidad > 0) {
          serviceRecords.push({
            usuario_id: user.id,
            fecha: today,
            tipo: 'impresion_color',
            cantidad: cantidad,
            precio_unitario: servicePrices.color_prints || 0,
            total: cantidad * (servicePrices.color_prints || 0),
            valor_anterior: services.colorPrints.yesterday,
            valor_actual: services.colorPrints.today
          });
        }
      }

      // BW prints
      if (services.bwPrints && (services.bwPrints.today > 0 || services.bwPrints.yesterday > 0)) {
        const cantidad = Math.max(0, services.bwPrints.today - services.bwPrints.yesterday);
        if (cantidad > 0) {
          serviceRecords.push({
            usuario_id: user.id,
            fecha: today,
            tipo: 'impresion_bn',
            cantidad: cantidad,
            precio_unitario: servicePrices.bw_prints || 0,
            total: cantidad * (servicePrices.bw_prints || 0),
            valor_anterior: services.bwPrints.yesterday,
            valor_actual: services.bwPrints.today
          });
        }
      }

      // Insert service records if any
      if (serviceRecords.length > 0) {
        const { error: serviceError } = await supabase
          .from('ventas')
          .insert(serviceRecords);

        if (serviceError) throw serviceError;
      }

      // Save supply records to supply_sales table
      const supplyRecords = [];
      Object.entries(suppliesData).forEach(([supplyName, supplyData]: [string, any]) => {
        if (supplyData.startStock > 0 || supplyData.endStock > 0) {
          const cantidad = Math.max(0, supplyData.startStock - supplyData.endStock);
          if (cantidad > 0) {
            supplyRecords.push({
              user_id: user.id,
              date: today,
              supply_name: supplyName,
              initial_stock: supplyData.startStock,
              final_stock: supplyData.endStock,
              quantity_sold: cantidad,
              unit_price: supplyPrices[supplyName] || 0,
              total: cantidad * (supplyPrices[supplyName] || 0)
            });
          }
        }
      });

      // Insert supply records if any
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

  const loadDailySales = async (date?: string) => {
    if (!user) return { services: {}, supplies: {} };

    const targetDate = date || new Date().toISOString().split('T')[0];

    try {
      // Load service records from ventas table
      const { data: serviceRecords, error: serviceError } = await supabase
        .from('ventas')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('fecha', targetDate);

      if (serviceError) throw serviceError;

      // Load supply records from supply_sales table
      const { data: supplyRecords, error: supplyError } = await supabase
        .from('supply_sales')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', targetDate);

      if (supplyError) throw supplyError;

      // Transform data to match component state format
      const services = {};
      const supplies = {};

      serviceRecords?.forEach(record => {
        let serviceKey = '';
        switch (record.tipo) {
          case 'copias_color':
            serviceKey = 'colorCopies';
            break;
          case 'copias_bn':
            serviceKey = 'bwCopies';
            break;
          case 'impresion_color':
            serviceKey = 'colorPrints';
            break;
          case 'impresion_bn':
            serviceKey = 'bwPrints';
            break;
        }
        
        if (serviceKey) {
          services[serviceKey] = {
            yesterday: record.valor_anterior || 0,
            today: record.valor_actual || 0
          };
        }
      });

      supplyRecords?.forEach(record => {
        supplies[record.supply_name] = {
          startStock: record.initial_stock,
          endStock: record.final_stock
        };
      });

      return { services, supplies };

    } catch (error) {
      console.error('Error loading sales:', error);
      return { services: {}, supplies: {} };
    }
  };

  return {
    loading,
    saveDailySales,
    loadDailySales,
  };
};
