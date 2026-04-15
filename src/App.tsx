import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useParams, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GeoProvider } from "@/contexts/GeoContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import AppLayout from "./components/layout/AppLayout";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SavedLibraryPage from "./pages/SavedLibraryPage";
import OpportunityDeskPage from "./pages/OpportunityDeskPage";
import OpportunityDeskDeepDivePage from "./pages/OpportunityDeskDeepDivePage";
import EventsPage from "./pages/EventsPage";
import ReadsPage from "./pages/ReadsPage";
import { OPPORTUNITY_DESK_PATH, assistantDeepDivePath, assistantHomePath } from "@/lib/assistantBranding";
import NotFound from "./pages/NotFound";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import { SUPABASE_ENV_ERROR } from "@/lib/supabaseEnv";

const queryClient = new QueryClient();

function LegacyAuthUrlRedirect() {
  const location = useLocation();
  const q = location.search || "";
  return <Navigate to={`/opportunities${q}`} replace />;
}

/** Old assistant URLs → `/opportunities`. */
function LegacyAssistantHomeRedirect() {
  return <Navigate to={assistantHomePath} replace />;
}

function LegacyAssistantDeepDiveRedirect() {
  const { insightId } = useParams<{ insightId: string }>();
  if (!insightId) return <Navigate to={assistantHomePath} replace />;
  return <Navigate to={assistantDeepDivePath(insightId)} replace />;
}

function LegacyMyDeskHomeRedirect() {
  return <Navigate to="/opportunities" replace />;
}

function LegacyMyDeskDeepDiveRedirect() {
  const { insightId } = useParams<{ insightId: string }>();
  if (!insightId) return <Navigate to="/opportunities" replace />;
  return <Navigate to={assistantDeepDivePath(insightId)} replace />;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/opportunities" replace />} />
    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
    <Route path="/terms-of-service" element={<TermsOfServicePage />} />
    <Route path="/auth" element={<LegacyAuthUrlRedirect />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route element={<AppLayout />}>
      <Route path="/events" element={<EventsPage />} />
      <Route path="/reads" element={<ReadsPage />} />
      <Route path={`/${OPPORTUNITY_DESK_PATH}`} element={<OpportunityDeskPage />} />
      <Route path={`/${OPPORTUNITY_DESK_PATH}/deep-dive/:insightId`} element={<OpportunityDeskDeepDivePage />} />
      <Route path="/saved" element={<SavedLibraryPage />} />

      <Route path="/my-desk" element={<LegacyMyDeskHomeRedirect />} />
      <Route path="/my-desk/deep-dive/:insightId" element={<LegacyMyDeskDeepDiveRedirect />} />
      <Route path="/alfred" element={<LegacyAssistantHomeRedirect />} />
      <Route path="/alfred/deep-dive/:insightId" element={<LegacyAssistantDeepDiveRedirect />} />
      <Route path="/jordan" element={<LegacyAssistantHomeRedirect />} />
      <Route path="/jordan/deep-dive/:insightId" element={<LegacyAssistantDeepDiveRedirect />} />

      <Route path="/dashboard" element={<Navigate to="/opportunities" replace />} />
      <Route path="/intel" element={<Navigate to="/opportunities" replace />} />
      <Route path="/cross-intel" element={<Navigate to="/opportunities" replace />} />
      <Route path="/custom-intel" element={<Navigate to="/opportunities" replace />} />
      <Route path="/profile" element={<Navigate to="/opportunities" replace />} />
      <Route path="/onboarding" element={<Navigate to="/opportunities" replace />} />
      <Route path="/admin" element={<Navigate to="/opportunities" replace />} />
      <Route path="/industry/:slug" element={<Navigate to="/opportunities" replace />} />
      <Route path="/industry/:slug/:subFlowId" element={<Navigate to="/opportunities" replace />} />
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
