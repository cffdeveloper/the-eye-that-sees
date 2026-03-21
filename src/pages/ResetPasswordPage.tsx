import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-xs font-mono text-muted-foreground">Invalid or expired reset link.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <BrandHexMark size="lg" />
          <h1 className="text-lg font-mono font-bold text-foreground mt-4">Set New Password</h1>
        </div>
        <div className="glass-panel p-6 glow-border">
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-mono text-muted-foreground uppercase">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 h-9 text-xs font-mono"
                  required
                  minLength={6}
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-9 text-xs font-mono" disabled={loading}>
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />}
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
