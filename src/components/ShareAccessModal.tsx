
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useSharedAccess } from '@/hooks/useSharedAccess';
import { LoadingSpinner } from './LoadingSpinner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ShareAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  fotocopiadoraId: string;
  fotocopiadoraNombre: string;
}

type ModuleType = 'copias' | 'reportes' | 'historial' | 'configuracion';

const modules = [
  { id: 'copias' as ModuleType, name: 'Copias', description: 'Acceso al módulo de registro de copias' },
  { id: 'reportes' as ModuleType, name: 'Reportes', description: 'Acceso a reportes y gráficos' },
  { id: 'historial' as ModuleType, name: 'Historial', description: 'Acceso al historial de ventas' },
  { id: 'configuracion' as ModuleType, name: 'Configuración', description: 'Acceso a la configuración' },
];

export const ShareAccessModal: React.FC<ShareAccessModalProps> = ({
  isOpen,
  onClose,
  fotocopiadoraId,
  fotocopiadoraNombre,
}) => {
  const [email, setEmail] = useState('');
  const [selectedModules, setSelectedModules] = useState<ModuleType[]>([]);
  const [expiresAt, setExpiresAt] = useState<Date | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  const { shareAccess, loading } = useSharedAccess();

  const handleModuleChange = (moduleId: ModuleType, checked: boolean) => {
    if (checked) {
      setSelectedModules(prev => [...prev, moduleId]);
    } else {
      setSelectedModules(prev => prev.filter(id => id !== moduleId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      return;
    }

    if (selectedModules.length === 0) {
      return;
    }

    try {
      await shareAccess(
        email,
        fotocopiadoraId,
        selectedModules,
        expiresAt?.toISOString()
      );
      
      // Reset form
      setEmail('');
      setSelectedModules([]);
      setExpiresAt(undefined);
      onClose();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const resetForm = () => {
    setEmail('');
    setSelectedModules([]);
    setExpiresAt(undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartir acceso - {fotocopiadoraNombre}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email del usuario</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              required
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Módulos a compartir</Label>
            <div className="space-y-3 mt-2">
              {modules.map((module) => (
                <div key={module.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={module.id}
                    checked={selectedModules.includes(module.id)}
                    onCheckedChange={(checked) => 
                      handleModuleChange(module.id, checked as boolean)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor={module.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {module.name}
                    </Label>
                    <p className="text-xs text-gray-500">
                      {module.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Fecha de expiración (opcional)</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
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
                    setExpiresAt(date);
                    setCalendarOpen(false);
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
                onClick={() => setExpiresAt(undefined)}
                className="mt-1 text-xs"
              >
                Remover fecha de expiración
              </Button>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !email.trim() || selectedModules.length === 0}
              className="flex-1"
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">Compartiendo...</span>
                </>
              ) : (
                'Compartir acceso'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
