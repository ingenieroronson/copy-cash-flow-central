
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Trash2, Calendar, User, Printer, Plus } from 'lucide-react';
import { useSharedAccess } from '@/hooks/useSharedAccess';
import { usePhotocopiers } from '@/hooks/usePhotocopiers';
import { ShareAccessModal } from './ShareAccessModal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface GroupedAccess {
  user: any;
  photocopier: any;
  modules: any[];
}

export const SharedAccessSummary = () => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedPhotocopier, setSelectedPhotocopier] = useState<any>(null);
  const [allSharedAccess, setAllSharedAccess] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getSharedAccess, revokeAccess } = useSharedAccess();
  const { photocopiers } = usePhotocopiers();

  const loadAllSharedAccess = async () => {
    setLoading(true);
    try {
      const allAccess = [];
      for (const photocopier of photocopiers) {
        const data = await getSharedAccess(photocopier.id);
        const accessWithPhotocopier = data.map((access: any) => ({
          ...access,
          photocopier: photocopier
        }));
        allAccess.push(...accessWithPhotocopier);
      }
      setAllSharedAccess(allAccess);
    } catch (error) {
      console.error('Error loading shared access:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (photocopiers.length > 0) {
      loadAllSharedAccess();
    } else {
      setLoading(false);
    }
  }, [photocopiers]);

  const handleRevokeAccess = async (sharedAccessId: string) => {
    try {
      await revokeAccess(sharedAccessId);
      await loadAllSharedAccess(); // Reload the list immediately
    } catch (error) {
      console.error('Error revoking access:', error);
    }
  };

  const handleShareAccess = (photocopier: any) => {
    setSelectedPhotocopier(photocopier);
    setIsShareModalOpen(true);
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

  // Group shared access by user and photocopier
  const groupedSharedAccess = allSharedAccess.reduce((acc, access) => {
    const key = `${access.shared_with_id}-${access.fotocopiadora_id}`;
    if (!acc[key]) {
      acc[key] = {
        user: access.shared_with,
        photocopier: access.photocopier,
        modules: [],
      };
    }
    acc[key].modules.push(access);
    return acc;
  }, {} as Record<string, GroupedAccess>);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Gestión de Acceso Compartido
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Share Access Section */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Compartir Nuevo Acceso
          </h3>
          {photocopiers.length === 0 ? (
            <p className="text-gray-500">No hay fotocopiadoras disponibles para compartir.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {photocopiers.map((photocopier) => (
                <Button
                  key={photocopier.id}
                  onClick={() => handleShareAccess(photocopier)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Compartir acceso a {photocopier.nombre}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Summary Table of Active Shared Access */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Resumen de Accesos Compartidos Activos</h3>
          {Object.keys(groupedSharedAccess).length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No has compartido acceso con ningún usuario</p>
              <p className="text-gray-400 text-sm">Usa los botones de arriba para comenzar a compartir acceso</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-700">
                      Usuario
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-700">
                      Fotocopiadora
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-700">
                      Módulos Compartidos
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-medium text-gray-700">
                      Fecha de Expiración
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-center font-medium text-gray-700">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(groupedSharedAccess).map((group, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {group.user?.nombre || group.user?.email}
                            </p>
                            <p className="text-sm text-gray-500">{group.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Printer className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-900">{group.photocopier.nombre}</p>
                            {group.photocopier.ubicacion && (
                              <p className="text-sm text-gray-500">{group.photocopier.ubicacion}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {group.modules.map((access: any) => (
                            <Badge key={access.id} variant="secondary" className="text-xs">
                              {getModuleDisplayName(access.module_type)}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        {group.modules.some((access: any) => access.expires_at) ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="w-3 h-3 text-gray-500" />
                            <span>
                              {format(
                                new Date(group.modules.find((access: any) => access.expires_at)?.expires_at),
                                'dd/MM/yyyy',
                                { locale: es }
                              )}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Sin expiración</span>
                        )}
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {group.modules.map((access: any) => (
                            <Button
                              key={access.id}
                              size="sm"
                              variant="outline"
                              onClick={() => handleRevokeAccess(access.id)}
                              className="text-red-600 hover:text-red-700 hover:border-red-300 text-xs"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Revocar {getModuleDisplayName(access.module_type)}
                            </Button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedPhotocopier && (
          <ShareAccessModal
            isOpen={isShareModalOpen}
            onClose={() => {
              setIsShareModalOpen(false);
              setSelectedPhotocopier(null);
              loadAllSharedAccess(); // Refresh the list when modal closes
            }}
            fotocopiadoraId={selectedPhotocopier.id}
            fotocopiadoraNombre={selectedPhotocopier.nombre}
          />
        )}
      </CardContent>
    </Card>
  );
};
