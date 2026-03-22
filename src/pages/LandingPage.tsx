import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BrandHexMark } from "@/components/BrandHexMark";
import { BrandWordmark } from "@/components/BrandWordmark";
import { Button } from "@/components/ui/button";
import { SUBSCRIPTION_USD_MONTHLY } from "@/lib/pricing";
import { industries } from "@/lib/industryData";
import { Reveal } from "@/components/motion/Reveal";
import { LandingBackdrop } from "@/components/motion/LandingBackdrop";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Globe2,
  Layers,
  LineChart,
  Radio,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const totalFlows = industries.reduce((a, i) => a + i.subFlows.length, 0);

const heroStagger = {
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.06 },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const cardStagger = {
  show: { transition: { staggerChildren: 0.07 } },
};

const cardItem = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function LandingPage() {
  const marqueeItems = [...industries, ...industries];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-x-hidden">
      <LandingBackdrop />

      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-20 border-b border-border/60 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400 }}>
              <BrandHexMark size="md" />
            </motion.div>
            <div className="flex flex-col min-w-0">
              <span className="truncate leading-tight">
                <BrandWordmark />
              </span>
              <span className="text-xs text-muted-foreground">Maverick AI · Research agent</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="sm" className="text-sm" asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button size="sm" className="text-sm gap-1.5 shadow-md hover:shadow-lg transition-shadow" asChild>
              <Link to="/auth?mode=signup">
                Get started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.header>

      <main className="relative z-10 flex-1">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-20 sm:pb-28">
          <div className="grid lg:grid-cols-[1fr_min(44%,480px)] gap-12 lg:gap-16 items-center">
            <motion.div className="min-w-0" variants={heroStagger} initial="hidden" animate="show">
              <motion.div variants={heroItem} className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/90 px-4 py-1.5 text-xs text-muted-foreground mb-8 shadow-sm backdrop-blur-sm">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <span className="text-foreground/90 font-medium">Intel GoldMine</span>
                <span className="text-border">·</span>
                <span className="text-brand-orange font-medium">Maverick AI</span>
              </motion.div>

              <motion.h1
                variants={heroItem}
                className="text-4xl sm:text-5xl md:text-[3.15rem] font-semibold tracking-tight leading-[1.08] max-w-4xl text-foreground"
              >
                The intelligence layer for{" "}
                <span className="text-primary">capital, strategy,</span>
                <br className="hidden sm:block" /> and every industry{" "}
                <span className="text-brand-orange">money flow</span>
              </motion.h1>

              <motion.p
                variants={heroItem}
                className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed"
              >
                <strong className="text-foreground font-medium">Intel GoldMine</strong> is your intelligence platform.{" "}
                <strong className="text-foreground font-medium">Maverick</strong> is the AI agent that maps {industries.length}{" "}
                industries and {totalFlows}+ money flows, pulls live signals from 11+ sources, and produces structured research —
                cross-industry scans, deep dives, and your own Intel Lab.
              </motion.p>

              <motion.div variants={heroItem} className="mt-10 flex flex-wrap items-center gap-3">
                <Button size="lg" className="h-12 px-8 text-base font-medium gap-2 shadow-lg hover:shadow-xl transition-shadow" asChild>
                  <Link to="/auth?mode=signup">
                    Start Intel GoldMine
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-6 text-base border-border/80 hover:border-primary/40 hover:bg-primary/5 transition-colors"
                  asChild
                >
                  <Link to="/auth">Sign in to account</Link>
                </Button>
              </motion.div>

              <motion.div variants={heroItem} className="mt-14 grid sm:grid-cols-3 gap-4 max-w-3xl">
                {[
                  { n: `${industries.length}`, l: "Industries modeled", accent: "primary" as const },
                  { n: `${totalFlows}+`, l: "Money flows tracked", accent: "orange" as const },
                  { n: "11+", l: "Live data sources", accent: "primary" as const },
                ].map((s) => (
                  <motion.div
                    key={s.l}
                    whileHover={{ y: -3, transition: { type: "spring", stiffness: 400, damping: 20 } }}
                    className={cn(
                      "rounded-xl border bg-card/80 px-5 py-4 shadow-sm transition-shadow hover:shadow-md",
                      s.accent === "orange" ? "border-brand-orange/30" : "border-primary/20",
                    )}
                  >
                    <p
                      className={cn(
                        "text-2xl font-semibold tabular-nums",
                        s.accent === "orange" ? "text-brand-orange" : "text-primary",
                      )}
                    >
                      {s.n}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{s.l}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.figure
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto w-full max-w-md lg:max-w-none"
            >
              <div className="relative rounded-2xl overflow-hidden border border-border/60 bg-card shadow-2xl shadow-black/25 ring-1 ring-border/50">
                <motion.div
                  className="absolute -inset-1 bg-primary/20 opacity-50 blur-2xl"
                  animate={{ opacity: [0.35, 0.55, 0.35] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=82"
                  alt="Professional analyst reviewing financial intelligence dashboards on multiple monitors"
                  className="relative w-full h-full object-cover aspect-[4/3] lg:aspect-[5/4]"
                  width={1400}
                  height={1120}
                  loading="eager"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/15 to-transparent pointer-events-none" />
                <div className="absolute top-4 left-4 right-4 flex items-center gap-2 z-10">
                  <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/80 backdrop-blur-md px-2.5 py-1.5 text-[10px] text-muted-foreground shadow-sm">
                    <LineChart className="w-3.5 h-3.5 text-primary" />
                    <span className="font-medium text-foreground">Live synthesis</span>
                    <motion.span
                      className="ml-1 h-1.5 w-1.5 rounded-full bg-emerald-500"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                </div>
                <figcaption className="absolute bottom-0 left-0 right-0 px-4 py-3 text-[11px] text-muted-foreground text-center sm:text-left z-10">
                  Command-center view — structured intel, not a toy chat UI
                </figcaption>
              </div>
              <div className="absolute -z-10 -right-6 -bottom-6 w-40 h-40 rounded-full bg-primary/15 blur-3xl" aria-hidden />
            </motion.figure>
          </div>
        </section>

        {/* Industry marquee */}
        <div className="relative border-y border-border/50 bg-muted/25 overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap py-3.5 gap-10 text-sm text-muted-foreground">
            {marqueeItems.map((ind, i) => (
              <span key={`${ind.slug}-${i}`} className="inline-flex items-center gap-2 shrink-0">
                <span className="text-base">{ind.icon}</span>
                <span className="font-medium text-foreground/90">{ind.name}</span>
                <span className="text-xl text-border">·</span>
              </span>
            ))}
          </div>
        </div>

        {/* Platform */}
        <section className="border-t border-border/50 bg-muted/15">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
            <Reveal className="text-center max-w-2xl mx-auto">
              <p className="text-xs font-semibold text-brand-orange tracking-wide uppercase mb-2">Platform</p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
                Everything you need to see around corners
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Pipelines, regions, and structured outputs — built for operators who can’t afford slow research.
              </p>
            </Reveal>

            <motion.div
              className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-5"
              variants={cardStagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
            >
              {[
                {
                  icon: Radio,
                  title: "Live market feed",
                  body: "Crypto, FX, commodities, VC & macro signals — refreshed on a steady cadence in one command center.",
                },
                {
                  icon: Globe2,
                  title: "Geo-scoped research",
                  body: "Snapshots and analysis tuned to regions you care about — not generic US-only takes.",
                },
                {
                  icon: BarChart3,
                  title: "Structured AI outputs",
                  body: "Metrics, frameworks, comparisons, and scores — not walls of unstructured text.",
                },
                {
                  icon: Layers,
                  title: "Intel Lab",
                  body: "Define primary vs secondary lanes, add free-text context, and run custom briefs plus follow-ups.",
                },
                {
                  icon: Zap,
                  title: "Cross-industry mode",
                  body: "Find gaps, deals, and bridges across all sectors in a single intelligence pass.",
                },
                {
                  icon: Shield,
                  title: "Built for operators",
                  body: "For founders, investors, and analysts who need evidence-backed views fast.",
                },
              ].map((f, i) => (
                <motion.div
                  key={f.title}
                  variants={cardItem}
                  whileHover={{ y: -4, transition: { type: "spring", stiffness: 350, damping: 22 } }}
                  className="group rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm hover:shadow-xl hover:border-primary/25 transition-colors duration-300"
                >
                  <div
                    className={cn(
                      "mb-4 flex h-10 w-10 items-center justify-center rounded-xl border transition-colors",
                      i % 2 === 0
                        ? "border-primary/20 bg-primary/5 text-primary group-hover:bg-primary/10"
                        : "border-brand-orange/25 bg-brand-orange/5 text-brand-orange group-hover:bg-brand-orange/10",
                    )}
                  >
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-border/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
            <Reveal className="text-center max-w-xl mx-auto">
              <p className="text-xs font-semibold text-primary tracking-wide uppercase mb-2">Workflow</p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">From signal to decision</h2>
            </Reveal>
            <div className="mt-12 grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Scope & geo",
                  body: "Pick global or regional context so Maverick doesn’t hallucinate a generic market.",
                  icon: Globe2,
                },
                {
                  step: "02",
                  title: "Synthesize",
                  body: "Cross-industry scans, deep dives, and Intel Lab briefs with structured blocks.",
                  icon: Sparkles,
                },
                {
                  step: "03",
                  title: "Act",
                  body: "Export thinking into strategy — with sources, scores, and risks surfaced upfront.",
                  icon: CheckCircle2,
                },
              ].map((s, i) => (
                <Reveal key={s.step} delay={i * 0.08} className="relative">
                  <div className="flex flex-col items-center text-center md:items-start md:text-left">
                    <span className="text-[11px] font-bold tabular-nums text-primary/80 mb-2">{s.step}</span>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-card shadow-sm">
                      <s.icon className="w-6 h-6 text-brand-orange" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="border-t border-border/50 bg-muted/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
            <Reveal className="max-w-xl mx-auto">
              <motion.div
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="rounded-2xl border border-border/70 bg-card p-8 sm:p-10 text-center shadow-xl border-l-4 border-l-brand-orange relative overflow-hidden"
              >
                <motion.div
                  className="pointer-events-none absolute inset-0 opacity-[0.07]"
                  style={{
                    background: "radial-gradient(circle at 30% 20%, hsl(var(--primary)) 0%, transparent 50%)",
                  }}
                />
                <div className="relative">
                  <Sparkles className="w-8 h-8 text-brand-orange mx-auto mb-2" />
                  <p className="text-xs font-medium text-primary">Pricing</p>
                  <div className="mt-4 flex items-baseline justify-center gap-1">
                    <span className="text-5xl sm:text-6xl font-semibold tabular-nums text-foreground">${SUBSCRIPTION_USD_MONTHLY}</span>
                    <span className="text-xl text-muted-foreground font-medium">/month</span>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    Full <span className="text-foreground font-medium">Intel GoldMine</span> access — Maverick runs live intel, AI briefs, deep
                    dives, cross-industry analysis, and Intel Lab. Billed by your workspace; talk to your admin to activate.
                  </p>
                  <Button size="lg" className="mt-8 h-12 px-10 font-medium gap-2 shadow-md" asChild>
                    <Link to="/auth?mode=signup">
                      Get access
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Already subscribed?{" "}
                    <Link to="/auth" className="text-primary hover:underline font-medium">
                      Sign in
                    </Link>
                  </p>
                </div>
              </motion.div>
            </Reveal>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-border/50 pb-24 pt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <Reveal className="rounded-3xl border border-border/60 bg-card p-10 sm:p-14 text-center shadow-lg relative overflow-hidden">
              <div className="absolute -top-24 right-0 h-48 w-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" aria-hidden />
              <div className="absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-brand-orange/10 blur-3xl pointer-events-none" aria-hidden />
              <div className="relative">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">Ready to see your markets clearly?</h2>
                <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                  Create an account or sign in — your dashboard, live feed, and industries unlock after authentication.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Button size="lg" className="h-12 px-8 font-medium shadow-md hover:shadow-lg transition-shadow" asChild>
                    <Link to="/auth?mode=signup">Create free account</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-12 px-8 border-border hover:border-primary/35 hover:bg-primary/5" asChild>
                    <Link to="/auth">Sign in</Link>
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative z-10 border-t border-border/60 py-10 bg-card/50 backdrop-blur-sm"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <BrandHexMark size="sm" />
            <span className="font-medium text-foreground">Intel GoldMine</span>
          </div>
          <p className="text-center sm:text-right text-xs sm:text-sm">Maverick AI · Not financial advice.</p>
        </div>
      </motion.footer>
    </div>
  );
}
