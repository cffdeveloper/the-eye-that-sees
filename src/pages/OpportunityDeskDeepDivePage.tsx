import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useGeoContext } from "@/contexts/GeoContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SaveIntelButton } from "@/components/saved/SaveIntelButton";
import { cn } from "@/lib/utils";
import { assistantHomePath } from "@/lib/assistantBranding";
import { profileFirstName } from "@/lib/profileDisplayName";
import {
  findInsightById,
  getTrainingCorpus,
  loadInsightsCache,
  type AlfredInsight,
} from "@/lib/alfredStorage";

type CrossIndustryRow = {
  industry: string;
  whyItMattersForTheUser: string;
  linkToThisIdea: string;
};

type GapBridge = {
  gap: string;
  whoIsUnderserved: string;
  howYouCouldFill: string;
  industriesInvolved: string[];
  roughDifficulty: string;
};

export type DeepDiveAnalysis = {
  userProfileMirror: string;
  executiveThesis: string;
  landscape: string;
  crossIndustry: CrossIndustryRow[];
  gapBridges: GapBridge[];
  positioningPlaybook: string;
  monetizationPaths: string[];
  ninetyDayPlan: string[];
  risksMissteps: string[];
  researchQueries: string[];
  disclaimer: string;
};

function insightResearchUrl(insight: AlfredInsight): string {
  const q = `${insight.title} ${insight.category.replace(/_/g, " ")}`.trim();
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}

function buildDeepDiveMarkdown(insight: AlfredInsight, analysis: DeepDiveAnalysis): string {
  const parts: string[] = [];
  parts.push(`# ${insight.title}`, "");
  parts.push(
    "::: insight_snapshot",
    `**Category:** ${insight.category.replace(/_/g, " ")} · **Timing:** ${insight.timing} · **Priority:** ${insight.priority}`,
    "",
    insight.summary,
    ":::",
    "",
  );
  if (analysis.userProfileMirror) parts.push("## How this applies to you", "", analysis.userProfileMirror, "");
  if (analysis.executiveThesis) parts.push("## Executive thesis", "", analysis.executiveThesis, "");
  if (analysis.landscape) parts.push("## Landscape & forces", "", analysis.landscape, "");
  if (analysis.crossIndustry.length > 0) {
    parts.push("## Cross-industry connections", "");
    analysis.crossIndustry.forEach((row, i) => {
      parts.push(`### ${i + 1}. ${row.industry}`, "", row.whyItMattersForTheUser, "", `*Bridge:* ${row.linkToThisIdea}`, "");
    });
  }
  if (analysis.gapBridges.length > 0) {
    parts.push("## Gaps you could bridge", "");
    analysis.gapBridges.forEach((g, i) => {
      parts.push(
        `### ${i + 1}. ${g.gap}`,
        "",
        `**Difficulty:** ${g.roughDifficulty}`,
        "",
        `**Underserved:** ${g.whoIsUnderserved}`,
        "",
        `**How you could fill it:** ${g.howYouCouldFill}`,
        "",
        g.industriesInvolved.length ? `*Industries:* ${g.industriesInvolved.join(", ")}` : "",
        "",
      );
    });
  }
  if (analysis.positioningPlaybook) parts.push("## Positioning playbook", "", analysis.positioningPlaybook, "");
  if (analysis.monetizationPaths.length > 0) {
    parts.push("## Monetization paths", "");
    analysis.monetizationPaths.forEach((line, i) => parts.push(`${i + 1}. ${line}`));
    parts.push("");
  }
  if (analysis.ninetyDayPlan.length > 0) {
    parts.push("## ~90 day execution map", "");
    analysis.ninetyDayPlan.forEach((line, i) => parts.push(`${i + 1}. ${line}`));
    parts.push("");
  }
  if (analysis.risksMissteps.length > 0) {
    parts.push("## Risks & missteps", "");
    analysis.risksMissteps.forEach((line) => parts.push(`- ${line}`));
    parts.push("");
  }
  if (analysis.researchQueries.length > 0) {
    parts.push("## Suggested research queries", "");
    analysis.researchQueries.forEach((q) => parts.push(`- ${q}`));
    parts.push("");
  }
  if (analysis.disclaimer) parts.push("## Disclaimer", "", analysis.disclaimer, "");
  return parts.join("\n\n").trim();
}

function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={cn(
        "font-display text-base font-bold tracking-tight text-foreground border-b border-border/50 pb-2",
        className,
      )}
    >
      {children}
    </h2>
  );
}

function BackLink() {
  return (
    <Link
      to={assistantHomePath}
      className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      <ArrowLeft className="h-4 w-4 shrink-0" />
      Back to opportunities
    </Link>
  );
}

export default function OpportunityDeskDeepDivePage() {
  const { insightId } = useParams<{ insightId: string }>();
  const { geoString, isGlobal } = useGeoContext();
  const { profile, user } = useAuth();
  const geoHint = isGlobal ? "global markets" : geoString;
  const addressAs = profileFirstName(profile, user?.email);

  const insight = useMemo(() => {
    if (!insightId) return null;
    return findInsightById(loadInsightsCache(), insightId);
  }, [insightId]);

  const [analysis, setAnalysis] = useState<DeepDiveAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDeepDive = useCallback(
    async (ins: AlfredInsight) => {
      setLoading(true);
      setError(null);
      try {
        const trainingCorpus = getTrainingCorpus();
        const { data, error: fnError } = await supabase.functions.invoke("alfred-deep-dive", {
          body: {
            trainingCorpus,
            geoHint,
            addressAs: addressAs || undefined,
            insightSeed: {
              title: ins.title,
              summary: ins.summary,
              category: ins.category,
              timing: ins.timing,
              priority: ins.priority,
              actions: ins.actions,
              caveats: ins.caveats,
            },
          },
        });
        if (fnError) throw fnError;
        if (data?.error) throw new Error(typeof data.error === "string" ? data.error : "Request failed");
        setAnalysis(data as unknown as DeepDiveAnalysis);
      } catch (e) {
        console.error(e);
        const msg = e instanceof Error ? e.message : "Could not load deep dive";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [geoHint, addressAs],
  );

  useEffect(() => {
    if (!insight) return;
    void runDeepDive(insight);
  }, [insight, runDeepDive]);

  if (!insightId) {
    return (
      <div className="w-full max-w-6xl py-12">
        <BackLink />
        <p className="mt-6 text-sm text-muted-foreground">Missing opportunity id.</p>
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="w-full max-w-6xl space-y-6 pb-16">
        <BackLink />
        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-8 text-center space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            This opportunity is not in your saved deck anymore — refresh your deck on the main page, or open deep dive from a current
            card.
          </p>
          <Button type="button" className="rounded-xl font-semibold" asChild>
            <Link to={assistantHomePath}>Back to opportunities</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl space-y-10 pb-20">
      <header className="space-y-4">
        <BackLink />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Full analysis</p>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl leading-tight">
              {insight.title}
            </h1>
            <div className="flex flex-wrap gap-1.5 text-[10px] text-muted-foreground">
              <span className="px-2 py-0.5 rounded-full bg-muted/70 font-medium capitalize">
                {insight.category.replace(/_/g, " ")}
              </span>
              <span>{insight.timing.replace(/_/g, " ")}</span>
              <span className="tabular-nums">Priority {insight.priority}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg font-semibold gap-1.5"
              disabled={loading}
              onClick={() => runDeepDive(insight)}
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Regenerate
            </Button>
            <Button type="button" variant="secondary" size="sm" className="rounded-lg font-semibold" asChild>
              <a href={insightResearchUrl(insight)} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Web search
              </a>
            </Button>
            {analysis && (
              <SaveIntelButton
                title={`${insight.title} — deep dive`}
                subtitle="Opportunity desk"
                source="opportunity_desk"
                sourceDetail={profile?.display_name || user?.email || undefined}
                size="sm"
                getBody={() => buildDeepDiveMarkdown(insight, analysis)}
              />
            )}
          </div>
        </div>
      </header>

      {loading && analysis && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground -mt-4">
          <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
          Regenerating analysis…
        </p>
      )}

      {loading && !analysis && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-muted-foreground">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm font-medium text-center max-w-sm">
            Building cross-industry analysis, gap map, and positioning playbook…
          </p>
        </div>
      )}

      {error && !analysis && !loading && (
        <div className="rounded-2xl border border-destructive/25 bg-destructive/[0.06] p-5 text-sm text-muted-foreground">
          <p className="font-medium text-destructive mb-2">Could not load analysis</p>
          <p>{error}</p>
          <Button type="button" className="mt-4 rounded-xl" onClick={() => runDeepDive(insight)}>
            Try again
          </Button>
        </div>
      )}

      {analysis && (
        <div className="space-y-10">
          <section className="rounded-2xl border border-border/50 bg-muted/15 p-4 sm:p-5 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">From your deck</p>
            <p className="text-sm text-foreground leading-relaxed">{insight.summary}</p>
          </section>

          {analysis.userProfileMirror && (
            <section className="space-y-3">
              <SectionTitle>How this applies to you</SectionTitle>
              <div className="prose-infinitygap text-[13px] text-card-foreground leading-relaxed rounded-2xl border border-primary/15 bg-primary/[0.04] p-4 sm:p-5">
                <p className="whitespace-pre-wrap">{analysis.userProfileMirror}</p>
              </div>
            </section>
          )}

          {analysis.executiveThesis && (
            <section className="space-y-3">
              <SectionTitle>Executive thesis</SectionTitle>
              <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-wrap">
                {analysis.executiveThesis}
              </p>
            </section>
          )}

          {analysis.landscape && (
            <section className="space-y-3">
              <SectionTitle>Landscape & forces</SectionTitle>
              <div className="prose-infinitygap text-[13px] text-card-foreground leading-relaxed rounded-2xl border border-border/50 bg-card/50 p-4 sm:p-5">
                <p className="whitespace-pre-wrap">{analysis.landscape}</p>
              </div>
            </section>
          )}

          {analysis.crossIndustry.length > 0 && (
            <section className="space-y-4">
              <SectionTitle>Cross-industry connections</SectionTitle>
              <ul className="space-y-4">
                {analysis.crossIndustry.map((row, i) => (
                  <li
                    key={`${row.industry}-${i}`}
                    className="rounded-2xl border border-border/50 bg-card/60 p-4 sm:p-5 space-y-2"
                  >
                    <p className="font-display text-sm font-bold text-primary">{row.industry}</p>
                    <p className="text-sm text-foreground/90 leading-relaxed">{row.whyItMattersForTheUser}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-2">
                      <span className="font-semibold text-foreground/80">Bridge: </span>
                      {row.linkToThisIdea}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {analysis.gapBridges.length > 0 && (
            <section className="space-y-4">
              <SectionTitle>Gaps you could bridge</SectionTitle>
              <ul className="space-y-4">
                {analysis.gapBridges.map((g, i) => (
                  <li
                    key={`${g.gap}-${i}`}
                    className="rounded-2xl border border-brand-orange/20 bg-brand-orange/[0.04] p-4 sm:p-5 space-y-2"
                  >
                    <p className="font-display text-sm font-bold text-foreground">{g.gap}</p>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{g.roughDifficulty}</p>
                    <div className="text-sm space-y-2 leading-relaxed">
                      <p>
                        <span className="font-semibold text-foreground">Underserved: </span>
                        {g.whoIsUnderserved}
                      </p>
                      <p>
                        <span className="font-semibold text-foreground">How you could fill it: </span>
                        {g.howYouCouldFill}
                      </p>
                    </div>
                    {g.industriesInvolved.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {g.industriesInvolved.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-muted/80 text-muted-foreground font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {analysis.positioningPlaybook && (
            <section className="space-y-3">
              <SectionTitle>Positioning playbook</SectionTitle>
              <div className="prose-infinitygap text-[13px] text-card-foreground leading-relaxed rounded-2xl border border-border/50 bg-card/50 p-4 sm:p-5">
                <p className="whitespace-pre-wrap">{analysis.positioningPlaybook}</p>
              </div>
            </section>
          )}

          {analysis.monetizationPaths.length > 0 && (
            <section className="space-y-3">
              <SectionTitle>Monetization paths</SectionTitle>
              <ol className="list-decimal list-inside space-y-2 text-sm text-foreground/90 leading-relaxed">
                {analysis.monetizationPaths.map((line, i) => (
                  <li key={i} className="pl-0.5">
                    {line}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {analysis.ninetyDayPlan.length > 0 && (
            <section className="space-y-3">
              <SectionTitle>~90 day execution map</SectionTitle>
              <ol className="list-decimal list-inside space-y-2 text-sm text-foreground/90 leading-relaxed">
                {analysis.ninetyDayPlan.map((line, i) => (
                  <li key={i} className="pl-0.5">
                    {line}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {analysis.risksMissteps.length > 0 && (
            <section className="space-y-3">
              <SectionTitle className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                Risks & missteps
              </SectionTitle>
              <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                {analysis.risksMissteps.map((line, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-amber-600/80 dark:text-amber-400/80 shrink-0">•</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {analysis.researchQueries.length > 0 && (
            <section className="space-y-3">
              <SectionTitle>Suggested research queries</SectionTitle>
              <ul className="space-y-2">
                {analysis.researchQueries.map((q, i) => (
                  <li key={i}>
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(q)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
                    >
                      <Sparkles className="h-3.5 w-3.5 shrink-0 opacity-80" />
                      {q}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4 space-y-2">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Not financial or legal advice.</strong> This is generated research for education.
              Verify facts, fees, and regulations yourself.
            </p>
            {analysis.disclaimer && <p className="text-[11px] text-muted-foreground leading-relaxed">{analysis.disclaimer}</p>}
          </section>
        </div>
      )}
    </div>
  );
}
