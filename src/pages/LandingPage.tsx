import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { BrandHexMark } from "@/components/BrandHexMark";
import { BrandWordmark } from "@/components/BrandWordmark";
import { Button } from "@/components/ui/button";
import { SUBSCRIPTION_USD_MONTHLY } from "@/lib/pricing";
import { industries } from "@/lib/industryData";
import { Reveal } from "@/components/motion/Reveal";
import { LandingBackdrop } from "@/components/motion/LandingBackdrop";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Cpu,
  Globe2,
  Layers,
  LayoutGrid,
  Radio,
  Shield,
  TrendingUp,
  Zap,
  PlayCircle,
  FlaskConical,
  BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const totalFlows = industries.reduce((a, i) => a + i.subFlows.length, 0);

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const TESTIMONIALS = [
  { name: "Sarah K.", role: "Head of Strategy, Fintech", text: "Intel GoldMine replaced three separate tools for us. The cross-industry connections alone justify the cost." },
  { name: "Marcus T.", role: "VC Partner", text: "I use the Intel Lab before every investment committee. The depth of analysis is remarkable." },
  { name: "Amara O.", role: "Policy Analyst", text: "Finally, market intelligence that actually understands emerging markets. Geo-scoped analysis is a game-changer." },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const marqueeItems = [...industries, ...industries];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-x-hidden">
      {/* Nav */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-30 bg-background/80 backdrop-blur-xl border-b border-border/50 sticky top-0 shadow-sm shadow-black/[0.03]"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandHexMark size="md" />
            <BrandWordmark className="text-lg" />
          </div>
          <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium">
            <a
              href="#explore"
              className="rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            >
              Explore
            </a>
            <a href="#features" className="rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
              How it works
            </a>
            <a href="#pricing" className="rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              <span className="text-muted-foreground/70">⌘</span>K
            </span>
            <Button variant="ghost" size="sm" className="text-sm font-medium hidden sm:inline-flex" asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button size="sm" className="text-sm font-semibold gap-1.5 rounded-full px-5 sm:px-6 h-10 shadow-md hover:shadow-lg transition-all" asChild>
              <Link to="/auth?mode=signup">
                Get started free
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Sub-nav strip — product context */}
      <div className="relative z-20 border-b border-primary/10 bg-gradient-to-r from-primary/[0.04] via-muted/35 to-brand-orange/[0.05]">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-2.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13px]">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.04] px-3 py-1 font-medium text-foreground shadow-sm">
            <Activity className="w-3.5 h-3.5 text-primary shrink-0" />
            Maverick AI · live pipelines · geo snapshots
          </span>
          <span className="hidden sm:inline text-border">·</span>
          <span className="text-muted-foreground text-center sm:text-left">
            Evidence-backed intelligence for people who move fast — not another noise feed.
          </span>
        </div>
      </div>

      <main className="relative z-10 flex-1">
        {/* Hero */}
        <section ref={heroRef} className="relative overflow-hidden mesh-marketing">
          <LandingBackdrop />
          <div className="absolute inset-0 dot-pattern-fine opacity-50 pointer-events-none" />
          <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(100vw,900px)] h-[600px] rounded-full bg-brand-orange/[0.06] blur-[120px] pointer-events-none" />

          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-10 sm:pt-16 lg:pt-20 pb-8 lg:pb-12">
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 xl:gap-16 items-center"
              >
                <div className="text-center lg:text-left">
                  <motion.div variants={fadeUp} className="mb-6 sm:mb-8 flex justify-center lg:justify-start">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-2xl scale-110" />
                      <BrandHexMark size="lg" className="relative w-20 h-20 sm:w-24 sm:h-24 drop-shadow-xl" />
                    </div>
                  </motion.div>

                  <motion.div
                    variants={fadeUp}
                    className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2 rounded-full border border-border/60 bg-card/90 backdrop-blur-md px-4 py-2 text-sm text-muted-foreground mb-6 sm:mb-8 shadow-md"
                  >
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-emerald/50 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-signal-emerald" />
                    </span>
                    <span className="font-semibold text-foreground">Now live</span>
                    <span className="text-border">·</span>
                    <span className="text-brand-orange font-semibold">Maverick AI Research Agent</span>
                  </motion.div>

                  <motion.h1
                    variants={fadeUp}
                    className="font-display text-4xl sm:text-5xl md:text-6xl xl:text-[3.5rem] 2xl:text-7xl font-bold tracking-tight leading-[1.02] text-foreground"
                  >
                    Market intelligence,{" "}
                    <span className="text-gradient-gold">simplified</span>
                  </motion.h1>

                  <motion.p
                    variants={fadeUp}
                    className="mt-5 sm:mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed"
                  >
                    Track <span className="font-semibold text-foreground"> {industries.length} industries</span> and{" "}
                    <span className="font-semibold text-foreground">{totalFlows}+ money flows</span> with AI — structured
                    outputs, geo scope, and cross-industry scans in one place.
                  </motion.p>

                  <motion.div
                    variants={fadeUp}
                    className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-sm text-muted-foreground"
                  >
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1 border border-border/50">
                      <TrendingUp className="w-3.5 h-3.5 text-signal-emerald" />
                      Live signals
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1 border border-border/50">
                      <Cpu className="w-3.5 h-3.5 text-primary" />
                      Intel Lab
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1 border border-border/50">
                      <Globe2 className="w-3.5 h-3.5 text-brand-orange" />
                      Geo-scoped
                    </span>
                  </motion.div>

                  <motion.div variants={fadeUp} className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                    <Button
                      size="lg"
                      className="h-14 px-10 text-base font-semibold gap-2.5 rounded-full shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                      asChild
                    >
                      <Link to="/auth?mode=signup">
                        Start for free
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-14 px-8 text-base rounded-full border-border/70 bg-background/50 hover:bg-muted/50 transition-all duration-300"
                      asChild
                    >
                      <Link to="/auth" className="gap-2.5">
                        <PlayCircle className="w-4 h-4 text-primary" />
                        See how it works
                      </Link>
                    </Button>
                  </motion.div>
                </div>

                {/* Product preview — browser chrome */}
                <motion.div variants={fadeUp} className="relative hidden lg:block animate-hero-float">
                  <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/10 via-transparent to-brand-orange/10 blur-2xl opacity-80" />
                  <div className="shine-border relative rounded-2xl border border-border/40 bg-card shadow-2xl overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
                      <span className="flex gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-red-400/90" />
                        <span className="h-3 w-3 rounded-full bg-amber-400/90" />
                        <span className="h-3 w-3 rounded-full bg-emerald-400/90" />
                      </span>
                      <div className="flex-1 flex justify-center">
                        <span className="rounded-lg bg-background/80 border border-border/50 px-3 py-1 text-[11px] text-muted-foreground font-medium truncate max-w-[280px]">
                          intelgoldmine.app · Intel dashboard
                        </span>
                      </div>
                    </div>
                    <div className="relative aspect-[16/11] bg-muted/20">
                      <img
                        src="/hero-visual.png"
                        alt=""
                        className="w-full h-full object-cover object-top"
                        loading="eager"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent pointer-events-none" />
                    </div>
                    <div className="grid grid-cols-3 gap-px border-t border-border/40 bg-border/40 text-[11px]">
                      <div className="bg-card/95 p-3 text-center">
                        <p className="font-bold text-primary tabular-nums">{industries.length}</p>
                        <p className="text-muted-foreground">Industries</p>
                      </div>
                      <div className="bg-card/95 p-3 text-center">
                        <p className="font-bold text-brand-orange tabular-nums">{totalFlows}+</p>
                        <p className="text-muted-foreground">Flows</p>
                      </div>
                      <div className="bg-card/95 p-3 text-center">
                        <p className="font-bold text-signal-emerald tabular-nums">11+</p>
                        <p className="text-muted-foreground">Sources</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Hero image — mobile / tablet (hidden when side-by-side preview shows) */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="max-w-6xl mx-auto px-5 sm:px-8 pb-10 lg:hidden"
            >
              <div className="shine-border relative rounded-2xl overflow-hidden shadow-2xl border border-border/40 bg-card">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-muted/30">
                  <span className="h-2 w-2 rounded-full bg-red-400/80" />
                  <span className="h-2 w-2 rounded-full bg-amber-400/80" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
                </div>
                <img
                  src="/hero-visual.png"
                  alt="Intel GoldMine platform — AI-powered market intelligence dashboard"
                  className="w-full h-auto"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/35 via-transparent to-transparent pointer-events-none" />
              </div>
            </motion.div>
          </motion.div>

          {/* Stats row */}
          <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10 pb-16">
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto"
            >
              {[
                { n: `${industries.length}`, l: "Industries", color: "text-primary", icon: LayoutGrid },
                { n: `${totalFlows}+`, l: "Money flows", color: "text-brand-orange", icon: BarChart3 },
                { n: "11+", l: "Data sources", color: "text-signal-emerald", icon: Radio },
              ].map((s) => (
                <motion.div
                  key={s.l}
                  variants={fadeUp}
                  className="group text-center p-5 sm:p-6 rounded-2xl bg-card/90 backdrop-blur-sm border border-border/50 shadow-md hover:shadow-lg hover:border-primary/15 transition-all duration-300"
                >
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 border border-border/40 text-muted-foreground group-hover:text-primary transition-colors">
                    <s.icon className="w-5 h-5" />
                  </div>
                  <p className={cn("text-3xl sm:text-4xl md:text-5xl font-bold tabular-nums font-display", s.color)}>{s.n}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 font-semibold">{s.l}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Explore — quick modules */}
        <section id="explore" className="border-y border-border/40 bg-muted/15">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-3">Explore</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                One platform, three ways in
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Jump into the workflows teams use — from live dashboards to custom Intel Lab briefs.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Live intel feed",
                  desc: "Crypto, FX, commodities, VC & macro — refreshed continuously.",
                  icon: Radio,
                  accent: "from-primary/15 to-primary/[0.02]",
                  href: "#features",
                },
                {
                  title: "Intel Lab",
                  desc: "Define scope, add context, and run custom research with follow-ups.",
                  icon: FlaskConical,
                  accent: "from-brand-orange/15 to-brand-orange/[0.02]",
                  href: "#how-it-works",
                },
                {
                  title: "Cross-industry scan",
                  desc: "Spot gaps and bridges across sectors in a single intelligence pass.",
                  icon: Layers,
                  accent: "from-signal-violet/15 to-signal-violet/[0.02]",
                  href: "#features",
                },
              ].map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className={cn(
                    "group relative rounded-3xl border border-border/50 bg-gradient-to-b p-8 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1",
                    item.accent,
                  )}
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-background/80 border border-border/50 shadow-sm group-hover:border-primary/25 transition-colors">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    Learn more
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Industry marquee */}
        <div className="border-y border-border/40 bg-muted/20 overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap py-5 gap-10 text-sm text-muted-foreground">
            {marqueeItems.map((ind, i) => (
              <span key={`${ind.slug}-${i}`} className="inline-flex items-center gap-2.5 shrink-0">
                <span className="text-lg">{ind.icon}</span>
                <span className="font-medium text-foreground/70">{ind.name}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Visual break — product imagery */}
        <section className="relative border-y border-border/50 bg-gradient-to-br from-muted/30 via-background to-primary/[0.03] overflow-hidden">
          <div className="absolute inset-0 dot-pattern-fine opacity-40 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16 lg:py-20 relative z-10">
            <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-14 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-sm font-semibold text-primary tracking-widest uppercase mb-3">Inside the product</p>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight">
                  Rich visuals, structured intel — not a blank spreadsheet
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed text-base sm:text-lg">
                  Every industry and money flow opens into Maverick-powered briefs, live feeds, and snapshots. Your geo and role travel with you across the app.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  {["Live dashboards", "Intel Lab", "Cross-industry"].map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center rounded-full border border-border/60 bg-card/80 px-4 py-2 text-sm font-semibold text-foreground shadow-sm"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
                className="relative"
              >
                <div className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-primary/20 via-brand-orange/15 to-transparent blur-2xl opacity-90" />
                <div className="shine-border relative rounded-2xl border border-border/50 bg-card overflow-hidden shadow-2xl">
                  <img
                    src="/og-image.png"
                    alt="Intel GoldMine — market intelligence workspace preview"
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent pointer-events-none" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features — bento */}
        <section id="features" className="bg-gradient-to-b from-background via-muted/10 to-background relative overflow-hidden">
          <div className="absolute inset-0 dot-pattern-fine opacity-30 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-24 sm:py-36 relative">
            <Reveal className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
              <p className="text-sm font-semibold text-brand-orange tracking-widest uppercase mb-4">Features</p>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground tracking-tight leading-tight">
                Everything you need to stay ahead
              </h2>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                From live market data to AI-powered deep dives — clarity-first layouts, not noisy dashboards.
              </p>
            </Reveal>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="lg:col-span-7 rounded-[1.75rem] border border-border/50 bg-gradient-to-br from-primary/[0.07] via-card to-card p-8 sm:p-10 shadow-lg hover:shadow-xl transition-shadow shine-border"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary border border-primary/10">
                    <Radio className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">Live market feed</h3>
                    <p className="mt-3 text-base text-muted-foreground leading-relaxed max-w-xl">
                      Crypto, FX, commodities, VC & macro signals — refreshed continuously in one dashboard tuned for
                      decisions, not scrolling.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {["Macro", "FX", "Crypto", "VC"].map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-background/80 border border-border/60 px-3 py-1 text-xs font-semibold text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="lg:col-span-5 rounded-[1.75rem] border border-border/50 bg-gradient-to-b from-brand-orange/[0.08] to-card p-8 sm:p-10 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange/12 text-brand-orange mb-6">
                  <Globe2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Geo-scoped research</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Analysis tuned to the regions you care about — not generic global takes.
                </p>
              </motion.div>

              {[
                {
                  icon: BarChart3,
                  title: "Structured AI outputs",
                  body: "Metrics, frameworks, comparisons, and scores — not walls of text.",
                  iconBg: "bg-signal-violet/12 text-signal-violet border-signal-violet/10",
                  span: "lg:col-span-4",
                  grad: "from-signal-violet/[0.06] to-card",
                },
                {
                  icon: Layers,
                  title: "Intel Lab",
                  body: "Custom scope, context, and follow-up briefs on demand.",
                  iconBg: "bg-signal-emerald/12 text-signal-emerald border-signal-emerald/10",
                  span: "lg:col-span-4",
                  grad: "from-signal-emerald/[0.06] to-card",
                },
                {
                  icon: Zap,
                  title: "Cross-industry scans",
                  body: "Find gaps and bridges across sectors in one pass.",
                  iconBg: "bg-brand-orange/12 text-brand-orange border-brand-orange/10",
                  span: "lg:col-span-4",
                  grad: "from-brand-orange/[0.06] to-card",
                },
              ].map((f) => (
                <motion.div
                  key={f.title}
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className={cn(
                    "rounded-[1.75rem] border border-border/50 bg-gradient-to-b p-8 shadow-md hover:shadow-lg transition-shadow",
                    f.span,
                    f.grad,
                  )}
                >
                  <div
                    className={cn(
                      "mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border",
                      f.iconBg,
                    )}
                  >
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
                </motion.div>
              ))}

              <motion.div
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="lg:col-span-12 rounded-[1.75rem] border border-border/50 bg-gradient-to-r from-primary/[0.04] via-muted/20 to-brand-orange/[0.05] p-8 sm:p-10 flex flex-col md:flex-row md:items-center gap-8"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/10">
                  <Shield className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground">Built for decision makers</h3>
                  <p className="mt-2 text-muted-foreground max-w-3xl leading-relaxed">
                    Founders, investors, and analysts who need evidence-backed views fast — with UI that respects your
                    time.
                  </p>
                </div>
                <Button variant="outline" className="rounded-full shrink-0 border-border/60" asChild>
                  <Link to="/auth?mode=signup">
                    Get started
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="bg-card">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-24 sm:py-36">
            <Reveal className="text-center max-w-2xl mx-auto mb-20">
              <p className="text-sm font-semibold text-brand-orange tracking-widest uppercase mb-4">How it works</p>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground tracking-tight leading-tight">
                Three steps to clarity
              </h2>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  step: "01",
                  title: "Set your scope",
                  body: "Pick your industries, regions, and what matters most to you.",
                  icon: Globe2,
                },
                {
                  step: "02",
                  title: "Get AI insights",
                  body: "Maverick synthesizes data from 11+ sources into clear, structured reports.",
                  icon: BarChart3,
                },
                {
                  step: "03",
                  title: "Make decisions",
                  body: "Act on evidence-backed intel with scores, risks, and opportunities surfaced upfront.",
                  icon: CheckCircle2,
                },
              ].map((s, i) => (
                <Reveal key={s.step} delay={i * 0.15} className="relative">
                  <div className="flex flex-col items-start text-left">
                    <span className="text-6xl font-display font-bold text-primary/10 mb-4">{s.step}</span>
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/8 border border-primary/10">
                      <s.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">{s.title}</h3>
                    <p className="mt-3 text-base text-muted-foreground leading-relaxed">{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-gradient-to-b from-card to-background">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-24 sm:py-32">
            <Reveal className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-sm font-semibold text-brand-orange tracking-widest uppercase mb-4">Trusted by leaders</p>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
                What our users say
              </h2>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((t, i) => (
                <Reveal key={t.name} delay={i * 0.1}>
                  <div className="rounded-3xl border border-border/50 bg-card p-8 shadow-sm h-full flex flex-col">
                    <div className="mb-5 h-px w-12 bg-primary/40 rounded-full" aria-hidden />
                    <p className="text-base text-foreground leading-relaxed flex-1 border-l-2 border-primary/20 pl-4 italic">
                      "{t.text}"
                    </p>
                    <div className="mt-6 pt-5 border-t border-border/50">
                      <p className="text-sm font-bold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.role}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="bg-muted/20">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-24 sm:py-36">
            <Reveal className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-sm font-semibold text-brand-orange tracking-widest uppercase mb-4">Pricing</p>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
                Simple, transparent pricing
              </h2>
              <p className="mt-6 text-lg text-muted-foreground">
                Start on the free tier. Move to Pro when you need full access to every workflow.
              </p>
            </Reveal>

            <Reveal className="max-w-md mx-auto">
              <div className="rounded-3xl border border-border/50 bg-card p-10 sm:p-12 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-brand-orange to-primary" />
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-orange/10 mb-6">
                  <BadgeCheck className="w-8 h-8 text-brand-orange" />
                </div>
                <p className="text-lg font-bold text-foreground mb-6">Pro Plan</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-display text-6xl sm:text-7xl font-bold tabular-nums text-foreground">${SUBSCRIPTION_USD_MONTHLY}</span>
                  <span className="text-xl text-muted-foreground font-medium">/mo</span>
                </div>
                <p className="mt-6 text-base text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  Full access to Intel GoldMine — live feeds, AI deep dives, cross-industry analysis, and Intel Lab.
                </p>

                <ul className="mt-8 space-y-4 text-left max-w-xs mx-auto">
                  {[
                    "AI-powered research & chat",
                    `${industries.length} industries · ${totalFlows}+ money flows`,
                    "Geo-scoped analysis & snapshots",
                    "Cross-industry intelligence",
                    "Custom Intel Lab",
                  ].map((line) => (
                    <li key={line} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-signal-emerald shrink-0" />
                      <span className="text-sm text-foreground font-medium">{line}</span>
                    </li>
                  ))}
                </ul>

                <Button size="lg" className="mt-10 w-full h-14 text-base font-bold rounded-full shadow-lg hover:shadow-xl transition-all" asChild>
                  <Link to="/auth?mode=signup">
                    Get started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <p className="mt-4 text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/auth" className="text-primary hover:underline font-semibold">
                    Sign in
                  </Link>
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 sm:py-36">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <Reveal>
              <div className="rounded-[2rem] bg-gradient-to-br from-primary/[0.06] via-card to-brand-orange/[0.06] border border-border/40 p-12 sm:p-20 text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-primary/[0.03] blur-[100px]" />
                <div className="relative z-10">
                  <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground tracking-tight leading-tight">
                    Ready to see your<br />markets clearly?
                  </h2>
                  <p className="mt-6 text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
                    Join thousands of decision makers using Intel GoldMine to stay ahead of the curve.
                  </p>
                  <div className="mt-10 flex flex-wrap justify-center gap-4">
                    <Button size="lg" className="h-14 px-10 text-base font-bold rounded-full shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300" asChild>
                      <Link to="/auth?mode=signup">Create free account</Link>
                    </Button>
                    <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-full" asChild>
                      <Link to="/auth">Sign in</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border/50 bg-muted/20 py-14">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <BrandHexMark size="sm" />
              <span className="font-bold text-foreground text-lg">Intel GoldMine</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              AI-powered market intelligence with geo scope, structured outputs, and Maverick — your research copilot.
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Product</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#explore" className="text-foreground/80 hover:text-primary transition-colors">
                  Explore
                </a>
              </li>
              <li>
                <a href="#features" className="text-foreground/80 hover:text-primary transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-foreground/80 hover:text-primary transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Legal</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/privacy-policy" className="text-foreground/80 hover:text-primary transition-colors">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-foreground/80 hover:text-primary transition-colors">
                  Terms of service
                </Link>
              </li>
            </ul>
          </div>
          <div className="md:col-span-4 flex flex-col justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Account</p>
              <div className="flex flex-wrap gap-3">
                <Button size="sm" variant="outline" className="rounded-full" asChild>
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button size="sm" className="rounded-full" asChild>
                  <Link to="/auth?mode=signup">Get started</Link>
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">© 2026 Intel GoldMine · Not financial advice.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
