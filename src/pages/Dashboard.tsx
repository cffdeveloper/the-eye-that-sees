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
  ArrowUpRight,
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
import { motion } from "framer-motion";
import { IntelWorkflowGuide } from "@/components/marketing/ProductWayfinding";
import { dashboardIntelCopy } from "@/lib/pageIntelMessages";

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.06 } },
};

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

  const roleTitle =
    profile?.role && profile.role !== "explorer"
      ? profile.role
          .split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : null;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-[1400px] space-y-6 pb-8 sm:space-y-8 sm:pb-10"
    >
      {/* Welcome hero */}
      <motion.section variants={fadeIn} className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-4 shadow-sm sm:rounded-3xl sm:p-8 md:p-10">
        <div className="absolute right-0 top-0 h-[200px] w-[min(100%,280px)] rounded-3xl bg-gradient-to-bl from-brand-orange/[0.04] via-transparent to-transparent sm:h-[300px] sm:w-[400px]" />
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
          <div className="space-y-5 max-w-2xl">
            <div className="flex items-center gap-3 flex-wrap">
              <BrandHexMark size="md" />
              <BrandWordmark className="text-lg" />
              <SubscriptionBadge />
            </div>

            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
                {profile?.display_name ? (
                  <>Welcome back, <span className="text-gradient-gold">{profile.display_name}</span></>
                ) : (
                  <>Your intelligence dashboard</>
                )}
              </h1>
              <div className="mt-3 space-y-2.5 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
                {roleTitle && (
                  <p>
                    <span className="font-semibold text-foreground">{roleTitle}</span>
                    {profile?.organization && (
                      <span className="text-foreground/90"> · {profile.organization}</span>
                    )}
                    <span>
                      {" "}
                      — we use this to calibrate tone and depth (change anytime in Profile).
                    </span>
                  </p>
                )}
                <p>
                  <span className="font-semibold text-foreground">Coverage.</span> {dashboardIntelCopy.coverage}
                </p>
                <p>
                  <span className="font-semibold text-foreground">What you can do.</span> {dashboardIntelCopy.capabilities}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
              <Link
                to="/intel"
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg sm:px-6"
              >
                <Radio className="h-4 w-4 shrink-0" />
                Live feed
              </Link>
              <Link
                to="/cross-intel"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border/60 bg-card px-5 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted/30"
              >
                <Network className="h-4 w-4 shrink-0 text-brand-orange" />
                Cross-industry
              </Link>
              <Link
                to="/custom-intel"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border/60 bg-card px-5 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted/30"
              >
                <Layers className="h-4 w-4 shrink-0 text-primary" />
                Intel Lab
              </Link>
            </div>
          </div>

          {/* Subscription card */}
          {!isPro && (
            <div className="w-full lg:w-[300px] shrink-0">
              <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card to-muted/20 p-6 shadow-sm">
                <div className="flex items-center gap-2.5 mb-4">
                  <ArrowUpRight className="w-5 h-5 text-primary" />
                  <span className="text-sm font-bold text-foreground">Upgrade to Pro</span>
                </div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="font-display text-4xl font-bold tabular-nums text-foreground">${SUBSCRIPTION_USD_MONTHLY}</span>
                  <span className="text-sm text-muted-foreground font-medium">/mo</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  Unlock deep dives, cross-industry analysis, and Intel Lab.
                </p>
                <UpgradeButton className="w-full rounded-xl h-11 font-bold" />
              </div>
            </div>
          )}

          {isPro && (
            <div className="w-full lg:w-[300px] shrink-0">
              <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-6">
                <div className="flex items-center gap-2.5 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="text-sm font-bold text-foreground">Pro Active</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Full access to all features.
                </p>
                {subscription?.current_period_end && (
                  <p className="mt-3 text-xs text-primary font-semibold">
                    Renews {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.section>

      <motion.section variants={fadeIn}>
        <IntelWorkflowGuide />
      </motion.section>

      {/* Quick actions */}
      <motion.div variants={fadeIn} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Live intel feed", desc: "Crypto, FX, commodities, VC, supply chain & headlines—refreshed so you orient before you drill down.", icon: Radio, href: "/intel", color: "text-primary", gradient: "from-primary/8 to-transparent" },
          { title: "Cross-industry AI", desc: "One pass across mapped sectors to surface gaps, deals, connections, and alerts for your region.", icon: Network, href: "/cross-intel", color: "text-brand-orange", gradient: "from-brand-orange/8 to-transparent" },
          { title: "Deep dives", desc: "Sector briefs plus every money flow—tailored intel, news, and snapshots per lane.", icon: TrendingUp, href: "/industry/technology", color: "text-signal-violet", gradient: "from-signal-violet/8 to-transparent" },
          { title: "Intel Lab", desc: "Scope primary vs secondary flows, add context, get structured briefs + follow-up chat.", icon: Layers, href: "/custom-intel", color: "text-signal-emerald", gradient: "from-signal-emerald/8 to-transparent" },
        ].map((f) => (
          <Link
            key={f.href}
            to={f.href}
            className={cn(
              "group premium-card p-6 bg-gradient-to-br",
              f.gradient
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl bg-card border border-border/40", f.color)}>
                <f.icon className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-base font-bold text-foreground">{f.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </Link>
        ))}
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeIn} className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
        {[
          { label: "Industries", value: industries.length, icon: BarChart3, color: "text-primary" },
          { label: "Money flows", value: totalFlows, icon: Activity, color: "text-foreground" },
          { label: "Data sources", value: "11+", icon: Database, color: "text-brand-orange" },
          { label: "Raw data", value: dbStats.rawData.toLocaleString(), icon: Database, color: "text-foreground" },
          { label: "Insights", value: dbStats.insights.toLocaleString(), icon: Zap, color: "text-brand-orange" },
          { label: "Matches", value: dbStats.matches.toLocaleString(), icon: TrendingUp, color: "text-primary" },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card p-3 sm:rounded-2xl sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={cn("w-4 h-4", stat.color)} />
              <p className="text-xs text-muted-foreground font-semibold">{stat.label}</p>
            </div>
            <p className={cn("text-2xl font-bold tabular-nums font-display", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Alerts toggle */}
      <motion.div variants={fadeIn} className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={alertsEnabled ? () => setAlertsEnabled(false) : handleEnableNotifications}
          className={cn(
            "inline-flex w-full items-center justify-center gap-2.5 rounded-full border px-5 py-3 text-sm font-semibold transition-all sm:w-auto",
            alertsEnabled
              ? "border-primary/20 bg-primary/[0.04] text-primary"
              : "border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/30"
          )}
        >
          {alertsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          {alertsEnabled ? "Alerts enabled" : "Enable alerts"}
        </button>
      </motion.div>

      {/* Map */}
      <motion.div variants={fadeIn} className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2.5">
          <MapPin className="h-5 w-5 shrink-0 text-brand-orange" />
          <span className="text-base font-bold text-foreground sm:text-lg">Global coverage</span>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border/50 shadow-sm sm:rounded-3xl">
          <WorldMap />
        </div>
      </motion.div>

      {/* Industries */}
      <motion.div variants={fadeIn}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">All Industries</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              {industries.length} sectors · {totalFlows} flows — each card opens the full sector workspace; open any{" "}
              <span className="text-foreground/90 font-medium">money flow</span> for lane-specific AI, news, and history.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sortedIndustries.map((ind) => (
            <Link
              key={ind.slug}
              to={`/industry/${ind.slug}`}
              className="group premium-card p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{ind.icon}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-1">{ind.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{ind.description}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-primary font-bold">{ind.subFlows.length} flows</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="text-xs text-muted-foreground truncate">
                  {ind.subFlows.slice(0, 2).map((s) => s.shortName).join(", ")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
