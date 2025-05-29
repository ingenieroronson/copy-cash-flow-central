
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ExpirationDatePickerProps {
  expiresAt: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  calendarOpen: boolean;
  onCalendarOpenChange: (open: boolean) => void;
}

export const ExpirationDatePicker: React.FC<ExpirationDatePickerProps> = ({
  expiresAt,
  onDateChange,
  calendarOpen,
  onCalendarOpenChange,
}) => {
  return (
    <div>
      <Label>Fecha de expiración (opcional)</Label>
      <Popover open={calendarOpen} onOpenChange={onCalendarOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
            type="button"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {expiresAt ? (
              format(expiresAt, "PPP", { locale: es })
            ) : (
              <span className="text-gray-500">Sin fecha de expiración</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={expiresAt}
            onSelect={(date) => {
              onDateChange(date);
              onCalendarOpenChange(false);
            }}
            disabled={(date) => date < new Date()}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {expiresAt && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDateChange(undefined)}
          className="mt-1 text-xs"
        >
          Remover fecha de expiración
        </Button>
      )}
    </div>
  );
};
