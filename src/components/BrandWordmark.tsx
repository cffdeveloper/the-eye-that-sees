import { cn } from "@/lib/utils";

type BrandWordmarkProps = {
  className?: string;
  /** Slightly smaller when space is tight (e.g. sidebar). */
  compact?: boolean;
};

/**
 * Platform name: Intel GoldMine — two solid colors (no blended gradient).
 * The AI agent is Maverick (see copy / badges elsewhere).
 */
export function BrandWordmark({ className, compact }: BrandWordmarkProps) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline select-none leading-none gap-1.5 font-sans",
        compact ? "text-sm" : "text-base sm:text-lg",
        className,
      )}
    >
      <span className="text-foreground font-semibold tracking-tight">Intel</span>
      <span className="text-brand-orange font-semibold tracking-tight">GoldMine</span>
    </span>
  );
}
