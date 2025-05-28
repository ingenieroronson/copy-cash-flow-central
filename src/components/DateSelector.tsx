
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const DateSelector = ({ selectedDate, onDateChange }: DateSelectorProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <Calendar className="w-5 h-5 text-blue-500" />
        <div className="flex-1">
          <Label htmlFor="sales-date" className="text-sm font-medium text-gray-700 mb-2 block">
            Fecha de Ventas
          </Label>
          <Input
            id="sales-date"
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
