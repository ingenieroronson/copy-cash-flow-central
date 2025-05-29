import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Save } from 'lucide-react';
import { useProcedures } from '@/hooks/useProcedures';
import { useToast } from '@/hooks/use-toast';

export const ProcedureManagementSection = () => {
  const { procedures, addProcedure, updateProcedure, deleteProcedure, loading } = useProcedures();
  const { toast } = useToast();
  const [newProcedure, setNewProcedure] = useState({ name: '', price: 0 });

  const handleAddProcedure = async () => {
    if (!newProcedure.name.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre válido.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addProcedure(newProcedure.name, newProcedure.price);
      setNewProcedure({ name: '', price: 0 });
      toast({
        title: "Procedimiento agregado",
        description: "El nuevo procedimiento se ha agregado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el procedimiento.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProcedure = async (procedureName: string) => {
    try {
      await deleteProcedure(procedureName);
      toast({
        title: "Procedimiento eliminado",
        description: "El procedimiento se ha eliminado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el procedimiento.",
        variant: "destructive",
      });
    }
  };

  const handleProcedurePriceUpdate = async (procedureId: string, price: number) => {
    try {
      await updateProcedure(procedureId, { unit_price: price });
      toast({
        title: "Precio actualizado",
        description: "El precio del procedimiento se ha actualizado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el precio del procedimiento.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Gestión de Procedimientos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando procedimientos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-gray-800">Gestión de Procedimientos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Procedure */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-3">Agregar Nuevo Procedimiento</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="procedure-name">Nombre del procedimiento</Label>
              <Input
                id="procedure-name"
                value={newProcedure.name}
                onChange={(e) => setNewProcedure(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: CURP, RFC, INE"
              />
            </div>
            <div className="w-full sm:w-32">
              <Label htmlFor="procedure-price">Precio (MXN)</Label>
              <Input
                id="procedure-price"
                type="number"
                step="0.01"
                value={newProcedure.price}
                onChange={(e) => setNewProcedure(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddProcedure} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Agregar
              </Button>
            </div>
          </div>
        </div>

        {/* Existing Procedures */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Procedimientos Existentes</h3>
          {procedures.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay procedimientos configurados. Agrega uno nuevo arriba.</p>
          ) : (
            <div className="space-y-3">
              {procedures.map((procedure) => (
                <div key={procedure.id} className="flex flex-col sm:flex-row gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <Input
                      value={procedure.name}
                      onChange={(e) => updateProcedure(procedure.id, { name: e.target.value })}
                      placeholder="Nombre del procedimiento"
                    />
                  </div>
                  <div className="w-full sm:w-32">
                    <Input
                      type="number"
                      step="0.01"
                      value={procedure.unit_price}
                      onChange={(e) => updateProcedure(procedure.id, { unit_price: parseFloat(e.target.value) || 0 })}
                      placeholder="Precio"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleProcedurePriceUpdate(procedure.id, procedure.unit_price)}
                      size="sm"
                      variant="outline"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteProcedure(procedure.name)}
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
