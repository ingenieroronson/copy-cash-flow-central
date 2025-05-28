
import React from 'react';
import { DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface SummaryCardProps {
  total: number;
}

export const SummaryCard = ({ total }: SummaryCardProps) => {
  return (
    <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-2xl border-0 mx-2">
      <CardContent className="p-4 md:p-6 lg:p-8">
        <div className="flex flex-col items-center text-center gap-4 md:flex-row md:justify-between md:text-left">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-3 md:p-4 bg-white/20 rounded-full flex-shrink-0">
              <DollarSign className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-1">Resumen del día</h2>
              <p className="text-orange-100 text-sm md:text-base">Total de ventas</p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <div className="text-2xl md:text-3xl lg:text-5xl font-bold">
              ${total.toFixed(2)}
            </div>
            <div className="text-xs md:text-sm text-orange-100 mt-1">
              MXN
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
