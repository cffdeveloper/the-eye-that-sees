import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { industries } from "@/lib/industryData";
import { COUNTRIES } from "@/lib/geoData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BrandHexMark } from "@/components/BrandHexMark";
import { BrandWordmark } from "@/components/BrandWordmark";
import { ArrowRight, ArrowLeft, Check, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ROLES = [
  { value: "ceo", label: "CEO / Founder", icon: "👑" },
  { value: "executive", label: "C-Suite Executive", icon: "💼" },
  { value: "investor", label: "Investor / VC", icon: "💰" },
  { value: "analyst", label: "Analyst / Researcher", icon: "📊" },
  { value: "consultant", label: "Consultant / Advisor", icon: "🎯" },
  { value: "product_manager", label: "Product Manager", icon: "🚀" },
  { value: "engineer", label: "Engineer / Developer", icon: "⚙️" },
  { value: "journalist", label: "Journalist / Media", icon: "📰" },
  { value: "student", label: "Student / Academic", icon: "🎓" },
  { value: "government", label: "Government / Policy", icon: "🏛️" },
  { value: "entrepreneur", label: "Entrepreneur", icon: "🔥" },
  { value: "explorer", label: "Just Exploring", icon: "🔍" },
];

const GOALS = [
  { value: "market_research", label: "Market Research", icon: "📈" },
  { value: "investment", label: "Investment Decisions", icon: "💹" },
  { value: "competitive_intel", label: "Competitive Intelligence", icon: "🎯" },
  { value: "strategy", label: "Strategic Planning", icon: "🗺️" },
  { value: "trends", label: "Trend Spotting", icon: "🔮" },
  { value: "risk", label: "Risk Assessment", icon: "⚠️" },
  { value: "opportunities", label: "Opportunity Discovery", icon: "💡" },
  { value: "learning", label: "Learning & Education", icon: "📚" },
];

const EXPERIENCE = [
  { value: "beginner", label: "Beginner", desc: "New to industry intelligence" },
  { value: "intermediate", label: "Intermediate", desc: "Some experience with market analysis" },
  { value: "advanced", label: "Advanced", desc: "Experienced analyst or decision maker" },
  { value: "expert", label: "Expert", desc: "Deep domain expertise" },
];

export default function OnboardingPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [organization, setOrganization] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState("intermediate");

  const toggleItem = (arr: string[], item: string, setter: (a: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]);
  };

  const totalSteps = 5;

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName || null,
          organization: organization || null,
          title: title || null,
          bio: bio || null,
          role: role || "explorer",
          goals: selectedGoals,
          industries_of_interest: selectedIndustries,
          preferred_regions: selectedRegions,
          experience_level: experienceLevel,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success("Welcome to Intel GoldMine! Maverick will personalize your intelligence.");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const canAdvance = () => {
    if (step === 0) return !!displayName.trim();
    if (step === 1) return !!role;
    if (step === 2) return selectedGoals.length > 0;
    if (step === 3) return selectedIndustries.length > 0;
    return true;
  };

  const regions = COUNTRIES.slice(0, 30);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />

      <div className="relative z-10 w-full max-w-2xl">
        <div className="flex flex-col items-center mb-6">
          <BrandHexMark size="lg" />
          <h1 className="text-lg font-bold text-foreground mt-3">
            <BrandWordmark />
          </h1>
          <p className="text-[10px] text-muted-foreground mt-1">
            Let's personalize your intelligence experience
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-6 max-w-xs mx-auto">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= step ? "bg-primary" : "bg-border"
              )}
            />
          ))}
        </div>

        <div className="glass-panel p-6 glow-border min-h-[400px] flex flex-col">
          {/* Step 0: About You */}
          {step === 0 && (
            <div className="space-y-4 flex-1">
              <div className="text-center mb-4">
                <h2 className="text-sm font-bold text-foreground">About You</h2>
                <p className="text-[10px] text-muted-foreground">Tell us a bit about yourself</p>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-muted-foreground uppercase">Display Name *</Label>
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="How should we address you?" className="h-9 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-muted-foreground uppercase">Organization</Label>
                  <Input value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Company or institution" className="h-9 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-muted-foreground uppercase">Title / Position</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Head of Strategy" className="h-9 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-muted-foreground uppercase">Experience Level</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {EXPERIENCE.map((exp) => (
                      <button
                        key={exp.value}
                        type="button"
                        onClick={() => setExperienceLevel(exp.value)}
                        className={cn(
                          "p-2 rounded-md border text-left transition-all text-[10px]",
                          experienceLevel === exp.value
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border/40 bg-muted/10 text-muted-foreground hover:border-border"
                        )}
                      >
                        <span className="font-bold">{exp.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] text-muted-foreground uppercase">Bio (optional)</Label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Brief description of what you do and what intelligence you need..." className="min-h-[60px] text-xs" />
              </div>
            </div>
          )}

          {/* Step 1: Role */}
          {step === 1 && (
            <div className="space-y-4 flex-1">
              <div className="text-center mb-4">
                <h2 className="text-sm font-bold text-foreground">Your Role</h2>
                <p className="text-[10px] text-muted-foreground">This helps us tailor intelligence depth and format</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={cn(
                      "p-3 rounded-lg border text-left transition-all",
                      role === r.value
                        ? "border-primary bg-primary/10 glow-border"
                        : "border-border/40 bg-muted/10 hover:border-border"
                    )}
                  >
                    <span className="text-lg">{r.icon}</span>
                    <p className="text-[10px] font-bold text-foreground mt-1">{r.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Goals */}
          {step === 2 && (
            <div className="space-y-4 flex-1">
              <div className="text-center mb-4">
                <h2 className="text-sm font-bold text-foreground">Your Goals</h2>
                <p className="text-[10px] text-muted-foreground">Select all that apply — we'll prioritize intel accordingly</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {GOALS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => toggleItem(selectedGoals, g.value, setSelectedGoals)}
                    className={cn(
                      "p-3 rounded-lg border text-left transition-all flex items-center gap-2",
                      selectedGoals.includes(g.value)
                        ? "border-primary bg-primary/10"
                        : "border-border/40 bg-muted/10 hover:border-border"
                    )}
                  >
                    <span className="text-lg">{g.icon}</span>
                    <span className="text-[10px] font-bold text-foreground">{g.label}</span>
                    {selectedGoals.includes(g.value) && <Check className="w-3 h-3 text-primary ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Industries */}
          {step === 3 && (
            <div className="space-y-4 flex-1">
              <div className="text-center mb-4">
                <h2 className="text-sm font-bold text-foreground">Industries of Interest</h2>
                <p className="text-[10px] text-muted-foreground">Select industries you want to track — you can change these later</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 max-h-[340px] overflow-y-auto pr-1">
                {industries.map((ind) => (
                  <button
                    key={ind.slug}
                    type="button"
                    onClick={() => toggleItem(selectedIndustries, ind.slug, setSelectedIndustries)}
                    className={cn(
                      "p-2 rounded-md border text-left transition-all flex items-center gap-2",
                      selectedIndustries.includes(ind.slug)
                        ? "border-primary bg-primary/10"
                        : "border-border/40 bg-muted/10 hover:border-border"
                    )}
                  >
                    <span>{ind.icon}</span>
                    <span className="text-[9px] font-bold text-foreground flex-1 truncate">{ind.name}</span>
                    {selectedIndustries.includes(ind.slug) && <Check className="w-3 h-3 text-primary shrink-0" />}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setSelectedIndustries(industries.map((i) => i.slug))}
                className="text-[9px] text-primary hover:underline"
              >
                Select all industries
              </button>
            </div>
          )}

          {/* Step 4: Regions */}
          {step === 4 && (
            <div className="space-y-4 flex-1">
              <div className="text-center mb-4">
                <h2 className="text-sm font-bold text-foreground">Priority Regions</h2>
                <p className="text-[10px] text-muted-foreground">Optional — select regions to prioritize in your intel feed</p>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5 max-h-[300px] overflow-y-auto pr-1">
                {regions.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => toggleItem(selectedRegions, r.value, setSelectedRegions)}
                    className={cn(
                      "p-2 rounded-md border text-left transition-all",
                      selectedRegions.includes(r.value)
                        ? "border-primary bg-primary/10"
                        : "border-border/40 bg-muted/10 hover:border-border"
                    )}
                  >
                    <span className="text-[9px] font-bold text-foreground truncate block">{r.label}</span>
                    {selectedRegions.includes(r.value) && <Check className="w-3 h-3 text-primary mt-0.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/40">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="text-[10px] gap-1"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </Button>

            <span className="text-[9px] text-muted-foreground">
              {step + 1} / {totalSteps}
            </span>

            {step < totalSteps - 1 ? (
              <Button
                size="sm"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canAdvance()}
                className="text-[10px] gap-1"
              >
                Next <ArrowRight className="w-3 h-3" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleFinish}
                disabled={saving}
                className="text-[10px] gap-1 bg-primary"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                Launch Intel GoldMine
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
