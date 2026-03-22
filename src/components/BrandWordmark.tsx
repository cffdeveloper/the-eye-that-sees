import { cn } from "@/lib/utils";

type BrandWordmarkProps = {
  className?: string;
  compact?: boolean;
};

export function BrandWordmark({ className, compact }: BrandWordmarkProps) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline select-none leading-none gap-1 font-sans",
        compact ? "text-sm" : "text-base sm:text-lg",
        className,
      )}
    >
      <span className="text-foreground font-bold tracking-tight">Intel</span>
      <span className="text-brand-orange font-bold tracking-tight">GoldMine</span>
    </span>
  );
}
