
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Filter, RefreshCw, Users } from 'lucide-react';
import { usePhotocopiers } from '@/hooks/usePhotocopiers';
import type { ReportFilters } from '@/pages/Reports';

interface ReportsFiltersProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  loading?: boolean;
}

export const ReportsFilters = ({ filters, onFiltersChange, loading = false }: ReportsFiltersProps) => {
  const { allPhotocopiers } = usePhotocopiers();

  // Filter out photocopiers with invalid IDs
  const validPhotocopiers = allPhotocopiers.filter(p => p && p.id && p.id.trim() !== '');

  const handlePeriodChange = (period: 'week' | 'month' | 'custom') => {
    let dateRange = filters.dateRange;
    
    if (period === 'week') {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateRange = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };
    } else if (period === 'month') {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateRange = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };
    }

    onFiltersChange({
      ...filters,
      period,
      dateRange
    });
  };

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    onFiltersChange({
      ...filters,
      period: 'custom',
      dateRange: {
        ...filters.dateRange,
        [field]: value
      }
    });
  };

  const handlePhotocopierChange = (photocopierId: string) => {
    onFiltersChange({
      ...filters,
      photocopierId: photocopierId === 'all' ? undefined : photocopierId
    });
  };

  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <Filter className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
          <h3 className="text-base md:text-lg font-semibold text-gray-800">Filtros</h3>
          {loading && <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Period Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Período</Label>
            <Select value={filters.period} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última Semana</SelectItem>
                <SelectItem value="month">Último Mes</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
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
                {validPhotocopiers.map((photocopier) => (
                  <SelectItem key={photocopier.id} value={photocopier.id}>
                    <div className="flex items-center gap-2 w-full">
                      <span className="font-medium">{photocopier.nombre || 'Sin nombre'}</span>
                      {photocopier.isShared && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                          <Users className="w-2 h-2 mr-1" />
                          Compartida
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
