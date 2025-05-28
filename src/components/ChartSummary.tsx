
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp } from 'lucide-react';

export interface SummaryData {
  services: number;
  procedures: number;
  supplies: number;
  total: number;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

interface ChartSummaryProps {
  data: SummaryData;
  onExportCSV: () => void;
}

export const ChartSummary = ({ data, onExportCSV }: ChartSummaryProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDateRange = () => {
    const startDate = new Date(data.dateRange.startDate).toLocaleDateString('es-MX');
    const endDate = new Date(data.dateRange.endDate).toLocaleDateString('es-MX');
    return `${startDate} - ${endDate}`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Resumen del Período
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {formatDateRange()}
            </p>
          </div>
          <Button 
            onClick={onExportCSV}
            className="flex items-center gap-2 text-sm"
            size="sm"
          >
            <Download className="w-4 h-4" />
            Exportar Resumen CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold text-blue-600">
              {formatCurrency(data.services)}
            </div>
            <div className="text-sm text-blue-700 font-medium mt-1">
              Servicios
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold text-purple-600">
              {formatCurrency(data.procedures)}
            </div>
            <div className="text-sm text-purple-700 font-medium mt-1">
              Procedimientos
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold text-green-600">
              {formatCurrency(data.supplies)}
            </div>
            <div className="text-sm text-green-700 font-medium mt-1">
              Suministros
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold text-orange-600">
              {formatCurrency(data.total)}
            </div>
            <div className="text-sm text-orange-700 font-medium mt-1">
              Total
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
