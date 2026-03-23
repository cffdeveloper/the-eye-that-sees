import { useState, useEffect, useCallback, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { parseBlocks } from "@/lib/parseBlocks";
import { BlockRenderer } from "@/components/BlockRenderer";
import {
  Loader2,
  Globe,
  TrendingUp,
  AlertTriangle,
  Zap,
  BarChart3,
  ArrowRight,
  Activity,
  Radio,
  GitBranch,
} from "lucide-react";
import { industries } from "@/lib/industryData";
import { useNavigate } from "react-router-dom";
import { InlineMarkdown } from "@/components/InlineMarkdown";
import {
  getFlowsTouchingRegion,
  nearestMapRegion,
  regionIntelScore,
  type MapFlow,
} from "@/lib/mapRegionData";
import { useSubscription } from "@/hooks/useSubscription";
import { SaveIntelButton } from "@/components/saved/SaveIntelButton";
import { DownloadIntelPdfButton } from "@/components/saved/DownloadIntelPdfButton";
import { toast } from "sonner";
import {
  incrementTrialIntelPromptCount,
  trialIntelPromptsRemaining,
} from "@/lib/trialIntelStorage";

export interface RegionData {
  name: string;
  code: string;
  lat: number;
  lng: number;
  industries: string[];
  tradeVolume: string;
  disruptions: string[];
}

export type RegionAnalyticsScope =
  | { kind: "macro"; region: RegionData }
  | { kind: "country"; code: string; label: string; lat: number; lng: number };

interface RegionAnalyticsDialogProps {
  open: boolean;
  onClose: () => void;
  scope: RegionAnalyticsScope | null;
}

interface InsightRow {
  id: string;
  title: string;
  detail: string | null;
  insight_type: string;
  score: number | null;
  urgency: string | null;
  source_industry: string | null;
  created_at: string;
  geo_context: string[] | null;
}

interface MatchRow {
  id: string;
  title: string;
  description: string | null;
  match_type: string;
  confidence: number | null;
  estimated_value: string | null;
  industries: string[] | null;
  created_at: string;
}

export function RegionAnalyticsDialog({ open, onClose, scope }: RegionAnalyticsDialogProps) {
  const [insights, setInsights] = useState<InsightRow[]>([]);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [aiReport, setAiReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const navigate = useNavigate();
  const { isPro } = useSubscription();

  const macroRegion = useMemo(() => {
    if (!scope) return null;
    if (scope.kind === "macro") return scope.region;
    return nearestMapRegion(scope.lat, scope.lng);
  }, [scope]);

  const industryNames = useMemo(() => {
    if (!macroRegion) return [] as string[];
    return industries.filter((i) => macroRegion.industries.includes(i.slug)).map((i) => i.name);
  }, [macroRegion]);

  const flowsCorridor = useMemo<MapFlow[]>(
    () => (macroRegion ? getFlowsTouchingRegion(macroRegion.name) : []),
    [macroRegion],
  );

  const intelScore = useMemo(() => {
    if (!macroRegion) return 0;
    return regionIntelScore(macroRegion.disruptions.length, flowsCorridor.length);
  }, [macroRegion, flowsCorridor.length]);

  const fetchData = useCallback(async () => {
    if (!scope || !macroRegion) return;
    setLoading(true);
    setInsights([]);
    setMatches([]);
    setAiReport("");

    const names = industries.filter((i) => macroRegion.industries.includes(i.slug)).map((i) => i.name);
    const corridorCount = getFlowsTouchingRegion(macroRegion.name).length;
    const isCountry = scope.kind === "country";

    try {
      if (names.length > 0) {
        const { data: insightData } = await supabase
          .from("intel_insights")
          .select("*")
          .in("source_industry", names)
          .eq("still_relevant", true)
          .order("created_at", { ascending: false })
          .limit(20);

        if (insightData) setInsights(insightData as InsightRow[]);

        const { data: matchData } = await supabase
          .from("intel_matches")
          .select("*")
          .overlaps("industries", names)
          .order("created_at", { ascending: false })
          .limit(10);

        if (matchData) setMatches(matchData as MatchRow[]);
      }
    } catch (e) {
      console.error("Region analytics fetch error:", e);
    } finally {
      setLoading(false);
    }

    setReportLoading(true);
    try {
      if (isCountry && !isPro && trialIntelPromptsRemaining() <= 0) {
        toast.error("You've used all 3 free trial questions. Upgrade to Pro for unlimited intel.");
        setReportLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("deep-dive", {
        body:
          isCountry
            ? {
                topic: `${scope.label} — Country intelligence brief`,
                context: `Country focus: ${scope.label} (ISO ${scope.code}). Cover policy, FX and funding conditions, trade and capital formation, sector drivers, and material risks for actors operating **in this country only** — avoid treating the whole macro region as one thesis. Use "${macroRegion.name}" only as data-coverage context. Trade backdrop: ${macroRegion.tradeVolume}. Tracked industry lenses (slugs): ${macroRegion.industries.join(", ")}. Corridors touching shelf region ${macroRegion.name}: ${corridorCount}. Disruptions in wider shelf: ${macroRegion.disruptions.join("; ")}.`,
                industryName: names[0] || scope.label,
                subFlowName: "",
                geoContext: scope.label,
              }
            : {
                topic: `${macroRegion.name} — Regional intelligence command brief`,
                context: `Macro-region: ${macroRegion.name} (${macroRegion.code}). Trade: ${macroRegion.tradeVolume}. Tracked industries (slugs): ${macroRegion.industries.join(", ")}. Active disruptions: ${macroRegion.disruptions.join("; ")}. Trade corridors touching this region: ${corridorCount}. Produce a decisive executive brief: capital flows, policy/regulatory risk, sector rotation, and 3–5 actionable theses.`,
                industryName: names[0] || macroRegion.name,
                subFlowName: "",
                geoContext: macroRegion.name,
              },
      });
      if (error) throw error;
      const reportText = (data?.report as string | undefined)?.trim() || "";
      setAiReport(reportText);
      if (reportText && isCountry && !isPro) {
        incrementTrialIntelPromptCount();
        toast.success("Country intel brief ready (1 trial question used).");
      }
    } catch (e) {
      console.error("Region AI report error:", e);
    } finally {
      setReportLoading(false);
    }
  }, [scope, macroRegion, isPro]);

  useEffect(() => {
    if (open && scope && macroRegion) fetchData();
  }, [open, scope, macroRegion, fetchData]);

  if (!scope || !macroRegion) return null;

  const displayTitle = scope.kind === "country" ? scope.label : scope.region.name;
  const displayCode = scope.kind === "country" ? scope.code : scope.region.code;
  const displayLat = scope.kind === "country" ? scope.lat : scope.region.lat;
  const displayLng = scope.kind === "country" ? scope.lng : scope.region.lng;

  const reportSegments = aiReport ? parseBlocks(aiReport) : [];
  const regionIndustries = industries.filter((i) => macroRegion.industries.includes(i.slug));

  const urgencyColor = (u: string | null) => {
    if (u === "critical") return "text-destructive";
    if (u === "high") return "text-primary";
    return "text-muted-foreground";
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-5xl max-h-[92vh] flex flex-col gap-0 overflow-hidden bg-background border-border p-0 shadow-2xl shadow-primary/10 data-[state=open]:duration-300"
      >
        {/* Command-center header */}
        <div className="relative shrink-0 px-6 pt-6 pb-5 border-b border-border/50 overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: `linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />

          <DialogHeader className="relative">
            <div className="flex flex-wrap items-start gap-3 gap-y-2">
              <span className="inline-flex items-center gap-1.5 rounded border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                <Radio className="w-3 h-3 animate-pulse" />
                {displayCode}
              </span>
              <span className="rounded border border-border/60 bg-muted/30 px-2 py-0.5 text-[9px] text-muted-foreground">
                {displayLat.toFixed(1)}°, {displayLng.toFixed(1)}°
              </span>
            </div>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2 mt-2 pr-8">
              <Globe className="w-5 h-5 text-primary shrink-0" />
              <span>{displayTitle}</span>
              <span className="text-[10px] font-normal text-muted-foreground tracking-wide">
                {scope.kind === "country" ? "— COUNTRY INTEL" : "— REGIONAL INTEL COMMAND"}
              </span>
            </DialogTitle>
            <p className="text-[10px] text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              Live cross-reference of tracked industries, trade corridors, intel signals, and an AI brief tuned to this geography.
            </p>
          </DialogHeader>

          {/* KPI strip */}
          <div className="relative mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="rounded-lg border border-border/40 bg-background/60 px-3 py-2.5 backdrop-blur-sm">
              <p className="text-[8px] uppercase tracking-wider text-muted-foreground">Trade volume</p>
              <p className="text-sm font-bold text-primary">{macroRegion.tradeVolume}</p>
            </div>
            <div className="rounded-lg border border-border/40 bg-background/60 px-3 py-2.5 backdrop-blur-sm">
              <p className="text-[8px] uppercase tracking-wider text-muted-foreground">Infinity pulse</p>
              <p className="text-sm font-bold text-foreground">{intelScore}/100</p>
            </div>
            <div className="rounded-lg border border-border/40 bg-background/60 px-3 py-2.5 backdrop-blur-sm">
              <p className="text-[8px] uppercase tracking-wider text-muted-foreground">Corridors</p>
              <p className="text-sm font-bold text-accent">{flowsCorridor.length} active</p>
            </div>
            <div className="rounded-lg border border-border/40 bg-background/60 px-3 py-2.5 backdrop-blur-sm">
              <p className="text-[8px] uppercase tracking-wider text-muted-foreground">Industries</p>
              <p className="text-sm font-bold text-foreground">{industryNames.length} tracked</p>
            </div>
          </div>

          {macroRegion.disruptions.length > 0 && (
            <div className="relative mt-3 flex flex-wrap gap-2">
              {macroRegion.disruptions.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-destructive/10 border border-destructive/25"
                >
                  <Zap className="w-3 h-3 text-destructive shrink-0" />
                  <span className="text-[10px] text-destructive">{d}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 space-y-6">
          {/* Trade corridors — from global flow map */}
          {flowsCorridor.length > 0 && (
            <div>
              <h3 className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <GitBranch className="w-3 h-3 text-primary" />
                Trade corridors ({macroRegion.name} shelf)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {flowsCorridor.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border/30 bg-muted/10 px-3 py-2"
                  >
                    <div className="min-w-0 flex items-center gap-1.5 text-[10px] text-foreground">
                      <span className="truncate text-primary/90">{f.from}</span>
                      <ArrowRight className="w-3 h-3 shrink-0 text-muted-foreground" />
                      <span className="truncate text-primary/90">{f.to}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[9px] font-semibold text-foreground">{f.volume}</div>
                      <div className="text-[8px] text-muted-foreground">{f.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Industry grid */}
          <div>
            <h3 className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BarChart3 className="w-3 h-3 text-primary" />
              Key industries ({scope.kind === "country" ? `${displayTitle} lens` : `in ${displayTitle}`})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {regionIndustries.map((ind) => (
                <button
                  key={ind.slug}
                  onClick={() => {
                    onClose();
                    navigate(`/industry/${ind.slug}`);
                  }}
                  className="group glass-panel p-2.5 text-left hover:border-primary/50 hover:shadow-[0_0_20px_-4px_hsl(var(--primary)/0.35)] transition-all"
                >
                  <div className="text-base mb-1">{ind.icon}</div>
                  <div className="text-[10px] font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {ind.name}
                  </div>
                  <div className="text-[8px] text-muted-foreground">{ind.subFlows.length} flows</div>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8 gap-2">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="text-xs text-muted-foreground">Pulling signals from intelligence graph…</span>
            </div>
          ) : (
            <>
              {insights.length > 0 && (
                <div>
                  <h3 className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-primary" />
                    Latest signals ({insights.length})
                  </h3>
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {insights.map((ins) => (
                      <div key={ins.id} className="glass-panel p-2.5 flex items-start gap-2">
                        <div
                          className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                            ins.urgency === "critical"
                              ? "bg-destructive animate-pulse"
                              : ins.urgency === "high"
                                ? "bg-primary"
                                : "bg-muted-foreground/40"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-semibold text-foreground truncate">{ins.title}</div>
                          {ins.detail && (
                            <div className="text-[9px] text-muted-foreground line-clamp-3 mt-0.5 min-w-0">
                              <InlineMarkdown content={ins.detail} />
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {ins.source_industry && (
                              <span className="text-[8px] text-primary/70">{ins.source_industry}</span>
                            )}
                            {ins.urgency && (
                              <span className={`text-[8px] ${urgencyColor(ins.urgency)}`}>⚡ {ins.urgency}</span>
                            )}
                            {ins.score != null && (
                              <span className="text-[8px] text-accent">score: {ins.score}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matches.length > 0 && (
                <div>
                  <h3 className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-accent" />
                    Cross-industry connections ({matches.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {matches.slice(0, 6).map((m) => (
                      <div key={m.id} className="glass-panel p-2.5">
                        <div className="text-[10px] font-semibold text-foreground truncate">{m.title}</div>
                        {m.description && (
                          <div className="text-[9px] text-muted-foreground line-clamp-2 mt-0.5 min-w-0 [&_p]:inline">
                            <InlineMarkdown content={m.description} />
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {m.confidence != null && (
                            <span className="text-[8px] text-primary">conf: {Math.round(m.confidence * 100)}%</span>
                          )}
                          {m.estimated_value && (
                            <span className="text-[8px] text-accent">{m.estimated_value}</span>
                          )}
                          <span className="text-[8px] text-muted-foreground">{m.match_type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* AI deep-dive report */}
          <div>
            <h3 className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-primary" />
              AI regional briefing (structured)
            </h3>
            {reportLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 rounded-lg border border-dashed border-primary/20 bg-primary/5">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <p className="text-[10px] text-muted-foreground">Generating {displayTitle} command brief…</p>
                <p className="text-[8px] text-muted-foreground/50 text-center max-w-md">
                  Weaving corridors, disruptions, and industry signals into a single structured report
                </p>
              </div>
            ) : reportSegments.length > 0 ? (
              <div className="space-y-2">
                <div className="flex flex-wrap justify-end gap-2">
                  <DownloadIntelPdfButton
                    contentRootId="region-analytics-ai-report"
                    documentTitle={`${displayTitle} — regional briefing`}
                    size="sm"
                    className="h-8 text-[10px]"
                  />
                  <SaveIntelButton
                    title={`${displayTitle} — regional briefing`}
                    subtitle="AI regional briefing (structured)"
                    source="region_analytics"
                    sourceDetail={displayTitle}
                    getBody={() => aiReport}
                    size="sm"
                    className="h-8 text-[10px]"
                  />
                </div>
                <div
                  id="region-analytics-ai-report"
                  className="glass-panel p-4 min-w-0 max-w-full border border-border/40"
                >
                  <BlockRenderer segments={reportSegments} />
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground text-center py-8 rounded-lg border border-border/30 bg-muted/5">
                No AI briefing yet — run more intel jobs or try again shortly.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
