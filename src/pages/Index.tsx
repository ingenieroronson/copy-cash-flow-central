
import React from 'react';
import { Header } from '@/components/Header';
import { AuthForm } from '@/components/AuthForm';
import { AppWrapper } from '@/components/AppWrapper';
import { RoleGuard } from '@/components/RoleGuard';
import { DailySalesCalculator } from '@/components/DailySalesCalculator';
import { useSalesState } from '@/hooks/useSalesState';
import { useBusinesses } from '@/hooks/useBusinesses';

const Index = () => {
  const salesState = useSalesState();
  const { currentBusinessId } = useBusinesses();

  if (!currentBusinessId) {
    return (
      <AppWrapper {...salesState}>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-4xl mx-auto px-3 md:px-6 py-4 md:py-8">
            <div className="text-center py-8">
              <p className="text-gray-500">No hay negocios disponibles.</p>
            </div>
          </main>
        </div>
      </AppWrapper>
    );
  }

  return (
    <AppWrapper {...salesState}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-4xl mx-auto px-3 md:px-6 py-4 md:py-8">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Registro de Ventas Diarias
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Registra las ventas diarias de tu fotocopiadora
            </p>
          </div>

          <RoleGuard 
            requiredRole="operador"
            fallback={
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <p className="text-gray-500 mb-2">
                  No tienes permisos para registrar ventas.
                </p>
                <p className="text-sm text-gray-400">
                  Contacta al administrador para obtener permisos de operador.
                </p>
              </div>
            }
          >
            <DailySalesCalculator {...salesState} />
          </RoleGuard>
        </main>
      </div>
    </AppWrapper>
  );
};

export default Index;
