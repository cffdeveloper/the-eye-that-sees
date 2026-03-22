import { cn } from "@/lib/utils";

const sizeMap = {
  sm: "w-7 h-7",
  md: "w-9 h-9",
  lg: "w-11 h-11",
} as const;

type Size = keyof typeof sizeMap;

/** Brand logo mark using the generated logo image. */
export function BrandHexMark({ size = "md", className }: { size?: Size; className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="Intel GoldMine"
      className={cn("shrink-0 object-contain", sizeMap[size], className)}
    />
  );
}
