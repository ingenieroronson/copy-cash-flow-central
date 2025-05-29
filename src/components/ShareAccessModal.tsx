
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSharedAccess } from '@/hooks/useSharedAccess';
import { LoadingSpinner } from './LoadingSpinner';
import { ModuleSelector } from './ModuleSelector';
import { ExpirationDatePicker } from './ExpirationDatePicker';

interface ShareAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  fotocopiadoraId: string;
  fotocopiadoraNombre: string;
}

type ModuleType = 'copias' | 'reportes' | 'historial' | 'configuracion';

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

          <ModuleSelector
            selectedModules={selectedModules}
            onModuleChange={handleModuleChange}
          />

          <ExpirationDatePicker
            expiresAt={expiresAt}
            onDateChange={setExpiresAt}
            calendarOpen={calendarOpen}
            onCalendarOpenChange={setCalendarOpen}
          />

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
