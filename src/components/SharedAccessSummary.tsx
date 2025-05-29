
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Trash2, Users, Printer } from 'lucide-react';
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

interface SharedAccessSummaryProps {
  fotocopiadoraId: string;
}

export const SharedAccessSummary = ({ fotocopiadoraId }: SharedAccessSummaryProps) => {
  const [sharedAccess, setSharedAccess] = useState<SharedAccessRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { getSharedAccess, revokeAccess } = useSharedAccess();

  const loadSharedAccess = async () => {
    setLoading(true);
    try {
      const data = await getSharedAccess(fotocopiadoraId);
      console.log('Loaded shared access data:', data);
      setSharedAccess(data as SharedAccessRecord[]);
    } catch (error) {
      console.error('Error loading shared access:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fotocopiadoraId) {
      loadSharedAccess();
    }
  }, [fotocopiadoraId]);

  const handleRevokeAccess = async (sharedAccessId: string) => {
    try {
      await revokeAccess(sharedAccessId);
      // Reload data after successful revocation
      loadSharedAccess();
    } catch (error) {
      console.error('Error revoking access:', error);
    }
  };

  const getModuleDisplayName = (moduleType: string) => {
    const moduleNames: Record<string, string> = {
      copias: 'Copias',
      reportes: 'Reportes',
      historial: 'Historial',
      configuracion: 'Configuración',
    };
    return moduleNames[moduleType] || moduleType;
  };

  // Group by user and photocopier
  const groupedSharedAccess = sharedAccess.reduce((acc, access) => {
    const key = `${access.shared_with_id}-${access.fotocopiadora_id}`;
    if (!acc[key]) {
      acc[key] = {
        user: access.shared_with,
        photocopier: {
          id: access.fotocopiadora_id,
          nombre: 'Fotocopiadora',
          ubicacion: null,
        },
        modules: [],
      };
    }
    acc[key].modules.push(access);
    return acc;
  }, {} as Record<string, GroupedSharedAccess>);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gestión de Acceso Compartido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando accesos compartidos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (Object.keys(groupedSharedAccess).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gestión de Acceso Compartido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No has compartido acceso con ningún usuario</p>
            <p className="text-gray-400 text-sm">Los accesos compartidos aparecerán aquí</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Gestión de Acceso Compartido
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Resumen de Accesos Activos</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Usuario
                  </th>
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
                            onClick={() => handleRevokeAccess(access.id)}
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
        </div>
      </CardContent>
    </Card>
  );
};
