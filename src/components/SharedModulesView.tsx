
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Printer, Inbox } from 'lucide-react';
import { useSharedAccess } from '@/hooks/useSharedAccess';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface GroupedSharedModule {
  fotocopiadora: any;
  owner: any;
  modules: any[];
}

export const SharedModulesView = () => {
  const [sharedWithMe, setSharedWithMe] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getSharedWithMe } = useSharedAccess();

  const loadSharedWithMe = async () => {
    setLoading(true);
    try {
      const data = await getSharedWithMe();
      console.log('Shared with me data:', data);
      setSharedWithMe(data);
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
          {Object.values(groupedByPhotocopier).map((group) => (
            <div key={group.fotocopiadora.id} className="border rounded-lg p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium flex items-center gap-2 text-blue-900">
                    <Printer className="w-4 h-4" />
                    {group.fotocopiadora.nombre}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-blue-700 mt-1">
                    <User className="w-3 h-3" />
                    <span>
                      Compartido por: {group.owner.nombre || group.owner.email}
                    </span>
                    {group.fotocopiadora.ubicacion && (
                      <>
                        <span>•</span>
                        <span>{group.fotocopiadora.ubicacion}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-800">Módulos disponibles:</p>
                <div className="flex flex-wrap gap-2">
                  {group.modules.map((access: any) => (
                    <div key={access.id} className="flex items-center gap-2">
                      <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
                        {getModuleDisplayName(access.module_type)}
                      </Badge>
                      {access.expires_at && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          <Calendar className="w-3 h-3" />
                          Expira: {format(new Date(access.expires_at), 'dd/MM/yyyy', { locale: es })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
