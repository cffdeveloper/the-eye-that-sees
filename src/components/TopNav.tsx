import { RotateCcw } from "lucide-react";
import { BrandHexMark } from "@/components/BrandHexMark";
import { BrandWordmark } from "@/components/BrandWordmark";

export function TopNav({ onClear, hasMessages }: { onClear: () => void; hasMessages: boolean }) {
  return (
    <header className="flex items-center justify-between px-5 py-4 border-b border-border/40 glass-panel-strong z-10">
      <div className="flex items-center gap-4">
        <BrandHexMark size="md" />
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl md:text-[1.7rem] leading-tight">
              <BrandWordmark />
            </h1>
            <span className="text-[11px] font-medium text-muted-foreground">Maverick AI</span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-brand-orange/10 text-brand-orange border border-brand-orange/25">
              v1.0
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {hasMessages && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all border border-transparent hover:border-border/50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New session</span>
          </button>
        )}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-primary/10"
          style={{ borderColor: "hsl(var(--primary) / 0.22)" }}
        >
          <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-primary" />
          <span className="text-[10px] font-semibold tracking-wide text-primary">Live</span>
        </div>
      </div>
    </header>
  );
}
