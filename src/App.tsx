
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SettingsLoadingState } from "@/components/SettingsLoadingState";
// import Index from "./pages/Index"; // Ya no necesitas Index ni /home
import Settings from "./pages/Settings";
import SalesHistory from "./pages/SalesHistory";
import NotFound from "./pages/NotFound";
import Reports from "./pages/Reports";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();

  // Mientras está cargando, mostrar loading
  if (loading) {
    return <SettingsLoadingState />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {user ? (
          // Usuario autenticado - rutas normales
          <>
            <Route path="/" element={<Navigate to="/settings" replace />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/sales-history" element={<SalesHistory />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/login" element={<Navigate to="/settings" replace />} />
            <Route path="*" element={<Navigate to="/settings" replace />} />
          </>
        ) : (
          // Usuario NO autenticado - todas las rutas van a settings (ahí se muestra el login)
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/" element={<Navigate to="/settings" replace />} />
            <Route path="*" element={<Navigate to="/settings" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
