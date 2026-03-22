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
import { motion, AnimatePresence } from "framer-motion";

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
  { value: "intermediate", label: "Intermediate", desc: "Some market analysis experience" },
  { value: "advanced", label: "Advanced", desc: "Experienced decision maker" },
  { value: "expert", label: "Expert", desc: "Deep domain expertise" },
];

const STEP_TITLES = [
  { title: "About you", subtitle: "Let's personalize your experience" },
  { title: "Your role", subtitle: "This helps us tailor intel depth and format" },
  { title: "Your goals", subtitle: "Select all that apply" },
  { title: "Industries", subtitle: "Pick the sectors you want to track" },
  { title: "Regions", subtitle: "Optional — prioritize regions in your feed" },
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
      toast.success("Welcome to Intel GoldMine! 🎉");
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <BrandHexMark size="lg" />
          <h1 className="text-lg font-bold text-foreground mt-4">
            <BrandWordmark />
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Let's set up your intelligence experience
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-2 max-w-xs mx-auto">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-300",
                i <= step ? "bg-primary" : "bg-border"
              )}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mb-6">
          Step {step + 1} of {totalSteps}
        </p>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-lg min-h-[420px] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
              className="flex-1"
            >
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold text-foreground">{STEP_TITLES[step].title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{STEP_TITLES[step].subtitle}</p>
              </div>

              {/* Step 0: About You */}
              {step === 0 && (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Display Name *</Label>
                      <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="How should we call you?" className="h-11 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Organization</Label>
                      <Input value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Company or institution" className="h-11 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Title / Position</Label>
                      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Head of Strategy" className="h-11 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Experience Level</Label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {EXPERIENCE.map((exp) => (
                          <button
                            key={exp.value}
                            type="button"
                            onClick={() => setExperienceLevel(exp.value)}
                            className={cn(
                              "p-2.5 rounded-xl border text-left transition-all text-xs",
                              experienceLevel === exp.value
                                ? "border-primary bg-primary/8 text-foreground ring-1 ring-primary/20"
                                : "border-border bg-background text-muted-foreground hover:border-primary/30"
                            )}
                          >
                            <span className="font-semibold">{exp.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Bio (optional)</Label>
                    <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Brief description of what you do..." className="min-h-[70px] text-sm rounded-xl" />
                  </div>
                </div>
              )}

              {/* Step 1: Role */}
              {step === 1 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={cn(
                        "p-3.5 rounded-xl border text-left transition-all",
                        role === r.value
                          ? "border-primary bg-primary/8 ring-1 ring-primary/20"
                          : "border-border bg-background hover:border-primary/30"
                      )}
                    >
                      <span className="text-xl">{r.icon}</span>
                      <p className="text-xs font-semibold text-foreground mt-1.5">{r.label}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 2: Goals */}
              {step === 2 && (
                <div className="grid grid-cols-2 gap-2.5">
                  {GOALS.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => toggleItem(selectedGoals, g.value, setSelectedGoals)}
                      className={cn(
                        "p-3.5 rounded-xl border text-left transition-all flex items-center gap-2.5",
                        selectedGoals.includes(g.value)
                          ? "border-primary bg-primary/8 ring-1 ring-primary/20"
                          : "border-border bg-background hover:border-primary/30"
                      )}
                    >
                      <span className="text-xl">{g.icon}</span>
                      <span className="text-xs font-semibold text-foreground flex-1">{g.label}</span>
                      {selectedGoals.includes(g.value) && <Check className="w-4 h-4 text-primary shrink-0" />}
                    </button>
                  ))}
                </div>
              )}

              {/* Step 3: Industries */}
              {step === 3 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[320px] overflow-y-auto pr-1">
                    {industries.map((ind) => (
                      <button
                        key={ind.slug}
                        type="button"
                        onClick={() => toggleItem(selectedIndustries, ind.slug, setSelectedIndustries)}
                        className={cn(
                          "p-2.5 rounded-xl border text-left transition-all flex items-center gap-2",
                          selectedIndustries.includes(ind.slug)
                            ? "border-primary bg-primary/8 ring-1 ring-primary/20"
                            : "border-border bg-background hover:border-primary/30"
                        )}
                      >
                        <span>{ind.icon}</span>
                        <span className="text-xs font-semibold text-foreground flex-1 truncate">{ind.name}</span>
                        {selectedIndustries.includes(ind.slug) && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedIndustries(industries.map((i) => i.slug))}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Select all industries
                  </button>
                </div>
              )}

              {/* Step 4: Regions */}
              {step === 4 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[320px] overflow-y-auto pr-1">
                  {regions.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => toggleItem(selectedRegions, r.value, setSelectedRegions)}
                      className={cn(
                        "p-2.5 rounded-xl border text-left transition-all",
                        selectedRegions.includes(r.value)
                          ? "border-primary bg-primary/8 ring-1 ring-primary/20"
                          : "border-border bg-background hover:border-primary/30"
                      )}
                    >
                      <span className="text-xs font-semibold text-foreground truncate block">{r.label}</span>
                      {selectedRegions.includes(r.value) && <Check className="w-3.5 h-3.5 text-primary mt-0.5" />}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-5 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="gap-1.5 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>

            {step < totalSteps - 1 ? (
              <Button
                size="sm"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canAdvance()}
                className="gap-1.5 rounded-xl px-6"
              >
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleFinish}
                disabled={saving}
                className="gap-1.5 rounded-xl px-6"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Launch Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
