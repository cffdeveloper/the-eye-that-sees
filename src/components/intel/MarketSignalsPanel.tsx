import { MarketSignal } from "@/lib/intelTypes";
import { Newspaper, ExternalLink } from "lucide-react";

export function MarketSignalsPanel({ data }: { data: MarketSignal[] }) {
  if (!data?.length) return null;

  return (
    <div className="glass-panel p-3 h-full">
      <div className="flex items-center gap-2 mb-3">
        <Newspaper className="w-3.5 h-3.5 text-primary" />
        <h3 className="text-[11px] font-bold text-foreground tracking-wider">MARKET SIGNALS</h3>
        <span className="text-[9px] text-muted-foreground ml-auto">{data.length} signals</span>
      </div>
      <div className="space-y-1 max-h-[400px] overflow-y-auto scrollbar-thin">
        {data.map((s, i) => (
          <a
            key={i}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block py-1.5 px-2 rounded bg-card/50 border border-border/20 hover:border-primary/30 hover:bg-primary/5 transition-colors group"
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {s.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] text-muted-foreground">{s.source}</span>
                  {s.country && <span className="text-[9px] text-muted-foreground/60">{s.country}</span>}
                </div>
              </div>
              <ExternalLink className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary/60 flex-shrink-0 mt-0.5" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
