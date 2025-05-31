
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Filter, Package, Edit2, Save, X } from 'lucide-react';
import { usePhotocopiers } from '@/hooks/usePhotocopiers';
import { useInventoryData } from '@/hooks/useInventoryData';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export interface InventoryFilters {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  photocopierId?: string;
}

interface InventoryRecord {
  name: string;
  type: 'service' | 'supply' | 'procedure';
  totalInventory: number;
  soldQuantity: number;
  availableQuantity: number;
}

export const InventoryManagement = () => {
  const { photocopiers } = usePhotocopiers();
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, number>>({});
  
  const [filters, setFilters] = useState<InventoryFilters>({
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    }
  });

  const { data, loading, updateInventory } = useInventoryData(filters);

  const formatServiceType = (type: string) => {
    const typeMap: Record<string, string> = {
      'copias_color': 'Copias a Color',
      'copias_bn': 'Copias B/N',
      'impresion_color': 'Impresión a Color',
      'impresion_bn': 'Impresión B/N',
      'color_copies': 'Copias a Color',
      'bw_copies': 'Copias B/N',
      'color_prints': 'Impresión a Color',
      'bw_prints': 'Impresión B/N'
    };
    return typeMap[type] || type;
  };

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }));
  };

  const handlePhotocopierChange = (photocopierId: string) => {
    setFilters(prev => ({
      ...prev,
      photocopierId: photocopierId === 'all' ? undefined : photocopierId
    }));
  };

  const startEditing = (itemName: string, currentInventory: number) => {
    setEditingItem(itemName);
    setEditValues({ [itemName]: currentInventory });
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditValues({});
  };

  const saveInventory = async (itemName: string, itemType: 'service' | 'supply' | 'procedure') => {
    const newInventory = editValues[itemName];
    if (newInventory !== undefined) {
      try {
        await updateInventory(itemName, itemType, newInventory);
        setEditingItem(null);
        setEditValues({});
      } catch (error) {
        console.error('Error updating inventory:', error);
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Filters Section */}
      <Card className="sticky top-0 z-10 bg-white shadow-sm">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <Filter className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
            <h3 className="text-base md:text-lg font-semibold text-gray-800">Filtros de Inventario</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Start Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Fecha Inicio</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="date"
                  value={filters.dateRange.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Fecha Fin</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="date"
                  value={filters.dateRange.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Photocopier Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Fotocopiadora</Label>
              <Select 
                value={filters.photocopierId || 'all'} 
                onValueChange={handlePhotocopierChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {photocopiers.map((photocopier) => (
                    <SelectItem key={photocopier.id} value={photocopier.id}>
                      {photocopier.nombre || 'Sin nombre'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      {data.length === 0 ? (
        <Card>
          <CardContent className="p-8 md:p-12">
            <div className="text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-sm md:text-base">
                No se encontraron artículos para este rango de fechas
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <Package className="w-5 h-5 text-green-500" />
              <h3 className="text-lg md:text-xl font-semibold text-gray-800">
                Control de Inventario
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Artículo</TableHead>
                    <TableHead className="text-center">Tipo</TableHead>
                    <TableHead className="text-right">Inventario Total</TableHead>
                    <TableHead className="text-right">Cantidad Vendida</TableHead>
                    <TableHead className="text-right">Disponible</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow key={index} className={item.availableQuantity < 0 ? 'bg-red-50' : ''}>
                      <TableCell className="font-medium">
                        {item.type === 'service' 
                          ? formatServiceType(item.name) 
                          : item.name
                        }
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.type === 'service' 
                            ? 'bg-blue-100 text-blue-800' 
                            : item.type === 'supply'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {item.type === 'service' ? 'Servicio' : 
                           item.type === 'supply' ? 'Suministro' : 'Procedimiento'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {editingItem === item.name ? (
                          <Input
                            type="number"
                            value={editValues[item.name] || 0}
                            onChange={(e) => setEditValues(prev => ({
                              ...prev,
                              [item.name]: parseInt(e.target.value) || 0
                            }))}
                            className="w-20 h-8 text-right"
                            min="0"
                          />
                        ) : (
                          <span className="font-semibold">{item.totalInventory.toLocaleString()}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-orange-600">
                        {item.soldQuantity.toLocaleString()}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${
                        item.availableQuantity < 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {item.availableQuantity.toLocaleString()}
                        {item.availableQuantity < 0 && (
                          <span className="text-xs block text-red-500">¡Déficit!</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingItem === item.name ? (
                          <div className="flex gap-1 justify-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => saveInventory(item.name, item.type)}
                              className="h-7 w-7 p-0"
                            >
                              <Save className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditing}
                              className="h-7 w-7 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditing(item.name, item.totalInventory)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Nota:</strong> Los artículos con disponibilidad negativa (en rojo) indican que se han vendido más unidades de las que había en inventario.
                Puedes editar el inventario total haciendo clic en el botón de editar.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
