
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Shield, Users, Building2, DollarSign, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminAccessPanelProps {
  userEmail: string;
}

export const AdminAccessPanel = ({ userEmail }: AdminAccessPanelProps) => {
  const [permissions, setPermissions] = useState({
    canCreateEditBusinesses: true,
    canInviteUsers: true,
    canManagePricingAndSales: true,
  });
  const { toast } = useToast();

  const handlePermissionChange = (permission: keyof typeof permissions, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: value,
    }));

    toast({
      title: "Permisos actualizados",
      description: `Se ${value ? 'otorgaron' : 'revocaron'} los permisos para ${userEmail}`,
    });
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Shield className="w-5 h-5" />
          Panel de Acceso de Administrador
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-orange-100 rounded-lg p-4">
          <p className="text-orange-700 text-sm">
            Como super administrador, puedes controlar los permisos de acceso del sistema.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-orange-600" />
              <div>
                <h4 className="font-medium text-gray-900">Crear/Editar Negocios</h4>
                <p className="text-sm text-gray-600">Permite crear y modificar información de negocios</p>
              </div>
            </div>
            <Switch
              checked={permissions.canCreateEditBusinesses}
              onCheckedChange={(value) => handlePermissionChange('canCreateEditBusinesses', value)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-orange-600" />
              <div>
                <h4 className="font-medium text-gray-900">Invitar Usuarios</h4>
                <p className="text-sm text-gray-600">Permite invitar y gestionar usuarios del sistema</p>
              </div>
            </div>
            <Switch
              checked={permissions.canInviteUsers}
              onCheckedChange={(value) => handlePermissionChange('canInviteUsers', value)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <DollarSign className="w-5 h-5 text-orange-600" />
                <BarChart3 className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Gestionar Precios y Ventas</h4>
                <p className="text-sm text-gray-600">Permite administrar precios y registros de ventas</p>
              </div>
            </div>
            <Switch
              checked={permissions.canManagePricingAndSales}
              onCheckedChange={(value) => handlePermissionChange('canManagePricingAndSales', value)}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-orange-200">
          <p className="text-xs text-orange-600">
            Los cambios en los permisos se aplicarán inmediatamente para todos los usuarios.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
