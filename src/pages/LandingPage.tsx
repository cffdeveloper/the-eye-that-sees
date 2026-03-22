import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { BrandHexMark } from "@/components/BrandHexMark";
import { BrandWordmark } from "@/components/BrandWordmark";
import { Button } from "@/components/ui/button";
import { industries } from "@/lib/industryData";
import { LandingBackdrop } from "@/components/motion/LandingBackdrop";
import {
  Activity,
  ArrowRight,
  Cpu,
  Globe2,
  Layers,
  Radio,
  TrendingUp,
  PlayCircle,
  FlaskConical,
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
                },
                {
                  title: "Intel Lab",
                  desc: "Scope industries & flows, add context, generate briefs + follow-ups.",
                  icon: FlaskConical,
                  grad: "bg-gradient-to-br from-amber-500/35 via-brand-orange/15 to-slate-900/85",
                },
                {
                  title: "Cross-industry scan",
                  desc: "Gaps, deals, and bridges across all mapped sectors in one pass.",
                  icon: Layers,
                  grad: "bg-gradient-to-br from-violet-500/30 via-signal-violet/15 to-slate-900/85",
                },
              ].map((item) => (
                <Link
                  key={item.title}
                  to="/auth?mode=signup"
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
                      Get started
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
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
      </main>

      <footer className="relative z-10 border-t border-zinc-800 bg-zinc-950 text-zinc-300 py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <BrandHexMark size="sm" variant="onDark" />
              <BrandWordmark className="text-lg" variant="onDark" />
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-sm">
              Market intelligence with geo scope, structured AI, and Maverick — your research copilot.
            </p>
            <p className="text-sm">
              <a href="#explore" className="text-zinc-400 hover:text-white transition-colors font-medium">
                Explore the platform →
              </a>
            </p>
          </div>
          <div className="md:col-span-3">
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
          <div className="md:col-span-4 flex flex-col justify-between gap-6 md:pl-4">
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
