import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, ChevronDown, Download, Loader2, RefreshCw, Timer } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ProUpgradePrompt } from "@/components/ProUpgradePrompt";
import { useAuth } from "@/contexts/AuthContext";
import { getTrainingCorpus } from "@/lib/alfredStorage";
import { downloadIntelBriefPdf } from "@/lib/exportIntelBriefPdf";
import { normalizeMarkdownInput } from "@/lib/markdownNormalize";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { industries as allIndustries } from "@/lib/industryData";

type BriefRow = Database["public"]["Tables"]["user_read_briefs"]["Row"];

const TICK_MS = 120_000;
const RESEARCH_WAVES = 60;

type ScopeMode = "all" | "industries" | "custom";

export function AlfredReadPanel({ geoHint, isPro }: { geoHint: string; isPro: boolean }) {
  const { user } = useAuth();
  const [rows, setRows] = useState<BriefRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const [extendedPack, setExtendedPack] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStep, setJobStep] = useState(0);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Custom scope
  const [scopeMode, setScopeMode] = useState<ScopeMode>("all");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [customTopic, setCustomTopic] = useState("");
  const [showScopeDropdown, setShowScopeDropdown] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_read_briefs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) {
      console.error(error);
      toast.error("Could not load briefs");
    } else {
      setRows((data as BriefRow[]) || []);
      if (data?.[0]?.id) setSelectedId(data[0].id);
    }
    setLoading(false);
  }, []);

  const clearTickTimer = () => {
    if (tickTimerRef.current) {
      clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
  };

  const runTick = useCallback(
    async (jid: string) => {
      try {
        const { data, error } = await supabase.functions.invoke("daily-read-brief", {
          body: { action: "tick", jobId: jid },
        });
        if (error) throw error;
        if (data?.code === "INSUFFICIENT_CREDITS") {
          toast.error("Add credits.");
          clearTickTimer();
          setJobId(null);
          return;
        }
        if (data?.error && data?.status !== "complete") {
          throw new Error(typeof data.error === "string" ? data.error : "Tick failed");
        }

        if (data?.status === "complete" && data?.brief?.id) {
          toast.success("Extended research pack is ready.");
          setJobId(null);
          setJobStep(RESEARCH_WAVES);
          setJobStatus("complete");
          clearTickTimer();
          await load();
          setSelectedId(data.brief.id);
          return;
        }

        if (data?.status === "running" && typeof data.step === "number") {
          setJobStep(data.step);
          setJobStatus("running");
        }
      } catch (e) {
        console.error(e);
        toast.error(e instanceof Error ? e.message : "Tick failed");
        clearTickTimer();
        setJobId(null);
      }
    },
    [load],
  );

  const resumeActiveJob = useCallback(async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from("user_read_brief_jobs")
      .select("id, step, status")
      .eq("user_id", user.id)
      .in("status", ["running", "compiling"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return;
    setJobId(data.id);
    setJobStep(typeof data.step === "number" ? data.step : 0);
    setJobStatus(data.status);
    setExtendedPack(true);
  }, [user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void resumeActiveJob();
  }, [resumeActiveJob]);

  useEffect(() => {
    if (!jobId || jobStatus === "complete") {
      clearTickTimer();
      return;
    }
    clearTickTimer();
    tickTimerRef.current = setInterval(() => {
      void runTick(jobId);
    }, TICK_MS);
    return () => clearTickTimer();
  }, [jobId, jobStatus, runTick]);

  const buildScopePayload = () => {
    if (scopeMode === "industries" && selectedIndustries.length > 0) {
      return { focusIndustries: selectedIndustries };
    }
    if (scopeMode === "custom" && customTopic.trim()) {
      return { customFocus: customTopic.trim() };
    }
    return {};
  };

  const generateStandard = async () => {
    setGenerating(true);
    try {
      const trainingCorpus = getTrainingCorpus();
      const { data, error } = await supabase.functions.invoke("daily-read-brief", {
        body: { action: "standard", trainingCorpus, geoHint, ...buildScopePayload() },
      });
      if (error) throw error;
      if (data?.code === "INSUFFICIENT_CREDITS") {
        toast.error("Add credits to generate a digest.");
        return;
      }
      if (data?.error) throw new Error(typeof data.error === "string" ? data.error : "Request failed");
      if (data?.brief?.id) {
        toast.success("Digest saved");
        await load();
        setSelectedId(data.brief.id);
      }
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Could not generate");
    } finally {
      setGenerating(false);
    }
  };

  const startExtended = async () => {
    setGenerating(true);
    try {
      const trainingCorpus = getTrainingCorpus();
      const { data, error } = await supabase.functions.invoke("daily-read-brief", {
        body: { action: "start_extended", trainingCorpus, geoHint, ...buildScopePayload() },
      });
      if (error) throw error;
      if (data?.code === "JOB_ACTIVE") {
        toast.message(data.error || "Job already running");
        return;
      }
      if (data?.code === "INSUFFICIENT_CREDITS") {
        toast.error("Add credits for extended research.");
        return;
      }
      if (data?.error) throw new Error(typeof data.error === "string" ? data.error : "Could not start");
      if (data?.jobId) {
        setJobId(data.jobId);
        setJobStep(0);
        setJobStatus("running");
        toast.success("Extended research started — runs ~2 hours (60 waves), then compiles. Keep this tab open or come back.");
        void runTick(data.jobId);
      }
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Could not start");
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = () => {
    void generateStandard();
  };

  const handleStartExtended = () => {
    void startExtended();
  };

  const handlePdf = async () => {
    if (!printRef.current || !selected) return;
    try {
      await downloadIntelBriefPdf({
        contentElement: printRef.current,
        documentTitle: selected.title,
      });
    } catch (e) {
      console.error(e);
      toast.error("PDF export failed");
    }
  };

  const selected = rows.find((r) => r.id === selectedId) ?? rows[0];
  const wavesLeft = Math.max(0, RESEARCH_WAVES - jobStep);
  const etaResearchMin = wavesLeft * (TICK_MS / 60_000);

  const toggleIndustry = (slug: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  if (!isPro) {
    return (
      <div className="rounded-2xl border border-border/50 bg-muted/10 p-6">
        <p className="text-sm font-semibold text-foreground mb-2">Daily read</p>
        <p className="text-xs text-muted-foreground mb-4">
          Standard digests or extended ~50-page research packs. PDF export for any edition.
        </p>
        <ProUpgradePrompt feature="Add credits to generate and store research digests." />
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-border/50 bg-card/60 p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">Read</h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              <strong className="text-foreground">Standard</strong> — one-pass digest.{" "}
              <strong className="text-foreground">Extended ~50 pages</strong> — 60 unique research waves over ~2 hours, then compiled into a deep narrative research pack.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" className="rounded-lg gap-1.5 shrink-0" disabled={loading} onClick={() => void load()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Reload list
          </Button>
        </div>

        {/* Research scope picker */}
        <div className="rounded-xl border border-border/40 bg-muted/20 p-3 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Research scope</p>
          <div className="flex flex-wrap gap-2">
            {([
              ["all", "All my industries"],
              ["industries", "Pick industries"],
              ["custom", "Custom topic"],
            ] as const).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => { setScopeMode(k); setShowScopeDropdown(k !== "all"); }}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                  scopeMode === k ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:bg-muted/40",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {scopeMode === "industries" && (
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
              {allIndustries.map((ind) => (
                <button
                  key={ind.slug}
                  type="button"
                  onClick={() => toggleIndustry(ind.slug)}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                    selectedIndustries.includes(ind.slug)
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border/50 text-muted-foreground hover:bg-muted/30",
                  )}
                >
                  {ind.icon} {ind.name}
                </button>
              ))}
            </div>
          )}

          {scopeMode === "custom" && (
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="e.g. Bitcoin price analysis, Kenyan presidential race, organic farming in East Africa…"
              className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-border/40 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Switch id="extended-pack" checked={extendedPack} onCheckedChange={setExtendedPack} disabled={Boolean(jobId)} />
            <div>
              <Label htmlFor="extended-pack" className="text-sm font-semibold cursor-pointer">
                Extended ~50-page pack (multi-hour pipeline)
              </Label>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Off = fast standard digest. On = 60 research waves, then compile — keep tab open.
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            className={cn("rounded-lg gap-1.5 font-semibold shrink-0", extendedPack && "bg-primary")}
            disabled={generating || Boolean(jobId)}
            onClick={() => void handleGenerate()}
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
            {extendedPack ? "Start extended research" : "Generate digest"}
          </Button>
        </div>

        {jobId && jobStatus === "running" && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/25 bg-primary/[0.06] px-4 py-3 text-sm">
            <Timer className="h-5 w-5 text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground">
                Extended pipeline running — wave {jobStep} / {RESEARCH_WAVES}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                ~{etaResearchMin} min remaining in research phase, then final compile.
              </p>
            </div>
          </div>
        )}
      </div>

      {loading && rows.length === 0 ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
          No briefs yet. Pick a scope and generate your first digest.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
          <aside className="rounded-xl border border-border/50 bg-muted/20 p-2 max-h-[min(70vh,520px)] overflow-y-auto">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground px-2 py-1">History</p>
            <ul className="space-y-1">
              {rows.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(r.id)}
                    className={`w-full rounded-lg px-2 py-2 text-left text-xs transition-colors ${
                      selected?.id === r.id ? "bg-primary/15 text-primary font-semibold" : "hover:bg-muted/50 text-foreground/90"
                    }`}
                  >
                    <span className="line-clamp-2">{r.title}</span>
                    {r.brief_kind === "extended" && (
                      <span className="mt-0.5 block text-[9px] font-bold uppercase text-primary/90">Extended</span>
                    )}
                    <span className="block text-[10px] text-muted-foreground font-normal mt-0.5">
                      {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div className="min-w-0 space-y-3">
            {selected && (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" variant="secondary" size="sm" className="rounded-lg gap-1.5" onClick={() => void handlePdf()}>
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
                <div
                  ref={printRef}
                  data-pdf-export="true"
                  className="rounded-2xl border border-border/50 bg-card p-4 sm:p-6 prose prose-sm dark:prose-invert max-w-none prose-headings:font-display prose-a:text-primary"
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {normalizeMarkdownInput(selected.body_markdown)}
                  </ReactMarkdown>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
