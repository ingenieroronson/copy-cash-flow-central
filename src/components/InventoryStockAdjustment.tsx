
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInventory, InventoryItem } from '@/hooks/useInventory';

interface InventoryStockAdjustmentProps {
  item: InventoryItem;
  onClose: () => void;
}

export const InventoryStockAdjustment = ({ item, onClose }: InventoryStockAdjustmentProps) => {
  const { addInventoryTransaction } = useInventory(item.negocio_id);
  const [adjustmentType, setAdjustmentType] = useState<'purchase' | 'adjustment'>('purchase');
  const [quantity, setQuantity] = useState(0);
  const [unitCost, setUnitCost] = useState(item.unit_cost);
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await addInventoryTransaction({
      inventory_id: item.id,
      transaction_type: adjustmentType,
      quantity_change: quantity,
      unit_cost: adjustmentType === 'purchase' ? unitCost : undefined,
      notes: notes || undefined,
    });
    
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustar Stock - {item.supply_name}</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">Stock actual: <strong>{item.quantity} {item.unit_type}</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="adjustment_type">Tipo de ajuste</Label>
            <Select
              value={adjustmentType}
              onValueChange={(value: 'purchase' | 'adjustment') => setAdjustmentType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="purchase">Compra</SelectItem>
                <SelectItem value="adjustment">Ajuste manual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="quantity">
              Cantidad {adjustmentType === 'purchase' ? 'comprada' : 'a ajustar'}
              <span className="text-sm text-gray-500 ml-2">
                (usar números negativos para reducir stock)
              </span>
            </Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          {adjustmentType === 'purchase' && (
            <div>
              <Label htmlFor="unit_cost">Costo por unidad (MXN)</Label>
              <Input
                id="unit_cost"
                type="number"
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Compra de emergencia, ajuste por inventario físico"
            />
          </div>

          <div className="p-3 bg-blue-50 rounded">
            <p className="text-sm text-blue-800">
              Stock después del ajuste: <strong>{(item.quantity + quantity).toFixed(2)} {item.unit_type}</strong>
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Confirmar Ajuste
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
