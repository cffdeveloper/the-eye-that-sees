// Geo data for the selector
export type GeoType = "country" | "county" | "state" | "continent";

export type GeoOption = {
  value: string;
  label: string;
  type: GeoType;
  parent?: string; // e.g. county's parent country
};

export const CONTINENTS: GeoOption[] = [
  { value: "africa", label: "Africa", type: "continent" },
  { value: "asia", label: "Asia", type: "continent" },
  { value: "europe", label: "Europe", type: "continent" },
  { value: "north-america", label: "North America", type: "continent" },
  { value: "south-america", label: "South America", type: "continent" },
  { value: "oceania", label: "Oceania", type: "continent" },
  { value: "middle-east", label: "Middle East", type: "continent" },
];

export const COUNTRIES: GeoOption[] = [
  // Africa
  { value: "KE", label: "Kenya", type: "country", parent: "africa" },
  { value: "NG", label: "Nigeria", type: "country", parent: "africa" },
  { value: "ZA", label: "South Africa", type: "country", parent: "africa" },
  { value: "EG", label: "Egypt", type: "country", parent: "africa" },
  { value: "GH", label: "Ghana", type: "country", parent: "africa" },
  { value: "ET", label: "Ethiopia", type: "country", parent: "africa" },
  { value: "TZ", label: "Tanzania", type: "country", parent: "africa" },
  { value: "UG", label: "Uganda", type: "country", parent: "africa" },
  { value: "RW", label: "Rwanda", type: "country", parent: "africa" },
  { value: "SN", label: "Senegal", type: "country", parent: "africa" },
  { value: "CI", label: "Côte d'Ivoire", type: "country", parent: "africa" },
  { value: "MA", label: "Morocco", type: "country", parent: "africa" },
  { value: "DZ", label: "Algeria", type: "country", parent: "africa" },
  { value: "AO", label: "Angola", type: "country", parent: "africa" },
  { value: "MZ", label: "Mozambique", type: "country", parent: "africa" },
  // Asia
  { value: "CN", label: "China", type: "country", parent: "asia" },
  { value: "IN", label: "India", type: "country", parent: "asia" },
  { value: "JP", label: "Japan", type: "country", parent: "asia" },
  { value: "KR", label: "South Korea", type: "country", parent: "asia" },
  { value: "SG", label: "Singapore", type: "country", parent: "asia" },
  { value: "ID", label: "Indonesia", type: "country", parent: "asia" },
  { value: "TH", label: "Thailand", type: "country", parent: "asia" },
  { value: "VN", label: "Vietnam", type: "country", parent: "asia" },
  { value: "PH", label: "Philippines", type: "country", parent: "asia" },
  { value: "MY", label: "Malaysia", type: "country", parent: "asia" },
  // Europe
  { value: "GB", label: "United Kingdom", type: "country", parent: "europe" },
  { value: "DE", label: "Germany", type: "country", parent: "europe" },
  { value: "FR", label: "France", type: "country", parent: "europe" },
  { value: "NL", label: "Netherlands", type: "country", parent: "europe" },
  { value: "SE", label: "Sweden", type: "country", parent: "europe" },
  { value: "CH", label: "Switzerland", type: "country", parent: "europe" },
  { value: "ES", label: "Spain", type: "country", parent: "europe" },
  { value: "IT", label: "Italy", type: "country", parent: "europe" },
  { value: "PL", label: "Poland", type: "country", parent: "europe" },
  { value: "IE", label: "Ireland", type: "country", parent: "europe" },
  // North America
  { value: "US", label: "United States", type: "country", parent: "north-america" },
  { value: "CA", label: "Canada", type: "country", parent: "north-america" },
  { value: "MX", label: "Mexico", type: "country", parent: "north-america" },
  // South America
  { value: "BR", label: "Brazil", type: "country", parent: "south-america" },
  { value: "CO", label: "Colombia", type: "country", parent: "south-america" },
  { value: "AR", label: "Argentina", type: "country", parent: "south-america" },
  { value: "CL", label: "Chile", type: "country", parent: "south-america" },
  { value: "PE", label: "Peru", type: "country", parent: "south-america" },
  // Middle East
  { value: "AE", label: "UAE", type: "country", parent: "middle-east" },
  { value: "SA", label: "Saudi Arabia", type: "country", parent: "middle-east" },
  { value: "IL", label: "Israel", type: "country", parent: "middle-east" },
  { value: "TR", label: "Turkey", type: "country", parent: "middle-east" },
  { value: "QA", label: "Qatar", type: "country", parent: "middle-east" },
  // Oceania
  { value: "AU", label: "Australia", type: "country", parent: "oceania" },
  { value: "NZ", label: "New Zealand", type: "country", parent: "oceania" },
];

// Kenya counties as an example of sub-national
export const KENYA_COUNTIES: GeoOption[] = [
  { value: "KE-NAI", label: "Nairobi", type: "county", parent: "KE" },
  { value: "KE-MOM", label: "Mombasa", type: "county", parent: "KE" },
  { value: "KE-KIS", label: "Kisumu", type: "county", parent: "KE" },
  { value: "KE-NAK", label: "Nakuru", type: "county", parent: "KE" },
  { value: "KE-ELD", label: "Uasin Gishu (Eldoret)", type: "county", parent: "KE" },
  { value: "KE-KIA", label: "Kiambu", type: "county", parent: "KE" },
  { value: "KE-MAC", label: "Machakos", type: "county", parent: "KE" },
  { value: "KE-KAJ", label: "Kajiado", type: "county", parent: "KE" },
  { value: "KE-NYE", label: "Nyeri", type: "county", parent: "KE" },
  { value: "KE-MER", label: "Meru", type: "county", parent: "KE" },
  { value: "KE-KIL", label: "Kilifi", type: "county", parent: "KE" },
  { value: "KE-KAK", label: "Kakamega", type: "county", parent: "KE" },
];

// US states as example
export const US_STATES: GeoOption[] = [
  { value: "US-CA", label: "California", type: "state", parent: "US" },
  { value: "US-NY", label: "New York", type: "state", parent: "US" },
  { value: "US-TX", label: "Texas", type: "state", parent: "US" },
  { value: "US-FL", label: "Florida", type: "state", parent: "US" },
  { value: "US-IL", label: "Illinois", type: "state", parent: "US" },
  { value: "US-WA", label: "Washington", type: "state", parent: "US" },
  { value: "US-MA", label: "Massachusetts", type: "state", parent: "US" },
  { value: "US-CO", label: "Colorado", type: "state", parent: "US" },
  { value: "US-GA", label: "Georgia", type: "state", parent: "US" },
  { value: "US-PA", label: "Pennsylvania", type: "state", parent: "US" },
];

export function getSubRegions(countryCode: string): GeoOption[] {
  switch (countryCode) {
    case "KE": return KENYA_COUNTIES;
    case "US": return US_STATES;
    default: return [];
  }
}

export function getGeoLabel(selections: GeoOption[]): string {
  if (!selections.length) return "Global (All Markets)";
  if (selections.length === 1) return selections[0].label;
  if (selections.length <= 3) return selections.map(s => s.label).join(", ");
  return `${selections.length} regions selected`;
}

export function getGeoContextString(selections: GeoOption[]): string {
  if (!selections.length) return "global";
  return selections.map(s => s.label).join(", ");
}
