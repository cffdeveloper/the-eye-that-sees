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
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";

const totalFlows = industries.reduce((a, i) => a + i.subFlows.length, 0);

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export default function LandingPage() {
  const marqueeItems = [...industries, ...industries];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-x-hidden">
      <LandingBackdrop />

      {/* Nav */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-20 bg-background/80 backdrop-blur-xl border-b border-border/50 sticky top-0"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BrandHexMark size="md" />
            <BrandWordmark />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-sm font-medium" asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button size="sm" className="text-sm font-medium gap-1.5 rounded-full px-5 shadow-sm" asChild>
              <Link to="/auth?mode=signup">
                Get started free
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.header>

      <main className="relative z-10 flex-1">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-20 sm:pb-28">
          <motion.div variants={stagger} initial="hidden" animate="show" className="text-center max-w-3xl mx-auto">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs text-muted-foreground mb-8 shadow-sm">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-emerald/50 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-signal-emerald" />
              </span>
              <span className="font-medium text-foreground">Now live</span>
              <span className="text-border">·</span>
              <span className="text-brand-orange font-medium">Maverick AI Research Agent</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] text-foreground"
            >
              Market intelligence,{" "}
              <span className="text-primary">simplified</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Track {industries.length} industries and {totalFlows}+ money flows with AI-powered research.
              Get structured insights, not noise.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" className="h-12 px-8 text-base font-semibold gap-2 rounded-full shadow-lg hover:shadow-xl transition-all" asChild>
                <Link to="/auth?mode=signup">
                  Start for free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-6 text-base rounded-full border-border hover:border-primary/30 hover:bg-primary/5"
                asChild
              >
                <Link to="/auth" className="gap-2">
                  <Play className="w-4 h-4" />
                  See how it works
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto"
          >
            {[
              { n: `${industries.length}`, l: "Industries", color: "text-primary" },
              { n: `${totalFlows}+`, l: "Money flows", color: "text-brand-orange" },
              { n: "11+", l: "Data sources", color: "text-primary" },
            ].map((s) => (
              <motion.div key={s.l} variants={fadeUp} className="text-center">
                <p className={cn("text-3xl sm:text-4xl font-bold tabular-nums", s.color)}>{s.n}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.l}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Industry marquee */}
        <div className="border-y border-border/50 bg-muted/30 overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap py-3.5 gap-8 text-sm text-muted-foreground">
            {marqueeItems.map((ind, i) => (
              <span key={`${ind.slug}-${i}`} className="inline-flex items-center gap-2 shrink-0">
                <span className="text-base">{ind.icon}</span>
                <span className="font-medium text-foreground/80">{ind.name}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Features */}
        <section className="bg-muted/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
            <Reveal className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">Features</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                Everything you need to stay ahead
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                From live market data to AI-powered deep dives — all in one clean interface.
              </p>
            </Reveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Radio,
                  title: "Live market feed",
                  body: "Crypto, FX, commodities, VC & macro signals — refreshed continuously in one dashboard.",
                  color: "bg-primary/8 text-primary",
                },
                {
                  icon: Globe2,
                  title: "Geo-scoped research",
                  body: "Get analysis tuned to the regions you care about — not generic global takes.",
                  color: "bg-brand-orange/8 text-brand-orange",
                },
                {
                  icon: BarChart3,
                  title: "Structured AI outputs",
                  body: "Metrics, frameworks, comparisons, and scores — not walls of unstructured text.",
                  color: "bg-signal-violet/8 text-signal-violet",
                },
                {
                  icon: Layers,
                  title: "Intel Lab",
                  body: "Define your own research scope, add context, and run custom briefs with follow-ups.",
                  color: "bg-signal-emerald/8 text-signal-emerald",
                },
                {
                  icon: Zap,
                  title: "Cross-industry scans",
                  body: "Find gaps, deals, and bridges across all sectors in a single intelligence pass.",
                  color: "bg-brand-orange/8 text-brand-orange",
                },
                {
                  icon: Shield,
                  title: "Built for decision makers",
                  body: "For founders, investors, and analysts who need evidence-backed views fast.",
                  color: "bg-primary/8 text-primary",
                },
              ].map((f) => (
                <motion.div
                  key={f.title}
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className={cn("mb-4 flex h-11 w-11 items-center justify-center rounded-xl", f.color)}>
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
            <Reveal className="text-center max-w-xl mx-auto mb-14">
              <p className="text-sm font-semibold text-brand-orange tracking-wide uppercase mb-3">How it works</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Three steps to clarity</h2>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Set your scope",
                  body: "Pick your industries, regions, and what matters most to you.",
                  icon: Globe2,
                },
                {
                  step: "2",
                  title: "Get AI insights",
                  body: "Maverick synthesizes data from 11+ sources into clear, structured reports.",
                  icon: Sparkles,
                },
                {
                  step: "3",
                  title: "Make decisions",
                  body: "Act on evidence-backed intel with scores, risks, and opportunities surfaced upfront.",
                  icon: CheckCircle2,
                },
              ].map((s, i) => (
                <Reveal key={s.step} delay={i * 0.1} className="relative">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/8 border border-primary/15">
                      <s.icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs font-bold text-brand-orange mb-2">Step {s.step}</span>
                    <h3 className="text-lg font-bold text-foreground">{s.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xs">{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-muted/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
            <Reveal className="max-w-md mx-auto">
              <div className="rounded-3xl border border-border bg-card p-8 sm:p-10 text-center shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-brand-orange to-primary rounded-t-3xl" />
                <Sparkles className="w-8 h-8 text-brand-orange mx-auto mb-3" />
                <p className="text-sm font-semibold text-primary mb-4">Pro Plan</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl sm:text-6xl font-bold tabular-nums text-foreground">${SUBSCRIPTION_USD_MONTHLY}</span>
                  <span className="text-xl text-muted-foreground font-medium">/mo</span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  Full access to Intel GoldMine — live feeds, AI deep dives, cross-industry analysis, and Intel Lab.
                </p>

                <ul className="mt-6 space-y-3 text-sm text-left max-w-xs mx-auto">
                  {[
                    "AI-powered research & chat",
                    `${industries.length} industries · ${totalFlows}+ money flows`,
                    "Geo-scoped analysis & snapshots",
                    "Cross-industry intelligence",
                    "Custom Intel Lab",
                  ].map((line) => (
                    <li key={line} className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-signal-emerald shrink-0" />
                      <span className="text-foreground">{line}</span>
                    </li>
                  ))}
                </ul>

                <Button size="lg" className="mt-8 w-full h-12 font-semibold rounded-full shadow-md" asChild>
                  <Link to="/auth?mode=signup">
                    Get started
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
                <p className="mt-3 text-xs text-muted-foreground">
                  Already subscribed?{" "}
                  <Link to="/auth" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <Reveal className="rounded-3xl bg-gradient-to-br from-primary/5 via-card to-brand-orange/5 border border-border p-10 sm:p-14 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Ready to see your markets clearly?</h2>
              <p className="mt-4 text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Join thousands of decision makers using Intel GoldMine to stay ahead.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button size="lg" className="h-12 px-8 font-semibold rounded-full shadow-md" asChild>
                  <Link to="/auth?mode=signup">Create free account</Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 rounded-full" asChild>
                  <Link to="/auth">Sign in</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border/50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <BrandHexMark size="sm" />
            <span className="font-semibold text-foreground">Intel GoldMine</span>
          </div>
          <p className="text-xs">© 2026 Intel GoldMine · Not financial advice.</p>
        </div>
      </footer>
    </div>
  );
}
