export type AlertLevel = "critical" | "high" | "medium" | "info";

export type Alert = {
  level: AlertLevel;
  domain: string;
  title: string;
  detail: string;
  time: number;
};

export type CryptoAsset = {
  id: string;
  symbol: string;
  name: string;
  price: number;
  market_cap: number;
  volume_24h: number;
  change_1h: number | null;
  change_24h: number | null;
  change_7d: number | null;
  high_24h: number;
  low_24h: number;
  ath: number;
  ath_change: number;
  image: string;
  rank: number;
};

export type ForexData = {
  base: string;
  rates: Record<string, number>;
  updated: string;
};

export type Commodity = {
  name: string;
  symbol: string;
  price: number;
  unit: string;
  change: number;
};

export type SupplyChainRoute = {
  route: string;
  status: string;
  impact: string;
  risk: "low" | "medium" | "high";
};

export type MarketSignal = {
  source: string;
  title: string;
  url: string;
  date: string;
  country: string;
  type: string;
};

export type VCSignal = {
  sector: string;
  trend: string;
  signal: string;
  opportunity: string;
};

export type IntelFeed = {
  timestamp: string;
  alerts: Alert[];
  intel: {
    crypto: CryptoAsset[];
    forex: ForexData;
    commodities: Commodity[];
    supply_chain: SupplyChainRoute[];
    market_signals: MarketSignal[];
    vc_signals: VCSignal[];
  };
  sources_status: Record<string, boolean>;
};
