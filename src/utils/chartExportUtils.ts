
import type { SummaryData } from '@/components/ChartSummary';

export const exportSummaryToCSV = (data: SummaryData) => {
  const headers = [
    'Período',
    'Servicios',
    'Suministros',
    'Total'
  ];

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2);
  };

  const formatDateRange = () => {
    const startDate = new Date(data.dateRange.startDate).toLocaleDateString('es-MX');
    const endDate = new Date(data.dateRange.endDate).toLocaleDateString('es-MX');
    return `${startDate} - ${endDate}`;
  };

  const rows = [
    [
      formatDateRange(),
      formatCurrency(data.services),
      formatCurrency(data.supplies),
      formatCurrency(data.total)
    ]
  ];

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const filename = `resumen_ventas_${data.dateRange.startDate}_${data.dateRange.endDate}.csv`;
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
