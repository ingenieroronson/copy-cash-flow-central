
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { BarChart3, Calculator, Settings, History, LogOut, FileText } from 'lucide-react';
import { BusinessSelector } from './BusinessSelector';

export const Header = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!user) return null;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-3 md:px-6">
        <div className="flex items-center justify-between h-14 md:h-16">
          <div className="flex items-center space-x-4 md:space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Calculator className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              <span className="text-lg md:text-xl font-bold text-gray-900 hidden sm:block">
                FotoVentas
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Ventas Diarias
              </Link>
              <Link
                to="/sales-history"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/sales-history') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <History className="w-4 h-4 inline mr-1" />
                Historial
              </Link>
              <Link
                to="/reports"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/reports') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-1" />
                Reportes
              </Link>
              <Link
                to="/settings"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/settings') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-1" />
                Configuración
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <BusinessSelector />
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 hidden md:block">
                {user.email}
              </span>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline ml-1">Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 py-2">
          <nav className="flex items-center justify-around">
            <Link
              to="/"
              className={`flex flex-col items-center py-1 px-2 text-xs ${
                isActive('/') 
                  ? 'text-blue-700' 
                  : 'text-gray-600'
              }`}
            >
              <Calculator className="w-5 h-5 mb-1" />
              Ventas
            </Link>
            <Link
              to="/sales-history"
              className={`flex flex-col items-center py-1 px-2 text-xs ${
                isActive('/sales-history') 
                  ? 'text-blue-700' 
                  : 'text-gray-600'
              }`}
            >
              <History className="w-5 h-5 mb-1" />
              Historial
            </Link>
            <Link
              to="/reports"
              className={`flex flex-col items-center py-1 px-2 text-xs ${
                isActive('/reports') 
                  ? 'text-blue-700' 
                  : 'text-gray-600'
              }`}
            >
              <BarChart3 className="w-5 h-5 mb-1" />
              Reportes
            </Link>
            <Link
              to="/settings"
              className={`flex flex-col items-center py-1 px-2 text-xs ${
                isActive('/settings') 
                  ? 'text-blue-700' 
                  : 'text-gray-600'
              }`}
            >
              <Settings className="w-5 h-5 mb-1" />
              Config
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};
