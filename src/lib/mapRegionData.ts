/** Shared region + trade-flow data for WorldMap and RegionAnalyticsDialog */

export type MapRegion = {
  name: string;
  lat: number;
  lng: number;
  label: string;
  code: string;
  industries: string[]; // industry slugs — resolve to names via industryData
  tradeVolume: string;
  disruptions: string[];
};

export type MapFlow = {
  from: string;
  to: string;
  label: string;
  color: string;
  volume: string;
};

export const MAP_REGIONS: MapRegion[] = [
  { name: "North America", lat: 40, lng: -100, label: "NA", code: "NA", industries: ["technology", "financial-services", "health", "energy", "media-entertainment"], tradeVolume: "$8.2T", disruptions: ["AI regulation wave", "Fed rate decisions"] },
  { name: "South America", lat: -15, lng: -60, label: "SA", code: "SA", industries: ["agriculture", "mining", "energy", "trade-retail"], tradeVolume: "$1.4T", disruptions: ["Lithium demand surge", "Deforestation policy"] },
  { name: "Europe", lat: 50, lng: 10, label: "EU", code: "EU", industries: ["financial-services", "automotive", "trade-retail", "technology", "fashion-textiles"], tradeVolume: "$6.8T", disruptions: ["EU AI Act enforcement", "Energy transition"] },
  { name: "Africa", lat: 5, lng: 20, label: "AF", code: "AF", industries: ["mining", "agriculture", "telecommunications", "financial-services", "energy"], tradeVolume: "$0.7T", disruptions: ["AfCFTA trade growth", "Mobile money expansion"] },
  { name: "Middle East", lat: 28, lng: 45, label: "ME", code: "ME", industries: ["energy", "real-estate", "financial-services", "aerospace-defence", "hospitality-tourism"], tradeVolume: "$2.1T", disruptions: ["Oil diversification", "Vision 2030 projects"] },
  { name: "South Asia", lat: 22, lng: 78, label: "SAS", code: "SAS", industries: ["technology", "health", "fashion-textiles", "agriculture", "financial-services"], tradeVolume: "$1.8T", disruptions: ["UPI global expansion", "Generic pharma boom"] },
  { name: "East Asia", lat: 35, lng: 115, label: "EA", code: "EA", industries: ["technology", "automotive", "consumer-electronics", "trade-retail", "energy"], tradeVolume: "$9.5T", disruptions: ["Chip export controls", "EV price war"] },
  { name: "Southeast Asia", lat: 5, lng: 110, label: "SEA", code: "SEA", industries: ["trade-retail", "hospitality-tourism", "agriculture", "technology", "fashion-textiles"], tradeVolume: "$1.9T", disruptions: ["Supply chain relocation", "Digital economy boom"] },
  { name: "Oceania", lat: -28, lng: 135, label: "OC", code: "OC", industries: ["mining", "agriculture", "technology", "hospitality-tourism", "energy"], tradeVolume: "$0.6T", disruptions: ["Critical minerals demand", "Climate adaptation"] },
];

export const MAP_FLOWS: MapFlow[] = [
  { from: "East Asia", to: "North America", label: "Tech Hardware", color: "hsl(35, 100%, 55%)", volume: "$680B" },
  { from: "Middle East", to: "Europe", label: "Energy/Oil", color: "hsl(0, 85%, 55%)", volume: "$420B" },
  { from: "Africa", to: "East Asia", label: "Raw Materials", color: "hsl(155, 70%, 45%)", volume: "$180B" },
  { from: "North America", to: "Europe", label: "Software/SaaS", color: "hsl(200, 80%, 50%)", volume: "$340B" },
  { from: "South America", to: "North America", label: "Agriculture", color: "hsl(120, 60%, 40%)", volume: "$95B" },
  { from: "Southeast Asia", to: "Europe", label: "Textiles", color: "hsl(280, 60%, 55%)", volume: "$120B" },
  { from: "Europe", to: "Africa", label: "Financial Services", color: "hsl(210, 70%, 50%)", volume: "$85B" },
  { from: "Middle East", to: "South Asia", label: "Construction", color: "hsl(25, 90%, 50%)", volume: "$65B" },
  { from: "East Asia", to: "Southeast Asia", label: "Telecom Infra", color: "hsl(190, 80%, 45%)", volume: "$45B" },
  { from: "North America", to: "South Asia", label: "IT Services/BPO", color: "hsl(170, 60%, 45%)", volume: "$210B" },
  { from: "Oceania", to: "East Asia", label: "Mining/LNG", color: "hsl(45, 90%, 50%)", volume: "$130B" },
  { from: "South Asia", to: "Middle East", label: "Labor/Remittance", color: "hsl(300, 50%, 50%)", volume: "$75B" },
];

export function getMapRegion(name: string): MapRegion | undefined {
  return MAP_REGIONS.find((r) => r.name === name);
}

/** Closest macro-region to a map click (basemap has no country polygons; this ties tiles to our regions). */
export function nearestMapRegion(lat: number, lng: number): MapRegion {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  let best = MAP_REGIONS[0];
  let bestKm = Infinity;
  for (const r of MAP_REGIONS) {
    const dLat = toRad(r.lat - lat);
    const dLng = toRad(r.lng - lng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat)) * Math.cos(toRad(r.lat)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;
    if (dist < bestKm) {
      bestKm = dist;
      best = r;
    }
  }
  return best;
}

/** Trade corridors that start or end in this macro-region */
export function getFlowsTouchingRegion(regionName: string): MapFlow[] {
  return MAP_FLOWS.filter((f) => f.from === regionName || f.to === regionName);
}

export function regionIntelScore(disruptionCount: number, flowCount: number): number {
  const base = 42 + Math.min(38, disruptionCount * 12 + flowCount * 4);
  return Math.min(99, Math.round(base));
}
