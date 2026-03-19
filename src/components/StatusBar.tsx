import { Activity, Cpu, Zap, Shield, Clock } from "lucide-react";
import { useState, useEffect } from "react";

export function StatusBar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const items = [
    { icon: Activity, label: "STATUS", value: "OPERATIONAL", accent: true },
    { icon: Cpu, label: "MODEL", value: "GEMINI 3", accent: false },
    { icon: Zap, label: "SPEED", value: "STREAMING", accent: false },
  ];

  return (
    <div className="flex items-center justify-between px-5 py-1.5 border-b border-border/30 bg-background/50">
      <div className="flex items-center gap-5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-1.5">
              <Icon className={`w-3 h-3 ${item.accent ? "text-primary/70" : "text-muted-foreground/60"}`} />
              <span className="text-[9px] font-mono text-muted-foreground/50 tracking-wider">{item.label}</span>
              <span className={`text-[9px] font-mono font-medium tracking-wide ${item.accent ? "text-primary/80" : "text-muted-foreground/70"}`}>
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3 h-3" style={{ color: "hsl(155 70% 50% / 0.6)" }} />
          <span className="text-[9px] font-mono tracking-wide" style={{ color: "hsl(155 70% 50% / 0.7)" }}>ENCRYPTED</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-muted-foreground/40" />
          <span className="text-[9px] font-mono text-muted-foreground/50 tabular-nums tracking-wide">
            {time.toLocaleTimeString("en-US", { hour12: false })}
          </span>
        </div>
      </div>
    </div>
  );
}
