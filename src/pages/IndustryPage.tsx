import { useParams, Link, Navigate } from "react-router-dom";
import { getIndustryBySlug, subFlowIdToPathSegment } from "@/lib/industryData";
import { ArrowRight, TrendingUp, Loader2, Users, Handshake, Database, Clock } from "lucide-react";
import { useIndustryIntel } from "@/hooks/useIndustryIntel";
import { useIndustryNews } from "@/hooks/useIndustryNews";
import { useSocialIntel } from "@/hooks/useSocialIntel";
import { useSnapshots } from "@/hooks/useSnapshots";
import { useCachedIntel } from "@/hooks/useCachedIntel";
import { useGeoContext } from "@/contexts/GeoContext";
import { getGeoLabel } from "@/lib/geoData";
import { NewsFeed } from "@/components/intel/NewsFeed";
import { SocialIntelPanel } from "@/components/intel/SocialIntelPanel";
import { SnapshotTimeline } from "@/components/intel/SnapshotTimeline";
import { ClickableItem } from "@/components/intel/ClickableItem";
import { BlockMarkdown, InlineMarkdown } from "@/components/InlineMarkdown";
import { ProUpgradePrompt, ProGateLoading, useIsFreeUser } from "@/components/ProUpgradePrompt";
import { PageIntro } from "@/components/marketing/ProductWayfinding";
import { getIndustryIntelCopy } from "@/lib/pageIntelMessages";

export default function IndustryPage() {
  const { slug } = useParams<{ slug: string }>();
  const industry = slug ? getIndustryBySlug(slug) : undefined;
  const keywords = industry?.subFlows.flatMap(sf => sf.keywords).slice(0, 10) || [];
  const { geoString, geoScopeId, selections } = useGeoContext();
  const { data, loading } = useIndustryIntel(industry?.name || "", keywords, geoString, geoScopeId);
  const { articles, loading: newsLoading } = useIndustryNews(keywords);
  const { data: socialData, loading: socialLoading } = useSocialIntel(
    industry?.name || "",
    null,
    keywords,
    geoString,
    geoScopeId,
  );
  const { snapshots, loading: snapsLoading } = useSnapshots("industry", industry?.name || "", geoScopeId);
  const { report: cachedReport, loading: cacheLoading } = useCachedIntel("industry", industry?.name || "", geoScopeId);
  const { isFree, subscriptionLoading } = useIsFreeUser();

  if (!industry) return <Navigate to="/dashboard" replace />;

  const sectorIntro =
    getIndustryIntelCopy(industry.slug) ?? {
      eyebrow: "Sector workspace",
      title: `Why ${industry.name} intel here`,
      body: `${industry.description} Maverick maps markets, news, and social layers to this sector so you can spot gaps, research angles, and timely updates as conditions change.\n\nOpen each money flow below for lane-specific analysis, alerts, and snapshot history.`,
    };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 glow-border rounded-2xl">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-3xl">{industry.icon}</span>
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">{industry.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Industry {industry.id} · {industry.subFlows.length} money flows
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{industry.description}</p>
      </div>

      <PageIntro eyebrow={sectorIntro.eyebrow} title={sectorIntro.title}>
        {sectorIntro.body.split("\n\n").map((para, i) => (
          <p key={i}>{para}</p>
        ))}
        <p>
          Read the AI industry brief for the whole sector, then scroll for alerts, news, and social intel. Want every sector at once? Use{" "}
          <Link to="/cross-intel" className="text-primary font-medium hover:underline">
            Cross-industry
          </Link>
          . For a macro pulse first, open the{" "}
          <Link to="/intel" className="text-primary font-medium hover:underline">
            Live feed
          </Link>
          ; for your own scoped brief,{" "}
          <Link to="/custom-intel" className="text-primary font-medium hover:underline">
            Intel Lab
          </Link>
          .
        </p>
      </PageIntro>

      {/* AI Industry Brief */}
      <ClickableItem
        title={`${industry.name} — Full Industry Intelligence Report`}
        detail={data?.analysis || cachedReport?.analysis}
        industryName={industry.name}
        className="glass-panel p-4 hover:glow-border transition-all"
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold text-primary flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> AI INDUSTRY BRIEF
          </h2>
          <div className="flex items-center gap-2">
            {cachedReport?.created_at && (
              <span className="text-[7px] text-muted-foreground flex items-center gap-1">
                <Database className="w-2.5 h-2.5" />
                Auto-updated {new Date(cachedReport.created_at).toLocaleString()}
              </span>
            )}
            <span className="text-[8px] text-muted-foreground/50">Click for deep dive →</span>
          </div>
        </div>
        {subscriptionLoading ? (
          <ProGateLoading compact />
        ) : isFree ? (
          <ProUpgradePrompt feature="Upgrade for full access to unlock AI-powered industry analysis and reports." compact />
        ) : (loading && cacheLoading) ? (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            <span className="text-xs text-muted-foreground">Analyzing {industry.name} landscape...</span>
          </div>
        ) : (data?.analysis || cachedReport?.summary) ? (
          <div className="text-xs text-card-foreground leading-relaxed line-clamp-4">
            <BlockMarkdown content={data?.analysis || cachedReport?.summary || ""} />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Analysis unavailable — auto-intel will generate on next cycle.</p>
        )}
      </ClickableItem>

      {/* Cached Alerts from auto-intel */}
      <div className="glass-panel p-4">
        <h2 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-primary" /> AUTO-DETECTED ALERTS
        </h2>
        {subscriptionLoading ? (
          <ProGateLoading compact />
        ) : isFree ? (
          <ProUpgradePrompt feature="Upgrade for full access to see real-time alerts and critical market signals." compact />
        ) : cachedReport?.alerts && cachedReport.alerts.length > 0 ? (
          <div className="space-y-2">
            {cachedReport.alerts.map((alert: any, i: number) => (
              <div key={i} className={`p-2.5 rounded border ${
                alert.severity === "critical" ? "bg-destructive/10 border-destructive/30" :
                alert.severity === "warning" ? "bg-amber-500/10 border-amber-500/30" :
                "bg-muted/20 border-border/20"
              }`}>
                <p className="text-[10px] font-bold text-foreground">{alert.title}</p>
                <div className="text-[9px] text-muted-foreground mt-0.5">
                  <InlineMarkdown content={alert.detail || ""} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No alerts detected yet.</p>
        )}
      </div>

      {/* Cached Gaps/Opportunities */}
      <div className="glass-panel p-4">
        <h2 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-primary" /> EXPLOITABLE GAPS
        </h2>
        {subscriptionLoading ? (
          <ProGateLoading compact />
        ) : isFree ? (
          <ProUpgradePrompt feature="Upgrade for full access to discover exploitable market gaps and opportunities." compact />
        ) : cachedReport?.gaps && cachedReport.gaps.length > 0 ? (
          <div className="space-y-2">
            {cachedReport.gaps.map((gap: any, i: number) => (
              <ClickableItem
                key={i}
                title={gap.title}
                detail={gap.detail}
                industryName={industry.name}
                className="p-2.5 rounded bg-muted/20 border border-border/20 hover:border-primary/20 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <p className="text-[10px] font-bold text-foreground">{gap.title}</p>
                  <div className="flex items-center gap-1.5">
                    {gap.estimated_value && <span className="text-[8px] text-primary font-bold">{gap.estimated_value}</span>}
                    <span className={`text-[7px] px-1.5 py-0.5 rounded ${
                      gap.urgency === "critical" ? "bg-destructive/20 text-destructive" :
                      gap.urgency === "high" ? "bg-amber-500/20 text-amber-400" :
                      "bg-muted/30 text-muted-foreground"
                    }`}>{gap.urgency}</span>
                  </div>
                </div>
                <div className="text-[9px] text-muted-foreground mt-1">
                  <InlineMarkdown content={gap.detail || ""} />
                </div>
              </ClickableItem>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No gaps detected yet.</p>
        )}
      </div>

      {/* Key Players */}
      <div className="glass-panel p-4">
        <h2 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-primary" /> KEY PLAYERS
        </h2>
        {subscriptionLoading ? (
          <ProGateLoading compact />
        ) : isFree ? (
          <ProUpgradePrompt feature="Upgrade for full access to see key industry players and their strategies." compact />
        ) : data?.players && data.players.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {data.players.map((player: any, i: number) => (
              <ClickableItem
                key={i}
                title={player.name}
                detail={`Role: ${player.role}\nRecent: ${player.recent_activity}\nStrategy: ${player.strategy}\nPartners: ${player.partnerships || 'N/A'}`}
                industryName={industry.name}
                className="p-2.5 rounded bg-muted/20 border border-border/20 hover:border-primary/20 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <p className="text-xs font-bold text-foreground">{player.name}</p>
                  <span className="text-[8px] text-muted-foreground/50">→ dive</span>
                </div>
                <p className="text-[10px] text-primary mt-0.5">{player.role}</p>
                <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                  <InlineMarkdown content={player.recent_activity || ""} />
                </div>
              </ClickableItem>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No player data available yet.</p>
        )}
      </div>

      {/* Social Intelligence */}
      <SocialIntelPanel
        data={socialData}
        loading={socialLoading}
        industryName={industry.name}
        geoLabel={getGeoLabel(selections)}
      />

      {/* Live News Feed */}
      <NewsFeed articles={articles} loading={newsLoading} industryName={industry.name} />

      {/* Sub-flows grid */}
      <div>
        <h2 className="text-xs font-bold text-foreground mb-3">MONEY FLOWS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {industry.subFlows.map((sf) => (
            <Link
              key={sf.id}
              to={`/industry/${industry.slug}/${subFlowIdToPathSegment(sf.id)}`}
              className="glass-panel p-4 hover:glow-border transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-[10px] text-primary">{sf.id}</span>
                  <h3 className="text-sm font-bold text-foreground">{sf.name}</h3>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
              </div>
              <p className="text-[10px] text-muted-foreground mb-2">{sf.description}</p>
              <div className="p-2 rounded bg-muted/30 border border-border/30">
                <p className="text-[9px] text-muted-foreground leading-relaxed">{sf.moneyFlow}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Historical Snapshots */}
      <div className="glass-panel p-4">
        <h2 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-primary" /> HISTORICAL SNAPSHOTS
        </h2>
        {subscriptionLoading ? (
          <ProGateLoading compact />
        ) : isFree ? (
          <ProUpgradePrompt feature="Upgrade for full access to access historical analysis snapshots." compact />
        ) : (
          <SnapshotTimeline snapshots={snapshots} loading={snapsLoading} />
        )}
      </div>
    </div>
  );
}
