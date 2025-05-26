
import React from 'react';
import { File } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SupplyCardProps {
  title: string;
  icon: string;
  iconColor: string;
  backgroundColor: string;
  supply: {
    startStock: number;
    endStock: number;
  };
  onUpdate: (field: string, value: number) => void;
  total: number;
  sold: number;
  price: number;
}

export const SupplyCard = ({ 
  title, 
  iconColor, 
  backgroundColor, 
  supply, 
  onUpdate, 
  total, 
  sold,
  price
}: SupplyCardProps) => {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0 h-full">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className={`p-2 sm:p-3 rounded-lg ${backgroundColor}`}>
            <File className={`w-4 h-4 sm:w-6 sm:h-6 ${iconColor}`} />
          </div>
          <h3 className="text-sm sm:text-lg font-semibold text-gray-800 leading-tight">{title}</h3>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor={`start-${title}`} className="text-xs sm:text-sm font-medium text-gray-600">
                Stock inicial
              </Label>
              <Input
                id={`start-${title}`}
                type="number"
                value={supply.startStock || ''}
                onChange={(e) => onUpdate('startStock', parseInt(e.target.value) || 0)}
                className="mt-1 text-sm sm:text-lg font-medium h-8 sm:h-10"
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor={`end-${title}`} className="text-xs sm:text-sm font-medium text-gray-600">
                Stock final
              </Label>
              <Input
                id={`end-${title}`}
                type="number"
                value={supply.endStock || ''}
                onChange={(e) => onUpdate('endStock', parseInt(e.target.value) || 0)}
                className="mt-1 text-sm sm:text-lg font-medium h-8 sm:h-10"
                placeholder="0"
              />
            </div>
          </div>

          <div className="pt-3 sm:pt-4 border-t border-gray-100 space-y-2">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-gray-600">Precio:</span>
              <span className="font-medium">${price.toFixed(2)} MXN</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-gray-600">Vendidos:</span>
              <span className="text-sm sm:text-lg font-bold text-green-600">{sold}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm font-medium text-gray-700">Total</span>
              <span className="text-lg sm:text-xl font-bold text-gray-800">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
