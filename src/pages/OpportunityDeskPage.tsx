import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bot, BrainCircuit, Loader2, RefreshCw, ScanSearch, Sparkles, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useGeoContext } from "@/contexts/GeoContext";
import { useAuth } from "@/contexts/AuthContext";
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
import { cn } from "@/lib/utils";
import { assistantDeepDivePath } from "@/lib/assistantBranding";
import { opportunityDeskTitle, profileFirstName, trainActionLabel } from "@/lib/profileDisplayName";
import {
  appendTrainingEntry,
  getTrainingCorpus,
  loadInsightsCache,
  loadTrainingEntries,
  mergeInsightsCache,
  msUntilNextRefresh,
  saveInsightsCache,
  ALFRED_REFRESH_MS,
  insightsNeedRefresh,
  type AlfredInsight,
  type AlfredInsightsBundle,
} from "@/lib/alfredStorage";

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

function InsightCard({ insight, rank }: { insight: AlfredInsight; rank: number }) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-border/50 bg-card/80 p-4 sm:p-5 shadow-sm",
        "transition-colors hover:border-primary/20",
      )}
    >
      <InsightMetaRow insight={insight} rank={rank} />
      <p className="mt-3 max-h-[min(28rem,55vh)] overflow-y-auto pr-1 text-sm text-muted-foreground leading-relaxed [scrollbar-gutter:stable]">
        {insight.summary}
      </p>
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
        <Button type="button" variant="secondary" size="sm" className="rounded-lg gap-1.5 font-semibold" asChild>
          <Link to={assistantDeepDivePath(insight.id)}>
            <ScanSearch className="h-3.5 w-3.5 shrink-0" />
            Full deep dive
          </Link>
        </Button>
      </div>
    </article>
  );
}

export default function OpportunityDeskPage() {
  const { geoString, isGlobal } = useGeoContext();
  const { profile, user } = useAuth();
  const [trainOpen, setTrainOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [training, setTraining] = useState<ReturnType<typeof loadTrainingEntries>>([]);
  const [cache, setCache] = useState<AlfredInsightsBundle | null>(() => loadInsightsCache());
  const [loading, setLoading] = useState(false);

  const pageTitle = opportunityDeskTitle(profile, user?.email);
  const addressAs = profileFirstName(profile, user?.email);
  const trainLabel = trainActionLabel(profile, user?.email);
  const geoHint = isGlobal ? "global markets" : geoString;

  const refreshTraining = useCallback(() => {
    setTraining(loadTrainingEntries());
  }, []);

  useEffect(() => {
    refreshTraining();
  }, [refreshTraining]);

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
            mergeProactiveGaps: true,
            businessMode: true,
            microScanCount: 14,
          },
        });
        if (error) throw error;
        if (data?.error) throw new Error(typeof data.error === "string" ? data.error : "Request failed");

        const prev = loadInsightsCache();
        const merged = mergeInsightsCache(data.executiveSummary || "", data.insights || [], data.disclaimer, prev);
        const bundle = saveInsightsCache(merged);
        setCache(bundle);
        if (!opts?.silent) toast.success("Opportunity list updated");
      } catch (e) {
        console.error(e);
        toast.error(e instanceof Error ? e.message : "Could not refresh insights");
      } finally {
        setLoading(false);
      }
    },
    [geoHint, addressAs],
  );

  useEffect(() => {
    const c = loadInsightsCache();
    if (insightsNeedRefresh(c)) void runInsights({ silent: true });
  }, [runInsights]);

  useEffect(() => {
    const id = window.setInterval(() => void runInsights({ silent: true }), ALFRED_REFRESH_MS);
    return () => window.clearInterval(id);
  }, [runInsights]);

  const nextRefreshMs = useMemo(() => msUntilNextRefresh(cache), [cache]);
  const needsRefresh = useMemo(() => insightsNeedRefresh(cache), [cache]);

  const allInsights = cache?.insights ?? [];

  const executiveRead = cache?.executiveSummary ?? "";

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

  return (
    <div className="w-full max-w-6xl space-y-6 pb-10">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 border border-primary/20">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{pageTitle}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Operator mode: practical revenue plays (buy-sell, services, niche B2B). Each automated run performs many internal research waves,
              then merges fresh rows into this list about every two hours — duplicates collapse, the rest stack. Geography: {geoHint}.
            </p>
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
                  Goals, skills, capital, risk, geography, and what you’ve tried — every note refines ranking on future runs.
                </DialogDescription>
              </DialogHeader>
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Example: I'm in Nairobi, can invest ~$500/month, medium risk, 8 hours/week for side projects…"
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
            Refresh now
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
                  ? "Eligible for refresh now"
                  : `Next auto refresh in ${formatDuration(nextRefreshMs)}`
                : "Building first deck…"}
            </span>
          </div>
        </div>
      </header>

      {loading && !cache?.insights?.length && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium">Building your opportunity deck…</p>
        </div>
      )}

      {!loading && (!cache || !cache.insights?.length) && (
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            No deck yet — we&apos;ll fetch when you land here, or tap <strong>Refresh now</strong>.
          </p>
        </div>
      )}

      {cache && cache.insights.length > 0 && (
        <section className="space-y-4">
          {cache.executiveSummary && (
            <div className="rounded-2xl border border-border/50 bg-card/60 p-4 sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Executive read</p>
              <p className="text-sm sm:text-base text-foreground leading-relaxed">{executiveRead}</p>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-foreground">Opportunities</h2>
            <span className="text-xs text-muted-foreground tabular-nums">
              Last merged {new Date(cache.generatedAt).toLocaleString()} · {allInsights.length} in list
            </span>
          </div>

          <div className="space-y-4">
            {allInsights.map((insight, i) => (
              <InsightCard key={insight.id} insight={insight} rank={i + 1} />
            ))}
          </div>

          {cache.disclaimer && (
            <p className="text-[11px] text-muted-foreground leading-relaxed border-t border-border/40 pt-4">{cache.disclaimer}</p>
          )}
        </section>
      )}

      <footer className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4 text-xs text-muted-foreground leading-relaxed">
        <strong className="text-foreground">Not financial advice.</strong> Research-style ideas for education only. Verify data and consult
        licensed professionals before investing or forming a business.
      </footer>
    </div>
  );
}
