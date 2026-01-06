import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

const queryClient = new QueryClient();

// Only initialize Supabase session if credentials are configured
if (supabase.auth.getSession) {
  supabase.auth.getSession().then(({ data: { session } }) => {
    console.log('Supabase session:', session);
  });

  // Listen for auth changes
  supabase.auth.onAuthStateChange((_event, session) => {
    console.log('Supabase auth state changed:', _event, session);
  });
}

const App = () => {
  useEffect(() => {
    // Check for Supabase environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
      console.warn('Supabase URL is not configured. Please set VITE_SUPABASE_URL in your .env file.');
    }
    
    if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
      console.warn('Supabase anon key is not configured. Please set VITE_SUPABASE_ANON_KEY in your .env file.');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;