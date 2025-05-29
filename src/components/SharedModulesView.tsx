
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Printer, Inbox, Eye } from 'lucide-react';
import { useSharedAccess } from '@/hooks/useSharedAccess';
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

export const SharedModulesView = () => {
  const [sharedWithMe, setSharedWithMe] = useState<SharedAccessRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { getSharedWithMe } = useSharedAccess();

  const loadSharedWithMe = async () => {
    setLoading(true);
    try {
      const data = await getSharedWithMe();
      console.log('Shared with me data:', data);
      setSharedWithMe(data as SharedAccessRecord[]);
    } catch (error) {
      console.error('Error loading shared with me:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSharedWithMe();
    
    // Set up interval to refresh every 30 seconds for real-time updates
    const interval = setInterval(loadSharedWithMe, 30000);
    
    return () => clearInterval(interval);
  }, []);

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

  // Group by photocopier
  const groupedByPhotocopier = sharedWithMe.reduce((acc, access) => {
    const fotocopiadoraId = access.fotocopiadora_id;
    if (!acc[fotocopiadoraId]) {
      acc[fotocopiadoraId] = {
        fotocopiadora: access.fotocopiadora,
        owner: access.owner,
        modules: [],
      };
    }
    acc[fotocopiadoraId].modules.push(access);
    return acc;
  }, {} as Record<string, GroupedSharedModule>);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="w-5 h-5" />
            Módulos Compartidos Conmigo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando módulos compartidos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (Object.keys(groupedByPhotocopier).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="w-5 h-5" />
            Módulos Compartidos Conmigo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Inbox className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No tienes acceso a módulos compartidos</p>
            <p className="text-gray-400 text-sm">Cuando alguien comparta acceso contigo, aparecerán aquí</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Inbox className="w-5 h-5" />
          Módulos Compartidos Conmigo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Accesos Recibidos</h3>
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
                  <tr key={group.fotocopiadora.id} className="hover:bg-blue-50">
                    <td className="border border-gray-200 px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Printer className="w-4 h-4 text-blue-600" />
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
        </div>
      </CardContent>
    </Card>
  );
};
