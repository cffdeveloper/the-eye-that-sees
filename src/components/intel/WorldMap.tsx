import { useEffect, useRef, useState } from "react";
import { Globe } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const REGIONS: { name: string; lat: number; lng: number; label: string }[] = [
  { name: "North America", lat: 40, lng: -100, label: "NA" },
  { name: "South America", lat: -15, lng: -60, label: "SA" },
  { name: "Europe", lat: 50, lng: 10, label: "EU" },
  { name: "Africa", lat: 5, lng: 20, label: "AF" },
  { name: "Middle East", lat: 28, lng: 45, label: "ME" },
  { name: "South Asia", lat: 22, lng: 78, label: "SAS" },
  { name: "East Asia", lat: 35, lng: 115, label: "EA" },
  { name: "Southeast Asia", lat: 5, lng: 110, label: "SEA" },
  { name: "Oceania", lat: -28, lng: 135, label: "OC" },
];

const FLOWS: { from: string; to: string; label: string; color: string }[] = [
  { from: "East Asia", to: "North America", label: "Tech Hardware", color: "#00d4ff" },
  { from: "Middle East", to: "Europe", label: "Energy/Oil", color: "#f59e0b" },
  { from: "Africa", to: "East Asia", label: "Mining/Raw Materials", color: "#ef4444" },
  { from: "North America", to: "Europe", label: "Software/SaaS", color: "#06b6d4" },
  { from: "South America", to: "North America", label: "Agriculture", color: "#22c55e" },
  { from: "Southeast Asia", to: "Europe", label: "Textiles/Fashion", color: "#a855f7" },
  { from: "Europe", to: "Africa", label: "Financial Services", color: "#3b82f6" },
  { from: "Middle East", to: "South Asia", label: "Construction", color: "#f97316" },
  { from: "East Asia", to: "Southeast Asia", label: "Telecom Infra", color: "#0ea5e9" },
  { from: "North America", to: "South Asia", label: "IT Services/BPO", color: "#10b981" },
  { from: "Europe", to: "South America", label: "Automotive", color: "#94a3b8" },
  { from: "Oceania", to: "East Asia", label: "Mining/LNG", color: "#eab308" },
];

function getRegion(name: string) {
  return REGIONS.find(r => r.name === name);
}

export function WorldMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const [hoveredFlow, setHoveredFlow] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, {
      center: [20, 20],
      zoom: 2,
      minZoom: 2,
      maxZoom: 6,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
      dragging: true,
      worldCopyJump: true,
    });

    // Dark satellite tile layer
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 8, opacity: 0.7 }
    ).addTo(map);

    // Dark overlay for the command-center look
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png",
      { maxZoom: 8, opacity: 0.9, subdomains: "abcd" }
    ).addTo(map);

    // Region markers
    REGIONS.forEach(region => {
      const marker = L.circleMarker([region.lat, region.lng], {
        radius: 8,
        fillColor: "#00d4ff",
        fillOpacity: 0.7,
        color: "#00d4ff",
        weight: 2,
        opacity: 0.9,
      }).addTo(map);

      // Pulsing outer ring
      L.circleMarker([region.lat, region.lng], {
        radius: 16,
        fillColor: "#00d4ff",
        fillOpacity: 0.1,
        color: "#00d4ff",
        weight: 1,
        opacity: 0.3,
        className: "animate-pulse",
      }).addTo(map);

      marker.bindTooltip(
        `<div class="font-mono text-[10px]"><strong>${region.name}</strong></div>`,
        { className: "map-tooltip", direction: "top", offset: [0, -12] }
      );
    });

    // Flow lines (curved polylines)
    FLOWS.forEach(flow => {
      const from = getRegion(flow.from);
      const to = getRegion(flow.to);
      if (!from || !to) return;

      // Create curved line via midpoint offset
      const midLat = (from.lat + to.lat) / 2 + 10;
      const midLng = (from.lng + to.lng) / 2;

      const points: L.LatLngExpression[] = [];
      const steps = 30;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const lat = (1 - t) * (1 - t) * from.lat + 2 * (1 - t) * t * midLat + t * t * to.lat;
        const lng = (1 - t) * (1 - t) * from.lng + 2 * (1 - t) * t * midLng + t * t * to.lng;
        points.push([lat, lng]);
      }

      const line = L.polyline(points, {
        color: flow.color,
        weight: 1.5,
        opacity: 0.5,
        dashArray: "6 4",
        className: "flow-line",
      }).addTo(map);

      line.bindTooltip(
        `<div class="font-mono text-[9px]"><strong>${flow.from}</strong> → <strong>${flow.to}</strong><br/>${flow.label}</div>`,
        { className: "map-tooltip", sticky: true }
      );

      // Arrow at the end
      const lastPt = points[points.length - 1] as [number, number];
      L.circleMarker(lastPt, {
        radius: 3,
        fillColor: flow.color,
        fillOpacity: 0.8,
        color: flow.color,
        weight: 1,
      }).addTo(map);
    });

    leafletMap.current = map;

    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, []);

  return (
    <div className="glass-panel p-4">
      <h2 className="text-xs font-mono font-bold text-foreground mb-3 flex items-center gap-1.5">
        <Globe className="w-3.5 h-3.5 text-primary" /> GLOBAL MONEY FLOW MAP
      </h2>
      <div
        ref={mapRef}
        className="w-full h-[400px] rounded-lg border border-border/30 overflow-hidden"
        style={{ background: "hsl(222 25% 5%)" }}
      />
      {/* Legend */}
      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-1.5">
        {FLOWS.slice(0, 8).map((flow, i) => (
          <div
            key={i}
            className={`flex items-center gap-1.5 cursor-default transition-opacity ${hoveredFlow && hoveredFlow !== flow.label ? "opacity-40" : ""}`}
            onMouseEnter={() => setHoveredFlow(flow.label)}
            onMouseLeave={() => setHoveredFlow(null)}
          >
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: flow.color }} />
            <span className="text-[8px] font-mono text-muted-foreground truncate">{flow.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
