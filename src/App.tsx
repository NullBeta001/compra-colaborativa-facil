
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ListProvider } from "./context/ListContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CreateList from "./pages/CreateList";
import ViewList from "./pages/ViewList";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ListProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/create" element={<CreateList />} />
            <Route path="/list/:id" element={<ViewList />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ListProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
