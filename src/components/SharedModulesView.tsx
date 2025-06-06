
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Inbox, RefreshCw } from 'lucide-react';
import { useSharedAccess } from '@/hooks/useSharedAccess';
import { SharedModulesTable } from './shared-modules/SharedModulesTable';
import { EmptySharedModulesState } from './shared-modules/EmptySharedModulesState';

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
  const [refreshing, setRefreshing] = useState(false);
  const { getSharedWithMe } = useSharedAccess();

  const loadSharedWithMe = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const data = await getSharedWithMe();
      console.log('Shared with me data loaded:', data);
      setSharedWithMe(data as SharedAccessRecord[]);
    } catch (error) {
      console.error('Error loading shared with me:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSharedWithMe();
    
    // Set up interval for real-time updates every 30 seconds
    const interval = setInterval(() => {
      loadSharedWithMe(true);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

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
          <EmptySharedModulesState />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Inbox className="w-5 h-5" />
            Módulos Compartidos Conmigo
          </div>
          <button
            onClick={() => loadSharedWithMe(true)}
            disabled={refreshing}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            title="Actualizar"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Accesos Recibidos</h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-blue-700 font-medium">Acceso Compartido</span>
            </div>
          </div>
          <SharedModulesTable groupedByPhotocopier={groupedByPhotocopier} />
        </div>
      </CardContent>
    </Card>
  );
};
