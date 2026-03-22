import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandHexMark } from "@/components/BrandHexMark";
import { Loader2, Lock } from "lucide-react";
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
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <p className="text-sm text-muted-foreground text-center max-w-sm">Invalid or expired reset link.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <BrandHexMark size="lg" />
          <h1 className="text-xl font-bold text-foreground mt-4 tracking-tight">Set new password</h1>
          <p className="text-sm text-muted-foreground mt-1.5 text-center">Choose a strong password for your account.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">New password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 h-11 text-sm rounded-xl"
                  required
                  minLength={6}
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-11 text-sm font-semibold rounded-xl" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Update Password
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
