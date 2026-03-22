import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GeoProvider } from "@/contexts/GeoContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { useSubscription } from "@/hooks/useSubscription";
import { FullPagePaywall } from "@/components/SubscriptionGate";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import IndustryPage from "./pages/IndustryPage";
import SubFlowPage from "./pages/SubFlowPage";
import IntelDashboard from "./pages/IntelDashboard";
import CrossIntelPage from "./pages/CrossIntelPage";
import CustomIntelPage from "./pages/CustomIntelPage";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import OnboardingPage from "./pages/OnboardingPage";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

/** Public marketing `/` — signed-in users go straight to the app. */
function HomeGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;
  return <LandingPage />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (user && profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;

  return <>{children}</>;
}

/** Wraps pages that require a Pro subscription — free users see a paywall. */
function ProRoute({ children }: { children: React.ReactNode }) {
  const { isPro, loading } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!isPro) return <FullPagePaywall />;
  return <>{children}</>;
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomeGate />} />
    <Route path="/auth" element={<AuthPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route
      path="/onboarding"
      element={
        <OnboardingGuard>
          <OnboardingPage />
        </OnboardingGuard>
      }
    />
    <Route
      element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }
    >
      {/* Dashboard is free */}
      <Route path="/dashboard" element={<Dashboard />} />
      {/* Everything else requires Pro */}
      <Route path="/intel" element={<ProRoute><IntelDashboard /></ProRoute>} />
      <Route path="/cross-intel" element={<ProRoute><CrossIntelPage /></ProRoute>} />
      <Route path="/custom-intel" element={<ProRoute><CustomIntelPage /></ProRoute>} />
      <Route path="/industry/:slug" element={<ProRoute><IndustryPage /></ProRoute>} />
      <Route path="/industry/:slug/:subFlowId" element={<ProRoute><SubFlowPage /></ProRoute>} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <GeoProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <AppRoutes />
            </BrowserRouter>
          </GeoProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
