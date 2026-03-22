import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { industries } from "@/lib/industryData";
import { Loader2, Network, RefreshCw, AlertTriangle, Lightbulb, TrendingUp, Users, Handshake } from "lucide-react";
import { WorldMap } from "@/components/intel/WorldMap";
import { SnapshotTimeline } from "@/components/intel/SnapshotTimeline";
import { useSnapshots } from "@/hooks/useSnapshots";
import { useAlertNotifications } from "@/hooks/useAlertNotifications";
import { ClickableItem } from "@/components/intel/ClickableItem";
import { useGeoContext } from "@/contexts/GeoContext";
import { BlockMarkdown, InlineMarkdown } from "@/components/InlineMarkdown";
import { useSubscription } from "@/hooks/useSubscription";
import { ProUpgradePrompt } from "@/components/ProUpgradePrompt";
import { Link } from "react-router-dom";
import { PageIntro } from "@/components/marketing/ProductWayfinding";

type CrossIntel = {
  cross_industry_players?: { name: string; industries: string[]; activity: string; strategy: string }[];
  deals?: { type: string; parties: string; industries: string[]; value?: string; significance: string }[];
  gaps: { title: string; detail: string; industries: string[]; estimated_value?: string; urgency?: string; related_players?: string }[];
  connections: { title: string; detail: string; from: string; to: string; opportunity_type?: string; key_players?: string }[];
  alerts: { title: string; detail: string; level: string }[];
  summary: string;
};

export default function CrossIntelPage() {
  const [data, setData] = useState<CrossIntel | null>(null);
  const [loading, setLoading] = useState(false);
  const { geoString, isGlobal, geoScopeId } = useGeoContext();
  const { snapshots, loading: snapsLoading } = useSnapshots("cross-industry", "all", geoScopeId);
  const { isPro } = useSubscription();
  useAlertNotifications(data?.alerts || [], true);

  const fetchIntel = useCallback(async () => {
    if (!isPro) return;
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("cross-intel", {
        body: {
          industries: industries.map(i => ({
            name: i.name,
            subFlows: i.subFlows.map(sf => sf.name),
            keywords: i.subFlows.flatMap(sf => sf.keywords).slice(0, 5),
          })),
          geoContext: geoString,
          geoScopeId: geoScopeId || "global",
        },
      });
      if (error) throw error;
      setData(result as CrossIntel);
    } catch (e) {
      console.error("Cross-intel error:", e);
    } finally {
      setLoading(false);
    }
  }, [geoString, geoScopeId, isPro]);

  useEffect(() => { fetchIntel(); }, [fetchIntel]);

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight flex items-center gap-2">
            <Network className="w-5 h-5 text-brand-orange" /> Cross-industry intelligence
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            One AI pass across every mapped industry and flow — refresh after you change region
          </p>
        </div>
        <button onClick={fetchIntel} disabled={loading || !isPro} className="p-2 rounded-lg border border-border/60 hover:bg-muted/40 text-muted-foreground disabled:opacity-50 shrink-0">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
        </button>
      </div>

      <PageIntro eyebrow="Strategic scan" title="When to use Cross-industry">
        <p>
          Maverick compares all sectors and money flows to surface gaps, deals, connections, and alerts for your selected geography. For a single vertical, open an industry from the{" "}
          <Link to="/dashboard" className="text-primary font-medium hover:underline">
            Dashboard
          </Link>{" "}
          instead.
        </p>
        <p>
          Pair with the{" "}
          <Link to="/intel" className="text-primary font-medium hover:underline">
            Live feed
          </Link>{" "}
          for a market pulse and{" "}
          <Link to="/custom-intel" className="text-primary font-medium hover:underline">
            Intel Lab
          </Link>{" "}
          when you need a custom scoped brief.
        </p>
      </PageIntro>

      {!isPro ? (
        <div className="glass-panel p-6">
          <ProUpgradePrompt feature="Upgrade for full access to cross-industry AI analysis — gaps, connections, and opportunities across all 20 industries." />
        </div>
      ) : loading && !data ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Analyzing 20 industries and 70+ money flows…</p>
        </div>
      ) : data ? (
        <>
          {/* Summary */}
          <ClickableItem
            title="Cross-Industry Executive Intelligence Report"
            detail={data.summary}
            className="glass-panel p-4 glow-border hover:glow-border-strong transition-all"
          >
            <h2 className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
              EXECUTIVE SUMMARY
              <span className="text-[8px] text-muted-foreground/50 ml-auto">Click for deep dive →</span>
            </h2>
            <div className="text-[11px] text-card-foreground leading-relaxed line-clamp-4 min-w-0 [&_p]:mb-1 [&_p:last-child]:mb-0">
              <BlockMarkdown content={data.summary} />
            </div>
          </ClickableItem>

          <WorldMap />

          {(data.cross_industry_players?.length || data.deals?.length) ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {data.cross_industry_players && data.cross_industry_players.length > 0 && (
                <div className="glass-panel p-4">
                  <h2 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-primary" /> CROSS-INDUSTRY OPERATORS
                  </h2>
                  <div className="space-y-2">
                    {data.cross_industry_players.map((player, i) => (
                      <ClickableItem key={i} title={player.name} detail={`Activity: ${player.activity}\nStrategy: ${player.strategy}`}
                        className="p-2 rounded bg-muted/20 border border-border/20 hover:border-primary/20 transition-colors">
                        <p className="text-xs font-bold text-foreground">{player.name}</p>
                        <div className="text-[10px] text-muted-foreground mt-0.5 min-w-0">
                          <BlockMarkdown content={player.activity} />
                        </div>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {player.industries.map((ind, j) => (
                            <span key={j} className="text-[8px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{ind}</span>
                          ))}
                        </div>
                      </ClickableItem>
                    ))}
                  </div>
                </div>
              )}
              {data.deals && data.deals.length > 0 && (
                <div className="glass-panel p-4">
                  <h2 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                    <Handshake className="w-3.5 h-3.5 text-primary" /> CROSS-INDUSTRY DEALS
                  </h2>
                  <div className="space-y-2">
                    {data.deals.map((deal, i) => (
                      <ClickableItem key={i} title={`${deal.type}: ${deal.parties}`} detail={deal.significance}
                        className="p-2 rounded bg-muted/20 border border-border/20 hover:border-primary/20 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">{deal.type}</span>
                          <p className="text-[10px] text-foreground flex-1">{deal.parties}</p>
                          {deal.value && <span className="text-[10px] text-primary font-bold">{deal.value}</span>}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1 min-w-0">
                          <BlockMarkdown content={deal.significance} />
                        </div>
                      </ClickableItem>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="glass-panel p-4">
              <h2 className="text-xs font-bold text-accent mb-3 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-brand-orange" /> CROSS-INDUSTRY GAPS
              </h2>
              <div className="space-y-2">
                {data.gaps?.map((gap, i) => (
                  <ClickableItem key={i} title={gap.title} detail={gap.detail}
                    className="p-2 rounded bg-accent/5 border border-accent/20 hover:border-accent/50 transition-colors">
                    <div className="text-[10px] font-bold text-accent min-w-0"><InlineMarkdown content={gap.title} /></div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 min-w-0"><BlockMarkdown content={gap.detail} /></div>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {gap.industries.map((ind, j) => (
                        <span key={j} className="text-[8px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{ind}</span>
                      ))}
                    </div>
                  </ClickableItem>
                ))}
              </div>
            </div>

            <div className="glass-panel p-4">
              <h2 className="text-xs font-bold text-primary mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> CROSS-INDUSTRY CONNECTIONS
              </h2>
              <div className="space-y-2">
                {data.connections?.map((conn, i) => (
                  <ClickableItem key={i} title={conn.title} detail={conn.detail}
                    className="p-2 rounded bg-primary/5 border border-primary/20 hover:border-primary/40 transition-colors">
                    <div className="text-[10px] font-bold text-foreground min-w-0"><InlineMarkdown content={conn.title} /></div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 min-w-0"><BlockMarkdown content={conn.detail} /></div>
                    <div className="flex items-center gap-1 mt-1 text-[8px] text-primary">
                      <span className="px-1.5 py-0.5 rounded bg-primary/10">{conn.from}</span>
                      <span>→</span>
                      <span className="px-1.5 py-0.5 rounded bg-primary/10">{conn.to}</span>
                    </div>
                  </ClickableItem>
                ))}
              </div>
            </div>

            <div className="glass-panel p-4 lg:col-span-2">
              <h2 className="text-xs font-bold text-destructive mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> PROACTIVE ALERTS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {data.alerts?.map((alert, i) => (
                  <ClickableItem key={i} title={alert.title} detail={alert.detail}
                    className={`p-2 rounded border hover:opacity-80 transition-opacity ${alert.level === 'critical' ? 'bg-destructive/10 border-destructive/30' : alert.level === 'high' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-muted/20 border-border/20'}`}>
                    <div className="text-[10px] font-bold text-foreground min-w-0"><InlineMarkdown content={alert.title} /></div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 min-w-0"><BlockMarkdown content={alert.detail} /></div>
                  </ClickableItem>
                ))}
              </div>
            </div>
          </div>

          <SnapshotTimeline snapshots={snapshots} loading={snapsLoading} />
        </>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-20">Failed to load cross-industry intel. Try refreshing.</p>
      )}
    </div>
  );
}
