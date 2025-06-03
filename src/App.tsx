
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SettingsLoadingState } from "@/components/SettingsLoadingState";
import { shouldPerformRollover, markRolloverCompleted } from "@/utils/serviceRollover";
import { useEffect } from "react";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import SalesHistory from "./pages/SalesHistory";
import NotFound from "./pages/NotFound";
import Reports from "./pages/Reports";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();

  // Check for rollover need on every app load - but only mark as completed when actually needed
  useEffect(() => {
    console.log('App loaded - checking rollover status');
    if (shouldPerformRollover()) {
      console.log('Rollover will be handled by useSalesState when data loads');
      // Note: We don't mark as completed here because the actual rollover
      // will be performed in useSalesState when the service data loads
    } else {
      console.log('No rollover needed today');
    }
  }, []);

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
            <Route path="/login" element={<Navigate to="/home" replace />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </>
        ) : (
          // Usuario NO autenticado - todas las rutas van al login
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
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
