import type { ComparisonBlock } from "@/lib/blockTypes";
import { Scale } from "lucide-react";
import { InlineMarkdown } from "@/components/InlineMarkdown";

export function ComparisonBlockView({ data }: { data: ComparisonBlock["data"] }) {
  return (
    <div className="my-4 glass-panel overflow-hidden max-w-full min-w-0">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 min-w-0">
        <Scale className="w-4 h-4 text-primary/70 shrink-0" />
        <h3 className="text-xs font-semibold text-foreground tracking-wide min-w-0 truncate">{data.title}</h3>
      </div>
      <div className="max-w-full min-w-0 overflow-x-auto overflow-y-visible overscroll-x-contain touch-pan-x">
        <table className="w-max min-w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-border/30">
              {data.headers.map((h, i) => (
                <th
                  key={i}
                  className={`px-4 py-2.5 text-left font-semibold tracking-wider uppercase ${
                    i === 0 ? "text-muted-foreground" : "text-primary/80"
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, i) => (
              <tr key={i} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`px-4 py-2.5 align-top ${
                      j === 0 ? "text-muted-foreground font-medium" : "text-card-foreground"
                    }`}
                  >
                    <span>
                      <InlineMarkdown content={String(cell)} />
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.verdict && (
        <div className="px-4 py-3 border-t border-border/30 bg-primary/5">
          <div className="text-xs text-primary/90 leading-relaxed">
            <span className="font-semibold text-primary">Verdict</span>
            <span className="text-muted-foreground">: </span>
            <InlineMarkdown content={data.verdict} />
          </div>
        </div>
      )}
    </div>
  );
}
