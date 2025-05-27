
import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, LogOut, History, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Printer className="w-6 h-6 text-orange-500" />
          <h1 className="text-xl font-bold text-gray-800 cursor-pointer" onClick={() => navigate('/')}>
            Integracopias
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/sales-history')}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">Historial</span>
          </Button>
          <Button
            onClick={() => navigate('/settings')}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Configuración</span>
          </Button>
          <span className="text-sm text-gray-600 hidden sm:block">
            {user?.email}
          </span>
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
