import { Link, useSearchParams } from "react-router-dom";
import { BrandWordmark } from "@/components/BrandWordmark";
import { BrandHexMark } from "@/components/BrandHexMark";
import { industries } from "@/lib/industryData";
import {
  ArrowRight,
  TrendingUp,
  Zap,
  Bell,
  BellOff,
  Activity,
  Database,
  Radio,
  BarChart3,
  Sparkles,
  Layers,
  Network,
  Shield,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { WorldMap } from "@/components/intel/WorldMap";
import { useAlertNotifications } from "@/hooks/useAlertNotifications";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SUBSCRIPTION_USD_MONTHLY } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradeButton, SubscriptionBadge } from "@/components/SubscriptionGate";
import { toast } from "sonner";

export default function Dashboard() {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isPro, verifyPayment, loading: subLoading, subscription } = useSubscription();
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const { requestNotificationPermission } = useAlertNotifications([], alertsEnabled);
  const [dbStats, setDbStats] = useState({ rawData: 0, insights: 0, matches: 0 });

  const sortedIndustries = useMemo(() => {
    if (!profile?.industries_of_interest?.length) return industries;
    const preferred = new Set(profile.industries_of_interest);
    return [
      ...industries.filter((i) => preferred.has(i.slug)),
      ...industries.filter((i) => !preferred.has(i.slug)),
    ];
  }, [profile]);

  useEffect(() => {
    async function fetchStats() {
      const [{ count: raw }, { count: ins }, { count: mat }] = await Promise.all([
        supabase.from("raw_market_data").select("*", { count: "exact", head: true }),
        supabase.from("intel_insights").select("*", { count: "exact", head: true }),
        supabase.from("intel_matches").select("*", { count: "exact", head: true }),
      ]);
      setDbStats({ rawData: raw || 0, insights: ins || 0, matches: mat || 0 });
    }
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Verify Paystack payment on callback
  useEffect(() => {
    if (searchParams.get("payment") === "verify") {
      const ref = localStorage.getItem("paystack_reference");
      if (ref) {
        verifyPayment(ref)
          .then((result) => {
            if (result?.verified) {
              toast.success("Payment successful! Welcome to Pro 🎉");
            } else {
              toast.error("Payment verification failed. Please try again.");
            }
          })
          .catch(() => toast.error("Could not verify payment"))
          .finally(() => {
            localStorage.removeItem("paystack_reference");
            setSearchParams({}, { replace: true });
          });
      }
    }
  }, [searchParams]);

  const handleEnableNotifications = async () => {
    await requestNotificationPermission();
    setAlertsEnabled(true);
  };

  const totalFlows = industries.reduce((a, i) => a + i.subFlows.length, 0);

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto pb-6">
      {/* Ticker */}
      <div className="glass-panel px-3 py-1.5 overflow-hidden relative rounded-lg">
        <div className="ticker-tape">
          {industries.map((ind) => (
            <span key={ind.slug} className="flex items-center gap-1">
              <span>{ind.icon}</span>
              <span className="text-foreground font-semibold">{ind.name}</span>
              <span className="text-primary">{ind.subFlows.length} flows</span>
              <span className="text-muted-foreground">·</span>
            </span>
          ))}
          {industries.map((ind) => (
            <span key={`dup-${ind.slug}`} className="flex items-center gap-1">
              <span>{ind.icon}</span>
              <span className="text-foreground font-semibold">{ind.name}</span>
              <span className="text-primary">{ind.subFlows.length} flows</span>
              <span className="text-muted-foreground">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section className="relative rounded-2xl overflow-hidden border border-border/60 glow-border-strong">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 95% 65% at 40% -25%, hsl(var(--primary) / 0.08) 0%, transparent 55%)",
          }}
        />
        <div className="absolute inset-0 grid-bg opacity-[0.12] pointer-events-none" />
        <div className="relative px-5 py-8 sm:px-8 sm:py-10 md:py-12">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="space-y-5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-3">
                <BrandHexMark size="lg" className="shrink-0" />
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base sm:text-lg">
                    <BrandWordmark />
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-brand-orange/15 text-brand-orange border border-brand-orange/25 font-medium">
                    Maverick AI
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Live pipelines
                  </span>
                </div>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-semibold tracking-tight text-foreground leading-[1.12]">
                  {profile?.display_name ? (
                    <>
                      Welcome back,{" "}
                      <span className="text-primary">{profile.display_name}</span>
                    </>
                  ) : (
                    <>
                      See every{" "}
                      <span className="text-brand-orange">money flow</span>
                      <br className="hidden sm:block" />
                      before the market does
                    </>
                  )}
                </h1>
                <p className="mt-4 text-sm sm:text-[15px] text-muted-foreground leading-relaxed max-w-xl">
                  {profile?.role && profile.role !== "explorer"
                    ? `Tuned for ${profile.role.replace(/_/g, " ")}${profile.organization ? ` · ${profile.organization}` : ""}. `
                    : ""}
                  Intel GoldMine maps industries and gaps; Maverick runs AI deep-dives across {industries.length} sectors — with live
                  signals from 11+ sources.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/intel"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                >
                  <Radio className="w-4 h-4" />
                  Open live feed
                </Link>
                <Link
                  to="/cross-intel"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-orange/35 bg-card/90 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-brand-orange/10 transition-colors"
                >
                  <Network className="w-4 h-4 text-brand-orange" />
                  Cross-industry intel
                </Link>
                <Link
                  to="/custom-intel"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border/80 bg-card/80 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Layers className="w-4 h-4 text-primary" />
                  Intel Lab
                </Link>
              </div>
            </div>

            {/* Pricing card */}
            <div className="w-full lg:w-[min(100%,320px)] shrink-0">
              <div className={cn(
                "rounded-xl border bg-card p-6 shadow-lg border-t-4",
                isPro ? "border-primary/40 border-t-primary" : "border-border/70 border-t-brand-orange"
              )}>
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">Subscription</span>
                    <SubscriptionBadge />
                  </div>
                  <Shield className="w-4 h-4 text-brand-orange/80" />
                </div>

                {isPro ? (
                  <>
                    <div className="mt-3 flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                      <span className="text-xl font-bold text-foreground">Pro Active</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground leading-snug">
                      You have full access to Intel GoldMine, Maverick AI, deep dives, and all premium features.
                    </p>
                    {subscription?.current_period_end && (
                      <p className="mt-2 text-xs text-primary font-medium">
                        Renews {new Date(subscription.current_period_end).toLocaleDateString()}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="mt-3 flex items-end gap-1">
                      <span className="text-4xl font-bold tabular-nums text-foreground">${SUBSCRIPTION_USD_MONTHLY}</span>
                      <span className="text-lg font-semibold text-muted-foreground pb-1">/month</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground leading-snug">
                      Full Intel GoldMine access — Maverick powers briefs, chat, deep dives, cross-industry analysis, and Custom Intel Lab.
                    </p>
                  </>
                )}

                <ul className="mt-4 space-y-2.5 text-sm text-card-foreground">
                  {[
                    "Structured AI reports & chat with Maverick",
                    "20 industries · 70+ money flows",
                    "Geo-scoped research & snapshots",
                  ].map((line, i) => (
                    <li key={line} className="flex items-start gap-2">
                      <Sparkles className={`w-4 h-4 shrink-0 mt-0.5 ${i === 1 ? "text-brand-orange" : "text-primary"}`} />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>

                {!isPro && (
                  <div className="mt-4 border-t border-border/50 pt-3">
                    <UpgradeButton className="w-full" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border/40 pt-6">
            <button
              type="button"
              onClick={alertsEnabled ? () => setAlertsEnabled(false) : handleEnableNotifications}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                alertsEnabled
                  ? "border-primary/35 bg-primary/5 text-primary"
                  : "border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {alertsEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
              {alertsEnabled ? "Browser alerts on" : "Enable alerts"}
            </button>
            <p className="text-xs text-muted-foreground max-w-md text-right">
              Intel GoldMine · Maverick AI · Money flows · Gaps · Signals
            </p>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            title: "Live intel feed",
            desc: "Crypto, FX, commodities, VC & macro — refreshed on a cadence you can trust.",
            icon: Radio,
            href: "/intel",
          },
          {
            title: "Cross-industry AI",
            desc: "Map deals, gaps, and bridges across all 20 sectors in one pass.",
            icon: Network,
            href: "/cross-intel",
          },
          {
            title: "Deep dives",
            desc: "Structured blocks — metrics, frameworks, scores — on any thesis.",
            icon: TrendingUp,
            href: "/industry/technology",
          },
          {
            title: "Intel Lab",
            desc: "Roll your own scope: primary vs secondary lanes, then brief + follow-up.",
            icon: Layers,
            href: "/custom-intel",
          },
        ].map((f, i) => (
          <Link
            key={f.href}
            to={f.href}
            className="group glass-panel p-5 rounded-xl border border-border/60 hover:border-primary/20 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <f.icon className={cn("w-4 h-4", i % 2 === 0 ? "text-primary" : "text-brand-orange")} />
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-brand-orange transition-colors" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {[
          { label: "Industries", value: industries.length, icon: BarChart3 },
          { label: "Money flows", value: totalFlows, icon: Activity },
          { label: "Data sources", value: "11+", icon: Database, accent: true },
          { label: "Raw data pts", value: dbStats.rawData.toLocaleString(), icon: Database },
          { label: "Insights", value: dbStats.insights.toLocaleString(), icon: Zap, accent: true },
          { label: "Matches", value: dbStats.matches.toLocaleString(), icon: TrendingUp },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-3 rounded-xl">
            <div className="flex items-center gap-1.5 mb-1">
              <stat.icon
                className={cn(
                  "w-3.5 h-3.5",
                  stat.accent ? (i === 2 ? "text-primary" : "text-brand-orange") : "text-muted-foreground",
                )}
              />
              <p className="text-[10px] text-muted-foreground font-medium">{stat.label}</p>
            </div>
            <p
              className={cn(
                "text-lg font-semibold tabular-nums",
                stat.accent ? (i === 2 ? "text-primary" : "text-brand-orange") : "text-foreground",
              )}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-0.5">
          <MapPin className="w-4 h-4 text-brand-orange" />
          <span className="text-sm font-semibold text-foreground">Global coverage</span>
          <span className="text-xs text-muted-foreground">Intel snapshots by region</span>
        </div>
        <WorldMap />
      </div>

      {/* Industries */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="terminal-header text-[10px]">ALL INDUSTRIES</span>
          <span className="text-[9px] text-muted-foreground">
            {industries.length} sectors · {totalFlows} flows
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {sortedIndustries.map((ind) => (
            <Link
              key={ind.slug}
              to={`/industry/${ind.slug}`}
              className="glass-panel p-4 rounded-xl border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-1.5">
                <span className="text-xl">{ind.icon}</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-brand-orange transition-colors" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-0.5 leading-tight">{ind.name}</h3>
              <p className="text-[9px] text-muted-foreground line-clamp-2 leading-relaxed">{ind.description}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-[9px] text-primary font-semibold">{ind.subFlows.length} flows</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="text-[9px] text-muted-foreground">
                  {ind.subFlows
                    .slice(0, 2)
                    .map((s) => s.shortName)
                    .join(", ")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
