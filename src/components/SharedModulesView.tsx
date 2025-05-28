
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Printer } from 'lucide-react';
import { useSharedAccess } from '@/hooks/useSharedAccess';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const SharedModulesView = () => {
  const [sharedWithMe, setSharedWithMe] = useState<any[]>([]);
  const { getSharedWithMe } = useSharedAccess();

  useEffect(() => {
    const loadSharedWithMe = async () => {
      const data = await getSharedWithMe();
      setSharedWithMe(data);
    };

    loadSharedWithMe();
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
  }, {} as Record<string, any>);

  if (Object.keys(groupedByPhotocopier).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Módulos Compartidos Conmigo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            No tienes acceso a módulos compartidos por otros usuarios.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Printer className="w-5 h-5" />
          Módulos Compartidos Conmigo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.values(groupedByPhotocopier).map((group: any) => (
            <div key={group.fotocopiadora.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <Printer className="w-4 h-4" />
                    {group.fotocopiadora.nombre}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {group.fotocopiadora.ubicacion && `${group.fotocopiadora.ubicacion} • `}
                    Compartido por: {group.owner.nombre || group.owner.email}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {group.modules.map((access: any) => (
                  <div key={access.id} className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getModuleDisplayName(access.module_type)}
                    </Badge>
                    {access.expires_at && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        Expira: {format(new Date(access.expires_at), 'dd/MM/yyyy', { locale: es })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
