import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Library from "./pages/Library";
import Randomizer from "./pages/Randomizer";
import GameNights from "./pages/GameNights";

import Friends from "./pages/Friends";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Navigation from "./components/Navigation";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navigation />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/library" element={
              <ProtectedRoute>
                <Library />
              </ProtectedRoute>
            } />
            <Route path="/randomizer" element={
              <ProtectedRoute>
                <Randomizer />
              </ProtectedRoute>
            } />
            <Route path="/game-nights" element={
              <ProtectedRoute>
                <GameNights />
              </ProtectedRoute>
            } />
            <Route path="/friends" element={
              <ProtectedRoute>
                <Friends />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
