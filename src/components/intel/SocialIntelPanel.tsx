import { useState, useMemo } from "react";
import { Loader2, Zap, Users, TrendingUp, Radio, Twitter, Youtube, MessageSquare } from "lucide-react";
import { ClickableItem } from "./ClickableItem";
import { buildSocialIntelResearchContext } from "./socialIntelResearch";
import { BlockMarkdown, InlineMarkdown } from "@/components/InlineMarkdown";

interface SocialIntelPanelProps {
  data: any;
  loading: boolean;
  industryName?: string;
  subFlowName?: string;
  /** From geo selector — shows which market’s Reddit/YouTube/news RSS are prioritized */
  geoLabel?: string;
}

const SOURCE_LABELS: Record<string, string> = {
  twitter: "X",
  gdelt: "GDELT",
  reddit: "Reddit",
  hackernews: "HN",
  country_news: "G News",
  youtube: "YouTube",
  outlet_rss: "Outlets RSS",
  gdelt_outlet: "GDELT outlets",
};

export function SocialIntelPanel({ data, loading, industryName, subFlowName, geoLabel }: SocialIntelPanelProps) {
  const [tab, setTab] = useState<"breaking" | "players" | "opportunities">("breaking");

  const researchContext = useMemo(() => buildSocialIntelResearchContext(data), [data]);

  if (loading && !data) {
    return (
      <div className="glass-panel p-4">
        <h2 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-primary animate-pulse" /> LIVE SOCIAL INTELLIGENCE
        </h2>
        <div className="flex items-center gap-2 py-4">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
          <span className="text-[9px] text-muted-foreground">
            Scraping X, Google News, outlet RSS, YouTube, local Reddit, GDELT{geoLabel && geoLabel !== "Global (All Markets)" ? ` — scoped to ${geoLabel}` : ""}…
          </span>
        </div>
      </div>
    );
  }

  const synthesis = data?.synthesis;
  if (!synthesis) return null;

  const breaking = synthesis.breaking || [];
  const players = synthesis.player_activity || [];
  const opportunities = synthesis.opportunities_from_signals || [];
  const sentiment = synthesis.social_sentiment || {};
  const freshness = synthesis.freshness_score || 0;

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-primary" /> LIVE SOCIAL INTELLIGENCE
        </h2>
        <div className="flex items-center gap-2">
          <span className={`text-[8px] px-1.5 py-0.5 rounded ${
            freshness >= 70 ? "bg-emerald-500/20 text-emerald-400" : 
            freshness >= 40 ? "bg-amber-500/20 text-amber-400" : 
            "bg-red-500/20 text-red-400"
          }`}>
            FRESHNESS: {freshness}%
          </span>
          <span className={`text-[8px] px-1.5 py-0.5 rounded ${
            sentiment.overall === "bullish" ? "bg-emerald-500/20 text-emerald-400" :
            sentiment.overall === "bearish" ? "bg-red-500/20 text-red-400" :
            "bg-muted/30 text-muted-foreground"
          }`}>
            {(sentiment.overall || "neutral").toUpperCase()}
          </span>
          <span className="text-[8px] text-muted-foreground">
            {data?.signals_collected || 0} signals
          </span>
        </div>
      </div>

      {geoLabel && geoLabel !== "Global (All Markets)" && (
        <p className="text-[8px] text-primary/80 mb-2">
          Geo scope: {geoLabel} — local subreddits, national Google News lenses, YouTube channels, and outlet RSS match this selection.
        </p>
      )}
      <p className="text-[8px] text-muted-foreground mb-3 leading-relaxed">
        Synthesis below is fed from these sources and is passed into deep-dive research as live intel (not decorative copy).
      </p>

      {/* Raw previews — proves country Reddit / YouTube / news are connected */}
      {data?.signal_preview && (
        <div className="mb-3 space-y-2 rounded border border-border/20 bg-muted/5 p-2">
          <p className="text-[8px] font-bold text-foreground uppercase tracking-wider">Signal samples (raw)</p>
          {(data.signal_preview.reddit_local?.length ?? 0) > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-0.5 text-[8px] text-muted-foreground">
                <MessageSquare className="w-3 h-3" /> Local Reddit
              </div>
              <ul className="text-[8px] text-muted-foreground space-y-0.5 list-disc list-inside">
                {data.signal_preview.reddit_local.slice(0, 3).map((r: any, i: number) => (
                  <li key={i}>
                    <span className="text-primary/90">r/{r.subreddit}</span>{" "}
                    <span className="text-foreground/70">[{r.country}]</span> {r.title?.slice(0, 90)}
                    {r.title?.length > 90 ? "…" : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {(data.signal_preview.youtube?.length ?? 0) > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-0.5 text-[8px] text-muted-foreground">
                <Youtube className="w-3 h-3" /> YouTube
              </div>
              <ul className="text-[8px] text-muted-foreground space-y-0.5 list-disc list-inside">
                {data.signal_preview.youtube.slice(0, 3).map((y: any, i: number) => (
                  <li key={i}>
                    <span className="text-primary/90">@{y.channel}</span> {y.title?.slice(0, 90)}
                    {y.title?.length > 90 ? "…" : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {(data.signal_preview.country_news?.length ?? 0) > 0 && (
            <div>
              <p className="text-[8px] text-muted-foreground mb-0.5">Google News by country</p>
              <ul className="text-[8px] text-muted-foreground space-y-0.5 list-disc list-inside">
                {data.signal_preview.country_news.slice(0, 3).map((n: any, i: number) => (
                  <li key={i}>
                    <span className="text-foreground/70">[{n.country}]</span> {n.title?.slice(0, 90)}
                    {n.title?.length > 90 ? "…" : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* X Pulse */}
      {synthesis.x_coverage && (
        <div className="mb-3 p-2 rounded bg-muted/10 border border-border/10">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Twitter className="w-3 h-3 text-primary" />
            <span className="text-[8px] font-bold text-foreground">X PULSE</span>
            {synthesis.x_coverage.tweets_analyzed > 0 && (
              <span className="text-[7px] text-muted-foreground">{synthesis.x_coverage.tweets_analyzed} tweets analyzed</span>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {(synthesis.x_coverage.top_voices || []).slice(0, 5).map((v: string, i: number) => (
              <span key={i} className="text-[7px] px-1.5 py-0.5 rounded bg-primary/15 text-primary">@{v}</span>
            ))}
            {(sentiment.x_pulse?.trending_hashtags || []).slice(0, 4).map((h: string, i: number) => (
              <span key={`h-${i}`} className="text-[7px] px-1.5 py-0.5 rounded bg-accent/20 text-accent-foreground">#{h}</span>
            ))}
          </div>
          {sentiment.x_pulse?.sentiment_shift && (
            <p className="text-[8px] text-muted-foreground mt-1">↗ {sentiment.x_pulse.sentiment_shift}</p>
          )}
        </div>
      )}

      {/* Sentiment tags */}
      {(sentiment.hot_topics?.length > 0 || sentiment.emerging_terms?.length > 0) && (
        <div className="flex flex-wrap gap-1 mb-3">
          {(sentiment.hot_topics || []).slice(0, 4).map((t: string, i: number) => (
            <span key={`hot-${i}`} className="text-[7px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
              🔥 {t}
            </span>
          ))}
          {(sentiment.emerging_terms || []).slice(0, 3).map((t: string, i: number) => (
            <span key={`em-${i}`} className="text-[7px] px-1.5 py-0.5 rounded bg-accent/20 text-accent-foreground">
              ✨ {t}
            </span>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {[
          { key: "breaking" as const, icon: Zap, label: "BREAKING", count: breaking.length },
          { key: "players" as const, icon: Users, label: "PLAYERS", count: players.length },
          { key: "opportunities" as const, icon: TrendingUp, label: "OPPORTUNITIES", count: opportunities.length },
        ].map(({ key, icon: Icon, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`text-[8px] px-2 py-1 rounded flex items-center gap-1 transition-colors ${
              tab === key ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-2.5 h-2.5" /> {label} ({count})
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {tab === "breaking" && breaking.map((item: any, i: number) => (
          <ClickableItem
            key={i}
            title={item.headline}
            detail={item.detail}
            industryName={industryName}
            subFlowName={subFlowName}
            socialIntelContext={researchContext}
            className="p-2.5 rounded bg-muted/20 border border-border/20 hover:border-primary/20 transition-colors"
          >
            <div className="flex items-start gap-2">
              <span className={`shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full ${
                item.impact === "high" ? "bg-red-500" : item.impact === "medium" ? "bg-amber-500" : "bg-emerald-500"
              }`} />
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-foreground leading-snug min-w-0">
                  <InlineMarkdown content={item.headline || ""} />
                </div>
                <div className="text-[9px] text-muted-foreground mt-1 min-w-0 [&_h1]:text-[10px] [&_h2]:text-[10px] [&_h3]:text-[9px]">
                  <BlockMarkdown content={item.detail || ""} />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {item.players_involved?.slice(0, 3).map((p: string, j: number) => (
                    <span key={j} className="text-[7px] px-1 py-0.5 rounded bg-primary/10 text-primary">{p}</span>
                  ))}
                  {item.source && <span className="text-[7px] text-muted-foreground">via {item.source}</span>}
                </div>
              </div>
            </div>
          </ClickableItem>
        ))}

        {tab === "players" && players.map((item: any, i: number) => (
          <ClickableItem
            key={i}
            title={item.player}
            detail={`${item.activity}. ${item.implications}`}
            industryName={industryName}
            subFlowName={subFlowName}
            socialIntelContext={researchContext}
            className="p-2.5 rounded bg-muted/20 border border-border/20 hover:border-primary/20 transition-colors"
          >
            <div className="text-[10px] font-bold text-primary min-w-0">
              <InlineMarkdown content={item.player || ""} />
            </div>
            <div className="text-[9px] text-foreground mt-1 min-w-0">
              <BlockMarkdown content={item.activity || ""} />
            </div>
            <div className="text-[8px] text-muted-foreground mt-1 italic min-w-0">
              → <InlineMarkdown content={item.implications || ""} />
            </div>
            {item.source && <span className="text-[7px] text-muted-foreground mt-1 block">Source: {item.source}</span>}
          </ClickableItem>
        ))}

        {tab === "opportunities" && opportunities.map((item: any, i: number) => (
          <ClickableItem
            key={i}
            title={item.title}
            detail={item.detail}
            industryName={industryName}
            subFlowName={subFlowName}
            socialIntelContext={researchContext}
            className="p-2.5 rounded bg-muted/20 border border-border/20 hover:border-primary/20 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="text-[10px] font-bold text-foreground min-w-0 flex-1">
                <InlineMarkdown content={item.title || ""} />
              </div>
              <span className={`shrink-0 text-[7px] px-1.5 py-0.5 rounded ${
                item.urgency === "act_now" ? "bg-red-500/20 text-red-400" :
                item.urgency === "this_week" ? "bg-amber-500/20 text-amber-400" :
                "bg-muted/30 text-muted-foreground"
              }`}>
                {(item.urgency || "").replace("_", " ").toUpperCase()}
              </span>
            </div>
            <div className="text-[9px] text-muted-foreground mt-1 min-w-0">
              <BlockMarkdown content={item.detail || ""} />
            </div>
            {item.source_signal && (
              <span className="text-[7px] text-primary/60 mt-1 block">
                Signal: <InlineMarkdown content={String(item.source_signal)} />
              </span>
            )}
          </ClickableItem>
        ))}
      </div>

      {/* Source breakdown */}
      <div className="flex flex-wrap items-center gap-3 mt-3 pt-2 border-t border-border/20">
        <span className="text-[7px] text-muted-foreground">Sources:</span>
        {data?.sources && Object.entries(data.sources).map(([key, val]) => (
          <span key={key} className="text-[7px] text-muted-foreground">
            {SOURCE_LABELS[key] || key}: {val as number}
          </span>
        ))}
        {data?.countries_scraped?.length > 0 && (
          <span className="text-[7px] text-primary/60">
            | {data.countries_scraped.length} countries: {data.countries_scraped.join(", ")}
          </span>
        )}
      </div>
    </div>
  );
}
