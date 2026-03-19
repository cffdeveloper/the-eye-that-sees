import type { FrameworkBlock } from "@/lib/blockTypes";
import { Layers } from "lucide-react";

const colorMap: Record<string, { border: string; bg: string; text: string; dot: string }> = {
  emerald: { border: "border-emerald-500/30", bg: "bg-emerald-500/5", text: "text-emerald-400", dot: "bg-emerald-400" },
  red: { border: "border-red-500/30", bg: "bg-red-500/5", text: "text-red-400", dot: "bg-red-400" },
  blue: { border: "border-blue-500/30", bg: "bg-blue-500/5", text: "text-blue-400", dot: "bg-blue-400" },
  amber: { border: "border-amber-500/30", bg: "bg-amber-500/5", text: "text-amber-400", dot: "bg-amber-400" },
  purple: { border: "border-purple-500/30", bg: "bg-purple-500/5", text: "text-purple-400", dot: "bg-purple-400" },
  cyan: { border: "border-primary/30", bg: "bg-primary/5", text: "text-primary", dot: "bg-primary" },
};

const fallback = colorMap.cyan;

export function FrameworkBlockView({ data }: { data: FrameworkBlock["data"] }) {
  return (
    <div className="my-4">
      <div className="flex items-center gap-2 mb-3">
        <Layers className="w-4 h-4 text-primary/70" />
        <h3 className="text-xs font-mono font-semibold text-foreground tracking-wide">{data.title}</h3>
        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary/70 border border-primary/15 uppercase tracking-widest">
          {data.type}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {data.sections.map((section, i) => {
          const colors = colorMap[section.color] || fallback;
          return (
            <div
              key={i}
              className={`rounded-lg border ${colors.border} ${colors.bg} p-4 space-y-2.5`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${colors.text}`}>
                  {section.label}
                </h4>
              </div>
              <ul className="space-y-1.5">
                {section.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs text-card-foreground leading-relaxed">
                    <span className={`mt-1.5 w-1 h-1 rounded-full flex-shrink-0 ${colors.dot} opacity-50`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
