import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthForm } from '@/components/AuthForm';
import Settings from "./pages/Settings";
import SalesHistory from "./pages/SalesHistory";
import Reports from "./pages/Reports";

const queryClient = new QueryClient();

const AppContent = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* La raíz SIEMPRE muestra AuthForm */}
        <Route path="/" element={<AuthForm />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/sales-history" element={<SalesHistory />} />
        <Route path="/reports" element={<Reports />} />
        {/* Cualquier ruta no definida también muestra AuthForm */}
        <Route path="*" element={<AuthForm />} />
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
