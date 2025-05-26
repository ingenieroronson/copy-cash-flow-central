
import React from 'react';
import { DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface SummaryCardProps {
  total: number;
}

export const SummaryCard = ({ total }: SummaryCardProps) => {
  return (
    <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-2xl border-0">
      <CardContent className="p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-full">
              <DollarSign className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">Resumen del día</h2>
              <p className="text-orange-100">Total de ventas</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">
              ${total.toFixed(2)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
