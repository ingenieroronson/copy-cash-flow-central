
import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, LogOut, History, Settings, BarChart3, Home } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-3 md:px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <Printer className="w-5 h-5 md:w-6 md:h-6 text-orange-500 flex-shrink-0" />
          <h1 className="text-lg md:text-xl font-bold text-gray-800 cursor-pointer truncate" onClick={() => navigate('/settings')}>
            Integracopias
          </h1>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2 lg:gap-4">
          <Button
            onClick={() => navigate('/home')}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3"
          >
            <Home className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden md:inline">Inicio</span>
          </Button>
          <Button
            onClick={() => navigate('/reports')}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3"
          >
            <BarChart3 className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden md:inline">Reportes</span>
          </Button>
          <Button
            onClick={() => navigate('/sales-history')}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3"
          >
            <History className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden md:inline">Historial</span>
          </Button>
          <Button
            onClick={() => navigate('/settings')}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3"
          >
            <Settings className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden md:inline">Config</span>
          </Button>
          <span className="text-xs md:text-sm text-gray-600 hidden lg:block truncate max-w-32">
            {user?.email}
          </span>
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3"
          >
            <LogOut className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden lg:inline">Cerrar</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
