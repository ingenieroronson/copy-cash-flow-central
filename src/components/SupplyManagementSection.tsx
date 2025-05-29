import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Save } from 'lucide-react';
import { useSupplies } from '@/hooks/useSupplies';
import { usePricing } from '@/hooks/usePricing';
import { useToast } from '@/hooks/use-toast';

export const SupplyManagementSection = () => {
  const { supplies, addSupply, updateSupply, deleteSupply, loading: suppliesLoading } = useSupplies();
  const { updateSupplyPrice, loading: pricingLoading } = usePricing();
  const { toast } = useToast();
  const [newSupply, setNewSupply] = useState({ name: '', price: 0 });

  const loading = suppliesLoading || pricingLoading;

  const handleSupplyPriceUpdate = async (supplyName: string, price: number) => {
    try {
      await updateSupplyPrice(supplyName, price);
      toast({
        title: "Precio actualizado",
        description: "El precio del suministro se ha actualizado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el precio del suministro.",
        variant: "destructive",
      });
    }
  };

  const handleAddSupply = async () => {
    if (!newSupply.name.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre válido.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addSupply(newSupply.name, newSupply.price);
      setNewSupply({ name: '', price: 0 });
      toast({
        title: "Suministro agregado",
        description: "El nuevo suministro se ha agregado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el suministro.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSupply = async (supplyName: string) => {
    try {
      await deleteSupply(supplyName);
      toast({
        title: "Suministro eliminado",
        description: "El suministro se ha eliminado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el suministro.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Gestión de Suministros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando suministros...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-gray-800">Gestión de Suministros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Supply */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-3">Agregar Nuevo Suministro</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="supply-name">Nombre del suministro</Label>
              <Input
                id="supply-name"
                value={newSupply.name}
                onChange={(e) => setNewSupply(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Carpetas azules"
              />
            </div>
            <div className="w-full sm:w-32">
              <Label htmlFor="supply-price">Precio (MXN)</Label>
              <Input
                id="supply-price"
                type="number"
                step="0.01"
                value={newSupply.price}
                onChange={(e) => setNewSupply(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddSupply} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Agregar
              </Button>
            </div>
          </div>
        </div>

        {/* Existing Supplies */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Suministros Existentes</h3>
          {supplies.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay suministros configurados. Agrega uno nuevo arriba.</p>
          ) : (
            <div className="space-y-3">
              {supplies.map((supply) => (
                <div key={supply.id} className="flex flex-col sm:flex-row gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <Input
                      value={supply.supply_name || ''}
                      onChange={(e) => updateSupply(supply.id, { supply_name: e.target.value })}
                      placeholder="Nombre del suministro"
                    />
                  </div>
                  <div className="w-full sm:w-32">
                    <Input
                      type="number"
                      step="0.01"
                      value={supply.unit_price}
                      onChange={(e) => updateSupply(supply.id, { unit_price: parseFloat(e.target.value) || 0 })}
                      placeholder="Precio"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSupplyPriceUpdate(supply.supply_name || '', supply.unit_price)}
                      size="sm"
                      variant="outline"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteSupply(supply.supply_name || '')}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
