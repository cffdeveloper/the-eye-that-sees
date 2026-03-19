import { Hexagon, RotateCcw, Sparkles } from "lucide-react";

export function TopNav({ onClear, hasMessages }: { onClear: () => void; hasMessages: boolean }) {
  return (
    <header className="flex items-center justify-between px-5 py-3.5 border-b border-border/40 glass-panel-strong z-10">
      <div className="flex items-center gap-3">
        <div className="relative w-9 h-9">
          <Hexagon className="w-9 h-9 text-primary/80" strokeWidth={1.2} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-primary/80 animate-pulse-glow" />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold font-mono tracking-[0.25em] text-gradient-primary">
              NEXUS
            </h1>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary/70 border border-primary/15 tracking-wider">
              v1.0
            </span>
          </div>
          <p className="text-[10px] font-mono text-muted-foreground tracking-wider">
            Intelligence Platform
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {hasMessages && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all border border-transparent hover:border-border/50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Session</span>
          </button>
        )}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border" style={{
          background: "hsl(155 70% 45% / 0.08)",
          borderColor: "hsl(155 70% 45% / 0.2)"
        }}>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "hsl(155 70% 45%)" }} />
          <span className="text-[10px] font-mono font-semibold tracking-wide" style={{ color: "hsl(155 70% 55%)" }}>ACTIVE</span>
        </div>
      </div>
    </header>
  );
}
