import { useCallback, useMemo, useState } from "react";
import { Calendar, ExternalLink, Loader2, MapPin, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ProUpgradePrompt } from "@/components/ProUpgradePrompt";
import { cn } from "@/lib/utils";
import { getTrainingCorpus } from "@/lib/alfredStorage";

export type NetworkEventRow = {
  title: string;
  start_date: string | null;
  location: string | null;
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
          Uses your profile, industries, geography, and training notes, plus live web research (Tavily when configured). We do not access
          private inboxes; verify every date and link before you travel or pay.
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
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="font-display text-sm font-bold text-foreground sm:text-base min-w-0 flex-1">{ev.title}</h3>
              {ev.url && (
                <a
                  href={ev.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 shrink-0 text-xs font-semibold text-primary hover:underline"
                >
                  Link <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
              {ev.start_date && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {ev.start_date}
                </span>
              )}
              {ev.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {ev.location}
                </span>
              )}
              {ev.source_hint && <span className="text-muted-foreground/90">Source: {ev.source_hint}</span>}
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
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">{ev.relevance_note}</p>
          </li>
        ))}
      </ul>

      {disclaimer && (
        <p className="text-[11px] text-muted-foreground border-t border-border/40 pt-4 leading-relaxed">{disclaimer}</p>
      )}
    </section>
  );
}
