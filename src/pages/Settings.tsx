
import React from 'react';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/AuthForm';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { NoBusinessAccess } from '@/components/NoBusinessAccess';
import { NoAccess } from '@/components/NoAccess';
import { PhotocopierManagement } from '@/components/PhotocopierManagement';
import { RoleGuard } from '@/components/RoleGuard';
import { AdminAccessPanel } from '@/components/AdminAccessPanel';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon, Building2, Users, Crown } from 'lucide-react';

const Settings = () => {
  const { user, loading: authLoading } = useAuth();
  const { currentBusinessId, businesses, currentUserRole, loading: businessLoading } = useBusinesses();
  const { isSuperAdmin, loading: superAdminLoading } = useSuperAdmin();

  if (authLoading || businessLoading || superAdminLoading) return <LoadingSpinner />;
  if (!user) return <AuthForm />;

  // If user is not super admin, show no access page
  if (!isSuperAdmin) {
    return <NoAccess />;
  }

  // If user has no businesses, show no access component
  if (businesses.length === 0) {
    return <NoBusinessAccess />;
  }

  // If no current business selected but businesses exist, show loading
  if (!currentBusinessId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-8">
          <div className="text-center py-8">
            <p className="text-gray-500">Cargando configuración...</p>
          </div>
        </main>
      </div>
    );
  }

  const currentBusiness = businesses.find(b => b.id === currentBusinessId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Configuración
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Gestiona la configuración de tu negocio y fotocopiadoras
          </p>
        </div>

        <div className="space-y-6">
          {/* Admin Access Panel - Only visible to super admin */}
          {isSuperAdmin && (
            <AdminAccessPanel userEmail={user.email || ''} />
          )}

          {/* Super Admin Status */}
          {isSuperAdmin && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <Crown className="w-5 h-5" />
                  Super Administrador
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-yellow-700">
                  Tienes acceso completo a todos los negocios y funcionalidades del sistema como super administrador.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Información del Negocio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nombre</label>
                  <p className="text-gray-900">{currentBusiness?.nombre}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Tu Rol</label>
                  <div className="flex items-center gap-1">
                    <p className="text-gray-900 capitalize">
                      {isSuperAdmin ? 'Super Admin' : currentUserRole}
                    </p>
                    {isSuperAdmin && <Crown className="w-4 h-4 text-yellow-500" />}
                  </div>
                </div>
                {currentBusiness?.descripcion && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Descripción</label>
                    <p className="text-gray-900">{currentBusiness.descripcion}</p>
                  </div>
                )}
                {currentBusiness?.direccion && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Dirección</label>
                    <p className="text-gray-900">{currentBusiness.direccion}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Photocopier Management */}
          <RoleGuard requiredRole="operador">
            <PhotocopierManagement />
          </RoleGuard>

          {/* Admin-only sections */}
          <RoleGuard 
            requiredRole="admin"
            fallback={
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">
                    Funciones de administrador no disponibles
                  </p>
                  <p className="text-sm text-gray-400">
                    Solo los administradores pueden gestionar usuarios y configuración avanzada.
                  </p>
                </CardContent>
              </Card>
            }
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Gestión de Usuarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Como administrador, puedes invitar usuarios y gestionar sus roles.
                </p>
                <p className="text-sm text-gray-500">
                  Esta funcionalidad estará disponible próximamente.
                </p>
              </CardContent>
            </Card>
          </RoleGuard>
        </div>
      </main>
    </div>
  );
};

export default Settings;
