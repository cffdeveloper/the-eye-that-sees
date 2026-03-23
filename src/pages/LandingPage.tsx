import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { HeroSplineRobot } from "@/components/motion/HeroSplineRobot";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Cpu,
  Globe2,
  Layers,
  Key,
  Radar,
  Radio,
  Rocket,
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

const CHOOSE_LANE_CARDS = [
  {
    title: "Live intel feed",
    desc: "A continuous global pulse — markets, macro, commodities, funding, and socials where configured. Built for operators who need rhythm without noise.",
    icon: Radio,
    grad: "bg-gradient-to-br from-primary/30 via-primary/10 to-slate-900/80",
  },
  {
    title: "Infinity Lab",
    desc: "Scope industries & money flows, add context, and let Infinitygap generate research-grade briefs you can challenge line by line — your private lab.",
    icon: FlaskConical,
    grad: "bg-gradient-to-br from-amber-500/35 via-brand-orange/15 to-slate-900/85",
  },
  {
    title: "Cross-industry scan",
    desc: "See bridges, gaps, and knock-on effects across all mapped sectors — for analysts who think in systems, not single tickers.",
    icon: Layers,
    grad: "bg-gradient-to-br from-violet-500/30 via-signal-violet/15 to-slate-900/85",
  },
] as const;

type LaneCardMotion = { focus: number; yaw: number; lift: number };

function ChooseLaneCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [motionByIndex, setMotionByIndex] = useState<LaneCardMotion[]>(() =>
    CHOOSE_LANE_CARDS.map(() => ({ focus: 1, yaw: 0, lift: 0 })),
  );

  const updateScrollMotion = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const cards = container.querySelectorAll<HTMLElement>("[data-lane-card]");
    if (cards.length === 0) return;

    const cr = container.getBoundingClientRect();
    const centerX = cr.left + cr.width / 2;
    const halfW = cr.width / 2;

    const next: LaneCardMotion[] = [];
    cards.forEach((card) => {
      const r = card.getBoundingClientRect();
      const cardCenter = r.left + r.width / 2;
      const dist = Math.abs(cardCenter - centerX);
      const falloff = halfW + r.width * 0.35;
      const raw = Math.max(0, 1 - dist / falloff);
      const focus = Math.min(1, raw * raw);

      const offsetNorm = (cardCenter - centerX) / Math.max(1, halfW);
      const yaw = Math.max(-1, Math.min(1, offsetNorm)) * -14;
      const lift = (1 - focus) * 10;

      next.push({ focus, yaw, lift });
    });
    setMotionByIndex(next);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let raf = 0;
    const onScrollOrResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateScrollMotion);
    };

    onScrollOrResize();
    container.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    const ro = new ResizeObserver(onScrollOrResize);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      ro.disconnect();
    };
  }, [updateScrollMotion]);

  return (
    <div className="relative mx-auto w-full max-w-6xl [perspective:1400px]">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-10 bg-gradient-to-r from-amber-50/95 via-amber-50/40 to-transparent dark:from-amber-950/50 dark:via-amber-950/20 sm:w-14 md:hidden"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-10 bg-gradient-to-l from-amber-50/95 via-amber-50/40 to-transparent dark:from-amber-950/50 dark:via-amber-950/20 sm:w-14 md:hidden"
        aria-hidden
      />

      <div
        ref={scrollRef}
        className={cn(
          "flex gap-4 pb-3 pt-1",
          "md:flex-wrap md:justify-center md:gap-6 md:overflow-x-visible md:px-0 md:pb-0",
          "max-md:overflow-x-auto max-md:overscroll-x-contain max-md:scroll-smooth max-md:scroll-pl-4 max-md:scroll-pr-4",
          "max-md:snap-x max-md:snap-mandatory max-md:[-webkit-overflow-scrolling:touch]",
          "-mx-4 px-4 sm:-mx-8 sm:px-8 md:mx-0",
          "max-md:[scrollbar-width:none] max-md:[-ms-overflow-style:none] max-md:[&::-webkit-scrollbar]:hidden",
        )}
      >
        {CHOOSE_LANE_CARDS.map((item, i) => {
          const m = motionByIndex[i] ?? { focus: 1, yaw: 0, lift: 0 };
          const scale = 0.88 + 0.12 * m.focus;
          const opacity = 0.58 + 0.42 * m.focus;
          const Icon = item.icon;

          return (
            <motion.div
              key={item.title}
              data-lane-card
              className="shrink-0 snap-start [transform-style:preserve-3d] will-change-transform"
              initial={false}
              animate={{
                scale,
                opacity,
                rotateY: m.yaw,
                y: m.lift,
              }}
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 34,
                mass: 0.55,
              }}
            >
              <Link
                to="/auth?mode=signup"
                className="group relative flex h-full w-[min(85vw,22rem)] flex-col overflow-hidden rounded-[1.35rem] border border-border/60 bg-card shadow-lg transition-[box-shadow,transform] duration-300 sm:w-[20rem] hover:shadow-2xl hover:-translate-y-0.5"
                style={{
                  boxShadow:
                    m.focus > 0.65
                      ? "0 22px 50px -18px hsl(var(--primary) / 0.22), 0 0 0 1px hsl(var(--primary) / 0.12)"
                      : undefined,
                }}
              >
                <div className={cn("relative h-32 overflow-hidden sm:h-36", item.grad)}>
                  <motion.div
                    className="absolute inset-0 bg-[url('/hero-visual.png')] bg-cover bg-center mix-blend-overlay"
                    animate={{ opacity: 0.2 + 0.2 * m.focus }}
                    transition={{ type: "spring", stiffness: 300, damping: 35 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                  <motion.div
                    className="absolute bottom-3 left-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border/50 bg-background/90 shadow-md"
                    animate={{ scale: 0.95 + 0.05 * m.focus }}
                    transition={{ type: "spring", stiffness: 420, damping: 28 }}
                  >
                    <Icon className="h-6 w-6 text-primary" />
                  </motion.div>
                </div>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="text-base font-bold text-foreground transition-colors group-hover:text-primary sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="mt-2 line-clamp-4 flex-1 text-sm leading-relaxed text-muted-foreground sm:line-clamp-none">
                    {item.desc}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary sm:mt-5">
                    Get started
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

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
        className="fixed inset-x-0 top-0 z-50 overflow-visible border-b border-border/40 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75"
      >
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-2 gap-y-2 px-3 py-2 sm:px-8 md:min-h-16 md:flex-nowrap md:items-center md:gap-6 md:py-0">
          <Link
            to="/"
            className="order-1 group relative z-[1] flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2.5 md:max-w-none md:flex-initial md:shrink-0"
          >
            <span className="relative flex shrink-0 items-center justify-center overflow-visible">
              <BrandHexMark size="header" className="transition-transform group-hover:scale-[1.03]" />
            </span>
            <BrandWordmark className="shrink-0 text-base leading-tight sm:text-xl sm:leading-none md:text-2xl" />
          </Link>
          <nav className="order-3 grid w-full grid-cols-2 gap-2 border-t border-border/35 pt-2 text-[12px] font-semibold text-muted-foreground sm:gap-2.5 sm:text-[13px] md:order-2 md:flex md:w-auto md:basis-auto md:flex-1 md:items-center md:justify-center md:gap-2 md:border-t-0 md:pt-0">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "group touch-manipulation inline-flex min-h-10 w-full items-center justify-center gap-1 rounded-full border border-border/60 bg-background/85 px-2.5 py-2 text-center shadow-sm backdrop-blur-sm transition-colors",
                    "hover:border-border hover:bg-muted/60 hover:text-foreground",
                    "outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    "md:min-h-9 md:w-auto md:shrink-0 md:justify-center md:gap-1.5 md:px-2.5 md:py-1.5 lg:px-3",
                  )}
                >
                  <Workflow className="h-3.5 w-3.5 shrink-0 text-primary/80 group-hover:text-primary transition-colors" />
                  <span className="min-w-0 text-center text-[11px] leading-snug sm:text-[13px] md:whitespace-nowrap">
                    How it works
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50 group-data-[state=open]:rotate-180 transition-transform duration-200" />
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
                            Infinitygap pulls from markets, macro, news, funding rails, and social signals —{" "}
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
                            prompts — not a ticker wall. Use the live pulse for rhythm, deep dives for rigor, Infinity Lab when
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
                    "group touch-manipulation inline-flex min-h-10 w-full items-center justify-center gap-1 rounded-full border border-border/60 bg-background/85 px-2.5 py-2 text-center shadow-sm backdrop-blur-sm transition-colors",
                    "hover:border-border hover:bg-muted/60 hover:text-foreground",
                    "outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    "md:min-h-9 md:w-auto md:shrink-0 md:justify-center md:gap-1.5 md:px-2.5 md:py-1.5 lg:px-3",
                  )}
                >
                  <BadgePercent className="h-3.5 w-3.5 shrink-0 text-brand-orange/90 group-hover:text-brand-orange transition-colors" />
                  <span className="min-w-0 text-center text-[11px] leading-snug sm:text-[13px] md:whitespace-nowrap">Pricing</span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50 group-data-[state=open]:rotate-180 transition-transform duration-200" />
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
                          cross-industry relationship maps, Infinity Lab sessions, and geo-scoped snapshots — the same stack
                          serious operators use to stay ahead of headlines.
                        </p>
                        <p className="text-xs text-muted-foreground/90">
                          Start free; upgrade when you want the full firehose and Infinitygap without limits.
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
                            "Infinitygap research, synthesis & follow-up chat",
                            `${industries.length} global sectors · ${FLOW_LANES_LABEL} mapped capital lanes`,
                            `${SOURCE_INTEGRATIONS_LABEL} source integrations — aggregated for you`,
                            "Cross-industry bridges, gaps & second-order links",
                            "Infinity Lab — scoped briefs when you need a private lens",
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
          <div className="order-2 flex shrink-0 items-center gap-1 sm:gap-2 md:order-3">
            <ThemeToggle size="sm" />
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

      <main className="relative z-10 flex-1 pt-14 sm:pt-16">
        {/* Hero — full first viewport below fixed header (pt matches calc(100dvh − header)); next sections only after scroll */}
        <section
          ref={heroRef}
          className="relative flex h-[calc(100dvh-3.5rem)] max-h-[calc(100dvh-3.5rem)] min-h-0 flex-col overflow-x-hidden overflow-y-visible mesh-marketing landing-aurora text-foreground sm:h-[calc(100dvh-4rem)] sm:max-h-[calc(100dvh-4rem)]"
        >
          <LandingBackdrop />
          <HeroSplineRobot />

          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="relative z-10 flex min-h-0 flex-1 flex-col justify-start px-0 pb-2 pt-20 max-sm:pb-3 sm:justify-center sm:pt-0 sm:py-3 md:py-4 overflow-x-hidden overflow-y-visible"
          >
            <div className="relative z-30 mx-auto flex w-full min-h-0 max-w-7xl flex-col px-4 max-sm:min-h-0 max-sm:flex-1 sm:px-8">
              {/* Intro callout — vertical position adjusted on this wrapper only (does not add big gap before headline grid) */}
              <div className="relative z-[15] mb-3 shrink-0 translate-y-4 sm:mb-5 sm:-translate-y-1.5 md:-translate-y-2 lg:mb-7 xl:mb-8">
                <p className="mb-0 text-left">
                  <span className="inline-flex max-w-full items-start gap-2.5 rounded-2xl border border-primary/35 bg-card/95 px-3 py-2 text-foreground shadow-[0_12px_40px_-16px_hsl(var(--primary)/0.35)] ring-1 ring-primary/15 backdrop-blur-md sm:max-w-4xl sm:px-3.5 sm:py-2.5 dark:border-primary/25 dark:shadow-[0_14px_44px_-14px_hsl(var(--primary)/0.25)]">
                    <Radar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="min-w-0 text-[12px] font-medium leading-snug text-foreground sm:text-sm">
                      Infinitygap is an intelligence agent that continuously gathers news and intel from hundreds of sources, maps how money moves, surfaces business gaps, research angles, and the relationships analysts, investors, and researchers need for cross-reading, and delivers high-signal updates to you proactively across every industry, 24/7—not scattered headlines.
                    </span>
                  </span>
                </p>
              </div>

              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="mt-0 grid min-h-0 gap-y-5 gap-x-0 max-sm:flex max-sm:min-h-0 max-sm:flex-1 max-sm:flex-col sm:gap-y-6"
              >
                <div className="min-h-0 max-w-full text-left max-sm:flex max-sm:min-h-0 max-sm:flex-1 max-sm:flex-col max-sm:justify-between xl:max-w-[min(100%,42rem)]">
                  <div className="max-sm:flex max-sm:min-h-0 max-sm:flex-1 max-sm:flex-col max-sm:justify-evenly max-sm:gap-3 max-sm:py-1">
                  <motion.h1
                    variants={fadeUp}
                    className="font-outfit text-[1.65rem] font-semibold leading-[1.08] tracking-[-0.045em] text-foreground sm:text-4xl md:text-5xl lg:text-[2.75rem] lg:leading-[1.06] xl:text-[3.1rem]"
                  >
                    <span className="block">
                      <span className="font-display italic font-medium tracking-[-0.02em] text-foreground/95">
                        Global market intelligence
                      </span>
                    </span>
                    <span className="mt-2 block sm:mt-2.5 lg:mt-3.5">
                      <span className="text-foreground/35">—</span>{" "}
                      <span className="text-gradient-gold bg-clip-text font-bold text-transparent">one command center</span>
                      <span className="font-bold text-foreground">.</span>
                    </span>
                  </motion.h1>

                  <motion.p
                    variants={fadeUp}
                    className="mt-5 max-w-xl font-mono text-[10px] font-medium uppercase leading-relaxed tracking-[0.18em] text-muted-foreground max-sm:mt-0 sm:mt-6 sm:text-[11px] sm:tracking-[0.2em] md:mt-7 md:text-xs md:tracking-[0.22em] lg:mt-9 xl:mt-10"
                  >
                    <span className="text-foreground/90 tabular-nums">{industries.length} sectors</span>
                    <span className="mx-2 text-border sm:mx-3">/</span>
                    <span className="text-foreground/90 tabular-nums">{FLOW_LANES_LABEL} capital lanes</span>
                    <span className="mx-2 text-border sm:mx-3">/</span>
                    <span className="text-foreground/90 tabular-nums">
                      {SOURCE_INTEGRATIONS_LABEL} feed integrations
                    </span>
                  </motion.p>

                  <motion.div variants={fadeUp} className="mt-5 flex min-h-0 flex-col gap-5 max-sm:mt-0 sm:mt-6 sm:gap-6 md:mt-7 md:gap-6 lg:mt-9 lg:gap-7 xl:mt-10 xl:gap-8">
                    <div className="grid w-full grid-cols-3 gap-1.5 sm:gap-2 md:gap-3">
                      {[
                        { icon: Globe2, label: "Worldwide signal mesh", c: "text-brand-orange" },
                        { icon: Layers, label: "Cross-industry links", c: "text-signal-violet" },
                        { icon: Cpu, label: "Infinity Lab & briefs", c: "text-primary" },
                      ].map(({ icon: Icon, label, c }) => (
                        <span
                          key={label}
                          className="group flex min-h-[2.75rem] min-w-0 flex-col items-center justify-center gap-1 rounded-xl border border-border/55 bg-gradient-to-br from-muted/45 via-muted/25 to-muted/40 px-1 py-2 text-center shadow-sm backdrop-blur-[2px] transition-[border-color,box-shadow] hover:border-primary/25 hover:shadow-md sm:min-h-0 sm:flex-row sm:items-center sm:justify-center sm:gap-2 sm:rounded-2xl sm:px-3 sm:py-2.5 sm:text-left md:gap-2.5 md:px-4 md:py-3"
                        >
                          <span
                            className={cn(
                              "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border/50 bg-background/80 shadow-inner sm:h-8 sm:w-8 sm:rounded-xl",
                              c,
                            )}
                          >
                            <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                          </span>
                          <span className="min-w-0 font-outfit text-[10px] font-semibold leading-snug tracking-[-0.02em] text-foreground sm:text-[12px] md:text-sm">
                            {label}
                          </span>
                        </span>
                      ))}
                    </div>
                  </motion.div>
                  </div>

                  {/* Mobile: CTA pair — tighter to chips, more gap between the two buttons only */}
                  <div className="hidden max-sm:mt-2 max-sm:flex max-sm:shrink-0 max-sm:flex-col max-sm:gap-5 max-sm:pb-[max(0.25rem,env(safe-area-inset-bottom))]">
                  <Link
                    to="/auth?mode=signup"
                    className={cn(
                      "group relative hidden min-h-10 w-full items-stretch overflow-hidden rounded-xl max-sm:flex sm:mt-0 md:rounded-2xl",
                      "border border-white/25 bg-primary/95 text-primary-foreground shadow-[0_10px_40px_-8px_hsl(var(--primary)/0.55),inset_0_1px_0_0_rgba(255,255,255,0.22)]",
                      "backdrop-blur-md dark:border-white/15 dark:shadow-[0_12px_48px_-10px_hsl(var(--primary)/0.45),inset_0_1px_0_0_rgba(255,255,255,0.12)]",
                      "transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_16px_48px_-8px_hsl(var(--primary)/0.6),inset_0_1px_0_0_rgba(255,255,255,0.28)]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    )}
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -left-8 -top-12 h-32 w-32 rounded-full bg-white/20 blur-2xl transition-opacity group-hover:opacity-90"
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-90"
                    />
                    <span className="relative z-10 flex w-full items-center gap-2 px-3 py-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/30 bg-white/15 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35)] backdrop-blur-sm">
                        <Rocket className="h-4 w-4 text-primary-foreground" strokeWidth={2.25} />
                      </span>
                      <span className="min-w-0 flex-1 text-left font-outfit text-sm font-bold tracking-tight">Start free</span>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 transition-transform group-hover:translate-x-0.5">
                        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </span>
                    </span>
                  </Link>

                  {/* Mobile: Sign in (paired with Start free above) */}
                  <Link
                    to="/auth"
                    className={cn(
                      "group relative hidden min-h-10 w-full shrink-0 items-stretch overflow-hidden rounded-xl max-sm:flex md:rounded-2xl",
                      "border border-border/70 bg-background/55 text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.55),0_8px_32px_-12px_rgba(0,0,0,0.15)]",
                      "backdrop-blur-xl dark:border-white/12 dark:bg-card/45 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_36px_-12px_rgba(0,0,0,0.45)]",
                      "transition-all duration-300 hover:border-primary/40 hover:bg-background/75 hover:shadow-lg dark:hover:bg-card/55",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    )}
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-transparent to-brand-orange/[0.06] opacity-0 transition-opacity group-hover:opacity-100"
                    />
                    <span className="relative z-10 flex w-full items-center gap-2 px-3 py-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45)] backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]">
                        <Key className="h-4 w-4 text-primary" strokeWidth={2.25} />
                      </span>
                      <span className="min-w-0 flex-1 text-left font-outfit text-sm font-semibold leading-tight tracking-tight text-foreground">
                        Sign in to explore
                      </span>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/50 bg-muted/30 text-muted-foreground transition-all group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary dark:border-white/10 dark:bg-white/[0.04]">
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </span>
                  </Link>
                  </div>

                  {/* Desktop: two-up CTAs (sm+) */}
                  <div className="hidden grid-cols-1 gap-2 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-2.5 md:mt-7 lg:mt-9 xl:mt-10">
                    <Link
                      to="/auth?mode=signup"
                      className={cn(
                        "group relative flex min-h-8 w-full items-stretch overflow-hidden rounded-xl sm:min-h-9 md:rounded-2xl",
                        "border border-white/25 bg-primary/95 text-primary-foreground shadow-[0_10px_40px_-8px_hsl(var(--primary)/0.55),inset_0_1px_0_0_rgba(255,255,255,0.22)]",
                        "backdrop-blur-md dark:border-white/15 dark:shadow-[0_12px_48px_-10px_hsl(var(--primary)/0.45),inset_0_1px_0_0_rgba(255,255,255,0.12)]",
                        "transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_16px_48px_-8px_hsl(var(--primary)/0.6),inset_0_1px_0_0_rgba(255,255,255,0.28)]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      )}
                    >
                      <span
                        aria-hidden
                        className="pointer-events-none absolute -left-8 -top-12 h-32 w-32 rounded-full bg-white/20 blur-2xl transition-opacity group-hover:opacity-90"
                      />
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-90"
                      />
                      <span className="relative z-10 flex w-full items-center gap-1.5 px-2 py-1.5 sm:gap-2 sm:px-2.5 sm:py-2 md:px-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/30 bg-white/15 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35)] backdrop-blur-sm sm:h-7 sm:w-7 sm:rounded-lg">
                          <Rocket className="h-3.5 w-3.5 text-primary-foreground sm:h-4 sm:w-4" strokeWidth={2.25} />
                        </span>
                        <span className="min-w-0 flex-1 text-left font-outfit text-[11px] font-bold tracking-tight sm:text-xs md:text-sm">
                          Start free
                        </span>
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 transition-transform group-hover:translate-x-0.5 sm:h-7 sm:w-7">
                          <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.5} />
                        </span>
                      </span>
                    </Link>
                    <Link
                      to="/auth"
                      className={cn(
                        "group relative flex min-h-8 w-full items-stretch overflow-hidden rounded-xl sm:min-h-9 md:rounded-2xl",
                        "border border-border/70 bg-background/55 text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.55),0_8px_32px_-12px_rgba(0,0,0,0.15)]",
                        "backdrop-blur-xl dark:border-white/12 dark:bg-card/45 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_36px_-12px_rgba(0,0,0,0.45)]",
                        "transition-all duration-300 hover:border-primary/40 hover:bg-background/75 hover:shadow-lg dark:hover:bg-card/55",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      )}
                    >
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-transparent to-brand-orange/[0.06] opacity-0 transition-opacity group-hover:opacity-100"
                      />
                      <span className="relative z-10 flex w-full items-center gap-1.5 px-2 py-1.5 sm:gap-2 sm:px-2.5 sm:py-2 md:px-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45)] backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] sm:h-7 sm:w-7 sm:rounded-lg">
                          <Key className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" strokeWidth={2.25} />
                        </span>
                        <span className="min-w-0 flex-1 text-left font-outfit text-[11px] font-semibold leading-tight tracking-tight text-foreground sm:text-xs md:text-sm">
                          Sign in to explore
                        </span>
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border/50 bg-muted/30 text-muted-foreground transition-all group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary dark:border-white/10 dark:bg-white/[0.04] sm:h-7 sm:w-7">
                          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 sm:h-3.5 sm:w-3.5" />
                        </span>
                      </span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Explore — warm sand band */}
        <section
          id="explore"
          className="relative border-y border-amber-200/30 dark:border-amber-500/15 landing-band-sand"
        >
          <div className="absolute inset-0 dot-pattern-fine opacity-[0.28] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14 sm:py-20 relative">
            <div className="mb-10 max-w-2xl mx-auto text-center sm:mb-14">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">Choose your lane</p>
              <h2 className="font-display text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-[2.75rem]">
                Three ways in. One global brain.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Pulse the world, stress-test relationships across sectors, or run a private brief — same Infinitygap engine,
                same truth bar.
              </p>
            </div>
            <ChooseLaneCarousel />
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
            <div className="flex flex-wrap items-center gap-3 sm:gap-3.5 md:gap-4">
              <BrandHexMark size="footer" variant="onDark" />
              <BrandWordmark
                className="text-xl sm:text-2xl md:text-2xl lg:text-3xl !leading-[1.12] tracking-tight"
                variant="onDark"
              />
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
            <p className="text-xs text-zinc-600">© 2026 Infinitygap · Not financial advice.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
