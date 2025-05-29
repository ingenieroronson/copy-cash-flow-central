
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Printer, Eye } from 'lucide-react';
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
  owner: {
    id: string;
    email: string;
    nombre: string | null;
  };
  fotocopiadora: {
    id: string;
    nombre: string | null;
    ubicacion: string | null;
  };
}

interface GroupedSharedModule {
  fotocopiadora: {
    id: string;
    nombre: string | null;
    ubicacion: string | null;
  };
  owner: {
    id: string;
    email: string;
    nombre: string | null;
  };
  modules: SharedAccessRecord[];
}

interface SharedModulesTableProps {
  groupedByPhotocopier: Record<string, GroupedSharedModule>;
}

export const SharedModulesTable = ({ groupedByPhotocopier }: SharedModulesTableProps) => {
  const getModuleDisplayName = (moduleType: string) => {
    const moduleNames: Record<string, string> = {
      copias: 'Copias',
      reportes: 'Reportes',
      historial: 'Historial',
      configuracion: 'Configuración',
    };
    return moduleNames[moduleType] || moduleType;
  };

  const getModuleIcon = (moduleType: string) => {
    const icons: Record<string, React.ReactNode> = {
      copias: <Eye className="w-3 h-3" />,
      reportes: <Eye className="w-3 h-3" />,
      historial: <Eye className="w-3 h-3" />,
      configuracion: <Eye className="w-3 h-3" />,
    };
    return icons[moduleType] || <Eye className="w-3 h-3" />;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-200 rounded-lg">
        <thead>
          <tr className="bg-blue-50">
            <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-blue-900">
              Fotocopiadora
            </th>
            <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-blue-900">
              Propietario
            </th>
            <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-blue-900">
              Módulos Disponibles
            </th>
            <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-blue-900">
              Expiración
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.values(groupedByPhotocopier).map((group) => (
            <tr key={group.fotocopiadora.id} className="hover:bg-blue-50 transition-colors">
              <td className="border border-gray-200 px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Printer className="w-4 h-4 text-blue-600" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-blue-900">{group.fotocopiadora.nombre}</p>
                    {group.fotocopiadora.ubicacion && (
                      <p className="text-xs text-blue-700">{group.fotocopiadora.ubicacion}</p>
                    )}
                  </div>
                </div>
              </td>
              <td className="border border-gray-200 px-4 py-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm text-blue-900">
                      {group.owner.nombre || group.owner.email}
                    </p>
                    <p className="text-xs text-blue-700">{group.owner.email}</p>
                  </div>
                </div>
              </td>
              <td className="border border-gray-200 px-4 py-2">
                <div className="flex flex-wrap gap-1">
                  {group.modules.map((access: SharedAccessRecord) => (
                    <Badge key={access.id} variant="default" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                      <span className="flex items-center gap-1">
                        {getModuleIcon(access.module_type)}
                        {getModuleDisplayName(access.module_type)}
                      </span>
                    </Badge>
                  ))}
                </div>
              </td>
              <td className="border border-gray-200 px-4 py-2">
                {group.modules.some(m => m.expires_at) ? (
                  <div className="flex items-center gap-1 text-sm text-blue-700">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(group.modules.find(m => m.expires_at)!.expires_at!), 'dd/MM/yyyy', { locale: es })}
                  </div>
                ) : (
                  <span className="text-sm text-blue-600">Sin expiración</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
