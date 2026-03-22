import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BrandHexMark } from "@/components/BrandHexMark";
import { UpgradeButton } from "@/components/SubscriptionGate";
import { User, Crown, Mail, Building2, Briefcase, MapPin, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SUBSCRIPTION_USD_MONTHLY } from "@/lib/pricing";

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const { isPro, subscription, loading: subLoading } = useSubscription();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    display_name: "",
    full_name: "",
    organization: "",
    title: "",
    bio: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name || "",
        full_name: profile.full_name || "",
        organization: profile.organization || "",
        title: profile.title || "",
        bio: profile.bio || "",
        avatar_url: profile.avatar_url || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: form.display_name || null,
        full_name: form.full_name || null,
        organization: form.organization || null,
        title: form.title || null,
        bio: form.bio || null,
        avatar_url: form.avatar_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Profile updated");
      await refreshProfile();
    }
    setSaving(false);
  };

  const handleDowngrade = async () => {
    // For now, show a message — full cancel requires Paystack API integration
    toast.info("To cancel your subscription, please contact support at support@intelgoldmine.com. We'll process your request within 24 hours.");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account details and subscription</p>
      </div>

      {/* Subscription Card */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Crown className="w-5 h-5 text-brand-orange" />
          <h2 className="text-lg font-bold text-foreground">Subscription</h2>
        </div>

        {subLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading…
          </div>
        ) : isPro ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold">
                <Crown className="w-3.5 h-3.5" />
                Pro Plan
              </span>
              <span className="text-sm text-muted-foreground">${SUBSCRIPTION_USD_MONTHLY}/month</span>
            </div>
            {subscription?.current_period_end && (
              <p className="text-sm text-muted-foreground">
                Next billing: {new Date(subscription.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            )}
            <Button variant="outline" size="sm" onClick={handleDowngrade} className="text-destructive border-destructive/30 hover:bg-destructive/5">
              Cancel subscription
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border font-semibold">
                Free Plan
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Upgrade to Pro to unlock AI-powered intelligence, deep dives, and real-time data across all industries.
            </p>
            <UpgradeButton size="default" />
          </div>
        )}
      </div>

      {/* Profile Details */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Profile Details</h2>
        </div>

        <div className="space-y-5">
          {/* Avatar URL */}
          <div className="flex items-center gap-4">
            {form.avatar_url ? (
              <img src={form.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-border" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                <User className="w-7 h-7 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Avatar URL</label>
              <Input
                value={form.avatar_url}
                onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
                className="text-sm"
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email
            </label>
            <Input value={user?.email || ""} disabled className="text-sm bg-muted/50" />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Display Name</label>
              <Input
                value={form.display_name}
                onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                placeholder="How you appear in the app"
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Full Name</label>
              <Input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Your legal name"
                className="text-sm"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Organization
              </label>
              <Input
                value={form.organization}
                onChange={(e) => setForm({ ...form, organization: e.target.value })}
                placeholder="Company or org"
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" /> Title / Role
              </label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Head of Strategy"
                className="text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Bio</label>
            <Textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="A short bio about yourself"
              className="text-sm min-h-[80px]"
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
