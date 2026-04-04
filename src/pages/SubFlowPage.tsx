import { useParams, Navigate, Link } from "react-router-dom";
import { getSubFlow } from "@/lib/industryData";
import { ArrowLeft, TrendingUp, Lightbulb, RefreshCw, Loader2, AlertTriangle, Database, Clock } from "lucide-react";
import { useSubFlowIntel } from "@/hooks/useSubFlowIntel";
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
import { buildSubFlowIntelCopy } from "@/lib/pageIntelMessages";
import { IndustryBriefSkeleton } from "@/components/ui/PageSkeletons";

export default function SubFlowPage() {
  const { slug, subFlowId } = useParams<{ slug: string; subFlowId: string }>();
  const result = slug && subFlowId ? getSubFlow(slug, subFlowId) : undefined;
  const { geoString, geoScopeId, selections } = useGeoContext();
  const { data, loading, refreshing, refresh } = useSubFlowIntel(
    result?.subFlow.name || "",
    result?.subFlow.keywords || [],
    result?.industry.name || "",
    geoString,
    geoScopeId
  );
  const { articles, loading: newsLoading } = useIndustryNews(result?.subFlow.keywords || []);
  const { data: socialData, loading: socialLoading } = useSocialIntel(
    result?.industry.name || "",
    result?.subFlow.name || null,
    result?.subFlow.keywords || [],
    geoString,
    geoScopeId,
  );
  const scopeKey = result ? `${result.industry.name}::${result.subFlow.name}` : "";
  const { snapshots, loading: snapsLoading } = useSnapshots("subflow", scopeKey, geoScopeId);
  const { report: cachedReport } = useCachedIntel("subflow", scopeKey, geoScopeId);
  const { isFree, subscriptionLoading } = useIsFreeUser();

  if (!result) return <Navigate to="/dashboard" replace />;
  const { industry, subFlow } = result;
  const flowIntro = buildSubFlowIntelCopy(industry, subFlow);

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Breadcrumb + Header */}
      <div className="glass-panel p-6 glow-border rounded-2xl">
        <Link to={`/industry/${industry.slug}`} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-3 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> {industry.icon} {industry.name}
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-medium text-brand-orange">{subFlow.id}</span>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight mt-0.5">{subFlow.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{subFlow.description}</p>
          </div>
          <button
            onClick={() => void refresh()}
            disabled={(loading && !data && !cachedReport) || subscriptionLoading || isFree}
            className="p-2 rounded-lg border border-border/60 hover:bg-muted/40 transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50 shrink-0"
          >
            {loading && !data && !cachedReport ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : refreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin text-primary/80" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="mt-4 p-4 rounded-xl bg-muted/25 border border-border/50 border-l-4 border-l-brand-orange">
          <p className="text-xs font-medium text-muted-foreground mb-1">Money flow</p>
          <p className="text-sm text-foreground leading-relaxed">{subFlow.moneyFlow}</p>
        </div>
      </div>

      <PageIntro eyebrow={flowIntro.eyebrow} title={flowIntro.title}>
        {flowIntro.body.split("\n\n").map((para, i) => (
          <p key={i}>{para}</p>
        ))}
        <p>
          <Link to={`/industry/${industry.slug}`} className="text-primary font-medium hover:underline">
            ← Back to {industry.name}
          </Link>{" "}
          to compare other flows, or jump to{" "}
          <Link to="/cross-intel" className="text-primary font-medium hover:underline">
            Cross-industry
          </Link>{" "}
          /{" "}
          <Link to="/custom-intel" className="text-primary font-medium hover:underline">
            Infinity Lab
          </Link>{" "}
          for multi-sector or custom briefs.
        </p>
      </PageIntro>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI Analysis */}
        <ClickableItem
          title={`${subFlow.name} — Full Market Analysis`}
          detail={data?.analysis || cachedReport?.analysis}
          industryName={industry.name}
          subFlowName={subFlow.name}
          className="glass-panel p-4 hover:glow-border transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold text-primary flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> AI DEEP ANALYSIS
            </h2>
            <div className="flex items-center gap-2">
              {cachedReport?.created_at && (
                <span className="text-[7px] text-muted-foreground flex items-center gap-1">
                  <Database className="w-2.5 h-2.5" /> {new Date(cachedReport.created_at).toLocaleString()}
                </span>
              )}
              {refreshing && (data?.analysis || cachedReport?.summary) && (
                <span className="text-[9px] font-medium text-primary [animation-duration:400ms] animate-pulse">Updating…</span>
              )}
              <span className="text-[8px] text-muted-foreground/50">Click for deep dive →</span>
            </div>
          </div>
          {subscriptionLoading ? (
            <ProGateLoading compact />
          ) : isFree ? (
            <ProUpgradePrompt feature="Upgrade for full access to unlock AI deep analysis for this money flow." compact />
          ) : loading && !data && !cachedReport ? (
            <IndustryBriefSkeleton className="py-4" />
          ) : (data?.analysis || cachedReport?.summary) ? (
            <div className="text-[11px] text-card-foreground leading-relaxed line-clamp-6">
              <BlockMarkdown content={data?.analysis || cachedReport?.summary || ""} />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Auto-intel will generate report on next cycle.</p>
          )}
        </ClickableItem>

        {/* Gaps & Opportunities */}
        <div className="glass-panel p-4">
          <h2 className="text-xs font-bold text-accent mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" /> GAPS & OPPORTUNITIES
          </h2>
          {subscriptionLoading ? (
            <ProGateLoading compact />
          ) : isFree ? (
            <ProUpgradePrompt feature="Upgrade for full access to discover gaps and opportunities in this flow." compact />
          ) : data?.gaps && data.gaps.length > 0 ? (
            <div className="space-y-2">
              {data.gaps.map((gap: any, i: number) => (
                <ClickableItem
                  key={i}
                  title={gap.title}
                  detail={gap.detail}
                  industryName={industry.name}
                  subFlowName={subFlow.name}
                  className="p-2 rounded bg-accent/5 border border-accent/20 hover:border-accent/50 transition-colors"
                >
                  <p className="text-[10px] font-bold text-accent">{gap.title}</p>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    <InlineMarkdown content={gap.detail || ""} />
                  </div>
                </ClickableItem>
              ))}
            </div>
          ) : loading ? (
            <div className="flex items-center gap-2 py-6">
              <Loader2 className="w-4 h-4 text-accent animate-spin" />
              <span className="text-xs text-muted-foreground">Identifying gaps...</span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No gaps detected yet.</p>
          )}
        </div>

        {/* Social Intelligence */}
        <SocialIntelPanel
          data={socialData}
          loading={socialLoading}
          industryName={industry.name}
          subFlowName={subFlow.name}
          geoLabel={getGeoLabel(selections)}
        />

        {/* Real News Feed */}
        <NewsFeed articles={articles} loading={newsLoading} industryName={industry.name} subFlowName={subFlow.name} />

        {/* Key Alerts */}
        <div className="glass-panel p-4">
          <h2 className="text-xs font-bold text-destructive mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> KEY ALERTS
          </h2>
          {subscriptionLoading ? (
            <ProGateLoading compact />
          ) : isFree ? (
            <ProUpgradePrompt feature="Upgrade for full access to receive critical market alerts." compact />
          ) : data?.alerts && data.alerts.length > 0 ? (
            <div className="space-y-2">
              {data.alerts.map((alert: any, i: number) => (
                <ClickableItem
                  key={i}
                  title={alert.title}
                  detail={alert.detail}
                  industryName={industry.name}
                  subFlowName={subFlow.name}
                  className={`p-2 rounded border hover:opacity-80 transition-opacity ${alert.level === 'critical' ? 'bg-destructive/10 border-destructive/30' : alert.level === 'high' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-muted/20 border-border/20'}`}
                >
                  <p className="text-[10px] font-bold text-foreground">{alert.title}</p>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    <InlineMarkdown content={alert.detail || ""} />
                  </div>
                </ClickableItem>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No critical alerts.</p>
          )}
        </div>
      </div>

      {/* Live Data Section */}
      {!subscriptionLoading && !isFree && data?.liveData && (
        <div className="glass-panel p-4">
          <h2 className="text-xs font-bold text-foreground mb-3">LIVE DATA FEEDS</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(data.liveData).map(([key, val]: [string, any]) => (
              <ClickableItem
                key={key}
                title={`${key.replace(/_/g, ' ')} — Detailed Analysis`}
                industryName={industry.name}
                subFlowName={subFlow.name}
                className="p-2 rounded bg-muted/20 border border-border/20 hover:border-primary/30 transition-colors"
              >
                <p className="text-[9px] text-muted-foreground uppercase">{key.replace(/_/g, ' ')}</p>
                <p className="text-sm font-bold text-foreground">{typeof val === 'number' ? val.toLocaleString() : String(val)}</p>
              </ClickableItem>
            ))}
          </div>
        </div>
      )}

      {/* Historical Snapshots */}
      <div className="glass-panel p-4">
        <h2 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-primary" /> HISTORICAL SNAPSHOTS
        </h2>
        {subscriptionLoading ? (
          <ProGateLoading compact />
        ) : isFree ? (
          <ProUpgradePrompt feature="Upgrade for full access to access historical snapshots and trend analysis." compact />
        ) : (
          <SnapshotTimeline snapshots={snapshots} loading={snapsLoading} />
        )}
      </div>
    </div>
  );
}
