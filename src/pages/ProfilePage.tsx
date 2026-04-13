import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Mail, Building2, Briefcase, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { PageIntro } from "@/components/marketing/ProductWayfinding";

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
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

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-0 sm:space-y-8">
      <div>
        <h1 className="font-display text-xl font-bold text-foreground sm:text-2xl">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and how Infinitygap personalizes briefs</p>
      </div>

      <PageIntro eyebrow="Personalize Infinitygap" title="Why this page matters">
        <p>
          Role, organization, and industry picks tune how Infinitygap writes briefs and prioritizes what you see. Geography is set in the top bar and applies across the app.
        </p>
        <p className="text-foreground/90">
          Back to{" "}
          <Link to="/dashboard" className="text-primary font-medium hover:underline">
            Dashboard
          </Link>{" "}
          for sectors,{" "}
          <Link to="/intel" className="text-primary font-medium hover:underline">
            Live feed
          </Link>
          ,{" "}
          <Link to="/cross-intel" className="text-primary font-medium hover:underline">
            Cross-industry
          </Link>
          , or{" "}
          <Link to="/custom-intel" className="text-primary font-medium hover:underline">
            Infinity Lab
          </Link>
          .
        </p>
      </PageIntro>

      <div className="rounded-2xl border border-border bg-card p-5 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <User className="h-5 w-5 shrink-0 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Profile Details</h2>
        </div>

        <div className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {form.avatar_url ? (
              <img src={form.avatar_url} alt="Avatar" className="h-16 w-16 shrink-0 rounded-full border-2 border-border object-cover" />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-border bg-muted">
                <User className="h-7 w-7 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avatar URL</label>
              <Input
                value={form.avatar_url}
                onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
                className="text-sm"
              />
            </div>
          </div>

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

          <Button onClick={handleSave} disabled={saving} className="w-full gap-2 sm:w-auto">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
