import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandHexMark } from "@/components/BrandHexMark";
import { BrandWordmark } from "@/components/BrandWordmark";
import { Loader2, Mail, Lock, User, Eye, EyeOff, ArrowLeft, Shield } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

type Mode = "login" | "signup" | "forgot";

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setMode] = useState<Mode>("login");

  const applyMode = (next: Mode) => {
    setMode(next);
    if (next === "signup") setSearchParams({ mode: "signup" });
    else if (next === "forgot") setSearchParams({ mode: "forgot" });
    else setSearchParams({});
  };

  useEffect(() => {
    const m = searchParams.get("mode");
    if (m === "signup") setMode("signup");
    else if (m === "forgot") setMode("forgot");
    else if (m === "login") setMode("login");
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
            "Sign-in could not open. Allow popups for this site, or open Infinitygap in a normal browser tab (not an embedded preview).",
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
    <div className="min-h-screen min-h-[100dvh] bg-background flex flex-col relative">
      <header className="sticky top-0 z-40 w-full shrink-0 overflow-visible border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/90">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-end gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <ThemeToggle size="sm" />
            <Link
              to="/"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/50 bg-background/60 px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-border hover:bg-muted/50 hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to home</span>
              <span className="sm:hidden">Home</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-8 sm:px-5 sm:py-10 md:p-12 lg:p-16">
        <motion.div
          variants={formStagger}
          initial="hidden"
          animate="show"
          className="relative z-10 w-full max-w-[440px]"
        >
          <motion.div
            variants={formItem}
            className="relative rounded-3xl border border-border/60 bg-card shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.4)] overflow-hidden ring-1 ring-border/40"
          >
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
                  TLS encryption
                </span>
                <span className="text-border/80 select-none" aria-hidden>
                  ·
                </span>
                <span className="font-medium">Industry-standard authentication</span>
              </p>

              {mode !== "forgot" && (
                <div className="grid grid-cols-2 gap-1 rounded-xl border border-border/60 bg-muted/40 p-1">
                  <button
                    type="button"
                    onClick={() => applyMode("login")}
                    className={cn(
                      "rounded-lg py-2.5 text-sm font-semibold transition-all",
                      mode === "login"
                        ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => applyMode("signup")}
                    className={cn(
                      "rounded-lg py-2.5 text-sm font-semibold transition-all",
                      mode === "signup"
                        ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Create account
                  </button>
                </div>
              )}

              {mode === "forgot" && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => applyMode("login")}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to sign in
                  </button>
                </div>
              )}

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
                className="text-center motion-reduce:transition-none"
              >
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                  {mode === "login" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset password"}
                </h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {mode === "login"
                    ? "Sign in to continue to your dashboard."
                    : mode === "signup"
                      ? "Start free — upgrade when you need the full workspace."
                      : "We’ll email you a secure link to choose a new password."}
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
                  onClick={() => applyMode("forgot")}
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
              {mode === "forgot" ? (
                <p className="text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <button type="button" onClick={() => applyMode("login")} className="font-semibold text-primary hover:underline">
                    Sign in
                  </button>
                </p>
              ) : mode === "login" ? (
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <button type="button" onClick={() => applyMode("signup")} className="font-semibold text-primary hover:underline">
                    Create account
                  </button>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button type="button" onClick={() => applyMode("login")} className="font-semibold text-primary hover:underline">
                    Sign in
                  </button>
                </p>
              )}
            </div>

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
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
