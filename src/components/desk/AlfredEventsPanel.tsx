import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Calendar,
  DollarSign,
  ExternalLink,
  Globe,
  Loader2,
  MapPin,
  Monitor,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getTrainingCorpus, normalizeInsightsList } from "@/lib/alfredStorage";
import { loadEventsFeed, mergeServerEvents, setEventArchived, type StoredNetworkEvent } from "@/lib/eventsFeedStorage";
import type { NetworkEventRow } from "@/lib/networkEventTypes";

export type { NetworkEventRow } from "@/lib/networkEventTypes";

const REFRESH_MS = 2 * 60 * 60 * 1000;

type SortMode = "soonest" | "relevance";

function parseTime(s: string | null): number {
  if (!s) return Number.POSITIVE_INFINITY;
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : Number.POSITIVE_INFINITY;
}

function formatDate(d: string | null): string {
  if (!d) return "Date TBC";
  try {
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

function formatBadgeIcon(format: string) {
  switch (format) {
    case "in-person":
      return <Users className="h-3 w-3" />;
    case "online":
      return <Monitor className="h-3 w-3" />;
    case "hybrid":
      return <Globe className="h-3 w-3" />;
    default:
      return null;
  }
}

function formatBadgeLabel(format: string) {
  switch (format) {
    case "in-person":
      return "In-person";
    case "online":
      return "Online";
    case "hybrid":
      return "Hybrid";
    default:
      return "TBC";
  }
}

function opportunityInsightsToEvents(insightsRaw: unknown[], geoHint: string): NetworkEventRow[] {
  const insights = normalizeInsightsList(Array.isArray(insightsRaw) ? insightsRaw : [], Date.now());
  return insights.slice(0, 24).map((ins) => ({
    title: ins.title,
    start_date: null,
    end_date: null,
    location: geoHint,
    venue: ins.category.replace(/_/g, " "),
    format: "unknown",
    entrance_fee: null,
    url: null,
    source_hint: "opportunity-radar",
    relevance_note: ins.summary,
    topics: [ins.category, ins.timing, ...ins.actions.slice(0, 2)].filter(Boolean),
  }));
}

export function AlfredEventsPanel({ geoHint }: { geoHint: string }) {
  const [events, setEvents] = useState<StoredNetworkEvent[]>(() => loadEventsFeed());
  const [disclaimer, setDisclaimer] = useState("");
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<SortMode>("soonest");
  const [themeQ, setThemeQ] = useState("");
  const [venueQ, setVenueQ] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const syncFromStorage = useCallback(() => {
    setEvents(loadEventsFeed());
  }, []);

  const run = useCallback(async () => {
    setLoading(true);
    try {
      const trainingCorpus = getTrainingCorpus();
      const { data, error } = await supabase.functions.invoke("alfred-opportunities", {
        body: { trainingCorpus, geoHint, mergeProactiveGaps: true },
      });
      if (error) throw error;
      if (data?.code === "INSUFFICIENT_CREDITS") {
        toast.error("Add credits to discover events.");
        return;
      }
      if (data?.error) throw new Error(typeof data.error === "string" ? data.error : "Request failed");
      const batch = opportunityInsightsToEvents(data?.insights, geoHint);
      mergeServerEvents(batch);
      syncFromStorage();
      setDisclaimer(
        typeof data?.disclaimer === "string"
          ? data.disclaimer
          : "Mapped from opportunity radar so Events stays synced with the strongest pulling pipeline.",
      );
      toast.success("Events updated");
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Could not load events");
    } finally {
      setLoading(false);
    }
  }, [geoHint, syncFromStorage]);

  useEffect(() => {
    void run();
    const id = window.setInterval(() => void run(), REFRESH_MS);
    return () => window.clearInterval(id);
  }, [run]);

  const filtered = useMemo(() => {
    const t = themeQ.trim().toLowerCase();
    const v = venueQ.trim().toLowerCase();
    return events.filter((ev) => {
      if (!showArchived && ev.archived) return false;
      if (showArchived && !ev.archived) return false;
      if (t) {
        const hay = `${(ev.topics || []).join(" ")} ${ev.relevance_note || ""} ${ev.title}`.toLowerCase();
        if (!hay.includes(t)) return false;
      }
      if (v && !(ev.venue || "").toLowerCase().includes(v) && !(ev.location || "").toLowerCase().includes(v)) {
        return false;
      }
      return true;
    });
  }, [events, themeQ, venueQ, showArchived]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    if (sort === "soonest") {
      copy.sort((a, b) => parseTime(a.start_date) - parseTime(b.start_date));
    }
    return copy;
  }, [filtered, sort]);

  const archivedCount = useMemo(() => events.filter((e) => e.archived).length, [events]);

  return (
    <section className="space-y-3">
      <div className="rounded-2xl border border-border/50 bg-card/60 p-3 sm:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">Events</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Global sweep every 2 hours — business, networking, and general-interest events. Your list keeps growing; archive what you
              don&apos;t need.
            </p>
          </div>
          <Button type="button" size="sm" variant="outline" className="rounded-lg gap-1.5" disabled={loading} onClick={() => void run()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh now
          </Button>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Theme / topic</label>
            <Input
              value={themeQ}
              onChange={(e) => setThemeQ(e.target.value)}
              placeholder="Filter e.g. fintech, gala, marathon…"
              className="mt-1 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Venue or city</label>
            <Input
              value={venueQ}
              onChange={(e) => setVenueQ(e.target.value)}
              placeholder="Venue name or location"
              className="mt-1 rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Sort</span>
          {(
            [
              ["soonest", "Soonest first"],
              ["relevance", "As listed"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setSort(k)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                sort === k ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:bg-muted/40",
              )}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setShowArchived((s) => !s);
            }}
            className={cn(
              "ml-auto rounded-full border px-3 py-1 text-xs font-semibold transition-colors inline-flex items-center gap-1.5",
              showArchived ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:bg-muted/40",
            )}
          >
            {showArchived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
            {showArchived ? "Showing archived" : `Archived (${archivedCount})`}
          </button>
        </div>
      </div>

      {events.length === 0 && !loading && (
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/15 p-6 text-center">
          <Sparkles className="h-8 w-8 text-primary mx-auto mb-2 opacity-80" />
          <p className="text-sm text-muted-foreground mb-4">Pulling the first batch of events…</p>
          <Button type="button" className="rounded-xl font-semibold" onClick={() => void run()}>
            Load events
          </Button>
        </div>
      )}

      {loading && events.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium">Scanning listings…</p>
        </div>
      )}

      <ul className="space-y-2.5">
        {sorted.map((ev) => (
          <li key={ev.key} className="rounded-2xl border border-border/50 bg-card/80 p-3 sm:p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="font-display text-sm font-bold text-foreground sm:text-base min-w-0 flex-1">{ev.title}</h3>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-lg gap-1 text-xs"
                  onClick={() => {
                    setEventArchived(ev.key, !ev.archived);
                    syncFromStorage();
                  }}
                >
                  {ev.archived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                  {ev.archived ? "Unarchive" : "Archive"}
                </Button>
                {ev.url && (
                  <a
                    href={ev.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Link <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-xs text-foreground">
                <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="font-medium">
                  {formatDate(ev.start_date)}
                  {ev.end_date && ev.end_date !== ev.start_date && ` — ${formatDate(ev.end_date)}`}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="font-medium">{ev.location || "Location TBC"}</span>
              </div>

              {ev.venue && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70 w-12 shrink-0">Venue</span>
                  <span>{ev.venue}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <DollarSign className="h-3.5 w-3.5 shrink-0" />
                <span>{ev.entrance_fee || "Fee info not available — check website"}</span>
              </div>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                  ev.format === "in-person" && "bg-green-500/10 text-green-600 dark:text-green-400",
                  ev.format === "online" && "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                  ev.format === "hybrid" && "bg-purple-500/10 text-purple-600 dark:text-purple-400",
                  ev.format === "unknown" && "bg-muted text-muted-foreground",
                )}
              >
                {formatBadgeIcon(ev.format)}
                {formatBadgeLabel(ev.format)}
              </span>
              {ev.source_hint && <span className="text-[10px] text-muted-foreground/80">via {ev.source_hint}</span>}
            </div>

            {ev.topics && ev.topics.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {ev.topics.map((t) => (
                  <span key={t} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    {t}
                  </span>
                ))}
              </div>
            )}

            <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/30 pt-2.5">{ev.relevance_note}</p>
          </li>
        ))}
      </ul>

      {disclaimer && (
        <p className="text-[11px] text-muted-foreground border-t border-border/40 pt-4 leading-relaxed">{disclaimer}</p>
      )}
    </section>
  );
}
