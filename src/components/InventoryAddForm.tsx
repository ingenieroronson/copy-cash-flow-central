
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInventory } from '@/hooks/useInventory';

interface InventoryAddFormProps {
  negocioId: string;
  onClose: () => void;
}

export const InventoryAddForm = ({ negocioId, onClose }: InventoryAddFormProps) => {
  const { addInventoryItem } = useInventory(negocioId);
  const [formData, setFormData] = useState({
    supply_name: '',
    quantity: 0,
    unit_cost: 0,
    threshold_quantity: 1,
    unit_type: 'units',
    sheets_per_block: null as number | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await addInventoryItem({
      negocio_id: negocioId,
      supply_name: formData.supply_name,
      quantity: formData.quantity,
      unit_cost: formData.unit_cost,
      threshold_quantity: formData.threshold_quantity,
      unit_type: formData.unit_type,
      sheets_per_block: formData.unit_type === 'blocks' ? formData.sheets_per_block : null,
    });
    
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Artículo al Inventario</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="supply_name">Nombre del suministro</Label>
            <Input
              id="supply_name"
              value={formData.supply_name}
              onChange={(e) => setFormData(prev => ({ ...prev, supply_name: e.target.value }))}
              placeholder="Ej: Papel blanco, Toner negro"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Cantidad inicial</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="unit_type">Tipo de unidad</Label>
              <Select
                value={formData.unit_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, unit_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="units">Unidades</SelectItem>
                  <SelectItem value="blocks">Bloques</SelectItem>
                  <SelectItem value="boxes">Cajas</SelectItem>
                  <SelectItem value="bottles">Botellas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.unit_type === 'blocks' && (
            <div>
              <Label htmlFor="sheets_per_block">Hojas por bloque</Label>
              <Input
                id="sheets_per_block"
                type="number"
                value={formData.sheets_per_block || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, sheets_per_block: parseInt(e.target.value) || null }))}
                placeholder="500"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unit_cost">Costo por unidad (MXN)</Label>
              <Input
                id="unit_cost"
                type="number"
                step="0.01"
                value={formData.unit_cost}
                onChange={(e) => setFormData(prev => ({ ...prev, unit_cost: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="threshold_quantity">Stock mínimo</Label>
              <Input
                id="threshold_quantity"
                type="number"
                step="0.01"
                value={formData.threshold_quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, threshold_quantity: parseFloat(e.target.value) || 1 }))}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Agregar Artículo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
