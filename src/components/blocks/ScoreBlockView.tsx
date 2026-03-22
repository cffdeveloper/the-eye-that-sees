import type { ScoreBlock } from "@/lib/blockTypes";
import { Gauge } from "lucide-react";
import { BlockMarkdown } from "@/components/InlineMarkdown";

function getScoreColor(score: number, max: number) {
  const pct = score / max;
  if (pct >= 0.8) return { ring: "stroke-emerald-400", text: "text-emerald-400", bg: "bg-emerald-500/10" };
  if (pct >= 0.6) return { ring: "stroke-blue-400", text: "text-blue-400", bg: "bg-blue-500/10" };
  if (pct >= 0.4) return { ring: "stroke-amber-400", text: "text-amber-400", bg: "bg-amber-500/10" };
  return { ring: "stroke-red-400", text: "text-red-400", bg: "bg-red-500/10" };
}

export function ScoreBlockView({ data }: { data: ScoreBlock["data"] }) {
  const colors = getScoreColor(data.score, data.maxScore);
  const pct = (data.score / data.maxScore) * 100;
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="my-4 glass-panel p-5">
      <div className="flex items-center gap-2 mb-4">
        <Gauge className="w-4 h-4 text-primary/70" />
        <h3 className="text-xs font-semibold text-foreground tracking-wide">{data.title}</h3>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Score ring */}
        <div className="relative w-28 h-28 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="4" opacity="0.3" />
            <circle
              cx="50" cy="50" r="42" fill="none"
              className={colors.ring}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${colors.text}`}>{data.score}</span>
            <span className="text-[9px] text-muted-foreground">/ {data.maxScore}</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 space-y-3">
          <div>
            <span className={`inline-block text-[10px] px-2.5 py-1 rounded-full ${colors.bg} ${colors.text} font-semibold tracking-wider uppercase border border-current/20`}>
              {data.label}
            </span>
          </div>
          <BlockMarkdown content={data.summary} className="text-xs text-card-foreground/80 leading-relaxed [&_p]:mb-1.5" />

          {/* Breakdown bars */}
          <div className="space-y-2 pt-1">
            {data.breakdown.map((item, i) => {
              const barPct = (item.score / data.maxScore) * 100;
              const barColors = getScoreColor(item.score, data.maxScore);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[10px] text-muted-foreground">{item.category}</span>
                    <span className={`text-[10px] font-semibold ${barColors.text}`}>{item.score}/{data.maxScore}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${barColors.ring.replace("stroke-", "bg-")}`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
