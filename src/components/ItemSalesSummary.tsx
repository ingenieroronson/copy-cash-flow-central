
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Filter, ToggleLeft, ToggleRight } from 'lucide-react';
import { usePhotocopiers } from '@/hooks/usePhotocopiers';
import { useItemSalesData } from '@/hooks/useItemSalesData';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export interface ItemSalesFilters {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  photocopierId?: string;
  groupByType: boolean;
}

interface ItemSalesRecord {
  name: string;
  type: 'service' | 'supply' | 'procedure';
  quantity: number;
  total: number;
}

export const ItemSalesSummary = () => {
  const { photocopiers } = usePhotocopiers();
  
  const [filters, setFilters] = useState<ItemSalesFilters>({
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    },
    groupByType: false
  });

  const { data, loading } = useItemSalesData(filters);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

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

  const toggleGroupByType = () => {
    setFilters(prev => ({
      ...prev,
      groupByType: !prev.groupByType
    }));
  };

  const groupedData = filters.groupByType 
    ? data.reduce((acc, item) => {
        let typeKey = 'Otros';
        if (item.type === 'service') typeKey = 'Servicios';
        else if (item.type === 'supply') typeKey = 'Suministros';
        else if (item.type === 'procedure') typeKey = 'Procedimientos';
        
        if (!acc[typeKey]) acc[typeKey] = [];
        acc[typeKey].push(item);
        return acc;
      }, {} as Record<string, ItemSalesRecord[]>)
    : { 'Todos los Artículos': data };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Filters Section */}
      <Card className="sticky top-0 z-10 bg-white shadow-sm">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <Filter className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
            <h3 className="text-base md:text-lg font-semibold text-gray-800">Filtros</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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

            {/* Group By Type Toggle */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Agrupar por Tipo</Label>
              <Button
                variant="outline"
                onClick={toggleGroupByType}
                className="w-full justify-start"
              >
                {filters.groupByType ? (
                  <>
                    <ToggleRight className="w-4 h-4 mr-2 text-blue-500" />
                    Agrupado
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-4 h-4 mr-2 text-gray-400" />
                    Mezclado
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Tables */}
      {data.length === 0 ? (
        <Card>
          <CardContent className="p-8 md:p-12">
            <div className="text-center">
              <p className="text-gray-500 text-sm md:text-base">
                No se encontraron ventas para este rango de fechas
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {Object.entries(groupedData).map(([groupName, items]) => (
            <Card key={groupName}>
              <CardContent className="p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
                  {groupName}
                </h3>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-left">Artículo</TableHead>
                        {!filters.groupByType && (
                          <TableHead className="text-center">Tipo</TableHead>
                        )}
                        <TableHead className="text-right">Cantidad Vendida</TableHead>
                        <TableHead className="text-right">Total (MXN)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {item.type === 'service' 
                              ? formatServiceType(item.name) 
                              : item.name
                            }
                          </TableCell>
                          {!filters.groupByType && (
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
                          )}
                          <TableCell className="text-right font-semibold">
                            {item.quantity.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-green-600">
                            {formatCurrency(item.total)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="border-t-2 border-gray-200 font-bold bg-gray-50">
                        <TableCell colSpan={filters.groupByType ? 2 : 3} className="text-right">
                          Total {groupName}:
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          {formatCurrency(items.reduce((sum, item) => sum + item.total, 0))}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
