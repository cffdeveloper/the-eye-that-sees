import type { MetricItem } from "@/lib/blockTypes";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const trendIcon = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

const trendColor = {
  up: "text-emerald-400",
  down: "text-red-400",
  neutral: "text-muted-foreground",
};

const trendBg = {
  up: "bg-emerald-400/10",
  down: "bg-red-400/10",
  neutral: "bg-muted/50",
};

export function MetricsBlockView({ data }: { data: MetricItem[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 my-4">
      {data.map((m, i) => {
        const Icon = trendIcon[m.trend] || Minus;
        return (
          <div
            key={i}
            className="glass-panel p-3.5 space-y-2 hover:glow-border transition-all duration-300"
          >
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {m.label}
            </p>
            <p className="text-xl font-bold text-foreground tracking-tight">
              {m.value}
            </p>
            {m.delta && (
              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${trendBg[m.trend]} ${trendColor[m.trend]}`}>
                <Icon className="w-3 h-3" />
                {m.delta}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
