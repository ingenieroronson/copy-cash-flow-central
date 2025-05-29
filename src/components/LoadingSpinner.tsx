
import React from 'react';

export const LoadingSpinner = () => {
  console.log('LoadingSpinner: Renderizando spinner de carga principal');
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando...</p>
        <p className="text-sm text-gray-400 mt-2">Verificando autenticación...</p>
      </div>
    </div>
  );
};
