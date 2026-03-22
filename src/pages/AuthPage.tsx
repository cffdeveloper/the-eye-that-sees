import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { motion, AnimatePresence } from "framer-motion";

const PROD_URL = "https://intelgoldmine.onrender.com";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandHexMark } from "@/components/BrandHexMark";
import { BrandWordmark } from "@/components/BrandWordmark";
import { Loader2, Mail, Lock, User, Eye, EyeOff, Sparkles } from "lucide-react";
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
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) toast.error("Google sign-in failed");
  };

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden">
      <Link
        to="/"
        className="absolute top-5 left-5 z-30 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back to home
      </Link>

      {/* Brand panel — hidden on small screens */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex lg:w-[46%] xl:w-[48%] relative min-h-screen flex-col justify-between p-10 xl:p-12 text-primary-foreground overflow-hidden"
      >
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/92 via-primary/85 to-primary/75" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-40" />
        </div>
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur-md border border-white/15">
              <Sparkles className="w-7 h-7 text-amber-200" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white leading-tight">
                Intel <span className="text-amber-200">GoldMine</span>
              </h2>
              <p className="text-xs text-white/80 mt-0.5">Maverick AI</p>
            </div>
          </div>

          <div className="mt-auto space-y-6 max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Sparkles className="w-8 h-8 text-amber-200/90 mb-3" />
              <p className="text-2xl font-semibold text-white tracking-tight leading-snug">
                Structured intelligence for teams who move on capital, not vibes.
              </p>
              <p className="mt-3 text-sm text-white/80 leading-relaxed">
                Live feeds, geo-scoped research, and Intel Lab — built for operators who need receipts, not noise.
              </p>
            </motion.div>
            <div className="flex flex-wrap gap-2">
              {["20 industries", "70+ flows", "11+ sources"].map((t) => (
                <span
                  key={t}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Form column */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative min-h-screen">
        <div className="absolute inset-0 grid-bg opacity-[0.08] pointer-events-none" />
        <div
          className="absolute inset-x-0 top-0 h-[min(50vh,24rem)] pointer-events-none lg:hidden"
          style={{
            background: "radial-gradient(ellipse 80% 90% at 50% 0%, hsl(var(--primary) / 0.08) 0%, transparent 65%)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <BrandHexMark size="lg" />
            <h1 className="text-xl font-semibold text-foreground mt-5">
              <BrandWordmark />
            </h1>
            <p className="text-sm text-muted-foreground mt-2 text-center max-w-sm leading-relaxed">
              Intelligence platform · <span className="text-brand-orange font-semibold">Maverick</span> is your AI research agent
            </p>
          </div>

          <div className="glass-panel p-8 glow-border space-y-6 rounded-2xl shadow-xl border border-border/50">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: mode === "signup" ? 12 : -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === "signup" ? -8 : 8 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                <h2 className="text-lg font-semibold text-foreground">
                  {mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Reset password"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1.5">
                  {mode === "login"
                    ? "Access your personalized intelligence dashboard"
                    : mode === "signup"
                      ? "Start your intelligence journey"
                      : "We'll send you a reset link"}
                </p>
              </motion.div>
            </AnimatePresence>

            <Button
              variant="outline"
              className="w-full h-11 text-sm gap-2 hover:bg-muted/60 transition-colors"
              onClick={handleGoogleLogin}
              type="button"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-3">
              <AnimatePresence mode="wait">
                {mode === "signup" && (
                  <motion.div
                    key="fullname"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1.5 overflow-hidden"
                  >
                    <Label className="text-xs font-medium text-foreground">Full name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your name"
                        className="pl-9 h-10 text-sm transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
                        required
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-9 h-10 text-sm transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
                    required
                  />
                </div>
              </div>

              {mode !== "forgot" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-9 pr-9 h-10 text-sm transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              )}

              <motion.div whileTap={{ scale: 0.99 }}>
                <Button type="submit" className="w-full h-10 text-sm font-medium shadow-md" disabled={loading}>
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />}
                  {mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
                </Button>
              </motion.div>
            </form>

            <div className="text-center">
              {mode === "login" ? (
                <p className="text-sm text-muted-foreground">
                  No account?{" "}
                  <button type="button" onClick={() => setMode("signup")} className="text-primary font-medium hover:underline">
                    Sign up
                  </button>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button type="button" onClick={() => setMode("login")} className="text-primary font-medium hover:underline">
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
