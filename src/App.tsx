
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import SalesHistory from "./pages/SalesHistory";
import NotFound from "./pages/NotFound";
import Reports from "./pages/Reports";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Redirect root to settings for login/auth handling */}
          <Route path="/" element={<Navigate to="/settings" replace />} />
          
          {/* Settings page handles auth state (login form or settings) */}
          <Route path="/settings" element={<Settings />} />
          
          {/* All other routes require authentication */}
          <Route path="/home" element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          } />
          
          <Route path="/sales-history" element={
            <ProtectedRoute>
              <SalesHistory />
            </ProtectedRoute>
          } />
          
          <Route path="/reports" element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } />
          
          {/* Catch-all route redirects to settings for auth handling */}
          <Route path="*" element={<Navigate to="/settings" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
