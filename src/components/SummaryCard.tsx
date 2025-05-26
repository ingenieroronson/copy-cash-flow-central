
import React from 'react';
import { DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface SummaryCardProps {
  total: number;
}

export const SummaryCard = ({ total }: SummaryCardProps) => {
  return (
    <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-2xl border-0">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 text-center sm:text-left">
            <div className="p-3 sm:p-4 bg-white/20 rounded-full">
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-1">Resumen del día</h2>
              <p className="text-orange-100 text-sm sm:text-base">Total de ventas</p>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <div className="text-3xl sm:text-5xl font-bold">
              ${total.toFixed(2)}
            </div>
            <div className="text-xs sm:text-sm text-orange-100 mt-1">
              MXN
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
