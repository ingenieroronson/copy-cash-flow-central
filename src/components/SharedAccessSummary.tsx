
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Trash2, Calendar, User, Printer } from 'lucide-react';
import { useSharedAccess } from '@/hooks/useSharedAccess';
import { usePhotocopiers } from '@/hooks/usePhotocopiers';
import { ShareAccessModal } from './ShareAccessModal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const SharedAccessSummary = () => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedPhotocopier, setSelectedPhotocopier] = useState<any>(null);
  const [allSharedAccess, setAllSharedAccess] = useState<any[]>([]);
  const { getSharedAccess, revokeAccess } = useSharedAccess();
  const { photocopiers } = usePhotocopiers();

  const loadAllSharedAccess = async () => {
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
  };

  useEffect(() => {
    if (photocopiers.length > 0) {
      loadAllSharedAccess();
    }
  }, [photocopiers]);

  const handleRevokeAccess = async (sharedAccessId: string) => {
    try {
      await revokeAccess(sharedAccessId);
      loadAllSharedAccess(); // Reload the list
    } catch (error) {
      // Error is handled in the hook
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
  }, {} as Record<string, any>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Gestión de Acceso Compartido
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {/* Share Access Section */}
          <div className="border-b pb-4 mb-4">
            <h3 className="text-lg font-semibold mb-3">Compartir Acceso</h3>
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
                    {photocopier.nombre}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Current Shared Access Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Accesos Compartidos Actuales</h3>
            {Object.keys(groupedSharedAccess).length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No has compartido acceso con ningún usuario aún.
              </p>
            ) : (
              <div className="space-y-4">
                {Object.values(groupedSharedAccess).map((group: any, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4" />
                          <h4 className="font-medium">{group.user.nombre || group.user.email}</h4>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">{group.user.email}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Printer className="w-3 h-3" />
                          <span>{group.photocopier.nombre}</span>
                          {group.photocopier.ubicacion && (
                            <span>• {group.photocopier.ubicacion}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {group.modules.map((access: any) => (
                        <div key={access.id} className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {getModuleDisplayName(access.module_type)}
                          </Badge>
                          {access.expires_at && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(access.expires_at), 'dd/MM/yyyy', { locale: es })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      {group.modules.map((access: any) => (
                        <Button
                          key={access.id}
                          size="sm"
                          variant="outline"
                          onClick={() => handleRevokeAccess(access.id)}
                          className="text-red-500 hover:text-red-700 hover:border-red-300"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Revocar {getModuleDisplayName(access.module_type)}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
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
    </div>
  );
};
