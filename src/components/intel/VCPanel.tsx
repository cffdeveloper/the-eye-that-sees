import { VCSignal } from "@/lib/intelTypes";
import { Rocket, TrendingUp, ArrowRight } from "lucide-react";

const trendColors: Record<string, string> = {
  surging: "text-emerald-400 bg-emerald-400/10",
  accelerating: "text-primary bg-primary/10",
  growing: "text-blue-400 bg-blue-400/10",
  recovering: "text-amber-400 bg-amber-400/10",
  consolidating: "text-orange-400 bg-orange-400/10",
  emerging: "text-violet-400 bg-violet-400/10",
};

export function VCPanel({ data }: { data: VCSignal[] }) {
  if (!data?.length) return null;

  return (
    <div className="glass-panel p-3 h-full">
      <div className="flex items-center gap-2 mb-3">
        <Rocket className="w-3.5 h-3.5 text-primary" />
        <h3 className="text-[11px] font-bold text-foreground tracking-wider">VC / FUNDING SIGNALS</h3>
        <span className="text-[9px] text-muted-foreground ml-auto">Capital flow trends</span>
      </div>
      <div className="space-y-1.5">
        {data.map((v, i) => {
          const colorClass = trendColors[v.trend] || trendColors.growing;
          return (
            <div key={i} className="py-2 px-2.5 rounded bg-card/50 border border-border/20 hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-foreground">{v.sector}</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${colorClass}`}>
                  {v.trend}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-1">{v.signal}</p>
              <div className="flex items-center gap-1 text-[10px] text-primary">
                <ArrowRight className="w-3 h-3" />
                <span className="font-semibold">{v.opportunity}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
