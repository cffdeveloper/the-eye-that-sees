import { type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { BRAND_LOGO_PATH } from "@/lib/brandLogo";

const sizeMap = {
  /** Compact rails — readable at a glance */
  sm: "w-8 h-8 sm:w-9 sm:h-9",
  /** Marketing footer / dark surfaces */
  footer:
    "w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 xl:w-[3.25rem] xl:h-[3.25rem]",
  /** App chrome (TopBar, legal shell) */
  md: "w-9 h-9 sm:w-10 sm:h-10",
  lg: "w-11 h-11 sm:w-12 sm:h-12",
  /** Marketing / onboarding emphasis */
  xl: "w-12 h-12 sm:w-14 sm:h-14 md:w-[3.25rem] md:h-[3.25rem] lg:w-14 lg:h-14",
  /**
   * Marketing header — tune with `--brand-header-mark-size` on the mark.
   */
  header:
    "w-[clamp(2.25rem,var(--brand-header-mark-size,3.25rem),4rem)] h-[clamp(2.25rem,var(--brand-header-mark-size,3.25rem),4rem)]",
  /** Landing hero */
  hero: "w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36",
  /** Auth / reset spotlight */
  "2xl":
    "w-[5.5rem] h-[5.5rem] sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-[7.5rem] lg:h-[7.5rem]",
} as const;

type Size = keyof typeof sizeMap;

/** Product mark — uses `public/Final Logo.png` everywhere (light/dark). */
export function BrandHexMark({
  size = "md",
  className,
  variant = "default",
  /** When `size="header"`, sets `--brand-header-mark-size` on the mark (e.g. `"6rem"`). Bar height stays fixed. */
  headerMarkSize,
}: {
  size?: Size;
  className?: string;
  /** Slight style tweak on dark surfaces (same asset). */
  variant?: "default" | "onDark";
  headerMarkSize?: string;
}) {
  const headerVarStyle =
    size === "header" && headerMarkSize
      ? ({ ["--brand-header-mark-size" as string]: headerMarkSize } as CSSProperties)
      : undefined;

  return (
    <img
      src={BRAND_LOGO_PATH}
      alt="Infinitygap"
      style={headerVarStyle}
      className={cn(
        "shrink-0 object-contain",
        variant === "default" && "drop-shadow-[0_1px_2px_rgba(0,0,0,0.08)]",
        variant === "onDark" && "drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]",
        sizeMap[size],
        className,
      )}
    />
  );
}
