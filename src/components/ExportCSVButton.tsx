
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { formatDateInMexicoTimezone } from '@/utils/dateUtils';
import type { DetailedSalesRecord } from '@/components/DetailedReportsTable';
import type { ReportFilters } from '@/pages/Reports';

interface ExportCSVButtonProps {
  data: DetailedSalesRecord[];
  filters: ReportFilters;
  disabled?: boolean;
}

export const ExportCSVButton = ({ data, filters, disabled = false }: ExportCSVButtonProps) => {
  const exportToCSV = () => {
    if (data.length === 0) return;

    const headers = [
      'Fecha',
      'Tipo',
      'Producto/Servicio',
      'Cantidad',
      'Precio Unitario',
      'Total',
      'Fotocopiadora'
    ];

    const formatServiceType = (type: string) => {
      const typeMap: Record<string, string> = {
        'copias_color': 'Copias a Color',
        'copias_bn': 'Copias B/N',
        'impresion_color': 'Impresión a Color',
        'impresion_bn': 'Impresión B/N'
      };
      return typeMap[type] || type;
    };

    const rows = data.map(record => [
      formatDateInMexicoTimezone(record.date, 'dd/MM/yyyy'),
      record.type === 'service' ? 'Servicio' : 'Suministro',
      record.type === 'service' 
        ? formatServiceType(record.service_type!) 
        : record.supply_name || '',
      record.quantity.toString(),
      record.unit_price.toFixed(2),
      record.total.toFixed(2),
      record.photocopier_name || 'N/A'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      const filename = `reporte_ventas_${filters.dateRange.startDate}_${filters.dateRange.endDate}.csv`;
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Button 
      onClick={exportToCSV} 
      disabled={disabled}
      className="flex items-center gap-2 text-sm md:text-base"
      size="sm"
    >
      <Download className="w-4 h-4" />
      <span className="hidden sm:inline">Exportar CSV</span>
      <span className="sm:hidden">CSV</span>
    </Button>
  );
};
