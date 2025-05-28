
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, UserX } from 'lucide-react';

export const NoBusinessAccess = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Building2 className="w-16 h-16 text-gray-400" />
              <UserX className="w-8 h-8 text-red-500 absolute -bottom-2 -right-2" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Sin Acceso a Negocios
          </h1>
          
          <p className="text-gray-600 mb-6">
            No tienes acceso a ningún negocio en este momento. 
            Contacta al administrador del sistema para que te agregue a un negocio.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">
              Solo los usuarios invitados por el propietario pueden acceder a los negocios.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
