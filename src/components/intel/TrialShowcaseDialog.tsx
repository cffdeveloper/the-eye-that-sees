import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { industries } from "@/lib/industryData";
import type { GeoOption } from "@/lib/geoData";
import { CONTINENTS, COUNTRIES, getGeoContextString } from "@/lib/geoData";
import { parseBlocks } from "@/lib/parseBlocks";
import { BlockRenderer } from "@/components/BlockRenderer";
import { UpgradeButton } from "@/components/SubscriptionGate";
import {
  getTrialIntelPromptCount,
  incrementTrialIntelPromptCount,
  trialIntelPromptsRemaining,
  TRIAL_INTEL_MAX_PROMPTS,
} from "@/lib/trialIntelStorage";
import { cn } from "@/lib/utils";
import { SaveIntelButton } from "@/components/saved/SaveIntelButton";
import { DownloadIntelPdfButton } from "@/components/saved/DownloadIntelPdfButton";
import { toast } from "sonner";
import { Loader2, Presentation, ChevronRight, ChevronLeft, Globe2, BadgeCheck } from "lucide-react";

const GEO_POOL: GeoOption[] = [...CONTINENTS, ...COUNTRIES];

const LOADING_MESSAGES = [
  "Mapping your profile to scope and tone…",
  "Gathering live signals from news and filings…",
  "Cross-referencing industries and capital lanes…",
  "Simulating structured intelligence blocks…",
  "Stress-testing numbers and frameworks…",
  "Almost there — tightening the narrative…",
];

type ScopeMode = "all" | "industries" | "flows";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TrialShowcaseDialog({ open, onOpenChange }: Props) {
  const { profile } = useAuth();
  const [step, setStep] = useState(1);
  const [specialization, setSpecialization] = useState("");
  const [wholeGlobe, setWholeGlobe] = useState(true);
  const [geoSelections, setGeoSelections] = useState<GeoOption[]>([]);
  const [geoSearch, setGeoSearch] = useState("");
  const [scopeMode, setScopeMode] = useState<ScopeMode>("all");
  const [pickedIndustries, setPickedIndustries] = useState<Set<number>>(new Set());
  const [pickedFlows, setPickedFlows] = useState<Set<string>>(new Set());
  const [userPrompt, setUserPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusIdx, setStatusIdx] = useState(0);
  const [report, setReport] = useState<string | null>(null);

  const filteredGeo = useMemo(() => {
    const q = geoSearch.trim().toLowerCase();
    if (!q) return GEO_POOL.slice(0, 120);
    return GEO_POOL.filter((g) => g.label.toLowerCase().includes(q)).slice(0, 200);
  }, [geoSearch]);

  const resetForNewSession = useCallback(() => {
    setStep(1);
    setSpecialization("");
    setWholeGlobe(true);
    setGeoSelections([]);
    setGeoSearch("");
    setScopeMode("all");
    setPickedIndustries(new Set());
    setPickedFlows(new Set());
    setUserPrompt("");
    setReport(null);
    setLoading(false);
    setStatusIdx(0);
  }, []);

  useEffect(() => {
    if (!open) {
      resetForNewSession();
    }
  }, [open, resetForNewSession]);

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => {
      setStatusIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2400);
    return () => clearInterval(t);
  }, [loading]);

  const toggleGeo = (opt: GeoOption) => {
    setGeoSelections((prev) => {
      const has = prev.find((p) => p.value === opt.value);
      if (has) return prev.filter((p) => p.value !== opt.value);
      return [...prev, opt];
    });
  };

  const industryNames = useMemo(() => {
    return industries.filter((i) => pickedIndustries.has(i.id)).map((i) => i.name);
  }, [pickedIndustries]);

  const flowDescriptors = useMemo(() => {
    const out: string[] = [];
    for (const ind of industries) {
      for (const sf of ind.subFlows) {
        if (pickedFlows.has(sf.id)) {
          out.push(`${ind.name} → ${sf.shortName}: ${sf.name}`);
        }
      }
    }
    return out;
  }, [pickedFlows]);

  const canStep1 = specialization.trim().length >= 8;
  const canStep2 = wholeGlobe || geoSelections.length > 0;
  const canStep3 =
    scopeMode === "all" ||
    (scopeMode === "industries" && pickedIndustries.size > 0) ||
    (scopeMode === "flows" && pickedFlows.size > 0);
  const canStep4 = userPrompt.trim().length >= 10;

  const runTrial = async () => {
    const used = getTrialIntelPromptCount();
    if (used >= TRIAL_INTEL_MAX_PROMPTS) {
      toast.error(`You’ve used all ${TRIAL_INTEL_MAX_PROMPTS} trial questions. Upgrade to Pro for unlimited intel.`);
      return;
    }
    if (!canStep4) {
      toast.error("Add a bit more detail to your question.");
      return;
    }

    setLoading(true);
    setReport(null);
    setStatusIdx(0);

    const geoLabels = wholeGlobe ? [] : geoSelections.map((g) => g.label);

    try {
      const { data, error } = await supabase.functions.invoke("trial-showcase-intel", {
        body: {
          specialization: specialization.trim(),
          userPrompt: userPrompt.trim(),
          geoLabels,
          scopeMode,
          industryNames: scopeMode === "industries" ? industryNames : [],
          flowDescriptors: scopeMode === "flows" ? flowDescriptors : [],
          profileHint: {
            display_name: profile?.display_name ?? "",
            organization: profile?.organization ?? "",
            role: profile?.role ?? "",
            industries_of_interest: profile?.industries_of_interest ?? [],
            preferred_regions: profile?.preferred_regions ?? [],
          },
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const r = data?.report as string | undefined;
      if (!r?.trim()) throw new Error("No report returned");

      setReport(r);
      incrementTrialIntelPromptCount();
      toast.success("Intel brief ready.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const segments = report ? parseBlocks(report) : [];
  const remaining = trialIntelPromptsRemaining();

  const stepLabel = (n: number) => (
    <span
      className={cn(
        "inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-md border text-xs font-semibold tabular-nums",
        step === n
          ? "border-primary bg-primary text-primary-foreground"
          : step > n
            ? "border-primary/35 bg-primary/10 text-primary"
            : "border-border bg-muted/50 text-muted-foreground",
      )}
    >
      {n}
    </span>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(100%,720px)] max-h-[min(92vh,880px)] flex flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <div className="shrink-0 border-b border-border/60 px-5 py-4 sm:px-6">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              {report ? (
                <>
                  <BadgeCheck className="h-5 w-5 text-primary shrink-0" aria-hidden />
                  Showcase brief ready
                </>
              ) : loading ? (
                <>
                  <Loader2 className="h-5 w-5 text-primary shrink-0 animate-spin" aria-hidden />
                  Generating your brief…
                </>
              ) : (
                <>
                  <Presentation className="h-5 w-5 text-primary shrink-0" aria-hidden />
                  Try Infinitygap — free showcase
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm leading-relaxed">
              {report ? (
                <>
                  Your tailored intel is below — export, start over, or upgrade for unlimited questions.
                </>
              ) : loading ? (
                <>Large models can take a minute — status messages rotate so you can see the pipeline working.</>
              ) : (
                <>
                  One guided question on us. We calibrate to who you are, where you care about, and what you want tested — then
                  return the same structured brief style as Pro (metrics, cards, frameworks).
                </>
              )}
            </DialogDescription>
            <p className="text-[11px] font-semibold text-muted-foreground pt-1">
              {remaining === 0 ? (
                <span className="text-amber-600 dark:text-amber-400">Trial questions used ({TRIAL_INTEL_MAX_PROMPTS}/{TRIAL_INTEL_MAX_PROMPTS}).</span>
              ) : (
                <span>
                  {remaining} trial question{remaining === 1 ? "" : "s"} remaining
                </span>
              )}
            </p>
          </DialogHeader>
          {!report && (
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              {stepLabel(1)}
              <span className="text-border select-none" aria-hidden>
                —
              </span>
              {stepLabel(2)}
              <span className="text-border select-none" aria-hidden>
                —
              </span>
              {stepLabel(3)}
              <span className="text-border select-none" aria-hidden>
                —
              </span>
              {stepLabel(4)}
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-semibold text-foreground min-h-[3rem] px-2 transition-opacity duration-300">
                {LOADING_MESSAGES[statusIdx]}
              </p>
              <p className="text-[11px] text-muted-foreground max-w-sm">
                Large models can take a minute — we cycle status so you see the pipeline working.
              </p>
            </div>
          )}

          {!loading && report && (
            <div className="space-y-4">
              <div className="rounded-xl border border-primary/25 bg-primary/[0.04] px-4 py-3 text-sm text-foreground">
                <span className="font-bold">Showcase brief</span>
                <span className="text-muted-foreground"> — tailored to your profile and scope</span>
              </div>
              <div id="trial-report-content">
                <BlockRenderer segments={segments} />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end pt-2">
                <DownloadIntelPdfButton
                  contentRootId="trial-report-content"
                  documentTitle="Intelligence Brief"
                  className="w-full sm:w-auto"
                />
                <SaveIntelButton
                  title="Showcase intelligence brief"
                  subtitle="Try Infinitygap — free showcase"
                  source="trial_showcase"
                  sourceDetail={specialization.trim().slice(0, 120) || undefined}
                  getBody={() => report ?? ""}
                  className="w-full sm:w-auto"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl w-full sm:w-auto"
                  onClick={() => {
                    resetForNewSession();
                  }}
                >
                  Start over
                </Button>
                <UpgradeButton className="rounded-xl font-bold w-full sm:w-auto" />
              </div>
            </div>
          )}

          {!loading && !report && remaining === 0 && step === 1 && (
            <div className="text-center py-10 space-y-3">
              <p className="text-sm text-muted-foreground">You’ve used all trial questions on this device.</p>
              <div className="flex justify-center">
                <UpgradeButton className="rounded-xl font-bold" />
              </div>
            </div>
          )}

          {!loading && !report && remaining > 0 && (
            <>
              {step === 1 && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Who are you — and what do you focus on?</Label>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    We use this to calibrate tone, depth, and which examples matter (e.g. consultant vs operator vs investor).
                  </p>
                  <Textarea
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Senior consultant at a boutique firm; I help mid-market industrials with pricing and supply chain risk in East Africa…"
                    className="min-h-[140px] rounded-xl border-border/60 text-sm"
                  />
                  <Button
                    type="button"
                    className="w-full rounded-xl font-bold sm:w-auto"
                    disabled={!canStep1}
                    onClick={() => setStep(2)}
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
                    <Checkbox
                      id="whole-globe"
                      checked={wholeGlobe}
                      onCheckedChange={(v) => {
                        setWholeGlobe(v === true);
                        if (v === true) setGeoSelections([]);
                      }}
                    />
                    <button
                      type="button"
                      className="text-left space-y-0.5"
                      onClick={() => {
                        setWholeGlobe((w) => !w);
                        if (!wholeGlobe) setGeoSelections([]);
                      }}
                    >
                      <label htmlFor="whole-globe" className="text-sm font-semibold cursor-pointer flex items-center gap-2">
                        <Globe2 className="h-4 w-4 text-primary" />
                        Whole globe
                      </label>
                      <p className="text-xs text-muted-foreground">No regional filter — we still name local hotspots when useful.</p>
                    </button>
                  </div>

                  {!wholeGlobe && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold">Regions & countries (multi-select)</Label>
                        <Input
                          value={geoSearch}
                          onChange={(e) => setGeoSearch(e.target.value)}
                          placeholder="Search countries or continents…"
                          className="rounded-xl h-10 text-sm"
                        />
                        <ScrollArea className="h-[200px] rounded-xl border border-border/50 bg-card p-2">
                          <div className="space-y-1 pr-2">
                            {filteredGeo.map((opt) => {
                              const checked = !!geoSelections.find((g) => g.value === opt.value);
                              return (
                                <button
                                  key={opt.value + opt.type}
                                  type="button"
                                  onClick={() => toggleGeo(opt)}
                                  className={cn(
                                    "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors",
                                    checked ? "bg-primary/10 text-foreground" : "hover:bg-muted/50",
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "h-3.5 w-3.5 shrink-0 rounded border",
                                      checked ? "border-primary bg-primary" : "border-border",
                                    )}
                                  />
                                  <span className="truncate">{opt.label}</span>
                                  <span className="truncate text-[10px] text-muted-foreground capitalize">{opt.type}</span>
                                </button>
                              );
                            })}
                          </div>
                        </ScrollArea>
                        <p className="text-[10px] text-muted-foreground">
                          Selected: {geoSelections.length ? getGeoContextString(geoSelections) : "none"}
                        </p>
                      </div>
                    </>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" className="rounded-xl" onClick={() => setStep(1)}>
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      type="button"
                      className="rounded-xl font-bold"
                      disabled={!canStep2}
                      onClick={() => setStep(3)}
                    >
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">What should we analyse?</Label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {(
                        [
                          ["all", "All industries & flows", "Broad lens — we prioritize what fits your question."],
                          ["industries", "Pick industries", "Narrow to specific sectors."],
                          ["flows", "Pick money flows", "Specific lanes (e.g. SaaS, MNO)."],
                        ] as const
                      ).map(([k, title, desc]) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setScopeMode(k as ScopeMode)}
                          className={cn(
                            "rounded-xl border px-3 py-2.5 text-left text-xs transition-all",
                            scopeMode === k
                              ? "border-primary bg-primary/10 shadow-sm"
                              : "border-border/60 hover:bg-muted/40",
                          )}
                        >
                          <p className="font-bold text-foreground">{title}</p>
                          <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {scopeMode === "industries" && (
                    <ScrollArea className="h-[220px] rounded-xl border border-border/50 bg-card p-3">
                      <div className="space-y-2 pr-2">
                        {industries.map((ind) => (
                          <label
                            key={ind.id}
                            className="flex items-center gap-2 text-xs cursor-pointer rounded-lg px-1 py-1 hover:bg-muted/40"
                          >
                            <Checkbox
                              checked={pickedIndustries.has(ind.id)}
                              onCheckedChange={() => {
                                setPickedIndustries((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(ind.id)) next.delete(ind.id);
                                  else next.add(ind.id);
                                  return next;
                                });
                              }}
                            />
                            <span>
                              {ind.icon} {ind.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </ScrollArea>
                  )}

                  {scopeMode === "flows" && (
                    <ScrollArea className="h-[220px] rounded-xl border border-border/50 bg-card p-3">
                      <div className="space-y-2 pr-2">
                        {industries.map((ind) => (
                          <div key={ind.id} className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                              {ind.icon} {ind.name}
                            </p>
                            <div className="pl-2 space-y-1">
                              {ind.subFlows.map((sf) => (
                                <label key={sf.id} className="flex items-start gap-2 text-[11px] cursor-pointer">
                                  <Checkbox
                                    checked={pickedFlows.has(sf.id)}
                                    onCheckedChange={() => {
                                      setPickedFlows((prev) => {
                                        const next = new Set(prev);
                                        if (next.has(sf.id)) next.delete(sf.id);
                                        else next.add(sf.id);
                                        return next;
                                      });
                                    }}
                                    className="mt-0.5"
                                  />
                                  <span>
                                    <span className="font-semibold text-foreground">{sf.shortName}</span> — {sf.name}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" className="rounded-xl" onClick={() => setStep(2)}>
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      type="button"
                      className="rounded-xl font-bold"
                      disabled={!canStep3}
                      onClick={() => setStep(4)}
                    >
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Your question</Label>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    One sharp question — we&apos;ll answer with the same structured blocks as Pro deep dives.
                  </p>
                  <Textarea
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="What should we stress-test for you? (e.g. Where is the margin leak in X for my region?)"
                    className="min-h-[140px] rounded-xl border-border/60 text-sm"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" className="rounded-xl" onClick={() => setStep(3)}>
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      type="button"
                      className="rounded-xl font-bold"
                      disabled={!canStep4}
                      onClick={runTrial}
                    >
                      Generate intel
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
