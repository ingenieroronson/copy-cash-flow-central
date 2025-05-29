
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useSharedAccess } from '@/hooks/useSharedAccess';
import { usePhotocopiers } from '@/hooks/usePhotocopiers';
import { SharedAccessTable } from './shared-access/SharedAccessTable';
import { EmptySharedAccessState } from './shared-access/EmptySharedAccessState';

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
  fotocopiadoraId?: string;
}

export const SharedAccessSummary = ({ fotocopiadoraId }: SharedAccessSummaryProps) => {
  const [sharedAccess, setSharedAccess] = useState<SharedAccessRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { getSharedAccess, revokeAccess } = useSharedAccess();
  const { photocopiers } = usePhotocopiers();

  const loadSharedAccess = async () => {
    setLoading(true);
    try {
      if (fotocopiadoraId) {
        const data = await getSharedAccess(fotocopiadoraId);
        console.log('Loaded shared access data for photocopier:', fotocopiadoraId, data);
        setSharedAccess(data as SharedAccessRecord[]);
      } else {
        const allSharedAccess: SharedAccessRecord[] = [];
        for (const photocopier of photocopiers) {
          const data = await getSharedAccess(photocopier.id);
          allSharedAccess.push(...(data as SharedAccessRecord[]));
        }
        console.log('Loaded shared access data for all photocopiers:', allSharedAccess);
        setSharedAccess(allSharedAccess);
      }
    } catch (error) {
      console.error('Error loading shared access:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fotocopiadoraId || photocopiers.length > 0) {
      loadSharedAccess();
    }
  }, [fotocopiadoraId, photocopiers]);

  const handleRevokeAccess = async (sharedAccessId: string) => {
    try {
      await revokeAccess(sharedAccessId);
      loadSharedAccess();
    } catch (error) {
      console.error('Error revoking access:', error);
    }
  };

  const getPhotocopierName = (fotocopiadoraId: string) => {
    const photocopier = photocopiers.find(p => p.id === fotocopiadoraId);
    return photocopier?.nombre || 'Fotocopiadora';
  };

  // Group by user and photocopier
  const groupedSharedAccess = sharedAccess.reduce((acc, access) => {
    const key = `${access.shared_with_id}-${access.fotocopiadora_id}`;
    if (!acc[key]) {
      acc[key] = {
        user: access.shared_with,
        photocopier: {
          id: access.fotocopiadora_id,
          nombre: getPhotocopierName(access.fotocopiadora_id),
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
          <EmptySharedAccessState />
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
          <SharedAccessTable 
            groupedSharedAccess={groupedSharedAccess}
            fotocopiadoraId={fotocopiadoraId}
            onRevokeAccess={handleRevokeAccess}
          />
        </div>
      </CardContent>
    </Card>
  );
};
