import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/** Platform-wide workflow — use on Dashboard and anywhere users need orientation. */
export function IntelWorkflowGuide({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.04] via-background to-brand-orange/[0.03] p-5 sm:p-6 shadow-sm",
        className,
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1.5">How Intel GoldMine works</p>
      <h2 className="font-display text-base sm:text-lg font-bold text-foreground mb-3 leading-snug">
        Turn raw markets into decisions — one workflow
      </h2>
      <ol className="list-decimal list-inside space-y-2.5 text-sm text-muted-foreground leading-relaxed [&>li]:marker:text-primary [&>li]:marker:font-bold">
        <li>
          <span className="text-foreground font-semibold">Pick a sector</span> on this page — each industry card opens a full brief, news, and social intel for that vertical.
        </li>
        <li>
          <span className="text-foreground font-semibold">Go deeper on a money flow</span> — inside an industry, every flow is a lane (e.g. payments, logistics). That’s where flow-specific AI, gaps, and history live.
        </li>
        <li>
          <span className="text-foreground font-semibold">Live feed</span> ({""}
          <Link to="/intel" className="text-primary font-medium hover:underline">
            Intel
          </Link>
          ) for a cross-asset pulse;{" "}
          <span className="text-foreground font-semibold">Cross-industry</span> ({""}
          <Link to="/cross-intel" className="text-primary font-medium hover:underline">
            scan
          </Link>
          ) for links across all sectors;{" "}
          <span className="text-foreground font-semibold">Intel Lab</span> ({""}
          <Link to="/custom-intel" className="text-primary font-medium hover:underline">
            build
          </Link>
          ) for your own scoped briefs (Pro).
        </li>
      </ol>
      <p className="mt-4 text-xs text-muted-foreground border-t border-border/40 pt-4 leading-relaxed">
        <span className="font-semibold text-foreground">Tip:</span> Set geography in the top bar so feeds and intel match your markets. Refine role, industries, and alerts in{" "}
        <Link to="/profile" className="text-primary font-medium hover:underline">
          Profile
        </Link>
        .
      </p>
    </div>
  );
}

/** Short intro block for individual routes — marketing tone, scannable. */
export function PageIntro({
  eyebrow,
  title,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border/50 bg-muted/20 px-4 py-4 sm:px-5 sm:py-5", className)}>
      {eyebrow && (
        <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1.5">{eyebrow}</p>
      )}
      <h2 className="text-sm sm:text-base font-bold text-foreground leading-snug">{title}</h2>
      <div className="mt-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </div>
  );
}
