import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

const PROD_URL = "https://intelgoldmine.onrender.com";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandHexMark } from "@/components/BrandHexMark";
import { BrandWordmark } from "@/components/BrandWordmark";
import { Loader2, Mail, Lock, User, Eye, EyeOff, ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";

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
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: PROD_URL,
          },
        });
        if (error) throw error;
        toast.success("Check your email for a verification link!");
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${PROD_URL}/reset-password`,
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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) toast.error("Google sign-in failed");
  };

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden">
      <Link
        to="/"
        className="absolute top-6 left-6 z-30 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      {/* Left panel — cinematic */}
      <div className="hidden lg:flex lg:w-[48%] relative min-h-screen flex-col justify-between overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img src="/hero-visual.png" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-brand-navy/90 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col h-full p-12 xl:p-16">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md border border-white/10">
              <BrandHexMark size="sm" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight tracking-tight">
                Intel <span className="text-amber-200">GoldMine</span>
              </h2>
              <p className="text-xs text-white/60 font-medium">Powered by Maverick AI</p>
            </div>
          </div>

          <div className="mt-auto space-y-10 max-w-lg">
            <div>
              <p className="font-display text-4xl xl:text-5xl font-bold text-white tracking-tight leading-[1.1]">
                Intelligence that helps you make better decisions, faster.
              </p>
              <p className="mt-5 text-base text-white/70 leading-relaxed">
                Join decision makers who use Intel GoldMine to track markets, spot opportunities, and stay ahead.
              </p>
            </div>

            <div className="space-y-4">
              {["20 industries tracked live", "AI-powered research reports", "Personalized to your needs"].map((t) => (
                <div key={t} className="flex items-center gap-3 text-sm text-white/85">
                  <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0" />
                  <span className="font-medium">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form column */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16 relative min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-[440px]"
        >
          <div className="flex flex-col items-center mb-10 lg:hidden">
            <BrandHexMark size="lg" />
            <h1 className="text-2xl font-bold text-foreground mt-5">
              <BrandWordmark />
            </h1>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Your AI-powered intelligence platform
            </p>
          </div>

          <div className="rounded-3xl border border-border/50 bg-card p-8 sm:p-10 shadow-xl space-y-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
                className="text-center"
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
          </div>
        </motion.div>
      </div>
    </div>
  );
}
