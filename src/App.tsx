import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminPanel from "./pages/AdminPanel";
import Reprogramar from "./pages/Reprogramar";
import ReprogramarConfirm from "./pages/ReprogramarConfirm";
import PausarReactivacion from "./pages/PausarReactivacion";
import WLFriend from "./pages/WLFriend";
import EvaluationDay from "./pages/EvaluationDay";
import Offboarding from "./pages/Offboarding";
import EvaluacionPorVideo from "./pages/EvaluacionPorVideo";
import CalculadoraDeportiva from "./pages/CalculadoraDeportiva";
import VeranoFutcenter from "./pages/VeranoFutcenter";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/wl-friend" element={<WLFriend />} />
          <Route path="/evaluaciones" element={<EvaluationDay />} />
          <Route path="/admin-panel" element={<AdminPanel />} />
          <Route path="/reprogramar" element={<Reprogramar />} />
          <Route path="/reprogramar/confirm" element={<ReprogramarConfirm />} />
          <Route path="/reactivacion/pausar" element={<PausarReactivacion />} />
          <Route path="/offboarding/:prospectId" element={<Offboarding />} />
          <Route path="/calculadora-deportiva" element={<CalculadoraDeportiva />} />
          <Route path="/evaluacion-por-video" element={<EvaluacionPorVideo />} />
          <Route path="/verano2026" element={<VeranoFutcenter />} />
          <Route path="/veranofutcenter" element={<VeranoFutcenter />} />
          <Route path="/admin" element={<Admin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
