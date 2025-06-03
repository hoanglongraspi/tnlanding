import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { WebPPerformanceMonitor } from "@/components/ui/webp-performance-monitor";

// Lazy load components for better performance
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const PersonalProject = lazy(() => import("./pages/PersonalProject"));
const CommercialWork = lazy(() => import("./pages/CommercialWork"));
const Events = lazy(() => import("./pages/Events"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const CMSDemo = lazy(() => import("./pages/CMSDemo"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400/50 rounded-full animate-spin animate-reverse"></div>
    </div>
  </div>
);

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 10 minutes
      staleTime: 10 * 60 * 1000,
      // Keep data in cache for 30 minutes
      gcTime: 30 * 60 * 1000,
      // Retry failed requests max 2 times
      retry: 2,
      // Don't refetch on window focus unless data is stale
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect unless data is stale  
      refetchOnReconnect: false,
      // Don't refetch on mount unless data is stale
      refetchOnMount: false,
    },
    mutations: {
      // Retry failed mutations only once
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/personal-project" element={<PersonalProject />} />
            <Route path="/commercial-work" element={<CommercialWork />} />
            <Route path="/events" element={<Events />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/cms-demo" element={<CMSDemo />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      
      {/* WebP Performance Monitor - Development Only */}
      <WebPPerformanceMonitor position="bottom-right" autoHide={false} />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
