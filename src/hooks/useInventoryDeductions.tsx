
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { useInventoryTransactions } from './useInventoryTransactions';
import { InventoryItem } from './useInventory';

export const useInventoryDeductions = (inventory: InventoryItem[]) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { addInventoryTransaction } = useInventoryTransactions();

  const deductInventoryForSales = async (
    servicesData: any,
    suppliesData: any,
    photocopierId: string,
    salesDate: string
  ) => {
    if (!user) return;

    try {
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

      // Deduct "Hojas Blancas" if sheets were used
      if (totalSheetsUsed > 0) {
        const whitePaperItem = inventory.find(item => item.supply_name === 'Hojas Blancas');
        if (whitePaperItem && whitePaperItem.sheets_per_block) {
          const blocksUsed = totalSheetsUsed / whitePaperItem.sheets_per_block;
          
          await addInventoryTransaction({
            inventory_id: whitePaperItem.id,
            transaction_type: 'sale',
            quantity_change: -blocksUsed,
            reference_type: 'service_sale',
            notes: `Deducción automática: ${totalSheetsUsed} hojas (${blocksUsed.toFixed(2)} bloques) usadas en servicios de fotocopiado`
          });
        }
      }

      // Deduct other supplies based on sold quantities
      for (const [supplyName, supplyData] of Object.entries(suppliesData)) {
        if (supplyData && typeof supplyData === 'object') {
          const sold = Math.max(0, (supplyData as any).startStock - (supplyData as any).endStock);
          
          if (sold > 0) {
            const inventoryItem = inventory.find(item => item.supply_name === supplyName);
            if (inventoryItem) {
              await addInventoryTransaction({
                inventory_id: inventoryItem.id,
                transaction_type: 'sale',
                quantity_change: -sold,
                reference_type: 'supply_sale',
                notes: `Deducción automática: ${sold} unidades vendidas`
              });
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
    deductInventoryForSales,
  };
};
