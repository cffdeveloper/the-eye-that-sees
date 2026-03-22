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
    <div className="space-y-6 max-w-[1400px] mx-auto pb-8">
      {/* Welcome Section */}
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3 flex-wrap">
              <BrandHexMark size="md" />
              <BrandWordmark />
              <SubscriptionBadge />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
                {profile?.display_name ? (
                  <>Welcome back, <span className="text-primary">{profile.display_name}</span> 👋</>
                ) : (
                  <>Your intelligence dashboard</>
                )}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xl">
                {profile?.role && profile.role !== "explorer"
                  ? `Tuned for ${profile.role.replace(/_/g, " ")}${profile.organization ? ` at ${profile.organization}` : ""}. `
                  : ""}
                Track {industries.length} industries and {totalFlows}+ money flows with live signals from 11+ sources.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to="/intel"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
              >
                <Radio className="w-4 h-4" />
                Live feed
              </Link>
              <Link
                to="/cross-intel"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
              >
                <Network className="w-4 h-4 text-brand-orange" />
                Cross-industry
              </Link>
              <Link
                to="/custom-intel"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
              >
                <Layers className="w-4 h-4 text-primary" />
                Intel Lab
              </Link>
            </div>
          </div>

          {/* Subscription card */}
          {!isPro && (
            <div className="w-full lg:w-[280px] shrink-0">
              <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-muted/30 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-brand-orange" />
                  <span className="text-sm font-semibold text-foreground">Upgrade to Pro</span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold tabular-nums text-foreground">${SUBSCRIPTION_USD_MONTHLY}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  Unlock deep dives, cross-industry analysis, and Intel Lab.
                </p>
                <UpgradeButton className="w-full rounded-xl" />
              </div>
            </div>
          )}

          {isPro && (
            <div className="w-full lg:w-[280px] shrink-0">
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="text-sm font-bold text-foreground">Pro Active</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Full access to all features.
                </p>
                {subscription?.current_period_end && (
                  <p className="mt-2 text-xs text-primary font-medium">
                    Renews {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { title: "Live intel feed", desc: "Real-time market signals across all sectors.", icon: Radio, href: "/intel", color: "text-primary" },
          { title: "Cross-industry AI", desc: "Find connections across all 20 industries.", icon: Network, href: "/cross-intel", color: "text-brand-orange" },
          { title: "Deep dives", desc: "Structured AI reports on any thesis.", icon: TrendingUp, href: "/industry/technology", color: "text-signal-violet" },
          { title: "Intel Lab", desc: "Custom research with your own scope.", icon: Layers, href: "/custom-intel", color: "text-signal-emerald" },
        ].map((f) => (
          <Link
            key={f.href}
            to={f.href}
            className="group rounded-2xl border border-border bg-card p-5 hover:shadow-md hover:border-primary/20 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl bg-muted/60", f.color)}>
                <f.icon className="w-4 h-4" />
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Industries", value: industries.length, icon: BarChart3, color: "text-primary" },
          { label: "Money flows", value: totalFlows, icon: Activity, color: "text-foreground" },
          { label: "Data sources", value: "11+", icon: Database, color: "text-brand-orange" },
          { label: "Raw data", value: dbStats.rawData.toLocaleString(), icon: Database, color: "text-foreground" },
          { label: "Insights", value: dbStats.insights.toLocaleString(), icon: Zap, color: "text-brand-orange" },
          { label: "Matches", value: dbStats.matches.toLocaleString(), icon: TrendingUp, color: "text-primary" },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <stat.icon className={cn("w-3.5 h-3.5", stat.color)} />
              <p className="text-[11px] text-muted-foreground font-medium">{stat.label}</p>
            </div>
            <p className={cn("text-xl font-bold tabular-nums", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Alerts toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={alertsEnabled ? () => setAlertsEnabled(false) : handleEnableNotifications}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium transition-all",
            alertsEnabled
              ? "border-primary/20 bg-primary/5 text-primary"
              : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          {alertsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          {alertsEnabled ? "Alerts enabled" : "Enable alerts"}
        </button>
      </div>

      {/* Map */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-brand-orange" />
          <span className="text-sm font-semibold text-foreground">Global coverage</span>
        </div>
        <div className="rounded-2xl border border-border overflow-hidden">
          <WorldMap />
        </div>
      </div>

      {/* Industries */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-foreground">All Industries</h2>
            <p className="text-xs text-muted-foreground">{industries.length} sectors · {totalFlows} flows</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {sortedIndustries.map((ind) => (
            <Link
              key={ind.slug}
              to={`/industry/${ind.slug}`}
              className="group rounded-2xl border border-border bg-card p-4 hover:shadow-md hover:border-primary/20 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{ind.icon}</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-0.5">{ind.name}</h3>
              <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">{ind.description}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] text-primary font-semibold">{ind.subFlows.length} flows</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="text-[10px] text-muted-foreground truncate">
                  {ind.subFlows.slice(0, 2).map((s) => s.shortName).join(", ")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
