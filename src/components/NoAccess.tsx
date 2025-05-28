
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldX, Lock } from 'lucide-react';

export const NoAccess = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-200 bg-red-50">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <ShieldX className="w-16 h-16 text-red-400" />
              <Lock className="w-8 h-8 text-red-600 absolute -bottom-2 -right-2" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-red-900 mb-4">
            Acceso Denegado
          </h1>
          
          <p className="text-red-700 mb-6">
            No tienes permisos para acceder al sistema en este momento. 
            Contacta al super administrador para que te otorgue los permisos necesarios.
          </p>
          
          <div className="bg-red-100 rounded-lg p-4">
            <p className="text-sm text-red-600">
              Solo los usuarios con permisos especiales pueden acceder a esta aplicación.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
