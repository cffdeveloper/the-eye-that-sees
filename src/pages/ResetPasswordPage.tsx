import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandHexMark } from "@/components/BrandHexMark";
import { BrandWordmark } from "@/components/BrandWordmark";
import { LandingBackdrop } from "@/components/motion/LandingBackdrop";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Loader2, Lock, ArrowLeft, Shield } from "lucide-react";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setReady(true);
    }
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated successfully!");
      navigate("/opportunities");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const main = !ready ? (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[min(100%,440px)]"
    >
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] ring-1 ring-border/40 dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.4)]">
        <div className="space-y-5 p-5 text-center sm:space-y-6 sm:p-9">
          <div className="relative border-b border-border/50 pb-6 sm:pb-8">
            <div className="relative mb-4 flex justify-center">
              <div className="pointer-events-none absolute inset-0 left-1/2 top-1/2 h-[min(100%,12rem)] w-[min(100%,12rem)] -translate-x-1/2 -translate-y-1/2 scale-110 rounded-[2rem] bg-primary/12 blur-3xl" />
              <BrandHexMark size="2xl" className="relative mx-auto object-contain drop-shadow-lg" />
            </div>
            <h1 className="font-bold text-foreground">
              <BrandWordmark className="text-2xl sm:text-4xl" />
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Password recovery</p>
          </div>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-muted/40">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground tracking-tight">Link not valid</h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              This password reset link is invalid or has expired. Request a new one from the sign-in page.
            </p>
          </div>
          <Button className="w-full h-11 rounded-xl font-semibold" asChild>
            <Link to="/opportunities">Back to app</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  ) : (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[min(100%,440px)]"
    >
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] ring-1 ring-border/40 dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.4)]">
        <div className="space-y-5 p-5 sm:space-y-6 sm:p-9">
          <div className="relative border-b border-border/50 pb-6 text-center sm:pb-8">
            <div className="relative mb-4 flex justify-center">
              <div className="pointer-events-none absolute inset-0 left-1/2 top-1/2 h-[min(100%,12rem)] w-[min(100%,12rem)] -translate-x-1/2 -translate-y-1/2 scale-110 rounded-[2rem] bg-primary/12 blur-3xl" />
              <BrandHexMark size="2xl" className="relative mx-auto object-contain drop-shadow-lg" />
            </div>
            <h1 className="font-bold text-foreground">
              <BrandWordmark className="text-2xl sm:text-4xl" />
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Evidence-backed market intelligence</p>
          </div>

          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground/80">
              <Shield className="w-3.5 h-3.5 text-signal-emerald shrink-0" />
              Secure password update
            </span>
          </p>
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Set new password</h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">Choose a strong password you haven&apos;t used elsewhere.</p>
          </div>
          <form onSubmit={handleReset} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">New password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-11 h-12 text-sm rounded-xl border-border/60"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Update password
            </Button>
          </form>
          <div className="space-y-2 border-t border-border/40 pt-5 text-center">
            <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              <Link to="/privacy-policy" className="font-medium hover:text-foreground underline-offset-4 hover:underline">
                Privacy
              </Link>
              <span className="text-border select-none" aria-hidden>
                ·
              </span>
              <Link to="/terms-of-service" className="font-medium hover:text-foreground underline-offset-4 hover:underline">
                Terms
              </Link>
            </div>
            <p className="text-[10px] text-muted-foreground/80">© {new Date().getFullYear()} Infinitygap · Not financial advice.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background flex flex-col relative overflow-hidden mesh-marketing">
      <LandingBackdrop />
      <div className="absolute inset-0 dot-pattern-fine opacity-50 pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[min(80vw,480px)] h-[min(80vw,480px)] rounded-full bg-primary/12 blur-[100px] pointer-events-none opacity-90" />
      <div className="absolute bottom-[-15%] left-[-5%] w-[min(70vw,400px)] h-[min(70vw,400px)] rounded-full bg-brand-orange/10 blur-[90px] pointer-events-none" />

      <header className="sticky top-0 z-40 w-full shrink-0 overflow-visible border-b border-border/40 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-end gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <ThemeToggle size="sm" />
            <Link
              to="/opportunities"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/50 bg-background/60 px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-border hover:bg-muted/50 hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to sign in</span>
              <span className="sm:hidden">Sign in</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-5 sm:py-12">{main}</div>
    </div>
  );
}
