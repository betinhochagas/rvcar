import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SiteConfigProvider } from "@/contexts/SiteConfigContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingFallback from "@/components/LoadingFallback";

// Code splitting - lazy load das páginas
const Index = lazy(() => import('./pages/Index'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const SiteSettings = lazy(() => import('./pages/SiteSettings'));
const PageSections = lazy(() => import('./pages/PageSections'));

const queryClient = new QueryClient();

// Base path for subdirectory deployment (change if needed)
// Leave empty string ('') for root domain deployment
const basename = '';

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <SiteConfigProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={basename}>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/site-settings" element={<SiteSettings />} />
                <Route path="/admin/page-sections" element={<PageSections />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </SiteConfigProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
