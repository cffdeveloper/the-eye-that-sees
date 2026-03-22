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
  Radio,
  Shield,
  TrendingUp,
  Zap,
  PlayCircle,
  FlaskConical,
  BadgeCheck,
  Star,
  Quote,
} from "lucide-react";
import { cn } from "@/lib/utils";

const totalFlows = industries.reduce((a, i) => a + i.subFlows.length, 0);

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.12 } },
};

const TESTIMONIALS = [
  {
    name: "Sarah K.",
    role: "Head of Strategy, Fintech",
    text: "Intel GoldMine replaced three separate tools for us. The cross-industry connections alone justify the cost.",
  },
  {
    name: "Marcus T.",
    role: "VC Partner",
    text: "I use the Intel Lab before every investment committee. The depth of analysis is remarkable.",
  },
  {
    name: "Amara O.",
    role: "Policy Analyst",
    text: "Finally, market intelligence that actually understands emerging markets. Geo-scoped analysis is a game-changer.",
  },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.15]);
  const marqueeItems = [...industries, ...industries];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-x-hidden">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 border-b border-border/40 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/65"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-[64px] sm:h-[70px] flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 min-w-0 group">
            <BrandHexMark size="md" className="transition-transform group-hover:scale-[1.03]" />
            <BrandWordmark className="text-base sm:text-lg truncate" />
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-[13px] sm:text-sm font-semibold">
            {[
              ["Explore", "#explore"],
              ["Features", "#features"],
              ["How it works", "#how-it-works"],
              ["Pricing", "#pricing"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="rounded-full px-3.5 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="sm" className="text-sm font-semibold hidden sm:inline-flex" asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button size="sm" className="text-sm font-bold gap-1.5 rounded-full px-4 sm:px-5 h-9 shadow-md" asChild>
              <Link to="/auth?mode=signup">
                Get started
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.header>

      <main className="relative z-10 flex-1">
        {/* Hero — layered aurora + mesh (not flat navy) */}
        <section ref={heroRef} className="relative overflow-hidden mesh-marketing landing-aurora text-foreground">
          <LandingBackdrop />
          <div className="absolute inset-0 dot-pattern-fine opacity-[0.45] pointer-events-none" />
          <div className="absolute inset-0 grid-bg opacity-25 pointer-events-none" />

          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative pb-10 sm:pb-14">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12 lg:pt-14 pb-0">
              <p className="text-center lg:text-left text-[13px] sm:text-sm text-muted-foreground font-medium mb-6 flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1.5">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/90 backdrop-blur-sm px-3 py-1.5 text-foreground shadow-sm">
                  <Activity className="w-3.5 h-3.5 text-primary" />
                  Maverick AI · live pipelines · geo snapshots
                </span>
                <span className="hidden sm:inline text-border">·</span>
                <span className="text-muted-foreground max-w-md sm:max-w-none">
                  Evidence-backed intelligence — not another noise feed.
                </span>
              </p>

              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="grid lg:grid-cols-[1.08fr_0.92fr] gap-10 lg:gap-12 xl:gap-16 items-center"
              >
                <div className="text-center lg:text-left">
                  <motion.div variants={fadeUp} className="mb-5 sm:mb-6 flex justify-center lg:justify-start">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-3xl bg-primary/15 blur-3xl scale-125" />
                      <BrandHexMark size="lg" className="relative w-[4.5rem] h-[4.5rem] sm:w-24 sm:h-24 drop-shadow-lg" />
                    </div>
                  </motion.div>

                  <motion.div
                    variants={fadeUp}
                    className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2 rounded-full border border-border/60 bg-card/80 backdrop-blur-md px-3.5 py-1.5 text-[13px] sm:text-sm text-muted-foreground mb-6 shadow-sm"
                  >
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-emerald/40" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-signal-emerald" />
                    </span>
                    <span className="font-semibold text-foreground">Now live</span>
                    <span className="text-border">·</span>
                    <span className="text-brand-orange font-semibold">Research-grade briefs</span>
                  </motion.div>

                  <motion.h1
                    variants={fadeUp}
                    className="font-display text-[2.35rem] sm:text-5xl md:text-6xl xl:text-[3.5rem] font-bold tracking-[-0.03em] leading-[1.05] text-foreground"
                  >
                    Turn noise into{" "}
                    <span className="text-gradient-gold bg-clip-text text-transparent">decisions</span>
                    <span className="text-foreground">.</span>
                  </motion.h1>

                  <motion.p
                    variants={fadeUp}
                    className="mt-5 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed"
                  >
                    <span className="font-semibold text-foreground">{industries.length} industries</span> ·{" "}
                    <span className="font-semibold text-foreground">{totalFlows}+ money flows</span> ·{" "}
                    <span className="font-semibold text-foreground">11+ sources</span>
                    <span> — structured intel, geo scope, and cross-industry scans in one workspace.</span>
                  </motion.p>

                  <motion.div
                    variants={fadeUp}
                    className="mt-5 flex flex-wrap items-center justify-center lg:justify-start gap-2.5 text-[13px] sm:text-sm"
                  >
                    {[
                      { icon: TrendingUp, label: "Live signals", c: "text-signal-emerald" },
                      { icon: Cpu, label: "Intel Lab", c: "text-primary" },
                      { icon: Globe2, label: "Geo-scoped", c: "text-brand-orange" },
                    ].map(({ icon: Icon, label, c }) => (
                      <span
                        key={label}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 text-foreground/90"
                      >
                        <Icon className={cn("w-3.5 h-3.5", c)} />
                        {label}
                      </span>
                    ))}
                  </motion.div>

                  <motion.div variants={fadeUp} className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4">
                    <Button
                      size="lg"
                      className="h-12 sm:h-14 px-8 sm:px-10 text-base font-bold gap-2 rounded-full shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
                      asChild
                    >
                      <Link to="/auth?mode=signup">
                        Start free
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 text-base rounded-full border-border/70 bg-card/60 hover:bg-card"
                      asChild
                    >
                      <Link to="/auth" className="gap-2.5">
                        <PlayCircle className="w-4 h-4 text-primary" />
                        Sign in to explore
                      </Link>
                    </Button>
                  </motion.div>
                </div>

                <motion.div variants={fadeUp} className="relative hidden lg:block">
                  <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-primary/15 via-transparent to-brand-orange/15 blur-2xl" />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="shine-border relative rounded-2xl border border-border/40 bg-card shadow-2xl overflow-hidden"
                  >
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/40">
                      <span className="flex gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
                      </span>
                      <div className="flex-1 flex justify-center">
                        <span className="rounded-lg bg-background/80 border border-border/50 px-3 py-1 text-[11px] text-muted-foreground font-medium truncate max-w-[280px]">
                          intelgoldmine.app · dashboard
                        </span>
                      </div>
                    </div>
                    <div className="relative aspect-[16/10.5] bg-muted/30">
                      <img
                        src="/hero-visual.png"
                        alt=""
                        className="w-full h-full object-cover object-top"
                        loading="eager"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/35 via-transparent to-transparent pointer-events-none" />
                    </div>
                    <div className="grid grid-cols-3 gap-px border-t border-border/40 bg-border/30 text-[11px]">
                      <div className="bg-card/95 p-3 text-center backdrop-blur-sm">
                        <p className="font-bold text-primary tabular-nums">{industries.length}</p>
                        <p className="text-muted-foreground">Industries</p>
                      </div>
                      <div className="bg-card/95 p-3 text-center backdrop-blur-sm">
                        <p className="font-bold text-brand-orange tabular-nums">{totalFlows}+</p>
                        <p className="text-muted-foreground">Flows</p>
                      </div>
                      <div className="bg-card/95 p-3 text-center backdrop-blur-sm">
                        <p className="font-bold text-signal-emerald tabular-nums">11+</p>
                        <p className="text-muted-foreground">Sources</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="max-w-6xl mx-auto px-4 sm:px-8 pt-10 pb-4 lg:hidden"
            >
              <div className="shine-border relative rounded-2xl overflow-hidden border border-border/40 bg-card shadow-2xl">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-muted/30">
                  <span className="h-2 w-2 rounded-full bg-red-400/90" />
                  <span className="h-2 w-2 rounded-full bg-amber-400/90" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400/90" />
                </div>
                <img
                  src="/hero-visual.png"
                  alt="Intel GoldMine — market intelligence workspace"
                  className="w-full h-auto"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent pointer-events-none" />
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Explore — warm sand band */}
        <section id="explore" className="relative border-y border-amber-200/30 landing-band-sand">
          <div className="absolute inset-0 dot-pattern-fine opacity-[0.28] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14 sm:py-20 relative">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
              <p className="text-sm font-semibold text-primary tracking-[0.2em] uppercase mb-3">Explore</p>
              <h2 className="font-display text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-foreground tracking-tight leading-[1.1]">
                Three entry points. One intelligence stack.
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed text-base sm:text-lg">
                Pick how you work — live pulse, custom lab, or cross-sector sweep.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
              {[
                {
                  title: "Live intel feed",
                  desc: "Crypto, FX, commodities, VC & macro — refreshed continuously.",
                  icon: Radio,
                  grad: "bg-gradient-to-br from-primary/30 via-primary/10 to-slate-900/80",
                  href: "#features",
                },
                {
                  title: "Intel Lab",
                  desc: "Scope industries & flows, add context, generate briefs + follow-ups.",
                  icon: FlaskConical,
                  grad: "bg-gradient-to-br from-amber-500/35 via-brand-orange/15 to-slate-900/85",
                  href: "#how-it-works",
                },
                {
                  title: "Cross-industry scan",
                  desc: "Gaps, deals, and bridges across all mapped sectors in one pass.",
                  icon: Layers,
                  grad: "bg-gradient-to-br from-violet-500/30 via-signal-violet/15 to-slate-900/85",
                  href: "#features",
                },
              ].map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className="group relative flex flex-col rounded-[1.35rem] border border-border/60 bg-card overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={cn("relative h-36 sm:h-40 overflow-hidden", item.grad)}
                  >
                    <div className="absolute inset-0 bg-[url('/hero-visual.png')] bg-cover bg-center opacity-25 mix-blend-overlay group-hover:opacity-35 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                    <div className="absolute bottom-3 left-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-background/90 border border-border/50 shadow-md">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="p-6 sm:p-7 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">{item.desc}</p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                      Learn more
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Marquee — amber ribbon (distinct from hero + footer) */}
        <div className="border-y border-amber-300/35 bg-gradient-to-r from-amber-100/90 via-amber-50/95 to-orange-50/90 overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap py-5 sm:py-6 gap-12 sm:gap-16 text-sm text-amber-950/70">
            {marqueeItems.map((ind, i) => (
              <span key={`${ind.slug}-${i}`} className="inline-flex items-center gap-3 shrink-0">
                <span className="text-xl">{ind.icon}</span>
                <span className="font-semibold text-amber-950/85 tracking-tight">{ind.name}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Showcase — cool sky wash */}
        <section className="relative border-b border-border/50 landing-band-sky overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-200/20 via-transparent to-primary/[0.04] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14 sm:py-20 lg:py-24 relative z-10">
            <div className="grid lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-14 items-center">
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-sm font-semibold text-brand-orange tracking-[0.18em] uppercase mb-3">Product</p>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] font-bold text-foreground tracking-tight leading-[1.12]">
                  A briefing room — not a spreadsheet with charts taped on.
                </h2>
                <p className="mt-5 text-muted-foreground leading-relaxed text-base sm:text-lg">
                  Maverick turns flows, news, and market inputs into structured briefs you can act on. Geo and role follow
                  you everywhere.
                </p>
                <div className="mt-8 flex flex-wrap gap-2.5">
                  {["Dashboard", "Intel Lab", "Cross-industry"].map((label) => (
                    <span
                      key={label}
                      className="inline-flex rounded-full border border-border/70 bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
                className="relative"
              >
                <div className="absolute -inset-4 rounded-[1.75rem] bg-gradient-to-br from-primary/25 via-brand-orange/15 to-transparent blur-2xl opacity-80" />
                <div className="shine-border relative rounded-2xl border border-border/50 bg-card overflow-hidden shadow-2xl rotate-[0.5deg] hover:rotate-0 transition-transform duration-500">
                  <img
                    src="/og-image.png"
                    alt="Intel GoldMine workspace preview"
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent pointer-events-none" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features — mint wash + dots */}
        <section id="features" className="relative overflow-hidden bg-gradient-to-b from-emerald-50/35 via-background to-background">
          <div className="absolute inset-0 dot-pattern-fine opacity-35 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24 lg:py-28 relative">
            <Reveal className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <p className="text-sm font-semibold text-primary tracking-[0.2em] uppercase mb-3">Features</p>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-tight">
                Built for speed readers &amp; deep divers
              </h2>
              <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
                Live inputs, structured AI, and scans that respect your geography — in layouts that stay legible at 11pm.
              </p>
            </Reveal>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="lg:col-span-7 rounded-[1.5rem] border border-border/60 bg-card overflow-hidden shadow-xl shine-border group"
              >
                <div className="relative h-44 sm:h-52 overflow-hidden border-b border-border/50">
                  <img
                    src="/hero-visual.png"
                    alt=""
                    className="w-full h-full object-cover object-top opacity-90 group-hover:scale-[1.02] transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                  <div className="absolute bottom-4 left-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary border border-primary/20 backdrop-blur-sm">
                    <Radio className="w-6 h-6" />
                  </div>
                </div>
                <div className="p-7 sm:p-9">
                  <h3 className="text-2xl font-bold text-foreground">Live market feed</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed max-w-xl text-base">
                    Crypto, FX, commodities, VC & macro — tuned for decisions, not endless scrolling.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {["Macro", "FX", "Crypto", "VC"].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-muted/80 border border-border/60 px-3 py-1 text-xs font-semibold text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="lg:col-span-5 rounded-[1.5rem] border border-border/60 bg-gradient-to-b from-brand-orange/[0.12] to-card p-8 sm:p-10 shadow-lg flex flex-col justify-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange/15 text-brand-orange mb-6 border border-brand-orange/15">
                  <Globe2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Geo-scoped research</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed text-base">
                  Stop pretending “global” is useful. Tune intel to the markets you actually operate in.
                </p>
              </motion.div>

              {[
                {
                  icon: BarChart3,
                  title: "Structured AI outputs",
                  body: "Frameworks, scores, and comparisons — not walls of text.",
                  iconBg: "bg-signal-violet/12 text-signal-violet border-signal-violet/15",
                  span: "lg:col-span-4",
                  grad: "from-signal-violet/[0.08] to-card",
                },
                {
                  icon: Layers,
                  title: "Intel Lab",
                  body: "Your scope, your context — briefs and chat on demand.",
                  iconBg: "bg-signal-emerald/12 text-signal-emerald border-signal-emerald/15",
                  span: "lg:col-span-4",
                  grad: "from-signal-emerald/[0.08] to-card",
                },
                {
                  icon: Zap,
                  title: "Cross-industry scans",
                  body: "One pass to surface gaps and bridges across sectors.",
                  iconBg: "bg-brand-orange/12 text-brand-orange border-brand-orange/15",
                  span: "lg:col-span-4",
                  grad: "from-brand-orange/[0.08] to-card",
                },
              ].map((f) => (
                <motion.div
                  key={f.title}
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className={cn(
                    "rounded-[1.5rem] border border-border/60 bg-gradient-to-b p-8 shadow-md hover:shadow-lg transition-shadow",
                    f.span,
                    f.grad,
                  )}
                >
                  <div
                    className={cn("mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border", f.iconBg)}
                  >
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
                </motion.div>
              ))}

              <motion.div
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="lg:col-span-12 rounded-[1.5rem] border border-border/60 bg-gradient-to-r from-primary/[0.06] via-muted/30 to-brand-orange/[0.06] p-8 sm:p-10 flex flex-col md:flex-row md:items-center gap-8"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary border border-primary/15">
                  <Shield className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-foreground">Evidence-first, time-respecting UI</h3>
                  <p className="mt-2 text-muted-foreground max-w-3xl leading-relaxed">
                    For founders, investors, and analysts who need a clear view fast — without tab overload.
                  </p>
                </div>
                <Button className="rounded-full shrink-0 font-bold" asChild>
                  <Link to="/auth?mode=signup">
                    Get started
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How it works — soft mauve band + light cards */}
        <section id="how-it-works" className="relative landing-band-mauve text-foreground overflow-hidden border-y border-violet-200/25">
          <div className="absolute inset-0 dot-pattern-fine opacity-[0.2] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24 relative z-10">
            <Reveal className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <p className="text-sm font-semibold text-primary tracking-[0.2em] uppercase mb-3">How it works</p>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                From scope to signal in three moves
              </h2>
            </Reveal>

            <div className="relative grid md:grid-cols-3 gap-6 md:gap-8">
              <div className="hidden md:block absolute top-9 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent pointer-events-none" />
              {[
                {
                  step: "01",
                  title: "Set your scope",
                  body: "Industries, regions, and what matters — once, then it travels with you.",
                  icon: Globe2,
                },
                {
                  step: "02",
                  title: "Maverick synthesizes",
                  body: "11+ sources feed structured briefs — not copy-pasted headlines.",
                  icon: BarChart3,
                },
                {
                  step: "03",
                  title: "Decide with proof",
                  body: "Risks, scores, and opportunities surfaced where you read — not buried in footnotes.",
                  icon: CheckCircle2,
                },
              ].map((s, i) => (
                <Reveal key={s.step} delay={i * 0.12} className="relative text-center md:text-left">
                  <div className="rounded-2xl border border-border/60 bg-card p-7 sm:p-8 shadow-lg hover:shadow-xl hover:border-primary/15 transition-all h-full">
                    <div className="mx-auto md:mx-0 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/[0.08] border border-primary/10 text-primary">
                      <s.icon className="w-7 h-7" />
                    </div>
                    <span className="text-4xl font-display font-bold text-primary/15 mb-2 block">{s.step}</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground">{s.title}</h3>
                    <p className="mt-3 text-base text-muted-foreground leading-relaxed">{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials — warm paper */}
        <section className="landing-band-warm-quote border-y border-border/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
            <Reveal className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
              <p className="text-sm font-semibold text-primary tracking-[0.2em] uppercase mb-3">Voices</p>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                Teams that outrun the news cycle
              </h2>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {TESTIMONIALS.map((t, i) => (
                <Reveal key={t.name} delay={i * 0.08}>
                  <div className="relative h-full rounded-[1.35rem] border border-border/60 bg-card p-7 sm:p-8 shadow-lg flex flex-col overflow-hidden group hover:border-primary/20 transition-colors">
                    <Quote className="absolute top-5 right-5 w-10 h-10 text-primary/[0.08] group-hover:text-primary/15 transition-colors" />
                    <div className="flex gap-0.5 mb-5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-[hsl(38_90%_50%)] text-[hsl(38_90%_50%)]" />
                      ))}
                    </div>
                    <p className="text-base text-foreground leading-relaxed flex-1 font-medium">&ldquo;{t.text}&rdquo;</p>
                    <div className="mt-8 pt-6 border-t border-border/60">
                      <p className="text-sm font-bold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t.role}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing — compact billing-style card */}
        <section id="pricing" className="bg-slate-50/90 border-y border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
            <Reveal className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
              <p className="text-xs font-semibold text-brand-orange tracking-[0.2em] uppercase mb-2">Pricing</p>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                One Pro tier. Everything unlocked.
              </h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground">
                Start free. Upgrade when you need full depth.
              </p>
            </Reveal>

            <Reveal className="max-w-[420px] mx-auto">
              <div className="rounded-xl border border-slate-200/90 bg-card text-left shadow-sm overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-primary via-brand-orange to-primary" />
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Pro plan</p>
                      <p className="mt-1 font-display text-3xl sm:text-4xl font-bold tabular-nums text-foreground tracking-tight">
                        ${SUBSCRIPTION_USD_MONTHLY}
                        <span className="text-base sm:text-lg font-semibold text-muted-foreground font-sans">/mo</span>
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">Billed monthly · cancel anytime</p>
                    </div>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 border border-primary/10">
                      <BadgeCheck className="w-4 h-4 text-primary" />
                    </div>
                  </div>

                  <ul className="mt-5 pt-5 border-t border-border/60 space-y-2">
                    {[
                      "AI research & chat",
                      `${industries.length} industries · ${totalFlows}+ flows`,
                      "Geo & cross-industry intel",
                      "Intel Lab",
                    ].map((line) => (
                      <li key={line} className="flex items-center gap-2 text-[13px] text-foreground/90 leading-snug">
                        <CheckCircle2 className="w-3.5 h-3.5 text-signal-emerald shrink-0" />
                        {line}
                      </li>
                    ))}
                  </ul>

                  <Button className="mt-6 w-full h-10 text-sm font-semibold rounded-lg" asChild>
                    <Link to="/auth?mode=signup">
                      Get started
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Link>
                  </Button>
                  <p className="mt-3 text-center text-[11px] text-muted-foreground leading-relaxed">
                    <Link to="/auth" className="text-primary font-medium hover:underline">
                      Sign in
                    </Link>
                    {" · "}Payments processed securely via Paystack
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-zinc-800 bg-zinc-950 text-zinc-300 py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <BrandHexMark size="sm" variant="onDark" />
              <BrandWordmark className="text-lg" variant="onDark" />
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-sm">
              Market intelligence with geo scope, structured AI, and Maverick — your research copilot.
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-4">Product</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#explore" className="text-zinc-400 hover:text-white transition-colors">
                  Explore
                </a>
              </li>
              <li>
                <a href="#features" className="text-zinc-400 hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-zinc-400 hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-4">Legal</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/privacy-policy" className="text-zinc-400 hover:text-white transition-colors">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-zinc-400 hover:text-white transition-colors">
                  Terms of service
                </Link>
              </li>
            </ul>
          </div>
          <div className="md:col-span-4 flex flex-col justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-4">Account</p>
              <div className="flex flex-wrap gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  asChild
                >
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button
                  size="sm"
                  className="rounded-full bg-amber-400 text-amber-950 hover:bg-amber-300 font-semibold"
                  asChild
                >
                  <Link to="/auth?mode=signup">Get started</Link>
                </Button>
              </div>
            </div>
            <p className="text-xs text-zinc-600">© 2026 Intel GoldMine · Not financial advice.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
