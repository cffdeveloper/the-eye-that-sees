import { Globe, MapPin } from "lucide-react";

// SVG world map with industry money flow connections
const REGIONS: Record<string, { x: number; y: number; label: string }> = {
  "North America": { x: 180, y: 160, label: "NA" },
  "South America": { x: 240, y: 310, label: "SA" },
  "Europe": { x: 440, y: 130, label: "EU" },
  "Africa": { x: 440, y: 270, label: "AF" },
  "Middle East": { x: 510, y: 200, label: "ME" },
  "South Asia": { x: 570, y: 220, label: "SA" },
  "East Asia": { x: 650, y: 170, label: "EA" },
  "Southeast Asia": { x: 640, y: 260, label: "SEA" },
  "Oceania": { x: 700, y: 340, label: "OC" },
};

const FLOWS: { from: string; to: string; label: string; color: string }[] = [
  { from: "East Asia", to: "North America", label: "Tech Hardware", color: "hsl(var(--primary))" },
  { from: "Middle East", to: "Europe", label: "Energy/Oil", color: "hsl(38 95% 55%)" },
  { from: "Africa", to: "East Asia", label: "Mining/Raw Materials", color: "hsl(var(--destructive))" },
  { from: "North America", to: "Europe", label: "Software/SaaS", color: "hsl(185 80% 65%)" },
  { from: "South America", to: "North America", label: "Agriculture", color: "hsl(var(--success))" },
  { from: "Southeast Asia", to: "Europe", label: "Textiles/Fashion", color: "hsl(280 70% 60%)" },
  { from: "Europe", to: "Africa", label: "Financial Services", color: "hsl(210 70% 60%)" },
  { from: "Middle East", to: "South Asia", label: "Construction/Real Estate", color: "hsl(30 70% 50%)" },
  { from: "East Asia", to: "Southeast Asia", label: "Telecom Infrastructure", color: "hsl(200 80% 50%)" },
  { from: "North America", to: "South Asia", label: "IT Services/BPO", color: "hsl(160 60% 50%)" },
  { from: "Europe", to: "South America", label: "Automotive", color: "hsl(0 0% 65%)" },
  { from: "Oceania", to: "East Asia", label: "Mining/LNG", color: "hsl(45 80% 55%)" },
];

export function WorldMap() {
  return (
    <div className="glass-panel p-4">
      <h2 className="text-xs font-mono font-bold text-foreground mb-3 flex items-center gap-1.5">
        <Globe className="w-3.5 h-3.5 text-primary" /> GLOBAL MONEY FLOW MAP
      </h2>
      <div className="relative w-full overflow-hidden rounded border border-border/30 bg-background/50">
        <svg viewBox="0 0 800 420" className="w-full h-auto">
          {/* World map outline (simplified) */}
          <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="hsl(var(--primary) / 0.6)" />
            </marker>
          </defs>
          
          {/* Simplified continent shapes */}
          {/* North America */}
          <path d="M100,80 L220,80 L250,120 L240,200 L200,220 L160,200 L120,180 L100,120 Z" 
                fill="hsl(var(--muted) / 0.3)" stroke="hsl(var(--border))" strokeWidth="0.5" />
          {/* South America */}
          <path d="M200,230 L260,240 L280,280 L270,350 L240,380 L210,360 L200,300 Z" 
                fill="hsl(var(--muted) / 0.3)" stroke="hsl(var(--border))" strokeWidth="0.5" />
          {/* Europe */}
          <path d="M390,80 L480,80 L490,120 L470,160 L430,170 L400,150 L390,110 Z" 
                fill="hsl(var(--muted) / 0.3)" stroke="hsl(var(--border))" strokeWidth="0.5" />
          {/* Africa */}
          <path d="M400,180 L480,180 L500,240 L480,340 L440,360 L400,320 L390,240 Z" 
                fill="hsl(var(--muted) / 0.3)" stroke="hsl(var(--border))" strokeWidth="0.5" />
          {/* Asia */}
          <path d="M490,70 L700,70 L720,120 L700,200 L650,240 L580,250 L520,220 L500,160 L490,100 Z" 
                fill="hsl(var(--muted) / 0.3)" stroke="hsl(var(--border))" strokeWidth="0.5" />
          {/* Oceania */}
          <path d="M660,290 L730,290 L740,340 L720,370 L670,360 L660,320 Z" 
                fill="hsl(var(--muted) / 0.3)" stroke="hsl(var(--border))" strokeWidth="0.5" />

          {/* Flow lines */}
          {FLOWS.map((flow, i) => {
            const from = REGIONS[flow.from];
            const to = REGIONS[flow.to];
            if (!from || !to) return null;
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2 - 20;
            return (
              <g key={i}>
                <path
                  d={`M${from.x},${from.y} Q${midX},${midY} ${to.x},${to.y}`}
                  fill="none"
                  stroke={flow.color}
                  strokeWidth="1.5"
                  strokeOpacity="0.4"
                  strokeDasharray="4 2"
                  markerEnd="url(#arrowhead)"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0;-12"
                    dur={`${2 + i * 0.3}s`}
                    repeatCount="indefinite"
                  />
                </path>
                <title>{`${flow.from} → ${flow.to}: ${flow.label}`}</title>
              </g>
            );
          })}

          {/* Region nodes */}
          {Object.entries(REGIONS).map(([name, pos]) => (
            <g key={name}>
              <circle cx={pos.x} cy={pos.y} r="14" fill="hsl(var(--card))" stroke="hsl(var(--primary) / 0.5)" strokeWidth="1.5" />
              <circle cx={pos.x} cy={pos.y} r="3" fill="hsl(var(--primary))" opacity="0.8">
                <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
              </circle>
              <text x={pos.x} y={pos.y + 26} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="8" fontFamily="monospace">
                {name}
              </text>
            </g>
          ))}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-1.5">
        {FLOWS.slice(0, 8).map((flow, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: flow.color }} />
            <span className="text-[8px] font-mono text-muted-foreground truncate">{flow.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
