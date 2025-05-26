
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface SalesRecord {
  id?: string;
  machine_id: string;
  date: string;
  service_type: string;
  previous_value: number;
  current_value: number;
  unit_price: number;
}

export interface SupplySalesRecord {
  id?: string;
  user_id: string;
  date: string;
  supply_name: string;
  initial_stock: number;
  final_stock: number;
  unit_price: number;
}

export const useSalesRecords = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const saveDailySales = async (
    services: any,
    supplies: any,
    servicePrices: any,
    supplyPrices: any
  ) => {
    if (!user) return;

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get user's default machine (create one if doesn't exist)
      let { data: machines, error: machinesError } = await supabase
        .from('machines')
        .select('*')
        .eq('user_id', user.id)
        .limit(1);

      if (machinesError) throw machinesError;

      let machineId;
      if (!machines || machines.length === 0) {
        // Create default machine
        const { data: newMachine, error: createError } = await supabase
          .from('machines')
          .insert({
            user_id: user.id,
            name: 'Máquina Principal',
            location: 'Local'
          })
          .select()
          .single();

        if (createError) throw createError;
        machineId = newMachine.id;
      } else {
        machineId = machines[0].id;
      }

      // Save service records
      const serviceRecords: SalesRecord[] = [];
      Object.entries(services).forEach(([serviceKey, serviceData]: [string, any]) => {
        if (serviceData.today > 0 || serviceData.yesterday > 0) {
          const serviceType = serviceKey.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
          serviceRecords.push({
            machine_id: machineId,
            date: today,
            service_type: serviceType,
            previous_value: serviceData.yesterday,
            current_value: serviceData.today,
            unit_price: servicePrices[serviceType] || 0
          });
        }
      });

      if (serviceRecords.length > 0) {
        const { error: serviceError } = await supabase
          .from('sales_records')
          .upsert(serviceRecords, {
            onConflict: 'machine_id,date,service_type'
          });

        if (serviceError) throw serviceError;
      }

      // Save supply records
      const supplyRecords: SupplySalesRecord[] = [];
      Object.entries(supplies).forEach(([supplyKey, supplyData]: [string, any]) => {
        if (supplyData.startStock > 0 || supplyData.endStock > 0) {
          supplyRecords.push({
            user_id: user.id,
            date: today,
            supply_name: supplyKey,
            initial_stock: supplyData.startStock,
            final_stock: supplyData.endStock,
            unit_price: supplyPrices[supplyKey] || 0
          });
        }
      });

      if (supplyRecords.length > 0) {
        const { error: supplyError } = await supabase
          .from('supply_sales')
          .upsert(supplyRecords, {
            onConflict: 'user_id,date,supply_name'
          });

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
      // Load service records
      const { data: serviceRecords, error: serviceError } = await supabase
        .from('sales_records')
        .select(`
          *,
          machines!inner(user_id)
        `)
        .eq('machines.user_id', user.id)
        .eq('date', targetDate);

      if (serviceError) throw serviceError;

      // Load supply records
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
        const serviceKey = record.service_type.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        services[serviceKey] = {
          yesterday: record.previous_value,
          today: record.current_value
        };
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
