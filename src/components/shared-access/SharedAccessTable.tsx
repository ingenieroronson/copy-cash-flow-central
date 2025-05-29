
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Trash2, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SharedAccessRecord {
  id: string;
  owner_id: string;
  shared_with_id: string;
  fotocopiadora_id: string;
  module_type: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  shared_with: {
    id: string;
    email: string;
    nombre: string | null;
  };
}

interface GroupedSharedAccess {
  user: {
    id: string;
    email: string;
    nombre: string | null;
  };
  photocopier: {
    id: string;
    nombre: string | null;
    ubicacion: string | null;
  };
  modules: SharedAccessRecord[];
}

interface SharedAccessTableProps {
  groupedSharedAccess: Record<string, GroupedSharedAccess>;
  fotocopiadoraId?: string;
  onRevokeAccess: (sharedAccessId: string) => void;
}

export const SharedAccessTable = ({ 
  groupedSharedAccess, 
  fotocopiadoraId, 
  onRevokeAccess 
}: SharedAccessTableProps) => {
  const getModuleDisplayName = (moduleType: string) => {
    const moduleNames: Record<string, string> = {
      copias: 'Copias',
      reportes: 'Reportes',
      historial: 'Historial',
      configuracion: 'Configuración',
    };
    return moduleNames[moduleType] || moduleType;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-200 rounded-lg">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
              Usuario
            </th>
            {!fotocopiadoraId && (
              <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                Fotocopiadora
              </th>
            )}
            <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
              Módulos Compartidos
            </th>
            <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
              Expiración
            </th>
            <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.values(groupedSharedAccess).map((group, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="border border-gray-200 px-4 py-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium text-sm">{group.user.nombre || group.user.email}</p>
                    <p className="text-xs text-gray-500">{group.user.email}</p>
                  </div>
                </div>
              </td>
              {!fotocopiadoraId && (
                <td className="border border-gray-200 px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Printer className="w-4 h-4 text-gray-500" />
                    <p className="font-medium text-sm">{group.photocopier.nombre}</p>
                  </div>
                </td>
              )}
              <td className="border border-gray-200 px-4 py-2">
                <div className="flex flex-wrap gap-1">
                  {group.modules.map((access) => (
                    <Badge key={access.id} variant="secondary" className="text-xs">
                      {getModuleDisplayName(access.module_type)}
                    </Badge>
                  ))}
                </div>
              </td>
              <td className="border border-gray-200 px-4 py-2">
                {group.modules.some(m => m.expires_at) ? (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(group.modules.find(m => m.expires_at)!.expires_at!), 'dd/MM/yyyy', { locale: es })}
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">Sin expiración</span>
                )}
              </td>
              <td className="border border-gray-200 px-4 py-2">
                <div className="flex gap-1">
                  {group.modules.map((access) => (
                    <Button
                      key={access.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => onRevokeAccess(access.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
