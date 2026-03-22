import { cn } from "@/lib/utils";

const sizeMap = {
  sm: { box: "w-7 h-7", icon: "text-sm" },
  md: { box: "w-9 h-9", icon: "text-base" },
  lg: { box: "w-11 h-11", icon: "text-lg" },
} as const;

type Size = keyof typeof sizeMap;

/** Friendly rounded brand mark — warm gradient background with a gold icon. */
export function BrandHexMark({ size = "md", className }: { size?: Size; className?: string }) {
  const s = sizeMap[size];

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md",
        s.box,
        className,
      )}
      aria-hidden
    >
      <span className={cn("font-bold text-primary-foreground", s.icon)}>⬡</span>
      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-brand-orange border-2 border-background" />
    </div>
  );
}
