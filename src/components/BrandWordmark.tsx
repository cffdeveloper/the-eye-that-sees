import { cn } from "@/lib/utils";

type BrandWordmarkProps = {
  className?: string;
  compact?: boolean;
  /** Use on dark headers/footers so “Infinity” reads on navy. */
  variant?: "default" | "onDark";
};

export function BrandWordmark({ className, compact, variant = "default" }: BrandWordmarkProps) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline select-none leading-none gap-0 font-sans",
        compact ? "text-base sm:text-lg" : "text-lg sm:text-xl md:text-2xl",
        className,
      )}
    >
      <span
        className={cn(
          "font-bold tracking-tight",
          variant === "onDark" ? "text-white" : "text-foreground",
        )}
      >
        Infinity
      </span>
      <span className="text-gradient-gold font-bold tracking-tight">gap</span>
    </span>
  );
}
