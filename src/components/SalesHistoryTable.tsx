
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { DailySales, SalesRecord } from '@/pages/SalesHistory';

interface SalesHistoryTableProps {
  salesData: DailySales[];
  onDeleteRecord: (record: SalesRecord) => void;
}

export const SalesHistoryTable = ({ salesData, onDeleteRecord }: SalesHistoryTableProps) => {
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
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-500 text-lg">No hay ventas registradas</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {salesData.map((dailySale) => (
        <Card key={dailySale.date}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleDateExpansion(dailySale.date)}
                  className="p-0 h-auto"
                >
                  {expandedDates.has(dailySale.date) ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </Button>
                <CardTitle className="text-lg">
                  {format(new Date(dailySale.date), 'EEEE, d MMMM yyyy', { locale: es })}
                </CardTitle>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(dailySale.totalAmount)}
                </p>
                <p className="text-sm text-gray-500">
                  {dailySale.records.length} registro{dailySale.records.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </CardHeader>

          {expandedDates.has(dailySale.date) && (
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Precio Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailySale.records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {formatServiceType(record.tipo, record.supply_name)}
                          </p>
                          <p className="text-sm text-gray-500 capitalize">
                            {record.source === 'service' ? 'Servicio' : 'Suministro'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{record.cantidad}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(record.precio_unitario)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(record.total)}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente este registro de venta.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDeleteRecord(record)}
                                className="bg-red-600 hover:bg-red-700"
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
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};
