
import React from 'react';
import { Header } from '@/components/Header';

export const AccessRestrictedView = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">Acceso Restringido</h2>
            <p className="text-yellow-700">
              No tienes acceso al módulo de Historial para esta fotocopiadora.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
