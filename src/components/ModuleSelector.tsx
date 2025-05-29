
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

type ModuleType = 'copias' | 'reportes' | 'historial' | 'configuracion';

interface Module {
  id: ModuleType;
  name: string;
  description: string;
}

const modules: Module[] = [
  { id: 'copias' as ModuleType, name: 'Copias', description: 'Acceso al módulo de registro de copias' },
  { id: 'reportes' as ModuleType, name: 'Reportes', description: 'Acceso a reportes y gráficos' },
  { id: 'historial' as ModuleType, name: 'Historial', description: 'Acceso al historial de ventas' },
  { id: 'configuracion' as ModuleType, name: 'Configuración', description: 'Acceso a la configuración' },
];

interface ModuleSelectorProps {
  selectedModules: ModuleType[];
  onModuleChange: (moduleId: ModuleType, checked: boolean) => void;
}

export const ModuleSelector: React.FC<ModuleSelectorProps> = ({
  selectedModules,
  onModuleChange,
}) => {
  return (
    <div>
      <Label className="text-sm font-medium">Módulos a compartir</Label>
      <div className="space-y-3 mt-2">
        {modules.map((module) => (
          <div key={module.id} className="flex items-start space-x-3">
            <Checkbox
              id={module.id}
              checked={selectedModules.includes(module.id)}
              onCheckedChange={(checked) => 
                onModuleChange(module.id, checked as boolean)
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
  );
};
