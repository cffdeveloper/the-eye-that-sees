import { useCallback, useMemo, useState } from "react";
import { Calendar, DollarSign, ExternalLink, Globe, Loader2, MapPin, Monitor, RefreshCw, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ProUpgradePrompt } from "@/components/ProUpgradePrompt";
import { cn } from "@/lib/utils";
import { getTrainingCorpus } from "@/lib/alfredStorage";

export type NetworkEventRow = {
  title: string;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  venue: string | null;
  format: "in-person" | "online" | "hybrid" | "unknown";
  entrance_fee: string | null;
  url: string | null;
  source_hint: string;
  relevance_note: string;
  topics: string[];
};

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
    case "in-person": return <Users className="h-3 w-3" />;
    case "online": return <Monitor className="h-3 w-3" />;
    case "hybrid": return <Globe className="h-3 w-3" />;
    default: return null;
  }
}

function formatBadgeLabel(format: string) {
  switch (format) {
    case "in-person": return "In-person";
    case "online": return "Online";
    case "hybrid": return "Hybrid";
    default: return "TBC";
  }
}

export function AlfredEventsPanel({ geoHint, isPro }: { geoHint: string; isPro: boolean }) {
  const [events, setEvents] = useState<NetworkEventRow[]>([]);
  const [disclaimer, setDisclaimer] = useState("");
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<SortMode>("soonest");

  const run = useCallback(async () => {
    setLoading(true);
    try {
      const trainingCorpus = getTrainingCorpus();
      const { data, error } = await supabase.functions.invoke("network-events", {
        body: { trainingCorpus, geoHint },
      });
      if (error) throw error;
      if (data?.code === "INSUFFICIENT_CREDITS") {
        toast.error("Add credits to discover events.");
        return;
      }
      if (data?.error) throw new Error(typeof data.error === "string" ? data.error : "Request failed");
      setEvents(Array.isArray(data.events) ? data.events : []);
      setDisclaimer(typeof data.disclaimer === "string" ? data.disclaimer : "");
      toast.success("Events updated");
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Could not load events");
    } finally {
      setLoading(false);
    }
  }, [geoHint]);

  const sorted = useMemo(() => {
    const copy = [...events];
    if (sort === "soonest") {
      copy.sort((a, b) => parseTime(a.start_date) - parseTime(b.start_date));
    }
    return copy;
  }, [events, sort]);

  if (!isPro) {
    return (
      <div className="rounded-2xl border border-border/50 bg-muted/10 p-6">
        <p className="text-sm font-semibold text-foreground mb-2">Networking events</p>
        <p className="text-xs text-muted-foreground mb-4">
          We scan public listings and match conferences, meetups, and sector forums to your profile and training notes.
        </p>
        <ProUpgradePrompt feature="Add credits to run personalized event discovery." />
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-border/50 bg-card/60 p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-bold text-foreground">Events for you</h2>
          <Button type="button" size="sm" variant="outline" className="rounded-lg gap-1.5" disabled={loading} onClick={() => void run()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Personalized event discovery based on your profile, industries, and geography. Always verify dates, venues, and fees on official event websites before committing.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground self-center">Sort</span>
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
        </div>
      </div>

      {events.length === 0 && !loading && (
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/15 p-8 text-center">
          <Sparkles className="h-8 w-8 text-primary mx-auto mb-2 opacity-80" />
          <p className="text-sm text-muted-foreground mb-4">No events loaded yet. Tap refresh to search the public web for what fits you.</p>
          <Button type="button" className="rounded-xl font-semibold" onClick={() => void run()}>
            Find events
          </Button>
        </div>
      )}

      {loading && events.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium">Scanning listings…</p>
        </div>
      )}

      <ul className="space-y-3">
        {sorted.map((ev, i) => (
          <li
            key={`${ev.title}-${i}`}
            className="rounded-2xl border border-border/50 bg-card/80 p-4 sm:p-5 shadow-sm"
          >
            {/* Header row */}
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="font-display text-sm font-bold text-foreground sm:text-base min-w-0 flex-1">{ev.title}</h3>
              {ev.url && (
                <a
                  href={ev.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 shrink-0 text-xs font-semibold text-primary hover:underline"
                >
                  Register <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {/* Key details grid */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Date */}
              <div className="flex items-center gap-2 text-xs text-foreground">
                <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="font-medium">
                  {formatDate(ev.start_date)}
                  {ev.end_date && ev.end_date !== ev.start_date && ` — ${formatDate(ev.end_date)}`}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-xs text-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="font-medium">{ev.location || "Location TBC"}</span>
              </div>

              {/* Venue */}
              {ev.venue && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70 w-12 shrink-0">Venue</span>
                  <span>{ev.venue}</span>
                </div>
              )}

              {/* Fee */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <DollarSign className="h-3.5 w-3.5 shrink-0" />
                <span>{ev.entrance_fee || "Fee info not available — check website"}</span>
              </div>
            </div>

            {/* Format badge + source */}
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                ev.format === "in-person" && "bg-green-500/10 text-green-600 dark:text-green-400",
                ev.format === "online" && "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                ev.format === "hybrid" && "bg-purple-500/10 text-purple-600 dark:text-purple-400",
                ev.format === "unknown" && "bg-muted text-muted-foreground",
              )}>
                {formatBadgeIcon(ev.format)}
                {formatBadgeLabel(ev.format)}
              </span>
              {ev.source_hint && (
                <span className="text-[10px] text-muted-foreground/80">via {ev.source_hint}</span>
              )}
            </div>

            {/* Topics */}
            {ev.topics && ev.topics.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {ev.topics.map((t) => (
                  <span key={t} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Relevance */}
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
