import { Commodity } from "@/lib/intelTypes";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";

export function CommoditiesPanel({ data }: { data: Commodity[] }) {
  if (!data?.length) return null;

  return (
    <div className="glass-panel p-3 h-full">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-3.5 h-3.5 text-primary" />
        <h3 className="text-[11px] font-mono font-bold text-foreground tracking-wider">COMMODITIES</h3>
        <span className="text-[9px] font-mono text-muted-foreground ml-auto">{data.length} assets</span>
      </div>
      <div className="space-y-1.5">
        {data.map((c, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded bg-card/50 border border-border/20 hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-muted-foreground w-8">{c.symbol}</span>
              <span className="text-[11px] font-mono text-foreground">{c.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono font-semibold text-foreground">
                {c.price.toLocaleString()} <span className="text-[9px] text-muted-foreground">{c.unit.replace('$/', '')}</span>
              </span>
              <span className={`text-[10px] font-mono font-bold flex items-center gap-0.5 ${c.change > 0 ? 'text-emerald-400' : c.change < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                {c.change > 0 ? <TrendingUp className="w-3 h-3" /> : c.change < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                {c.change > 0 ? '+' : ''}{c.change.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
