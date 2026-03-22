import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { BrandHexMark } from "@/components/BrandHexMark";
import { BrandWordmark } from "@/components/BrandWordmark";
import { Button } from "@/components/ui/button";
import { SUBSCRIPTION_USD_MONTHLY } from "@/lib/pricing";
import { industries } from "@/lib/industryData";
import { Reveal } from "@/components/motion/Reveal";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Globe2,
  Layers,
  Radio,
  Shield,
  Sparkles,
  Zap,
  Star,
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
        className="relative z-30 bg-background/70 backdrop-blur-2xl border-b border-border/40 sticky top-0"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandHexMark size="md" />
            <BrandWordmark className="text-lg" />
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-sm font-medium hidden sm:inline-flex" asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button size="sm" className="text-sm font-semibold gap-1.5 rounded-full px-6 h-10 shadow-md hover:shadow-lg transition-all" asChild>
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
        <section ref={heroRef} className="relative overflow-hidden">
          {/* Gradient backdrop */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-brand-orange/[0.04] blur-[120px]" />
          
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-20 sm:pt-32 pb-12">
              <motion.div variants={stagger} initial="hidden" animate="show" className="text-center max-w-4xl mx-auto">
                <motion.div variants={fadeUp} className="mb-10">
                  <BrandHexMark size="lg" className="mx-auto w-20 h-20 sm:w-24 sm:h-24 drop-shadow-xl" />
                </motion.div>

                <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 backdrop-blur-sm px-4 py-2 text-sm text-muted-foreground mb-10 shadow-sm">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-emerald/50 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-signal-emerald" />
                  </span>
                  <span className="font-medium text-foreground">Now live</span>
                  <span className="mx-1 text-border">·</span>
                  <span className="text-brand-orange font-semibold">Maverick AI Research Agent</span>
                </motion.div>

                <motion.h1
                  variants={fadeUp}
                  className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] text-foreground"
                >
                  Market intelligence,{" "}
                  <span className="text-gradient-gold">simplified</span>
                </motion.h1>

                <motion.p
                  variants={fadeUp}
                  className="mt-8 text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light"
                >
                  Track {industries.length} industries and {totalFlows}+ money flows with AI-powered research.
                  Get structured insights, not noise.
                </motion.p>

                <motion.div variants={fadeUp} className="mt-12 flex flex-wrap items-center justify-center gap-4">
                  <Button size="lg" className="h-14 px-10 text-base font-semibold gap-2.5 rounded-full shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300" asChild>
                    <Link to="/auth?mode=signup">
                      Start for free
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 text-base rounded-full border-border/60 hover:border-primary/40 hover:bg-primary/[0.03] transition-all duration-300"
                    asChild
                  >
                    <Link to="/auth" className="gap-2.5">
                      <Sparkles className="w-4 h-4 text-brand-orange" />
                      See how it works
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </div>

            {/* Hero image */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="max-w-6xl mx-auto px-5 sm:px-8 pb-20"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/30">
                <img
                  src="/hero-visual.png"
                  alt="Intel GoldMine platform — AI-powered market intelligence dashboard"
                  className="w-full h-auto"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
              </div>
            </motion.div>
          </motion.div>

          {/* Stats row */}
          <div className="max-w-7xl mx-auto px-5 sm:px-8 -mt-8 relative z-10 pb-16">
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid grid-cols-3 gap-6 max-w-2xl mx-auto"
            >
              {[
                { n: `${industries.length}`, l: "Industries", color: "text-primary" },
                { n: `${totalFlows}+`, l: "Money flows", color: "text-brand-orange" },
                { n: "11+", l: "Data sources", color: "text-primary" },
              ].map((s) => (
                <motion.div key={s.l} variants={fadeUp} className="text-center p-6 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/40 shadow-sm">
                  <p className={cn("text-4xl sm:text-5xl font-bold tabular-nums font-display", s.color)}>{s.n}</p>
                  <p className="text-sm text-muted-foreground mt-2 font-medium">{s.l}</p>
                </motion.div>
              ))}
            </motion.div>
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

        {/* Features */}
        <section id="features" className="bg-gradient-to-b from-background to-muted/20">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-24 sm:py-36">
            <Reveal className="text-center max-w-3xl mx-auto mb-20">
              <p className="text-sm font-semibold text-brand-orange tracking-widest uppercase mb-4">Features</p>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground tracking-tight leading-tight">
                Everything you need to stay ahead
              </h2>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                From live market data to AI-powered deep dives — all in one elegant interface designed for clarity.
              </p>
            </Reveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Radio,
                  title: "Live market feed",
                  body: "Crypto, FX, commodities, VC & macro signals — refreshed continuously in one dashboard.",
                  gradient: "from-primary/10 to-primary/[0.02]",
                  iconBg: "bg-primary/10 text-primary",
                },
                {
                  icon: Globe2,
                  title: "Geo-scoped research",
                  body: "Get analysis tuned to the regions you care about — not generic global takes.",
                  gradient: "from-brand-orange/10 to-brand-orange/[0.02]",
                  iconBg: "bg-brand-orange/10 text-brand-orange",
                },
                {
                  icon: BarChart3,
                  title: "Structured AI outputs",
                  body: "Metrics, frameworks, comparisons, and scores — not walls of unstructured text.",
                  gradient: "from-signal-violet/10 to-signal-violet/[0.02]",
                  iconBg: "bg-signal-violet/10 text-signal-violet",
                },
                {
                  icon: Layers,
                  title: "Intel Lab",
                  body: "Define your own research scope, add context, and run custom briefs with follow-ups.",
                  gradient: "from-signal-emerald/10 to-signal-emerald/[0.02]",
                  iconBg: "bg-signal-emerald/10 text-signal-emerald",
                },
                {
                  icon: Zap,
                  title: "Cross-industry scans",
                  body: "Find gaps, deals, and bridges across all sectors in a single intelligence pass.",
                  gradient: "from-brand-orange/10 to-brand-orange/[0.02]",
                  iconBg: "bg-brand-orange/10 text-brand-orange",
                },
                {
                  icon: Shield,
                  title: "Built for decision makers",
                  body: "For founders, investors, and analysts who need evidence-backed views fast.",
                  gradient: "from-primary/10 to-primary/[0.02]",
                  iconBg: "bg-primary/10 text-primary",
                },
              ].map((f) => (
                <motion.div
                  key={f.title}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={cn(
                    "group rounded-3xl border border-border/50 bg-gradient-to-b p-8 shadow-sm hover:shadow-xl transition-all duration-500",
                    f.gradient
                  )}
                >
                  <div className={cn("mb-6 flex h-14 w-14 items-center justify-center rounded-2xl", f.iconBg)}>
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{f.title}</h3>
                  <p className="mt-3 text-base text-muted-foreground leading-relaxed">{f.body}</p>
                </motion.div>
              ))}
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
                  icon: Sparkles,
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
                    <div className="flex gap-1 mb-5">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-brand-orange text-brand-orange" />
                      ))}
                    </div>
                    <p className="text-base text-foreground leading-relaxed flex-1 italic">"{t.text}"</p>
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
              <p className="mt-6 text-lg text-muted-foreground">Start free. Upgrade when you need more.</p>
            </Reveal>

            <Reveal className="max-w-md mx-auto">
              <div className="rounded-3xl border border-border/50 bg-card p-10 sm:p-12 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-brand-orange to-primary" />
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-orange/10 mb-6">
                  <Sparkles className="w-8 h-8 text-brand-orange" />
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
                  Already subscribed?{" "}
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

      <footer className="relative z-10 border-t border-border/40 py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <BrandHexMark size="sm" />
            <span className="font-bold text-foreground text-lg">Intel GoldMine</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Intel GoldMine · Not financial advice.</p>
        </div>
      </footer>
    </div>
  );
}
