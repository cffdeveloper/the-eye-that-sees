import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bot, BrainCircuit, CalendarDays, Clock, Loader2, RefreshCw, ScanSearch, Sparkles, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useGeoContext } from "@/contexts/GeoContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { ProUpgradePrompt, ProGateLoading, useIsFreeUser } from "@/components/ProUpgradePrompt";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { PageIntro } from "@/components/marketing/ProductWayfinding";
import { cn } from "@/lib/utils";
import { assistantDeepDivePath } from "@/lib/assistantBranding";
import {
  opportunityDeskTitle,
  profileFirstName,
  trainActionLabel,
} from "@/lib/profileDisplayName";
import {
  appendTrainingEntry,
  getTrainingCorpus,
  insightsNeedRefresh,
  loadInsightsCache,
  loadTrainingEntries,
  msUntilNextRefresh,
  normalizeInsight,
  saveInsightsCache,
  type AlfredInsight,
  type AlfredInsightsBundle,
} from "@/lib/alfredStorage";
import { useProactiveGaps } from "@/hooks/useProactiveGaps";
import { formatDistanceToNow } from "date-fns";
import { AlfredEventsPanel } from "@/components/desk/AlfredEventsPanel";
import { AlfredReadPanel } from "@/components/desk/AlfredReadPanel";

type DeskSection = "desk" | "events" | "read";

const FREE_INSIGHT_LIMIT = 2;
const FREE_EXEC_SUMMARY_CHARS = 480;

function formatDuration(ms: number): string {
  if (ms <= 0) return "now";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h >= 48) return `${Math.floor(h / 24)}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function priorityLabel(p: number): { text: string; className: string } {
  if (p >= 85) return { text: "Urgent", className: "bg-destructive/15 text-destructive border-destructive/25" };
  if (p >= 70) return { text: "High", className: "bg-brand-orange/15 text-brand-orange border-brand-orange/25" };
  if (p >= 50) return { text: "Medium", className: "bg-primary/12 text-primary border-primary/20" };
  return { text: "Watch", className: "bg-muted text-muted-foreground border-border" };
}

function InsightMetaRow({ insight, rank }: { insight: AlfredInsight; rank: number }) {
  const badge = priorityLabel(insight.priority);
  return (
    <div className="flex flex-wrap items-start justify-between gap-2 gap-y-2">
      <div className="flex flex-wrap items-center gap-2 min-w-0">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
          {rank}
        </span>
        <h3 className="font-display text-sm font-bold leading-snug text-foreground sm:text-base min-w-0">{insight.title}</h3>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border",
            badge.className,
          )}
        >
          {badge.text} · {insight.priority}
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground font-medium capitalize">
          {insight.category.replace(/_/g, " ")}
        </span>
        <span className="text-[10px] text-muted-foreground">{insight.timing.replace(/_/g, " ")}</span>
      </div>
    </div>
  );
}

function InsightCard({
  insight,
  rank,
  allowDeepDive,
}: {
  insight: AlfredInsight;
  rank: number;
  allowDeepDive: boolean;
}) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-border/50 bg-card/80 p-4 sm:p-5 shadow-sm",
        "transition-colors hover:border-primary/20",
      )}
    >
      <InsightMetaRow insight={insight} rank={rank} />
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{insight.summary}</p>
      {insight.actions.length > 0 && (
        <ol className="mt-3 space-y-1.5 text-xs text-foreground/90 list-decimal list-inside">
          {insight.actions.map((a, i) => (
            <li key={i} className="leading-relaxed pl-0.5">
              {a}
            </li>
          ))}
        </ol>
      )}
      {insight.caveats.length > 0 && (
        <ul className="mt-3 space-y-1 text-[11px] text-amber-700/90 dark:text-amber-400/90 leading-relaxed border-t border-border/40 pt-3">
          {insight.caveats.map((c, i) => (
            <li key={i}>• {c}</li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-border/40 pt-4">
        {allowDeepDive ? (
          <Button type="button" variant="secondary" size="sm" className="rounded-lg gap-1.5 font-semibold" asChild>
            <Link to={assistantDeepDivePath(insight.id)}>
              <ScanSearch className="h-3.5 w-3.5 shrink-0" />
              Full deep dive
            </Link>
          </Button>
        ) : (
          <div className="w-full min-w-0 rounded-xl border border-border/50 bg-muted/15 p-3">
            <ProUpgradePrompt
              compact
              feature="Full deep-dive briefs with cross-industry analysis and execution maps are included with Pro."
            />
          </div>
        )}
      </div>
    </article>
  );
}

export default function OpportunityDeskPage() {
  const { geoString, isGlobal } = useGeoContext();
  const { profile, user } = useAuth();
  const { loading: subscriptionLoading } = useSubscription();
  const { isFree, isPro } = useIsFreeUser();
  const {
    rows: proactiveRows,
    loading: proactiveLoading,
    lastUpdated: proactiveLastUpdated,
  } = useProactiveGaps(isPro);

  const [trainOpen, setTrainOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [training, setTraining] = useState<ReturnType<typeof loadTrainingEntries>>([]);
  const [cache, setCache] = useState<AlfredInsightsBundle | null>(() => loadInsightsCache());
  const [loading, setLoading] = useState(false);
  const [autoRan, setAutoRan] = useState(false);
  const [deskSection, setDeskSection] = useState<DeskSection>("desk");

  const pageTitle = opportunityDeskTitle(profile, user?.email);
  const addressAs = profileFirstName(profile, user?.email);
  const trainLabel = trainActionLabel(profile, user?.email);

  const refreshTraining = useCallback(() => {
    setTraining(loadTrainingEntries());
  }, []);

  useEffect(() => {
    refreshTraining();
  }, [refreshTraining]);

  const geoHint = isGlobal ? "global markets" : geoString;

  const runInsights = useCallback(
    async (opts?: { silent?: boolean }) => {
      setLoading(true);
      try {
        const corpus = getTrainingCorpus();
        const { data, error } = await supabase.functions.invoke("alfred-opportunities", {
          body: {
            trainingCorpus: corpus,
            geoHint,
            addressAs: addressAs || undefined,
            mergeProactiveGaps: isPro,
          },
        });
        if (error) throw error;
        if (data?.error) throw new Error(typeof data.error === "string" ? data.error : "Request failed");

        const bundle = saveInsightsCache({
          executiveSummary: data.executiveSummary || "",
          insights: data.insights || [],
          disclaimer: data.disclaimer || undefined,
        });
        setCache(bundle);
        if (!opts?.silent) toast.success("Opportunity deck updated");
      } catch (e) {
        console.error(e);
        toast.error(e instanceof Error ? e.message : "Could not refresh insights");
      } finally {
        setLoading(false);
      }
    },
    [geoHint, addressAs, isPro],
  );

  useEffect(() => {
    if (autoRan) return;
    const c = loadInsightsCache();
    if (insightsNeedRefresh(c)) {
      setAutoRan(true);
      void runInsights({ silent: true });
    } else {
      setAutoRan(true);
    }
  }, [autoRan, runInsights]);

  const nextRefreshMs = useMemo(() => msUntilNextRefresh(cache), [cache]);
  const needsRefresh = useMemo(() => insightsNeedRefresh(cache), [cache]);

  const allInsights = cache?.insights ?? [];
  const visibleInsights = useMemo(() => {
    if (isPro) return allInsights;
    return allInsights.slice(0, FREE_INSIGHT_LIMIT);
  }, [allInsights, isPro]);

  const lockedCount = isPro ? 0 : Math.max(0, allInsights.length - FREE_INSIGHT_LIMIT);

  const executiveRead = cache?.executiveSummary ?? "";
  const executivePreview = useMemo(() => {
    if (isPro || executiveRead.length <= FREE_EXEC_SUMMARY_CHARS) return executiveRead;
    return `${executiveRead.slice(0, FREE_EXEC_SUMMARY_CHARS).trim()}…`;
  }, [executiveRead, isPro]);

  const saveTraining = () => {
    try {
      appendTrainingEntry(draft);
      setDraft("");
      setTrainOpen(false);
      refreshTraining();
      toast.success("Notes saved — they’ll shape your next refresh.");
    } catch {
      toast.error("Add some text before saving");
    }
  };

  if (subscriptionLoading) {
    return (
      <div className="mx-auto max-w-3xl pb-12">
        <ProGateLoading />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12">
      {deskSection === "desk" && (
        <PageIntro eyebrow="Personal opportunity desk" title="What this page does">
          <ol className="list-decimal list-inside space-y-1.5 [&>li]:pl-0.5">
            <li>
              <strong className="text-foreground">Train</strong> Infinitygap on your goals, skills, capital, and time — same notes
              power every run.
            </li>
            <li>
              <strong className="text-foreground">Get a ranked deck</strong> of cross-industry ideas and gaps you could monetize or
              position on (refreshes every 24h).
            </li>
            <li>
              <strong className="text-foreground">Deep dive</strong> any card for a long-form analyst-style brief —{" "}
              <strong className="text-foreground">Pro</strong> unlocks full deep dives and the full opportunity list.
            </li>
          </ol>
          <p>
            Free accounts see a <strong className="text-foreground">preview</strong> of the executive read and the top {FREE_INSIGHT_LIMIT}{" "}
            ideas. Upgrade for the full deck, complete summaries, and deep dives.
          </p>
        </PageIntro>
      )}

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 border border-primary/20">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{pageTitle}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Trains on what you share in notes — refreshes every 24 hours. Geography: {geoHint}.
            </p>
            {isFree && (
              <p className="text-[11px] font-semibold text-primary mt-1.5">
                Preview mode — upgrade for the full brief, all ideas, and deep dives.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Dialog open={trainOpen} onOpenChange={setTrainOpen}>
            <DialogTrigger asChild>
              <Button type="button" className="rounded-xl font-semibold gap-2 w-full sm:w-auto">
                <BrainCircuit className="h-4 w-4 shrink-0" />
                {trainLabel}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[min(90dvh,40rem)] flex flex-col">
              <DialogHeader>
                <DialogTitle>{trainLabel}</DialogTitle>
                <DialogDescription>
                  We use this text to personalize your deck — skills, capital, risk, country, goals, what you&apos;ve tried, hours
                  per week, and how you want to earn. Every save is merged into future runs.
                </DialogDescription>
              </DialogHeader>
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Example: I'm in Nairobi, can invest ~$500/month, comfortable with medium risk, not a developer but I can learn tools. I want side income and long-term stocks. I have 8 hours/week..."
                className="min-h-[200px] max-h-[min(50dvh,22rem)] text-sm rounded-xl resize-y"
              />
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" className="rounded-xl" onClick={() => setTrainOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" className="rounded-xl font-semibold" onClick={saveTraining}>
                  Save to memory
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            type="button"
            variant="outline"
            className="rounded-xl font-semibold gap-2 w-full sm:w-auto"
            disabled={loading}
            onClick={() => runInsights()}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh insights now
          </Button>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground sm:ml-auto">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
              {training.length} training note{training.length === 1 ? "" : "s"} saved
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              {cache
                ? needsRefresh
                  ? "Overdue for 24h refresh"
                  : `Next refresh in ${formatDuration(nextRefreshMs)}`
                : "No deck yet"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 rounded-xl border border-border/50 bg-muted/30 p-1.5">
          {(
            [
              ["desk", "Opportunities", Bot],
              ["events", "Events", CalendarDays],
              ["read", "Read", BookOpen],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setDeskSection(id)}
              className={cn(
                "inline-flex flex-1 min-w-[7rem] items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors sm:text-sm",
                deskSection === id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-90" />
              {label}
            </button>
          ))}
        </div>
      </header>

      {deskSection === "events" && <AlfredEventsPanel geoHint={geoHint} isPro={isPro} />}

      {deskSection === "read" && <AlfredReadPanel geoHint={geoHint} isPro={isPro} />}

      {deskSection === "desk" && loading && !cache?.insights?.length && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium">Building your opportunity deck…</p>
        </div>
      )}

      {deskSection === "desk" && !loading && (!cache || !cache.insights?.length) && (
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            No deck yet. We&apos;ll generate one when you open this page, or tap <strong>Refresh insights now</strong>.
          </p>
        </div>
      )}

      {deskSection === "desk" && isPro && (
        <section className="rounded-2xl border border-primary/15 bg-primary/[0.03] p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-base font-bold text-foreground">Proactive gaps</h2>
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {proactiveLoading
                ? "Loading…"
                : proactiveLastUpdated
                  ? `Updated ${formatDistanceToNow(new Date(proactiveLastUpdated), { addSuffix: true })}`
                  : "No background scans yet"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            24/7 scanner runs on a schedule (Pro). Gaps respect your profile: Kenya / online, low capital, profitable angles that can
            employ people when that fits you. They also merge into your main deck when you refresh.
          </p>
          {proactiveRows.length === 0 && !proactiveLoading && (
            <p className="text-xs text-muted-foreground italic">Waiting for the next scan — or ensure migrations and cron are deployed.</p>
          )}
          <ul className="space-y-3">
            {proactiveRows.slice(0, 6).map((row, i) => {
              const raw = row.insight as Record<string, unknown>;
              const ins = normalizeInsight(raw, {
                generatedAt: new Date(row.created_at).getTime(),
                index: i,
              });
              return (
                <li
                  key={row.id}
                  className="rounded-xl border border-border/50 bg-background/60 px-3 py-2.5 text-sm text-foreground/90"
                >
                  <span className="font-semibold text-foreground">{ins.title}</span>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{ins.summary}</p>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {deskSection === "desk" && isFree && (
        <div className="rounded-2xl border border-border/50 bg-muted/10 p-4">
          <p className="text-xs font-semibold text-foreground mb-1">Proactive 24/7 gap scanning</p>
          <p className="text-xs text-muted-foreground mb-3">
            Background research that surfaces Kenya / online, low-capital gaps is included with Pro.
          </p>
          <ProUpgradePrompt compact feature="Unlock scheduled multi-source scanning and proactive gaps on your desk." />
        </div>
      )}

      {deskSection === "desk" && cache && cache.insights.length > 0 && (
        <section className="space-y-4">
          {cache.executiveSummary && (
            <div className="rounded-2xl border border-border/50 bg-card/60 p-4 sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Executive read</p>
              <p className="text-sm sm:text-base text-foreground leading-relaxed">{executivePreview}</p>
              {isFree && executiveRead.length > FREE_EXEC_SUMMARY_CHARS && (
                <div className="mt-4 rounded-xl border border-border/40 bg-muted/20 p-4">
                  <ProUpgradePrompt
                    compact
                    feature="Upgrade to read the full executive brief and every insight card."
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-foreground">Prioritized opportunities</h2>
            <span className="text-xs text-muted-foreground tabular-nums">
              Updated {new Date(cache.generatedAt).toLocaleString()}
            </span>
          </div>

          <div className="space-y-4">
            {visibleInsights.map((insight, i) => (
              <InsightCard key={insight.id} insight={insight} rank={i + 1} allowDeepDive={isPro} />
            ))}
          </div>

          {isFree && lockedCount > 0 && (
            <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-5">
              <p className="text-sm font-semibold text-foreground mb-2">
                +{lockedCount} more opportunit{lockedCount === 1 ? "y" : "ies"} on Pro
              </p>
              <ProUpgradePrompt feature="Unlock the full ranked list, complete summaries, and unlimited deep-dive briefs." />
            </div>
          )}

          {cache.disclaimer && isPro && (
            <p className="text-[11px] text-muted-foreground leading-relaxed border-t border-border/40 pt-4">
              {cache.disclaimer}
            </p>
          )}
          {cache.disclaimer && isFree && (
            <p className="text-[11px] text-muted-foreground leading-relaxed border-t border-border/40 pt-4 italic">
              Full disclaimer text is shown with Pro.
            </p>
          )}
        </section>
      )}

      <footer className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4 text-xs text-muted-foreground leading-relaxed">
        <strong className="text-foreground">Not financial advice.</strong> This desk outputs research-style ideas for education only.
        Markets involve risk of loss. Verify data, fees, and tax rules yourself; consult a licensed professional before investing or
        structuring a business.
      </footer>
    </div>
  );
}
