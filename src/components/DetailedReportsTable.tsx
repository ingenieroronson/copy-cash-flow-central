import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { formatDisplayDate, formatDateInMexicoTimezone } from '@/utils/dateUtils';

export interface DetailedSalesRecord {
  date: string;
  type: 'service' | 'supply';
  service_type?: string;
  supply_name?: string;
  quantity: number;
  unit_price: number;
  total: number;
  photocopier_name?: string;
}

interface DetailedReportsTableProps {
  data: DetailedSalesRecord[];
}

export const DetailedReportsTable = ({ data }: DetailedReportsTableProps) => {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  const toggleDateExpansion = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

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
      'impresion_bn': 'Impresión B/N'
    };
    return typeMap[type] || type;
  };

  // Group data by date
  const groupedData = data.reduce((acc, record) => {
    if (!acc[record.date]) {
      acc[record.date] = [];
    }
    acc[record.date].push(record);
    return acc;
  }, {} as Record<string, DetailedSalesRecord[]>);

  // Calculate daily totals
  const dailyTotals = Object.entries(groupedData).map(([date, records]) => ({
    date,
    records,
    total: records.reduce((sum, record) => sum + record.total, 0),
    count: records.length
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (data.length === 0) {
    return (
      <div className="text-center py-8 md:py-12">
        <p className="text-gray-500 text-sm md:text-base">
          No se encontraron registros para el período seleccionado
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {dailyTotals.map(({ date, records, total, count }) => (
        <div key={date} className="border rounded-lg overflow-hidden">
          <div 
            className="bg-gray-50 p-3 md:p-4 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => toggleDateExpansion(date)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                <Button variant="ghost" size="sm" className="p-0 h-auto">
                  {expandedDates.has(date) ? (
                    <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
                  ) : (
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                </Button>
                <div>
                  <h3 className="font-semibold text-sm md:text-base">
                    {formatDisplayDate(date)}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    {count} transacción{count !== 1 ? 'es' : ''}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm md:text-base lg:text-lg text-green-600">
                  {formatCurrency(total)}
                </p>
              </div>
            </div>
          </div>

          {expandedDates.has(date) && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs md:text-sm">Tipo/Producto</TableHead>
                    <TableHead className="text-right text-xs md:text-sm">Cant.</TableHead>
                    <TableHead className="text-right text-xs md:text-sm hidden md:table-cell">Precio Unit.</TableHead>
                    <TableHead className="text-right text-xs md:text-sm">Total</TableHead>
                    <TableHead className="text-xs md:text-sm hidden lg:table-cell">Fotocopiadora</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="py-2 md:py-4">
                        <div>
                          <p className="font-medium text-xs md:text-sm">
                            {record.type === 'service' 
                              ? formatServiceType(record.service_type!) 
                              : record.supply_name
                            }
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {record.type === 'service' ? 'Servicio' : 'Suministro'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-xs md:text-sm py-2 md:py-4">
                        {record.quantity}
                      </TableCell>
                      <TableCell className="text-right text-xs md:text-sm py-2 md:py-4 hidden md:table-cell">
                        {formatCurrency(record.unit_price)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-xs md:text-sm py-2 md:py-4">
                        {formatCurrency(record.total)}
                      </TableCell>
                      <TableCell className="text-xs md:text-sm py-2 md:py-4 hidden lg:table-cell">
                        {record.photocopier_name || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
