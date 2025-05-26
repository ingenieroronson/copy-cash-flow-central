
import React from 'react';
import { Printer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ServiceCardProps {
  title: string;
  icon: string;
  iconColor: string;
  backgroundColor: string;
  service: {
    yesterday: number;
    today: number;
    price: number;
  };
  onUpdate: (field: string, value: number) => void;
  total: number;
  difference: number;
}

export const ServiceCard = ({ 
  title, 
  iconColor, 
  backgroundColor, 
  service, 
  onUpdate, 
  total, 
  difference 
}: ServiceCardProps) => {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-lg ${backgroundColor}`}>
            <Printer className={`w-6 h-6 ${iconColor}`} />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`yesterday-${title}`} className="text-sm font-medium text-gray-600">
                Ayer
              </Label>
              <Input
                id={`yesterday-${title}`}
                type="number"
                value={service.yesterday || ''}
                onChange={(e) => onUpdate('yesterday', parseInt(e.target.value) || 0)}
                className="mt-1 text-lg font-medium"
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor={`today-${title}`} className="text-sm font-medium text-gray-600">
                Hoy
              </Label>
              <Input
                id={`today-${title}`}
                type="number"
                value={service.today || ''}
                onChange={(e) => onUpdate('today', parseInt(e.target.value) || 0)}
                className="mt-1 text-lg font-medium"
                placeholder="0"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Diferencia:</span>
              <span className="text-lg font-bold text-green-600">+{difference}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Venta del día</span>
              <span className="text-xl font-bold text-gray-800">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
