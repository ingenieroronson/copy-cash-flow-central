import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { usePricing } from '@/hooks/usePricing';
import { useSupplies } from '@/hooks/useSupplies';
import { useProcedures } from '@/hooks/useProcedures';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, Save, Settings as SettingsIcon } from 'lucide-react';
import { AuthForm } from '@/components/AuthForm';
import { PhotocopierManagement } from '@/components/PhotocopierManagement';
import { SharedModulesView } from '@/components/SharedModulesView';
import { SharedAccessSummary } from '@/components/SharedAccessSummary';

const Settings = () => {
  const { user, loading: authLoading } = useAuth();
  const { pricing, updateServicePrice, updateSupplyPrice, loading: pricingLoading } = usePricing();
  const { supplies, addSupply, updateSupply, deleteSupply, loading: suppliesLoading } = useSupplies();
  const { procedures, addProcedure, updateProcedure, deleteProcedure, loading: proceduresLoading } = useProcedures();
  const { toast } = useToast();

  const [servicePrices, setServicePrices] = useState({
    color_copies: 0,
    bw_copies: 0,
    color_prints: 0,
    bw_prints: 0
  });

  const [newSupply, setNewSupply] = useState({ name: '', price: 0 });
  const [newProcedure, setNewProcedure] = useState({ name: '', price: 0 });

  React.useEffect(() => {
    if (pricing.length > 0) {
      const prices = pricing.reduce((acc, item) => {
        if (item.service_type) {
          acc[item.service_type] = item.unit_price;
        }
        return acc;
      }, {} as any);
      setServicePrices(prev => ({ ...prev, ...prices }));
    }
  }, [pricing]);

  if (authLoading || pricingLoading || suppliesLoading || proceduresLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const handleServicePriceUpdate = async (serviceType: 'color_copies' | 'bw_copies' | 'color_prints' | 'bw_prints', price: number) => {
    try {
      await updateServicePrice(serviceType, price);
      toast({
        title: "Precio actualizado",
        description: "El precio del servicio se ha actualizado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el precio del servicio.",
        variant: "destructive",
      });
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <SettingsIcon className="w-8 h-8 text-orange-500" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Configuración</h1>
          </div>

          <div className="space-y-8">
            {/* Photocopier Management */}
            <PhotocopierManagement />

            {/* Shared Access Management */}
            <SharedAccessSummary />

            {/* Shared Modules View */}
            <SharedModulesView />

            {/* Service Prices */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Precios de Servicios</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="color-copies">Copias a color (MXN)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="color-copies"
                        type="number"
                        step="0.01"
                        value={servicePrices.color_copies}
                        onChange={(e) => setServicePrices(prev => ({ ...prev, color_copies: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                      />
                      <Button
                        onClick={() => handleServicePriceUpdate('color_copies', servicePrices.color_copies)}
                        size="sm"
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bw-copies">Copias blanco y negro (MXN)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="bw-copies"
                        type="number"
                        step="0.01"
                        value={servicePrices.bw_copies}
                        onChange={(e) => setServicePrices(prev => ({ ...prev, bw_copies: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                      />
                      <Button
                        onClick={() => handleServicePriceUpdate('bw_copies', servicePrices.bw_copies)}
                        size="sm"
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="color-prints">Impresiones a color (MXN)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="color-prints"
                        type="number"
                        step="0.01"
                        value={servicePrices.color_prints}
                        onChange={(e) => setServicePrices(prev => ({ ...prev, color_prints: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                      />
                      <Button
                        onClick={() => handleServicePriceUpdate('color_prints', servicePrices.color_prints)}
                        size="sm"
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bw-prints">Impresiones blanco y negro (MXN)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="bw-prints"
                        type="number"
                        step="0.01"
                        value={servicePrices.bw_prints}
                        onChange={(e) => setServicePrices(prev => ({ ...prev, bw_prints: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                      />
                      <Button
                        onClick={() => handleServicePriceUpdate('bw_prints', servicePrices.bw_prints)}
                        size="sm"
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Procedure Management */}
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

            {/* Supply Management */}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
