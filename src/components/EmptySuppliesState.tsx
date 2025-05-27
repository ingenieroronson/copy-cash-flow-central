
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EmptySuppliesState = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
      <p className="text-gray-500 text-lg mb-4">No hay suministros configurados</p>
      <Button
        onClick={() => navigate('/settings')}
        variant="outline"
      >
        <Settings className="w-4 h-4 mr-2" />
        Ir a Configuración
      </Button>
    </div>
  );
};
