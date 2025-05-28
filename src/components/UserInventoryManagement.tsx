
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package, Plus } from 'lucide-react';
import { useInventory, InventoryItem } from '@/hooks/useInventory';
import { InventoryAddForm } from './InventoryAddForm';
import { InventoryStockAdjustment } from './InventoryStockAdjustment';
import { useUserBusinesses } from '@/hooks/useUserBusinesses';

export const UserInventoryManagement = () => {
  const { businesses, loading: businessesLoading } = useUserBusinesses();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAdjustment, setShowAdjustment] = useState<InventoryItem | null>(null);

  const { inventory, loading: inventoryLoading, lowStockItems } = useInventory(selectedBusinessId);

  // Auto-select first business if available
  React.useEffect(() => {
    if (businesses.length > 0 && !selectedBusinessId) {
      setSelectedBusinessId(businesses[0].id);
    }
  }, [businesses, selectedBusinessId]);

  if (businessesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-gray-500">No hay negocios disponibles</p>
          <p className="text-sm text-gray-400">Contacta al administrador para acceso</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Business Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Negocio</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedBusinessId} onValueChange={setSelectedBusinessId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona un negocio" />
            </SelectTrigger>
            <SelectContent>
              {businesses.map((business) => (
                <SelectItem key={business.id} value={business.id}>
                  {business.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedBusinessId && (
        <>
          {/* Low Stock Alerts */}
          {lowStockItems.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="w-5 h-5" />
                  Stock Bajo - {businesses.find(b => b.id === selectedBusinessId)?.nombre}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <span className="font-medium">{item.supply_name}</span>
                      <Badge variant="destructive">
                        {item.quantity} {item.unit_type} (mínimo: {item.threshold_quantity})
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Inventory Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Inventario - {businesses.find(b => b.id === selectedBusinessId)?.nombre}
                </CardTitle>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Artículo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {inventoryLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : inventory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay artículos en el inventario</p>
                  <p className="text-sm">Agrega tu primer artículo para comenzar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inventory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{item.supply_name}</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Cantidad: {item.quantity} {item.unit_type}</p>
                          <p>Costo: ${item.unit_cost} MXN (solo lectura)</p>
                          <p>Mínimo: {item.threshold_quantity} {item.unit_type}</p>
                          {item.sheets_per_block && (
                            <p>Hojas por bloque: {item.sheets_per_block}</p>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Los precios se editan desde la pestaña "Suministros"
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={item.quantity < item.threshold_quantity ? "destructive" : "secondary"}
                        >
                          {item.quantity} {item.unit_type}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowAdjustment(item)}
                        >
                          Ajustar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Add Form Modal */}
      {showAddForm && selectedBusinessId && (
        <InventoryAddForm
          negocioId={selectedBusinessId}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {/* Stock Adjustment Modal */}
      {showAdjustment && (
        <InventoryStockAdjustment
          item={showAdjustment}
          onClose={() => setShowAdjustment(null)}
        />
      )}
    </div>
  );
};
