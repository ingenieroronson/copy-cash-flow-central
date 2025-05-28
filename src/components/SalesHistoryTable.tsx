
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { formatDisplayDate, formatDateInMexicoTimezone } from '@/utils/dateUtils';
import type { DailySales, SalesRecord } from '@/pages/SalesHistory';

interface SalesHistoryTableProps {
  salesData: DailySales[];
  onDeleteRecord: (record: SalesRecord) => void;
  onDeleteAllForDate: (date: string) => void;
}

export const SalesHistoryTable = ({ salesData, onDeleteRecord, onDeleteAllForDate }: SalesHistoryTableProps) => {
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

  const formatServiceType = (tipo: string, supplyName?: string) => {
    if (supplyName) return supplyName;
    
    const typeMap: Record<string, string> = {
      'copias_color': 'Copias a Color',
      'copias_bn': 'Copias B/N',
      'impresion_color': 'Impresión a Color',
      'impresion_bn': 'Impresión B/N',
      'suministro': 'Suministro'
    };
    return typeMap[tipo] || tipo;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  if (salesData.length === 0) {
    return (
      <Card className="mx-2">
        <CardContent className="text-center py-8 md:py-12">
          <p className="text-gray-500 text-base md:text-lg">No hay ventas registradas</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4 px-2">
      {salesData.map((dailySale) => (
        <Card key={dailySale.date}>
          <CardHeader className="pb-3 md:pb-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleDateExpansion(dailySale.date)}
                  className="p-0 h-auto flex-shrink-0"
                >
                  {expandedDates.has(dailySale.date) ? (
                    <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
                  ) : (
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                </Button>
                <CardTitle className="text-sm md:text-base lg:text-lg truncate">
                  {formatDisplayDate(dailySale.date)}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right flex-shrink-0">
                  <p className="text-lg md:text-xl lg:text-2xl font-bold text-green-600">
                    {formatCurrency(dailySale.totalAmount)}
                  </p>
                  <p className="text-xs md:text-sm text-gray-500">
                    {dailySale.records.length} registro{dailySale.records.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Eliminar todos los registros del día"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="mx-2 max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-base md:text-lg">
                        ¿Eliminar todos los registros?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-sm md:text-base">
                        Esta acción eliminará permanentemente todos los registros de ventas del día{' '}
                        {formatDateInMexicoTimezone(dailySale.date, 'd MMM yyyy')}.
                        Esta acción no se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col md:flex-row gap-2">
                      <AlertDialogCancel className="text-sm">Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDeleteAllForDate(dailySale.date)}
                        className="bg-red-600 hover:bg-red-700 text-sm"
                      >
                        Eliminar Todo
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>

          {expandedDates.has(dailySale.date) && (
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs md:text-sm">Tipo</TableHead>
                      <TableHead className="text-right text-xs md:text-sm">Cant.</TableHead>
                      <TableHead className="text-right text-xs md:text-sm hidden sm:table-cell">Errores</TableHead>
                      <TableHead className="text-right text-xs md:text-sm hidden md:table-cell">Precio Unit.</TableHead>
                      <TableHead className="text-right text-xs md:text-sm">Total</TableHead>
                      <TableHead className="w-8 md:w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailySale.records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="py-2 md:py-4">
                          <div>
                            <p className="font-medium text-xs md:text-sm leading-tight">
                              {formatServiceType(record.tipo, record.supply_name)}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {record.source === 'service' ? 'Servicio' : 'Suministro'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-xs md:text-sm py-2 md:py-4">{record.cantidad}</TableCell>
                        <TableCell className="text-right text-xs md:text-sm py-2 md:py-4 hidden sm:table-cell">
                          {record.source === 'service' && record.errors !== undefined ? record.errors : '-'}
                        </TableCell>
                        <TableCell className="text-right text-xs md:text-sm py-2 md:py-4 hidden md:table-cell">
                          {formatCurrency(record.precio_unitario)}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-xs md:text-sm py-2 md:py-4">
                          {formatCurrency(record.total)}
                        </TableCell>
                        <TableCell className="py-2 md:py-4">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 md:h-8 md:w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="mx-2 max-w-md">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-base md:text-lg">¿Eliminar registro?</AlertDialogTitle>
                                <AlertDialogDescription className="text-sm md:text-base">
                                  Esta acción no se puede deshacer. Se eliminará permanentemente este registro de venta.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex-col md:flex-row gap-2">
                                <AlertDialogCancel className="text-sm">Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDeleteRecord(record)}
                                  className="bg-red-600 hover:bg-red-700 text-sm"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};
