
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package, Plus } from 'lucide-react';
import { useInventory, InventoryItem } from '@/hooks/useInventory';
import { InventoryAddForm } from './InventoryAddForm';
import { InventoryStockAdjustment } from './InventoryStockAdjustment';

interface InventoryManagementProps {
  negocioId: string;
}

export const InventoryManagement = ({ negocioId }: InventoryManagementProps) => {
  const { inventory, loading, lowStockItems } = useInventory(negocioId);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAdjustment, setShowAdjustment] = useState<InventoryItem | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-5 h-5" />
              Stock Bajo
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

      {/* Inventory Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Inventario
            </CardTitle>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Artículo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {inventory.length === 0 ? (
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
                      <p>Costo de compra: ${item.unit_cost} MXN</p>
                      <p>Mínimo: {item.threshold_quantity} {item.unit_type}</p>
                      {item.sheets_per_block && (
                        <p>Hojas por bloque: {item.sheets_per_block}</p>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Los precios de venta se gestionan desde "Suministros"
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
                      Ajustar Stock
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Form Modal */}
      {showAddForm && (
        <InventoryAddForm
          negocioId={negocioId}
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
