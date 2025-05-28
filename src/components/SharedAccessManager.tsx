
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Trash2, Calendar } from 'lucide-react';
import { useSharedAccess } from '@/hooks/useSharedAccess';
import { ShareAccessModal } from './ShareAccessModal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SharedAccessManagerProps {
  fotocopiadoraId: string;
  fotocopiadoraNombre: string;
}

export const SharedAccessManager: React.FC<SharedAccessManagerProps> = ({
  fotocopiadoraId,
  fotocopiadoraNombre,
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharedAccess, setSharedAccess] = useState<any[]>([]);
  const { getSharedAccess, revokeAccess } = useSharedAccess();

  const loadSharedAccess = async () => {
    const data = await getSharedAccess(fotocopiadoraId);
    setSharedAccess(data);
  };

  useEffect(() => {
    loadSharedAccess();
  }, [fotocopiadoraId]);

  const handleRevokeAccess = async (sharedAccessId: string) => {
    try {
      await revokeAccess(sharedAccessId);
      loadSharedAccess(); // Reload the list
    } catch (error) {
      // Error is handled in the hook
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

  // Group shared access by user
  const groupedSharedAccess = sharedAccess.reduce((acc, access) => {
    const userId = access.shared_with_id;
    if (!acc[userId]) {
      acc[userId] = {
        user: access.shared_with,
        modules: [],
      };
    }
    acc[userId].modules.push(access);
    return acc;
  }, {} as Record<string, any>);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Acceso Compartido</CardTitle>
          <Button
            onClick={() => setIsShareModalOpen(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Compartir acceso
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {Object.keys(groupedSharedAccess).length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No has compartido acceso con ningún usuario aún.
          </p>
        ) : (
          <div className="space-y-4">
            {Object.values(groupedSharedAccess).map((group: any) => (
              <div key={group.user.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{group.user.nombre || group.user.email}</h4>
                    <p className="text-sm text-gray-500">{group.user.email}</p>
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
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRevokeAccess(access.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <ShareAccessModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          fotocopiadoraId={fotocopiadoraId}
          fotocopiadoraNombre={fotocopiadoraNombre}
        />
      </CardContent>
    </Card>
  );
};
