import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useParams } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GeoProvider } from "@/contexts/GeoContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
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
import ProfilePage from "./pages/ProfilePage";
import SavedLibraryPage from "./pages/SavedLibraryPage";
import OpportunityDeskPage from "./pages/OpportunityDeskPage";
import OpportunityDeskDeepDivePage from "./pages/OpportunityDeskDeepDivePage";
import { OPPORTUNITY_DESK_PATH, assistantDeepDivePath, assistantHomePath } from "@/lib/assistantBranding";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import { Loader2 } from "lucide-react";
import { SUPABASE_ENV_ERROR } from "@/lib/supabaseEnv";

const queryClient = new QueryClient();

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

/** Old `/alfred` and `/jordan` URLs → `/my-desk`. */
function LegacyAssistantHomeRedirect() {
  return <Navigate to={assistantHomePath} replace />;
}

function LegacyAssistantDeepDiveRedirect() {
  const { insightId } = useParams<{ insightId: string }>();
  if (!insightId) return <Navigate to={assistantHomePath} replace />;
  return <Navigate to={assistantDeepDivePath(insightId)} replace />;
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
    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
    <Route path="/terms-of-service" element={<TermsOfServicePage />} />
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
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/intel" element={<IntelDashboard />} />
      <Route path="/cross-intel" element={<CrossIntelPage />} />
      <Route path="/custom-intel" element={<CustomIntelPage />} />
      <Route path={`/${OPPORTUNITY_DESK_PATH}`} element={<OpportunityDeskPage />} />
      <Route path={`/${OPPORTUNITY_DESK_PATH}/deep-dive/:insightId`} element={<OpportunityDeskDeepDivePage />} />
      <Route path="/alfred" element={<LegacyAssistantHomeRedirect />} />
      <Route path="/alfred/deep-dive/:insightId" element={<LegacyAssistantDeepDiveRedirect />} />
      <Route path="/jordan" element={<LegacyAssistantHomeRedirect />} />
      <Route path="/jordan/deep-dive/:insightId" element={<LegacyAssistantDeepDiveRedirect />} />
      <Route path="/industry/:slug" element={<IndustryPage />} />
      <Route path="/industry/:slug/:subFlowId" element={<SubFlowPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/saved" element={<SavedLibraryPage />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => {
  if (SUPABASE_ENV_ERROR) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-2xl rounded-xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold mb-3">Configuration required</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">{SUPABASE_ENV_ERROR}</p>
        </div>
      </div>
    );
  }

  return (
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
};

export default App;
