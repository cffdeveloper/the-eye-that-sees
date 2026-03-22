import { RotateCcw } from "lucide-react";
import { BrandHexMark } from "@/components/BrandHexMark";
import { BrandWordmark } from "@/components/BrandWordmark";

export function TopNav({ onClear, hasMessages }: { onClear: () => void; hasMessages: boolean }) {
  return (
    <header className="flex items-center justify-between px-5 py-4 border-b border-border bg-card/80 backdrop-blur-xl z-10">
      <div className="flex items-center gap-3">
        <BrandHexMark size="lg" />
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl md:text-4xl leading-tight">
              <BrandWordmark />
            </h1>
            <span className="text-[11px] font-medium text-muted-foreground">Intel GoldMine</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {hasMessages && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New session</span>
          </button>
        )}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-signal-emerald/10 border border-signal-emerald/20">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-signal-emerald" />
          <span className="text-[10px] font-semibold tracking-wide text-signal-emerald">Live</span>
        </div>
      </div>
    </header>
  );
}
