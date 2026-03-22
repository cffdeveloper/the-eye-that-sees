import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { BrandHexMark } from "@/components/BrandHexMark";
import { BrandWordmark } from "@/components/BrandWordmark";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { industries } from "@/lib/industryData";
import { SUBSCRIPTION_USD_MONTHLY } from "@/lib/pricing";
import { LandingBackdrop } from "@/components/motion/LandingBackdrop";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Cpu,
  Globe2,
  Layers,
  Radio,
  PlayCircle,
  FlaskConical,
  Workflow,
  CreditCard,
  BadgePercent,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

/** Marketing — emphasise coverage (feed integrations & mapped capital lanes). */
const SOURCE_INTEGRATIONS_LABEL = "40+";
const FLOW_LANES_LABEL = "120+";

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
        className="sticky top-0 z-50 overflow-visible border-b border-border/40 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/65"
      >
        <div className="mx-auto flex h-14 max-w-7xl flex-wrap items-center justify-between gap-x-2 gap-y-2 px-3 sm:h-16 sm:gap-3 sm:px-8">
          <Link
            to="/"
            className="relative z-[1] flex min-w-0 shrink items-center gap-2 sm:gap-2.5 group"
          >
            <span className="relative flex shrink-0 items-center justify-center overflow-visible">
              <BrandHexMark size="header" className="transition-transform group-hover:scale-[1.03]" />
            </span>
            <BrandWordmark className="text-base sm:text-lg md:text-xl truncate leading-none" />
          </Link>
          <nav className="order-3 flex w-full min-w-0 items-center justify-center gap-0.5 text-[12px] font-semibold text-muted-foreground sm:order-none sm:w-auto sm:justify-start sm:text-[13px] md:flex-1 md:justify-center">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "group rounded-full px-2 sm:px-3 py-2 hover:text-foreground hover:bg-muted/70 transition-colors",
                    "inline-flex items-center gap-1 max-w-[44vw] sm:max-w-none",
                    "outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  )}
                >
                  <Workflow className="w-3.5 h-3.5 shrink-0 text-primary/80 group-hover:text-primary transition-colors" />
                  <span className="truncate">
                    <span className="sm:hidden">How</span>
                    <span className="hidden sm:inline">How it works</span>
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-50 group-data-[state=open]:rotate-180 transition-transform duration-200" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="center"
                sideOffset={10}
                className="w-[min(92vw,22rem)] sm:w-[26rem] p-0 overflow-hidden border-border/60 shadow-xl z-[100] bg-card/95 backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
              >
                <div className="border-b border-border/50 bg-gradient-to-r from-primary/8 via-transparent to-violet-500/10 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Inside the machine</p>
                  <p className="font-display text-base font-bold text-foreground tracking-tight">How it works</p>
                </div>
                <div className="max-h-[min(60vh,420px)] overflow-y-auto p-3">
                  <Accordion type="single" collapsible defaultValue="hiw-1" className="space-y-2">
                    {[
                      {
                        id: "hiw-1",
                        title: "01 — Ingest · scope · prioritize",
                        body: (
                          <p>
                            Maverick pulls from markets, macro, news, funding rails, and social signals —{" "}
                            <span className="font-semibold text-foreground">{SOURCE_INTEGRATIONS_LABEL} integrated feed types</span>{" "}
                            — then respects <em>your</em> industries, regions, and watchlists. You’re not drowning in tabs;
                            the machine aggregates toward answers that match how you think.
                          </p>
                        ),
                      },
                      {
                        id: "hiw-2",
                        title: "02 — Map · link · brief",
                        body: (
                          <p>
                            Every sector is decomposed into money-flow lanes so you can see{" "}
                            <span className="font-semibold text-foreground">how capital actually moves</span>. Cross-industry
                            mode surfaces bridges, bottlenecks, and second-order effects — built for analysts and
                            researchers who live in the space <em>between</em> silos.
                          </p>
                        ),
                      },
                      {
                        id: "hiw-3",
                        title: "03 — Read · challenge · act",
                        body: (
                          <p>
                            Outputs read like a serious research desk: frameworks, risks, opportunities, and follow-up
                            prompts — not a ticker wall. Use the live pulse for rhythm, deep dives for rigor, Intel Lab when
                            you need a bespoke brief, and geo snapshots when place matters as much as price.
                          </p>
                        ),
                      },
                    ].map((item) => (
                      <AccordionItem
                        key={item.id}
                        value={item.id}
                        className="rounded-xl border border-border/60 bg-background/80 shadow-sm data-[state=open]:shadow-md data-[state=open]:border-primary/25 transition-shadow overflow-hidden"
                      >
                        <AccordionTrigger className="px-3 py-3 text-left text-[13px] font-bold text-foreground hover:no-underline hover:bg-muted/40 [&[data-state=open]]:bg-muted/25 rounded-none gap-2">
                          {item.title}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-sm leading-relaxed px-3 pb-3 pt-0 border-t border-border/40">
                          {item.body}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "group rounded-full px-2 sm:px-3 py-2 hover:text-foreground hover:bg-muted/70 transition-colors",
                    "inline-flex items-center gap-1 max-w-[44vw] sm:max-w-none",
                    "outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  )}
                >
                  <BadgePercent className="w-3.5 h-3.5 shrink-0 text-brand-orange/90 group-hover:text-brand-orange transition-colors" />
                  <span className="truncate sm:max-w-none">Pricing</span>
                  <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-50 group-data-[state=open]:rotate-180 transition-transform duration-200" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="center"
                sideOffset={10}
                className="w-[min(92vw,22rem)] sm:w-[26rem] p-0 overflow-hidden border-border/60 shadow-xl z-[100] bg-card/95 backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
              >
                <div className="border-b border-border/50 bg-gradient-to-r from-brand-orange/12 via-transparent to-amber-500/10 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-orange">Billing</p>
                  <p className="font-display text-base font-bold text-foreground tracking-tight">Pricing</p>
                </div>
                <div className="max-h-[min(65vh,480px)] overflow-y-auto p-3">
                  <Accordion type="single" collapsible defaultValue="price-1" className="space-y-2">
                    <AccordionItem
                      value="price-1"
                      className="rounded-xl border border-border/60 bg-background/80 shadow-sm data-[state=open]:shadow-md data-[state=open]:border-primary/25 transition-shadow overflow-hidden"
                    >
                      <AccordionTrigger className="px-3 py-3 text-left hover:no-underline hover:bg-muted/40 [&[data-state=open]]:bg-muted/25 rounded-none gap-2">
                        <span className="flex flex-col items-start gap-0.5">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Pro plan
                          </span>
                          <span className="text-sm font-bold text-foreground">
                            ${SUBSCRIPTION_USD_MONTHLY}
                            <span className="text-muted-foreground font-semibold">/month</span>
                          </span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground px-3 pb-3 pt-0 border-t border-border/40 space-y-3">
                        <p>
                          Pro is the full desk: unlimited live global pulse, deep sector & money-flow workspaces,{" "}
                          cross-industry relationship maps, Intel Lab sessions, and geo-scoped snapshots — the same stack
                          serious operators use to stay ahead of headlines.
                        </p>
                        <p className="text-xs text-muted-foreground/90">
                          Start free; upgrade when you want the full firehose and Maverick without limits.
                        </p>
                        <Button size="sm" className="w-full font-bold rounded-lg" asChild>
                          <Link to="/auth?mode=signup">
                            Get started
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Link>
                        </Button>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem
                      value="price-2"
                      className="rounded-xl border border-border/60 bg-background/80 shadow-sm data-[state=open]:shadow-md data-[state=open]:border-primary/25 transition-shadow overflow-hidden"
                    >
                      <AccordionTrigger className="px-3 py-3 text-left text-[13px] font-bold text-foreground hover:no-underline hover:bg-muted/40 gap-2">
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-signal-emerald shrink-0" />
                          What&apos;s included in Pro
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="px-3 pb-3 pt-0 border-t border-border/40">
                        <ul className="space-y-2 text-sm text-muted-foreground pt-2">
                          {[
                            "Maverick AI research, synthesis & follow-up chat",
                            `${industries.length} global sectors · ${FLOW_LANES_LABEL} mapped capital lanes`,
                            `${SOURCE_INTEGRATIONS_LABEL} source integrations — aggregated for you`,
                            "Cross-industry bridges, gaps & second-order links",
                            "Intel Lab — scoped briefs when you need a private lens",
                            "Geo filters & regional snapshots (where place matters)",
                          ].map((line) => (
                            <li key={line} className="flex gap-2">
                              <CheckCircle2 className="w-4 h-4 text-signal-emerald shrink-0 mt-0.5" />
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem
                      value="price-3"
                      className="rounded-xl border border-border/60 bg-background/80 shadow-sm data-[state=open]:shadow-md data-[state=open]:border-primary/25 transition-shadow overflow-hidden"
                    >
                      <AccordionTrigger className="px-3 py-3 text-left text-[13px] font-bold text-foreground hover:no-underline hover:bg-muted/40 gap-2">
                        <span className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-primary shrink-0" />
                          Payments &amp; security
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground px-3 pb-3 pt-0 border-t border-border/40 leading-relaxed">
                        <p className="pt-2">
                          Subscriptions are billed monthly. Checkout runs through{" "}
                          <span className="font-semibold text-foreground">Paystack</span> — the same flow you&apos;ll use
                          after you sign in. You can manage billing from your profile once you&apos;re on Pro.
                        </p>
                        <p className="mt-2 text-xs">
                          <Link to="/auth" className="text-primary font-semibold hover:underline">
                            Sign in
                          </Link>
                          {" · "}
                          <Link to="/privacy-policy" className="text-primary font-semibold hover:underline">
                            Privacy
                          </Link>
                          {" · "}
                          <Link to="/terms-of-service" className="text-primary font-semibold hover:underline">
                            Terms
                          </Link>
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </PopoverContent>
            </Popover>
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-1 sm:ml-0 sm:gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="hidden text-sm font-semibold sm:inline-flex" asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button size="sm" className="h-9 gap-1 rounded-full px-3 text-sm font-bold shadow-md sm:px-5" asChild>
              <Link to="/auth?mode=signup">
                <span className="sm:hidden">Start</span>
                <span className="hidden sm:inline">Get started</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.header>

      <main className="relative z-10 flex-1">
        {/* Hero — full first viewport (below sticky header); next sections only after scroll */}
        <section
          ref={heroRef}
          className="relative flex min-h-[calc(100svh-3.5rem)] flex-col overflow-hidden mesh-marketing landing-aurora text-foreground sm:min-h-[calc(100svh-4rem)]"
        >
          <LandingBackdrop />

          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="relative z-10 flex min-h-0 flex-1 flex-col justify-center py-6 sm:py-8"
          >
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 pt-4 sm:pt-6 lg:pt-8 pb-0">
              <p className="mb-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-center text-[13px] font-medium text-muted-foreground sm:mb-4 sm:text-sm lg:justify-start lg:text-left">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/90 px-3 py-1.5 text-foreground shadow-sm backdrop-blur-sm">
                  <Activity className="h-3.5 w-3.5 text-primary" />
                  Private intelligence layer · global pipelines · live geo
                </span>
                <span className="hidden text-border sm:inline">·</span>
                <span className="max-w-md text-muted-foreground sm:max-w-none">
                  Built for people who connect dots across markets — not for scrolling another feed.
                </span>
              </p>

              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="grid lg:grid-cols-[1.08fr_0.92fr] gap-8 lg:gap-10 xl:gap-12 lg:items-stretch"
              >
                <div className="text-center lg:text-left lg:flex lg:flex-col lg:justify-center">
                  <motion.div variants={fadeUp} className="mb-3 sm:mb-4 flex justify-center lg:justify-start">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-[2rem] bg-primary/16 blur-2xl scale-[1.25] sm:scale-[1.2]" />
                      <BrandHexMark size="hero" className="relative drop-shadow-md" />
                    </div>
                  </motion.div>

                  <motion.div
                    variants={fadeUp}
                    className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2 rounded-full border border-border/60 bg-card/80 backdrop-blur-md px-3.5 py-1.5 text-[13px] sm:text-sm text-muted-foreground mb-5 sm:mb-6 shadow-sm"
                  >
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-emerald/40" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-signal-emerald" />
                    </span>
                    <span className="font-semibold text-foreground">Live desk</span>
                    <span className="text-border">·</span>
                    <span className="font-semibold text-brand-orange">Maverick synthesis</span>
                  </motion.div>

                  <motion.h1
                    variants={fadeUp}
                    className="font-display text-[2.35rem] font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl xl:text-[3.5rem]"
                  >
                    Global market intelligence —{" "}
                    <span className="text-gradient-gold bg-clip-text text-transparent">one command center</span>
                    <span className="text-foreground">.</span>
                  </motion.h1>

                  <motion.p
                    variants={fadeUp}
                    className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg lg:mx-0"
                  >
                    <span className="font-semibold text-foreground">{industries.length} sectors</span> ·{" "}
                    <span className="font-semibold text-foreground">{FLOW_LANES_LABEL} capital lanes</span> ·{" "}
                    <span className="font-semibold text-foreground">{SOURCE_INTEGRATIONS_LABEL} feed integrations</span>
                    <span>
                      {" "}
                      — Maverick ingests sources from around the world, maps how money moves, and surfaces the
                      relationships analysts and researchers need for cross-reading — not scattered headlines.
                    </span>
                  </motion.p>

                  <motion.div
                    variants={fadeUp}
                    className="mt-5 flex flex-wrap items-center justify-center gap-2.5 text-[13px] sm:text-sm lg:justify-start"
                  >
                    {[
                      { icon: Globe2, label: "Worldwide signal mesh", c: "text-brand-orange" },
                      { icon: Layers, label: "Cross-industry links", c: "text-signal-violet" },
                      { icon: Cpu, label: "Intel Lab & briefs", c: "text-primary" },
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

                <motion.div variants={fadeUp} className="relative hidden h-full min-h-0 lg:flex lg:flex-col">
                  <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-primary/15 via-transparent to-brand-orange/15 blur-2xl" />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="shine-border relative flex h-full min-h-0 flex-col rounded-2xl border border-border/40 bg-card shadow-2xl overflow-hidden"
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
                    <div className="relative min-h-[clamp(240px,44vh,580px)] flex-1 bg-muted/30">
                      <img
                        src="/hero-visual.png"
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover object-top"
                        loading="eager"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/35 via-transparent to-transparent pointer-events-none" />
                    </div>
                    <div className="grid grid-cols-3 gap-px border-t border-border/40 bg-border/30 text-[10px] sm:text-[11px]">
                      <div className="bg-card/95 p-2.5 text-center backdrop-blur-sm sm:p-3">
                        <p className="font-bold tabular-nums text-primary">{industries.length}</p>
                        <p className="text-muted-foreground">Sectors</p>
                      </div>
                      <div className="bg-card/95 p-2.5 text-center backdrop-blur-sm sm:p-3">
                        <p className="font-bold tabular-nums text-brand-orange">{FLOW_LANES_LABEL}</p>
                        <p className="text-muted-foreground">Capital lanes</p>
                      </div>
                      <div className="bg-card/95 p-2.5 text-center backdrop-blur-sm sm:p-3">
                        <p className="font-bold tabular-nums text-signal-emerald">{SOURCE_INTEGRATIONS_LABEL}</p>
                        <p className="text-muted-foreground">Feed types</p>
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
              className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 pb-2 lg:hidden"
            >
              <div className="shine-border relative overflow-hidden rounded-2xl border border-border/40 bg-card shadow-2xl">
                <div className="flex items-center gap-2 border-b border-border/40 bg-muted/30 px-3 py-2">
                  <span className="h-2 w-2 rounded-full bg-red-400/90" />
                  <span className="h-2 w-2 rounded-full bg-amber-400/90" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400/90" />
                </div>
                <div className="relative aspect-[16/10] w-full max-h-[min(52vh,420px)]">
                  <img
                    src="/hero-visual.png"
                    alt="Intel GoldMine — market intelligence workspace"
                    className="h-full w-full object-cover object-top"
                    loading="eager"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Explore — warm sand band */}
        <section
          id="explore"
          className="relative border-y border-amber-200/30 dark:border-amber-500/15 landing-band-sand"
        >
          <div className="absolute inset-0 dot-pattern-fine opacity-[0.28] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14 sm:py-20 relative">
            <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">Choose your lane</p>
              <h2 className="font-display text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-[2.75rem]">
                Three ways in. One global brain.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Pulse the world, stress-test relationships across sectors, or run a private brief — same Maverick engine,
                same truth bar.
              </p>
            </div>
            <div className="grid gap-5 sm:gap-6 md:grid-cols-3">
              {[
                {
                  title: "Live intel feed",
                  desc: "A continuous global pulse — markets, macro, commodities, funding, and socials where configured. Built for operators who need rhythm without noise.",
                  icon: Radio,
                  grad: "bg-gradient-to-br from-primary/30 via-primary/10 to-slate-900/80",
                },
                {
                  title: "Intel Lab",
                  desc: "Scope industries & money flows, add context, and let Maverick generate research-grade briefs you can challenge line by line — your private lab.",
                  icon: FlaskConical,
                  grad: "bg-gradient-to-br from-amber-500/35 via-brand-orange/15 to-slate-900/85",
                },
                {
                  title: "Cross-industry scan",
                  desc: "See bridges, gaps, and knock-on effects across all mapped sectors — for analysts who think in systems, not single tickers.",
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
        <div className="border-y border-amber-300/35 dark:border-amber-500/25 bg-gradient-to-r from-amber-100/90 via-amber-50/95 to-orange-50/90 dark:from-amber-950/50 dark:via-amber-950/35 dark:to-orange-950/45 overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap py-5 sm:py-6 gap-12 sm:gap-16 text-sm text-amber-950/70 dark:text-amber-200/75">
            {marqueeItems.map((ind, i) => (
              <span key={`${ind.slug}-${i}`} className="inline-flex items-center gap-3 shrink-0">
                <span className="text-xl">{ind.icon}</span>
                <span className="font-semibold text-amber-950/85 dark:text-amber-100/90 tracking-tight">{ind.name}</span>
              </span>
            ))}
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-zinc-800 dark:border-zinc-900 bg-zinc-950 dark:bg-black text-zinc-300 py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <BrandHexMark size="footer" variant="onDark" />
              <BrandWordmark className="text-lg" variant="onDark" />
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-zinc-500">
              A private intelligence layer for people who read across markets — global ingestion, structured synthesis,
              and cross-sector clarity. You’re not using another dashboard; you’re joining a serious desk.
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
