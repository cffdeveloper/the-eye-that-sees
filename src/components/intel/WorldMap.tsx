import { useEffect, useRef, useState, useCallback } from "react";
import { Globe, Zap } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useGeoContext } from "@/contexts/GeoContext";
import { RegionAnalyticsDialog } from "./RegionAnalyticsDialog";
import { MAP_REGIONS, MAP_FLOWS, getMapRegion, nearestMapRegion } from "@/lib/mapRegionData";

export function WorldMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [activeDisruptions, setActiveDisruptions] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<(typeof MAP_REGIONS)[0] | null>(null);
  const { addSelection } = useGeoContext();

  const handleRegionClick = useCallback(
    (region: (typeof MAP_REGIONS)[0]) => {
      addSelection({ value: region.code, label: region.name, type: "continent" });
      const map = leafletMap.current;
      if (map) {
        map.flyTo([region.lat, region.lng], Math.max(map.getZoom(), 4), {
          duration: 0.85,
          easeLinearity: 0.22,
        });
      }
      setSelectedRegion(region);
    },
    [addSelection],
  );

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

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", {
      maxZoom: 8,
      opacity: 0.6,
      subdomains: "abcd",
    }).addTo(map);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png", {
      maxZoom: 8,
      opacity: 0.4,
      subdomains: "abcd",
    }).addTo(map);

    const onMapClick = (e: L.LeafletMouseEvent) => {
      const region = nearestMapRegion(e.latlng.lat, e.latlng.lng);
      handleRegionClick(region);
    };
    map.on("click", onMapClick);

    MAP_REGIONS.forEach((region) => {
      const pulseRing = L.circleMarker([region.lat, region.lng], {
        radius: 22,
        fillColor: "hsl(35, 100%, 55%)",
        fillOpacity: 0.06,
        color: "hsl(35, 100%, 55%)",
        weight: 1,
        opacity: 0.15,
        className: "animate-pulse",
      }).addTo(map);

      const marker = L.circleMarker([region.lat, region.lng], {
        radius: 7,
        fillColor: "hsl(35, 100%, 55%)",
        fillOpacity: 0.8,
        color: "hsl(35, 100%, 55%)",
        weight: 2,
        opacity: 1,
      }).addTo(map);

      if (region.disruptions.length > 0) {
        L.circleMarker([region.lat + 2, region.lng + 3], {
          radius: 4,
          fillColor: "hsl(0, 85%, 55%)",
          fillOpacity: 0.9,
          color: "hsl(0, 85%, 55%)",
          weight: 1,
          opacity: 0.8,
          className: "animate-pulse",
        }).addTo(map);
      }

      const tooltipContent = `
        <div style="font-family: 'IBM Plex Mono', monospace; font-size: 10px; min-width: 200px;">
          <div style="color: hsl(35, 100%, 55%); font-weight: 700; font-size: 11px; margin-bottom: 4px;">${region.name}</div>
          <div style="color: hsl(200, 20%, 70%); margin-bottom: 3px;">Trade Volume: <span style="color: hsl(200, 20%, 92%); font-weight: 600;">${region.tradeVolume}</span></div>
          <div style="color: hsl(200, 20%, 70%); margin-bottom: 2px;">Top Industries:</div>
          <div style="color: hsl(200, 20%, 85%); font-size: 9px;">${region.industries.slice(0, 3).join(" · ")}</div>
          ${region.disruptions.length ? `<div style="color: hsl(0, 85%, 65%); margin-top: 4px; font-size: 9px;">⚡ ${region.disruptions[0]}</div>` : ""}
          <div style="color: hsl(35, 100%, 55%); margin-top: 6px; font-size: 9px; font-weight: 600; letter-spacing: 0.04em;">▸ OPEN FULL REGIONAL INTEL</div>
        </div>
      `;

      marker.bindTooltip(tooltipContent, {
        className: "map-tooltip",
        direction: "top",
        offset: [0, -12],
      });

      const onMarkerClick = (ev: L.LeafletMouseEvent) => {
        if (ev.originalEvent) L.DomEvent.stopPropagation(ev.originalEvent);
        handleRegionClick(region);
      };
      marker.on("click", onMarkerClick);
      pulseRing.on("click", onMarkerClick);

      marker.on("mouseover", () => setHoveredRegion(region.name));
      marker.on("mouseout", () => setHoveredRegion(null));
    });

    MAP_FLOWS.forEach((flow) => {
      const from = getMapRegion(flow.from);
      const to = getMapRegion(flow.to);
      if (!from || !to) return;

      const midLat = (from.lat + to.lat) / 2 + 8;
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
        weight: 1.2,
        opacity: 0.35,
        dashArray: "4 6",
      }).addTo(map);

      line.bindTooltip(
        `<div style="font-family: 'IBM Plex Mono', monospace; font-size: 9px;">
          <span style="color: hsl(35, 100%, 55%)">${flow.from}</span> → <span style="color: hsl(35, 100%, 55%)">${flow.to}</span><br/>
          <span style="font-weight: 600">${flow.label}</span> · ${flow.volume}
        </div>`,
        { className: "map-tooltip", sticky: true },
      );

      const lastPt = points[points.length - 1] as [number, number];
      L.circleMarker(lastPt, {
        radius: 2.5,
        fillColor: flow.color,
        fillOpacity: 0.7,
        color: flow.color,
        weight: 1,
      }).addTo(map);
    });

    leafletMap.current = map;

    return () => {
      map.off("click", onMapClick);
      map.remove();
      leafletMap.current = null;
    };
  }, [handleRegionClick]);

  useEffect(() => {
    const allDisruptions = MAP_REGIONS.flatMap((r) => r.disruptions.map((d) => ({ region: r.name, text: d })));
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % allDisruptions.length;
      setActiveDisruptions([`${allDisruptions[idx].region}: ${allDisruptions[idx].text}`]);
    }, 4000);
    setActiveDisruptions([`${allDisruptions[0].region}: ${allDisruptions[0].text}`]);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel overflow-hidden">
      <div className="px-3 py-2 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-primary" />
          <span className="terminal-header text-[10px]">GLOBAL FLOW MAP</span>
          <span className="text-[9px] text-muted-foreground">LIVE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        </div>
        {activeDisruptions[0] && (
          <div className="flex items-center gap-1.5 text-[9px] text-destructive">
            <Zap className="w-3 h-3" />
            <span className="animate-fade-in-up">{activeDisruptions[0]}</span>
          </div>
        )}
      </div>

      <div
        ref={mapRef}
        className="w-full h-[380px] relative cursor-crosshair"
        style={{ background: "hsl(220 20% 4%)" }}
      >
        {hoveredRegion && (
          <div className="pointer-events-none absolute bottom-2 left-2 z-[500] px-2 py-1 rounded bg-background/80 border border-primary/20 text-[9px] font-mono text-primary/90 backdrop-blur-sm">
            {hoveredRegion}
          </div>
        )}
      </div>

      <div className="px-3 py-2 border-t border-border/50 flex flex-wrap gap-x-4 gap-y-1">
        {MAP_FLOWS.slice(0, 8).map((flow, i) => (
          <div key={i} className="flex items-center gap-1.5 cursor-default">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: flow.color }} />
            <span className="text-[8px] text-muted-foreground">{flow.label}</span>
            <span className="text-[8px] text-foreground font-semibold">{flow.volume}</span>
          </div>
        ))}
      </div>

      <RegionAnalyticsDialog open={!!selectedRegion} onClose={() => setSelectedRegion(null)} region={selectedRegion} />
    </div>
  );
}
