import { SupplyChainRoute } from "@/lib/intelTypes";
import { Ship, AlertTriangle, CheckCircle, Eye } from "lucide-react";

const riskColors: Record<string, string> = {
  high: "text-red-400 bg-red-400/10 border-red-400/30",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  low: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
};

const statusIcons: Record<string, any> = {
  "operational": CheckCircle,
  "monitored": Eye,
  "drought-restricted": AlertTriangle,
  "elevated-risk": AlertTriangle,
};

export function SupplyChainPanel({ data }: { data: SupplyChainRoute[] }) {
  if (!data?.length) return null;

  return (
    <div className="glass-panel p-3 h-full">
      <div className="flex items-center gap-2 mb-3">
        <Ship className="w-3.5 h-3.5 text-primary" />
        <h3 className="text-[11px] font-bold text-foreground tracking-wider">SUPPLY CHAIN ROUTES</h3>
        <span className="text-[9px] text-muted-foreground ml-auto">Disruption = opportunity</span>
      </div>
      <div className="space-y-1.5">
        {data.map((r, i) => {
          const Icon = statusIcons[r.status] || Eye;
          const colorClass = riskColors[r.risk] || riskColors.low;
          return (
            <div key={i} className={`flex items-center justify-between py-2 px-2.5 rounded border ${colorClass} transition-colors`}>
              <div className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5" />
                <div>
                  <span className="text-[11px] font-semibold">{r.route}</span>
                  <p className="text-[9px] opacity-70">{r.impact}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase">{r.status}</span>
                <p className="text-[9px] opacity-60">Risk: {r.risk}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
