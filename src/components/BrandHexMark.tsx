import { useTheme } from "next-themes";
import { useEffect, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: "w-7 h-7",
  /** Marketing footer / dark surfaces — larger than sm */
  footer: "w-10 h-10 sm:w-11 sm:h-11",
  md: "w-9 h-9",
  lg: "w-11 h-11",
  /** Compact nav bars (tooling) */
  xl: "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16",
  /**
   * Top bar mark — sized independently of header height (header uses overflow-visible + fixed h-12/h-14).
   * Tune without changing the bar: set `--brand-header-mark-size` on the header (e.g. `5.75rem`).
   */
  header:
    "w-[clamp(3.5rem,var(--brand-header-mark-size,5.25rem),7rem)] h-[clamp(3.5rem,var(--brand-header-mark-size,5.25rem),7rem)]",
  /** Landing hero — compact, less vertical footprint than 2xl */
  hero: "w-[5.5rem] h-[5.5rem] sm:w-24 sm:h-24 md:w-[6.5rem] md:h-[6.5rem] lg:w-28 lg:h-28 xl:w-[7.5rem] xl:h-[7.5rem]",
  /** Auth / reset spotlight */
  "2xl":
    "w-[7.25rem] h-[7.25rem] sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-[13rem] lg:h-[13rem] xl:w-[14.5rem] xl:h-[14.5rem]",
} as const;

type Size = keyof typeof sizeMap;

/** Logos: `/logo-light.png` (light UI) · `/logo-dark.png` (dark UI / dark surfaces). */
export function BrandHexMark({
  size = "md",
  className,
  variant = "default",
  /** When `size="header"`, sets `--brand-header-mark-size` on the mark (e.g. `"6rem"`). Bar height stays fixed. */
  headerMarkSize,
}: {
  size?: Size;
  className?: string;
  /** Logo for dark backgrounds (e.g. marketing footer) — always uses the dark-surface asset. */
  variant?: "default" | "onDark";
  headerMarkSize?: string;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const useDarkAsset = variant === "onDark" || (mounted && resolvedTheme === "dark");
  const src = useDarkAsset ? "/logo-dark.png" : "/logo-light.png";

  const headerVarStyle =
    size === "header" && headerMarkSize
      ? ({ ["--brand-header-mark-size" as string]: headerMarkSize } as CSSProperties)
      : undefined;

  return (
    <img
      src={src}
      alt="Intel GoldMine"
      style={headerVarStyle}
      className={cn(
        "shrink-0 object-contain",
        variant === "default" && !useDarkAsset && "drop-shadow-[0_1px_2px_rgba(0,0,0,0.08)]",
        sizeMap[size],
        className,
      )}
    />
  );
}
