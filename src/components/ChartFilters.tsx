
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Filter, BarChart3 } from 'lucide-react';
import { usePhotocopiers } from '@/hooks/usePhotocopiers';

export interface ChartFilters {
  dataTypes: string[];
  photocopierId?: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

interface ChartFiltersProps {
  filters: ChartFilters;
  onFiltersChange: (filters: ChartFilters) => void;
  loading?: boolean;
}

export const ChartFilters = ({ filters, onFiltersChange, loading = false }: ChartFiltersProps) => {
  const { photocopiers } = usePhotocopiers();

  const handleDataTypeChange = (dataType: string, checked: boolean) => {
    const newDataTypes = checked 
      ? [...filters.dataTypes, dataType]
      : filters.dataTypes.filter(type => type !== dataType);
    
    onFiltersChange({
      ...filters,
      dataTypes: newDataTypes
    });
  };

  const handlePhotocopierChange = (photocopierId: string) => {
    onFiltersChange({
      ...filters,
      photocopierId: photocopierId === 'all' ? undefined : photocopierId
    });
  };

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value
      }
    });
  };

  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
          <h3 className="text-base md:text-lg font-semibold text-gray-800">Filtros del Gráfico</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Data Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Tipo de Datos</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="services"
                  checked={filters.dataTypes.includes('services')}
                  onCheckedChange={(checked) => handleDataTypeChange('services', checked as boolean)}
                />
                <Label htmlFor="services" className="text-sm">Servicios</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="supplies"
                  checked={filters.dataTypes.includes('supplies')}
                  onCheckedChange={(checked) => handleDataTypeChange('supplies', checked as boolean)}
                />
                <Label htmlFor="supplies" className="text-sm">Suministros</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="total"
                  checked={filters.dataTypes.includes('total')}
                  onCheckedChange={(checked) => handleDataTypeChange('total', checked as boolean)}
                />
                <Label htmlFor="total" className="text-sm">Total</Label>
              </div>
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
        </div>
      </CardContent>
    </Card>
  );
};
