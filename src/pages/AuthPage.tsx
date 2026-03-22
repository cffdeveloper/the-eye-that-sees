import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandHexMark } from "@/components/BrandHexMark";
import { BrandWordmark } from "@/components/BrandWordmark";
import { Loader2, Mail, Lock, User, Eye, EyeOff, ArrowLeft, CheckCircle2, Shield, Zap, KeyRound, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { LandingBackdrop } from "@/components/motion/LandingBackdrop";

type Mode = "login" | "signup" | "forgot";

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<Mode>("login");

  useEffect(() => {
    const m = searchParams.get("mode");
    if (m === "signup") setMode("signup");
    if (m === "login") setMode("login");
  }, [searchParams]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const origin = window.location.origin;
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            // Must be listed under Supabase → Auth → URL configuration → Redirect URLs
            emailRedirectTo: origin,
          },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Account created — you're signed in.");
          navigate("/dashboard");
        } else {
          toast.success("Check your email for the confirmation link (and spam/junk).");
        }
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset link sent to your email!");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        // Full top-level navigation — required when the app runs in an iframe (e.g. previews)
        // or the browser would block cross-origin OAuth in a subframe.
        skipBrowserRedirect: true,
      },
    });
    if (error) {
      toast.error("Google sign-in failed");
      return;
    }
    if (data?.url) {
      const url = data.url;
      // OAuth must not run inside an iframe (browser blocks it). Top-level tab only.
      if (window.self === window.top) {
        window.location.assign(url);
        return;
      }
      try {
        window.top!.location.assign(url);
      } catch {
        // Cross-origin iframe: cannot navigate parent; same-tab iframe nav is blocked for OAuth.
        const opened = window.open(url, "_blank", "noopener,noreferrer");
        if (!opened) {
          toast.error(
            "Sign-in could not open. Allow popups for this site, or open Intel GoldMine in a normal browser tab (not an embedded preview).",
          );
        }
      }
    }
  };

  const formStagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
  };
  const formItem = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background flex flex-col md:flex-row relative overflow-hidden mesh-marketing">
      <LandingBackdrop />
      <div className="absolute inset-0 dot-pattern-fine opacity-50 pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[min(80vw,480px)] h-[min(80vw,480px)] rounded-full bg-primary/12 blur-[100px] pointer-events-none opacity-90" />
      <div className="absolute bottom-[-15%] left-[-5%] w-[min(70vw,400px)] h-[min(70vw,400px)] rounded-full bg-brand-orange/10 blur-[90px] pointer-events-none" />

      <Link
        to="/"
        className="absolute top-4 left-4 sm:top-5 sm:left-5 z-30 inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/85 backdrop-blur-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors font-medium shadow-md"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      {/* Mobile — cinematic strip (no empty white above form) */}
      <div className="relative md:hidden h-[min(42vh,320px)] w-full shrink-0 overflow-hidden">
        <img src="/hero-visual.png" alt="" className="absolute inset-0 h-full w-full object-cover scale-105" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/88 via-primary/72 to-brand-navy/93" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20" />
        <div className="absolute inset-0 opacity-25 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex h-full flex-col justify-end p-6 pt-24"
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div className="rounded-xl bg-white/15 p-2 backdrop-blur-md border border-white/20">
              <BrandHexMark size="sm" />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-tight">Intel GoldMine</p>
              <p className="text-[10px] text-white/70 font-medium">Maverick AI</p>
            </div>
          </div>
          <p className="font-display text-2xl font-bold text-white leading-tight max-w-sm">
            Intelligence that helps you decide faster.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["20+ industries", "11+ sources", "Geo-scoped"].map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/95 backdrop-blur-sm"
              >
                <Sparkles className="w-3 h-3 text-amber-200" />
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Left panel — tablet+ */}
      <div className="hidden md:flex md:w-[44%] lg:w-[46%] xl:w-[48%] relative min-h-[100dvh] flex-col justify-between overflow-hidden border-r border-white/10">
        <div className="absolute inset-0">
          <img src="/hero-visual.png" alt="" className="w-full h-full object-cover scale-105" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/88 via-primary/75 to-brand-navy/92" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        </div>

        {/* Floating stat cards */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-24 right-6 lg:right-10 z-[5] w-52 lg:w-56 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-4 shadow-2xl hidden md:block"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Live snapshot</p>
          <p className="mt-2 font-display text-2xl font-bold text-white tabular-nums">20+</p>
          <p className="text-xs text-white/70">Industries tracked</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-28 lg:bottom-32 right-8 lg:right-10 z-[5] w-48 lg:w-52 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-4 shadow-2xl hidden md:block animate-float"
        >
          <div className="flex items-center gap-2 text-amber-200">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-semibold">Maverick AI</span>
          </div>
          <p className="mt-2 text-sm text-white/85 leading-snug">Structured briefs & follow-ups on demand.</p>
        </motion.div>

        <div className="relative z-10 flex flex-col h-full p-8 lg:p-12 xl:p-16">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/12 p-3 backdrop-blur-md border border-white/15 shadow-lg">
              <BrandHexMark size="sm" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight tracking-tight">
                Intel <span className="text-amber-200">GoldMine</span>
              </h2>
              <p className="text-xs text-white/65 font-medium">Powered by Maverick AI</p>
            </div>
          </div>

          <div className="mt-auto space-y-10 max-w-lg">
            <div>
              <p className="font-display text-4xl xl:text-[2.75rem] font-bold text-white tracking-tight leading-[1.08]">
                Intelligence that helps you decide faster.
              </p>
              <p className="mt-5 text-base text-white/75 leading-relaxed">
                Track markets, spot opportunities, and stay ahead — with evidence-backed intel, not noise.
              </p>
            </div>

            <div className="space-y-3.5">
              {["20 industries tracked live", "AI-powered research reports", "Personalized to your regions"].map((t) => (
                <div key={t} className="flex items-center gap-3 text-sm text-white/90">
                  <CheckCircle2 className="w-5 h-5 text-amber-300/95 shrink-0" />
                  <span className="font-medium">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form column */}
      <div className="flex-1 flex items-center justify-center px-5 py-8 sm:p-10 lg:p-12 xl:p-16 relative min-h-0 md:min-h-[100dvh]">
        <motion.div
          variants={formStagger}
          initial="hidden"
          animate="show"
          className="relative z-10 w-full max-w-[440px]"
        >
          <div className="pointer-events-none absolute -inset-px rounded-[1.35rem] bg-gradient-to-r from-primary/25 via-brand-orange/20 to-primary/25 opacity-70 blur-xl md:opacity-90" />
          <motion.div
            variants={formItem}
            className="md:hidden mb-6 rounded-2xl border border-border/50 bg-gradient-to-br from-primary/[0.08] to-brand-orange/[0.06] p-5 text-center shadow-md relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_40%,hsl(var(--primary)/0.08)_50%,transparent_60%)] bg-[length:200%_100%] animate-shimmer" />
            <BrandHexMark size="md" className="mx-auto relative" />
            <h1 className="text-xl font-bold text-foreground mt-3 relative">
              <BrandWordmark />
            </h1>
            <p className="text-xs text-muted-foreground mt-1.5 relative">AI-powered market intelligence</p>
          </motion.div>

          <motion.div
            variants={formItem}
            className="relative rounded-3xl border border-border/50 bg-card/95 backdrop-blur-md shadow-2xl shadow-black/[0.08] overflow-hidden ring-1 ring-primary/5"
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-brand-orange to-primary bg-[length:200%_100%] animate-shimmer" />
            <div className="p-7 sm:p-9 space-y-6">
              <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 border border-border/50 px-2.5 py-1 font-medium">
                  <Shield className="w-3.5 h-3.5 text-signal-emerald" />
                  Secure sign-in
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 border border-border/50 px-2.5 py-1 font-medium">
                  <KeyRound className="w-3.5 h-3.5 text-primary" />
                  Supabase Auth
                </span>
              </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
                className="text-center motion-reduce:transition-none"
              >
                <h2 className="font-display text-2xl font-bold text-foreground">
                  {mode === "login" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset password"}
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  {mode === "login"
                    ? "Sign in to access your dashboard"
                    : mode === "signup"
                      ? "Get started with Intel GoldMine"
                      : "We'll send you a reset link"}
                </p>
              </motion.div>
            </AnimatePresence>

            <Button
              variant="outline"
              className="w-full h-12 text-sm gap-3 rounded-xl font-semibold hover:bg-muted/40 border-border/60 transition-all"
              onClick={handleGoogleLogin}
              type="button"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-border/60" />
              <span className="text-xs text-muted-foreground font-medium">or</span>
              <div className="flex-1 h-px bg-border/60" />
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-5">
              <AnimatePresence mode="wait">
                {mode === "signup" && (
                  <motion.div
                    key="fullname"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <Label className="text-sm font-semibold text-foreground">Full name</Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your name"
                        className="pl-11 h-12 text-sm rounded-xl border-border/60"
                        required
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-11 h-12 text-sm rounded-xl border-border/60"
                    required
                  />
                </div>
              </div>

              {mode !== "forgot" && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-11 pr-11 h-12 text-sm rounded-xl border-border/60"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Forgot password?
                </button>
              )}

              <Button type="submit" className="w-full h-12 text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
              </Button>
            </form>

            <div className="text-center">
              {mode === "login" ? (
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button type="button" onClick={() => setMode("signup")} className="text-primary font-bold hover:underline">
                    Sign up
                  </button>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button type="button" onClick={() => setMode("login")} className="text-primary font-bold hover:underline">
                    Sign in
                  </button>
                </p>
              )}
            </div>

            <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground pt-1">
              <Link to="/privacy-policy" className="hover:text-foreground underline-offset-2 hover:underline">
                Privacy policy
              </Link>
              <span className="text-border select-none">·</span>
              <Link to="/terms-of-service" className="hover:text-foreground underline-offset-2 hover:underline">
                Terms of service
              </Link>
            </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
