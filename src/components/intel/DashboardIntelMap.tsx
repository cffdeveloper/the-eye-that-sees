import { useCallback, useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { List, Map as MapIcon, MapPin, Navigation } from "lucide-react";
import { MapResizeHandler } from "@/components/intel/MapResizeHandler";
import { RegionAnalyticsDialog } from "@/components/intel/RegionAnalyticsDialog";
import { MAP_REGIONS, type MapRegion } from "@/lib/mapRegionData";
import { formatDistance, haversineKm, type LatLng } from "@/lib/geoDistance";
import { useGeoContext } from "@/contexts/GeoContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type ViewMode = "list" | "map";

/** Nairobi fallback from implementation guide (when no geolocation yet). */
const FALLBACK_CENTER: [number, number] = [-1.286389, 36.817223];

function FitBounds({ userCoords }: { userCoords: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    const pts: [number, number][] = MAP_REGIONS.map((r) => [r.lat, r.lng]);
    if (userCoords) pts.push([userCoords.lat, userCoords.lng]);
    if (pts.length === 1) {
      map.setView(pts[0], 4, { animate: false });
    } else {
      const b = L.latLngBounds(pts);
      map.fitBounds(b, { padding: [48, 48], maxZoom: 5, animate: false });
    }
    const t = window.setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(t);
  }, [map, userCoords?.lat, userCoords?.lng]);
  return null;
}

export function DashboardIntelMap() {
  const { addSelection } = useGeoContext();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [userCoords, setUserCoords] = useState<LatLng | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<MapRegion | null>(null);

  const requestLocation = useCallback(() => {
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocationError("Location access was denied or unavailable. Distances use alphabetical order until you enable location.");
        setLocating(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60_000,
      },
    );
  }, []);

  const sortedRegions = useMemo(() => {
    const enriched = MAP_REGIONS.map((r) => ({
      region: r,
      distanceKm: userCoords ? haversineKm(userCoords, { lat: r.lat, lng: r.lng }) : null,
    }));
    enriched.sort((a, b) => {
      if (a.distanceKm != null && b.distanceKm != null) return a.distanceKm - b.distanceKm;
      return a.region.name.localeCompare(b.region.name);
    });
    return enriched;
  }, [userCoords]);

  const mapCenter = userCoords ? ([userCoords.lat, userCoords.lng] as [number, number]) : FALLBACK_CENTER;

  const openRegion = useCallback(
    (region: MapRegion) => {
      addSelection({ value: region.code, label: region.name, type: "continent" });
      setSelectedRegion(region);
    },
    [addSelection],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card p-1.5 shadow-sm sm:rounded-2xl sm:p-3 sm:shadow-md">
      <div className="mb-2 flex flex-col gap-2.5 sm:mb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <div
            className="inline-flex rounded-full border border-border/60 bg-muted/40 p-0.5"
            role="tablist"
            aria-label="View mode"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "list"}
              onClick={() => setViewMode("list")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm",
                viewMode === "list"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <List className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              List
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "map"}
              onClick={() => setViewMode("map")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm",
                viewMode === "map"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <MapIcon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              Map
            </button>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-full border-border/60 text-xs font-semibold sm:h-9 sm:text-sm"
            disabled={locating}
            onClick={requestLocation}
          >
            <Navigation className={cn("h-3.5 w-3.5", locating && "animate-pulse")} />
            {locating ? "Locating…" : userCoords ? "Refresh location" : "Use my location"}
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground sm:max-w-[240px] sm:text-right sm:text-xs">
          OpenStreetMap · macro regions match your cross-industry workspace
        </p>
      </div>

      {locationError && (
        <p className="mb-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2.5 py-2 text-[11px] text-amber-950 dark:text-amber-100 sm:text-xs">
          {locationError}
        </p>
      )}

      {viewMode === "list" && (
        <ul className="max-h-[min(52vh,520px)] space-y-2 overflow-y-auto overscroll-contain pr-0.5 sm:max-h-[480px]">
          {sortedRegions.map(({ region, distanceKm }) => (
            <li key={region.code}>
              <button
                type="button"
                onClick={() => openRegion(region)}
                className="flex w-full items-start gap-3 rounded-xl border border-border/50 bg-background/60 px-3 py-2.5 text-left transition-colors hover:border-primary/30 hover:bg-muted/40 sm:px-4 sm:py-3"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-orange/15 text-brand-orange">
                  <MapPin className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 space-y-0.5">
                  <span className="block font-semibold text-foreground text-sm">{region.name}</span>
                  <span className="block text-xs text-muted-foreground line-clamp-2">
                    Trade {region.tradeVolume} · {region.industries.slice(0, 3).join(" · ")}
                  </span>
                  {distanceKm != null && (
                    <span className="block text-xs font-medium text-primary">{formatDistance(distanceKm)}</span>
                  )}
                  <span className="text-xs font-medium text-primary hover:underline">Open regional intel →</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {viewMode === "map" && (
        <MapContainer
          center={mapCenter}
          zoom={2}
          scrollWheelZoom
          className="h-[280px] w-full rounded-lg sm:h-[420px] sm:rounded-xl md:h-[520px]"
          attributionControl
        >
          <MapResizeHandler />
          <FitBounds userCoords={userCoords} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {userCoords && (
            <CircleMarker
              center={[userCoords.lat, userCoords.lng]}
              radius={8}
              pathOptions={{
                color: "#2563eb",
                fillColor: "#3b82f6",
                fillOpacity: 0.9,
              }}
            >
              <Popup>You are here</Popup>
            </CircleMarker>
          )}
          {MAP_REGIONS.map((region) => {
            const distanceKm = userCoords ? haversineKm(userCoords, { lat: region.lat, lng: region.lng }) : null;
            return (
              <CircleMarker
                key={region.code}
                center={[region.lat, region.lng]}
                radius={7}
                pathOptions={{
                  color: "#ea580c",
                  fillColor: "#f97316",
                  fillOpacity: 0.9,
                }}
                eventHandlers={{
                  click: () => openRegion(region),
                }}
              >
                <Popup>
                  <div className="space-y-1 min-w-[160px]">
                    <p className="font-semibold text-sm text-foreground">{region.name}</p>
                    <p className="text-xs text-muted-foreground">Trade volume {region.tradeVolume}</p>
                    {distanceKm != null && <p className="text-xs text-foreground">{formatDistance(distanceKm)}</p>}
                    <button
                      type="button"
                      className="text-xs font-medium text-primary hover:underline"
                      onClick={() => openRegion(region)}
                    >
                      Open regional intel
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      )}

      <RegionAnalyticsDialog open={!!selectedRegion} onClose={() => setSelectedRegion(null)} region={selectedRegion} />
    </div>
  );
}
