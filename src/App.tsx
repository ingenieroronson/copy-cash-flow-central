
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SettingsLoadingState } from "@/components/SettingsLoadingState";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import SalesHistory from "./pages/SalesHistory";
import NotFound from "./pages/NotFound";
import Reports from "./pages/Reports";
import { AuthForm } from "@/components/AuthForm";

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
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Index />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/sales-history" element={<SalesHistory />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </>
        ) : (
          // Usuario NO autenticado - mostrar login en todas las rutas
          <>
            <Route path="/" element={<AuthForm />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<AuthForm />} />
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
