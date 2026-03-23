import { useCallback, useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { List, Map as MapIcon, MapPin, Navigation } from "lucide-react";
import { MapResizeHandler } from "@/components/intel/MapResizeHandler";
import { RegionAnalyticsDialog, type RegionAnalyticsScope } from "@/components/intel/RegionAnalyticsDialog";
import { formatDistance, haversineKm, type LatLng } from "@/lib/geoDistance";
import { useGeoContext } from "@/contexts/GeoContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { nearestCountryFromLatLng, randomCountryPin, sortCountriesByDistance, type CountryPin } from "@/lib/countryFromLatLng";
import type { GeoOption } from "@/lib/geoData";

type ViewMode = "list" | "map";

function MapClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/** Initial view: random country, zoomed in (not whole world). */
function InitialCountryView({ pin }: { pin: CountryPin }) {
  const map = useMap();
  useEffect(() => {
    map.setView([pin.lat, pin.lng], 5, { animate: false });
    const t = window.setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(t);
  }, [map, pin.lat, pin.lng]);
  return null;
}

function UserLocationView({ userCoords }: { userCoords: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (!userCoords) return;
    map.setView([userCoords.lat, userCoords.lng], 5, { animate: true });
  }, [map, userCoords?.lat, userCoords?.lng]);
  return null;
}

export function DashboardIntelMap() {
  const { addSelection } = useGeoContext();
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [userCoords, setUserCoords] = useState<LatLng | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [listSearch, setListSearch] = useState("");
  const [initialPin] = useState(() => randomCountryPin());
  const [selectedScope, setSelectedScope] = useState<RegionAnalyticsScope | null>(null);

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

  const sortedCountries = useMemo(() => sortCountriesByDistance(userCoords), [userCoords]);

  const filteredList = useMemo(() => {
    const q = listSearch.trim().toLowerCase();
    if (!q) return sortedCountries;
    return sortedCountries.filter((c) => c.label.toLowerCase().includes(q));
  }, [sortedCountries, listSearch]);

  const mapCenter: [number, number] = userCoords ? [userCoords.lat, userCoords.lng] : [initialPin.lat, initialPin.lng];

  const openCountry = useCallback(
    (pin: CountryPin) => {
      const opt: GeoOption = { value: pin.value, label: pin.label, type: "country", parent: pin.parent };
      addSelection(opt);
      setSelectedScope({
        kind: "country",
        code: pin.value,
        label: pin.label,
        lat: pin.lat,
        lng: pin.lng,
      });
    },
    [addSelection],
  );

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      openCountry(nearestCountryFromLatLng(lat, lng));
    },
    [openCountry],
  );

  return (
    <div className="relative z-0 overflow-hidden rounded-xl border border-border/60 bg-card p-1.5 shadow-sm sm:rounded-2xl sm:p-3 sm:shadow-md">
      <div className="mb-2 flex flex-col gap-2.5 sm:mb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <div
            className="inline-flex max-w-full rounded-full border border-border/60 bg-muted/40 p-0.5"
            role="tablist"
            aria-label="View mode"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "list"}
              onClick={() => setViewMode("list")}
              className={cn(
                "inline-flex min-w-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-colors sm:px-3 sm:text-sm",
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
                "inline-flex min-w-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-colors sm:px-3 sm:text-sm",
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
            className="h-8 max-w-full gap-1.5 rounded-full border-border/60 text-xs font-semibold sm:h-9 sm:text-sm"
            disabled={locating}
            onClick={requestLocation}
          >
            <Navigation className={cn("h-3.5 w-3.5 shrink-0", locating && "animate-pulse")} />
            {locating ? "Locating…" : userCoords ? "Refresh location" : "Use my location"}
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground sm:max-w-[240px] sm:text-right sm:text-xs">
          Tap the map to pick a country · analysis is country-scoped
        </p>
      </div>

      {locationError && (
        <p className="mb-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2.5 py-2 text-[11px] text-amber-950 dark:text-amber-100 sm:text-xs">
          {locationError}
        </p>
      )}

      {viewMode === "list" && (
        <div className="flex max-h-[min(52vh,520px)] flex-col gap-2 sm:max-h-[480px]">
          <Input
            type="search"
            placeholder="Search countries…"
            value={listSearch}
            onChange={(e) => setListSearch(e.target.value)}
            className="h-9 rounded-lg text-sm"
          />
          <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-0.5">
            {filteredList.map((pin) => {
              const distanceKm = userCoords ? haversineKm(userCoords, { lat: pin.lat, lng: pin.lng }) : null;
              return (
                <li key={pin.value}>
                  <button
                    type="button"
                    onClick={() => openCountry(pin)}
                    className="flex w-full items-start gap-3 rounded-xl border border-border/50 bg-background/60 px-3 py-2.5 text-left transition-colors hover:border-primary/30 hover:bg-muted/40 sm:px-4 sm:py-3"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-orange/15 text-brand-orange">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1 space-y-0.5">
                      <span className="block text-sm font-semibold text-foreground">{pin.label}</span>
                      <span className="block text-xs text-muted-foreground">{pin.value}</span>
                      {distanceKm != null && (
                        <span className="block text-xs font-medium text-primary">{formatDistance(distanceKm)}</span>
                      )}
                      <span className="text-xs font-medium text-primary hover:underline">Open country intel →</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {viewMode === "map" && (
        <MapContainer
          center={mapCenter}
          zoom={5}
          minZoom={2}
          scrollWheelZoom
          className="relative z-0 h-[280px] w-full rounded-lg sm:h-[420px] sm:rounded-xl md:h-[520px]"
          attributionControl
        >
          <MapResizeHandler />
          <InitialCountryView pin={initialPin} />
          <UserLocationView userCoords={userCoords} />
          <MapClickHandler onPick={handleMapClick} />
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
            />
          )}
        </MapContainer>
      )}

      <RegionAnalyticsDialog open={!!selectedScope} onClose={() => setSelectedScope(null)} scope={selectedScope} />
    </div>
  );
}
