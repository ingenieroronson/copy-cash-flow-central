
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
    errors: number;
  };
  onUpdate: (field: string, value: number) => void;
  total: number;
  difference: number;
  price: number;
}

export const ServiceCard = ({ 
  title, 
  iconColor, 
  backgroundColor, 
  service, 
  onUpdate, 
  total, 
  difference,
  price
}: ServiceCardProps) => {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0 h-full">
      <CardContent className="p-3 md:p-4 lg:p-6">
        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4 lg:mb-6">
          <div className={`p-2 md:p-3 rounded-lg ${backgroundColor} flex-shrink-0`}>
            <Printer className={`w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 ${iconColor}`} />
          </div>
          <h3 className="text-xs md:text-sm lg:text-lg font-semibold text-gray-800 leading-tight">{title}</h3>
        </div>

        <div className="space-y-3 md:space-y-4">
          <div className="grid grid-cols-2 gap-2 md:gap-3 lg:gap-4">
            <div>
              <Label htmlFor={`yesterday-${title}`} className="text-xs md:text-sm font-medium text-gray-600">
                Ayer
              </Label>
              <Input
                id={`yesterday-${title}`}
                type="number"
                value={service.yesterday || ''}
                onChange={(e) => onUpdate('yesterday', parseInt(e.target.value) || 0)}
                className="mt-1 text-sm md:text-base lg:text-lg font-medium h-8 md:h-9 lg:h-10"
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor={`today-${title}`} className="text-xs md:text-sm font-medium text-gray-600">
                Hoy
              </Label>
              <Input
                id={`today-${title}`}
                type="number"
                value={service.today || ''}
                onChange={(e) => onUpdate('today', parseInt(e.target.value) || 0)}
                className="mt-1 text-sm md:text-base lg:text-lg font-medium h-8 md:h-9 lg:h-10"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 md:gap-3 lg:gap-4">
            <div>
              <Label htmlFor={`errors-${title}`} className="text-xs md:text-sm font-medium text-red-600">
                Errores
              </Label>
              <Input
                id={`errors-${title}`}
                type="number"
                value={service.errors || ''}
                onChange={(e) => onUpdate('errors', parseInt(e.target.value) || 0)}
                className="mt-1 text-sm md:text-base lg:text-lg font-medium h-8 md:h-9 lg:h-10 border-red-200 focus:border-red-300 focus:ring-red-300"
                placeholder="0"
              />
            </div>
          </div>

          <div className="pt-2 md:pt-3 lg:pt-4 border-t border-gray-100 space-y-1 md:space-y-2">
            <div className="flex justify-between items-center text-xs md:text-sm">
              <span className="text-gray-600">Precio:</span>
              <span className="font-medium">${price.toFixed(2)} MXN</span>
            </div>
            <div className="flex justify-between items-center text-xs md:text-sm">
              <span className="text-gray-600">Diferencia:</span>
              <span className="text-sm md:text-base lg:text-lg font-bold text-green-600">+{difference}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm font-medium text-gray-700">Venta del día</span>
              <span className="text-base md:text-lg lg:text-xl font-bold text-gray-800">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
