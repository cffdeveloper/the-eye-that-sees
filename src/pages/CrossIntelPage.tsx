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
  const [loading, setLoading] = useState(true);
  const { geoString, isGlobal } = useGeoContext();
  const { snapshots, loading: snapsLoading } = useSnapshots("cross-industry", "all");
  useAlertNotifications(data?.alerts || [], true);

  const fetchIntel = useCallback(async () => {
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
        },
      });
      if (error) throw error;
      setData(result as CrossIntel);
    } catch (e) {
      console.error("Cross-intel error:", e);
    } finally {
      setLoading(false);
    }
  }, [geoString]);

  useEffect(() => { fetchIntel(); }, [fetchIntel]);

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-mono font-bold text-foreground flex items-center gap-2">
            <Network className="w-4 h-4 text-primary" /> CROSS-INDUSTRY INTELLIGENCE
          </h1>
          <p className="text-[9px] font-mono text-muted-foreground">
            AI analyzes all 20 industries to find gaps, connections, and opportunities across sectors
          </p>
        </div>
        <button onClick={fetchIntel} disabled={loading} className="p-1.5 rounded border border-border/50 hover:bg-muted/30 text-muted-foreground disabled:opacity-50">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
        </button>
      </div>

      {loading && !data ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs font-mono text-muted-foreground">AI is analyzing 20 industries and 70+ money flows...</p>
        </div>
      ) : data ? (
        <>
          {/* Summary — clickable */}
          <ClickableItem
            title="Cross-Industry Executive Intelligence Report"
            detail={data.summary}
            className="glass-panel p-4 glow-border hover:glow-border-strong transition-all"
          >
            <h2 className="text-xs font-mono font-bold text-primary mb-2 flex items-center gap-1.5">
              EXECUTIVE SUMMARY
              <span className="text-[8px] font-mono text-muted-foreground/50 ml-auto">Click for deep dive →</span>
            </h2>
            <p className="text-[11px] font-mono text-card-foreground leading-relaxed whitespace-pre-wrap line-clamp-4">{data.summary}</p>
          </ClickableItem>

          {/* World Map */}
          <WorldMap />

          {/* Cross-Industry Players & Deals */}
          {(data.cross_industry_players?.length || data.deals?.length) ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {data.cross_industry_players && data.cross_industry_players.length > 0 && (
                <div className="glass-panel p-4">
                  <h2 className="text-xs font-mono font-bold text-foreground mb-3 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-primary" /> CROSS-INDUSTRY OPERATORS
                  </h2>
                  <div className="space-y-2">
                    {data.cross_industry_players.map((player, i) => (
                      <ClickableItem key={i} title={player.name} detail={`Activity: ${player.activity}\nStrategy: ${player.strategy}`}
                        className="p-2 rounded bg-muted/20 border border-border/20 hover:border-primary/20 transition-colors">
                        <p className="text-xs font-mono font-bold text-foreground">{player.name}</p>
                        <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{player.activity}</p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {player.industries.map((ind, j) => (
                            <span key={j} className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary">{ind}</span>
                          ))}
                        </div>
                      </ClickableItem>
                    ))}
                  </div>
                </div>
              )}
              {data.deals && data.deals.length > 0 && (
                <div className="glass-panel p-4">
                  <h2 className="text-xs font-mono font-bold text-foreground mb-3 flex items-center gap-1.5">
                    <Handshake className="w-3.5 h-3.5 text-primary" /> CROSS-INDUSTRY DEALS
                  </h2>
                  <div className="space-y-2">
                    {data.deals.map((deal, i) => (
                      <ClickableItem key={i} title={`${deal.type}: ${deal.parties}`} detail={deal.significance}
                        className="p-2 rounded bg-muted/20 border border-border/20 hover:border-primary/20 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">{deal.type}</span>
                          <p className="text-[10px] font-mono text-foreground flex-1">{deal.parties}</p>
                          {deal.value && <span className="text-[10px] font-mono text-primary font-bold">{deal.value}</span>}
                        </div>
                        <p className="text-[10px] font-mono text-muted-foreground mt-1">{deal.significance}</p>
                      </ClickableItem>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Cross-Industry Gaps */}
            <div className="glass-panel p-4">
              <h2 className="text-xs font-mono font-bold text-accent mb-3 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" /> CROSS-INDUSTRY GAPS
              </h2>
              <div className="space-y-2">
                {data.gaps?.map((gap, i) => (
                  <ClickableItem
                    key={i}
                    title={gap.title}
                    detail={gap.detail}
                    className="p-2 rounded bg-accent/5 border border-accent/20 hover:border-accent/50 transition-colors"
                  >
                    <p className="text-[10px] font-mono font-bold text-accent">{gap.title}</p>
                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{gap.detail}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {gap.industries.map((ind, j) => (
                        <span key={j} className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary">{ind}</span>
                      ))}
                    </div>
                  </ClickableItem>
                ))}
              </div>
            </div>

            {/* Connections */}
            <div className="glass-panel p-4">
              <h2 className="text-xs font-mono font-bold text-primary mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> CROSS-INDUSTRY CONNECTIONS
              </h2>
              <div className="space-y-2">
                {data.connections?.map((conn, i) => (
                  <ClickableItem
                    key={i}
                    title={conn.title}
                    detail={conn.detail}
                    className="p-2 rounded bg-primary/5 border border-primary/20 hover:border-primary/40 transition-colors"
                  >
                    <p className="text-[10px] font-mono font-bold text-foreground">{conn.title}</p>
                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{conn.detail}</p>
                    <div className="flex items-center gap-1 mt-1 text-[8px] font-mono text-primary">
                      <span className="px-1.5 py-0.5 rounded bg-primary/10">{conn.from}</span>
                      <span>→</span>
                      <span className="px-1.5 py-0.5 rounded bg-primary/10">{conn.to}</span>
                    </div>
                  </ClickableItem>
                ))}
              </div>
            </div>

            {/* Alerts */}
            <div className="glass-panel p-4 lg:col-span-2">
              <h2 className="text-xs font-mono font-bold text-destructive mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> PROACTIVE ALERTS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {data.alerts?.map((alert, i) => (
                  <ClickableItem
                    key={i}
                    title={alert.title}
                    detail={alert.detail}
                    className={`p-2 rounded border hover:opacity-80 transition-opacity ${alert.level === 'critical' ? 'bg-destructive/10 border-destructive/30' : alert.level === 'high' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-muted/20 border-border/20'}`}
                  >
                    <p className="text-[10px] font-mono font-bold text-foreground">{alert.title}</p>
                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{alert.detail}</p>
                  </ClickableItem>
                ))}
              </div>
            </div>
          </div>

          {/* Historical Snapshots */}
          <SnapshotTimeline snapshots={snapshots} loading={snapsLoading} />
        </>
      ) : (
        <p className="text-xs font-mono text-muted-foreground text-center py-20">Failed to load cross-industry intel. Try refreshing.</p>
      )}
    </div>
  );
}
