import { COUNTRIES, type GeoOption } from "@/lib/geoData";
import { haversineKm, type LatLng } from "@/lib/geoDistance";

/** Approximate centroid per ISO2 — spread within parent continent so nearest-neighbor resolves to a country on map tap. */
const CONTINENT_SEED: Record<string, [number, number]> = {
  africa: [8, 20],
  asia: [34, 100],
  europe: [54, 15],
  "north-america": [45, -100],
  "south-america": [-12, -55],
  oceania: [-25, 140],
  "middle-east": [28, 45],
};

export function approximateCentroidForCountry(iso: string): [number, number] {
  const c = COUNTRIES.find((x) => x.value === iso);
  if (!c?.parent) return [20, 0];
  const base = CONTINENT_SEED[c.parent] ?? [15, 0];
  const h = iso.split("").reduce((a, ch) => a + ch.charCodeAt(0), 0);
  return [base[0] + ((h * 7) % 200) / 20 - 5, base[1] + ((h * 11) % 240) / 15 - 8];
}

export type CountryPin = GeoOption & { lat: number; lng: number };

export function nearestCountryFromLatLng(lat: number, lng: number): CountryPin {
  let best: GeoOption | null = null;
  let bestKm = Infinity;
  for (const opt of COUNTRIES) {
    const [clat, clng] = approximateCentroidForCountry(opt.value);
    const d = haversineKm({ lat, lng }, { lat: clat, lng: clng });
    if (d < bestKm) {
      bestKm = d;
      best = opt;
    }
  }
  if (!best) {
    const fb = COUNTRIES[0];
    const [clat, clng] = approximateCentroidForCountry(fb.value);
    return { ...fb, lat: clat, lng: clng };
  }
  const [clat, clng] = approximateCentroidForCountry(best.value);
  return { ...best, lat: clat, lng: clng };
}

export function randomCountryPin(): CountryPin {
  const i = Math.floor(Math.random() * COUNTRIES.length);
  const opt = COUNTRIES[i];
  const [clat, clng] = approximateCentroidForCountry(opt.value);
  return { ...opt, lat: clat, lng: clng };
}

export function countryPinFromOption(opt: GeoOption): CountryPin {
  const [clat, clng] = approximateCentroidForCountry(opt.value);
  return { ...opt, lat: clat, lng: clng };
}

export function sortCountriesByDistance(user: LatLng | null): CountryPin[] {
  const pins = COUNTRIES.map((o) => countryPinFromOption(o));
  if (!user) {
    return pins.sort((a, b) => a.label.localeCompare(b.label));
  }
  return pins
    .map((p) => ({ p, d: haversineKm(user, { lat: p.lat, lng: p.lng }) }))
    .sort((a, b) => a.d - b.d)
    .map((x) => x.p);
}
