import { useIntelFeed } from "@/hooks/useIntelFeed";
import { AlertsBanner } from "@/components/intel/AlertsBanner";
import { CryptoPanel } from "@/components/intel/CryptoPanel";
import { ForexPanel } from "@/components/intel/ForexPanel";
import { CommoditiesPanel } from "@/components/intel/CommoditiesPanel";
import { SupplyChainPanel } from "@/components/intel/SupplyChainPanel";
import { VCPanel } from "@/components/intel/VCPanel";
import { MarketSignalsPanel } from "@/components/intel/MarketSignalsPanel";
import { SourcesStatus } from "@/components/intel/SourcesStatus";
import { RefreshCw, Loader2, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import { ProUpgradePrompt, useIsFreeUser } from "@/components/ProUpgradePrompt";
import { PageIntro } from "@/components/marketing/ProductWayfinding";

export default function IntelDashboard() {
  const { feed, loading, error, lastRefresh, refresh } = useIntelFeed();
  const { isFree } = useIsFreeUser();

  return (
    <div className="space-y-3 max-w-[1600px] mx-auto">
      <PageIntro eyebrow="Macro pulse" title="What this feed is for">
        <p>
          Scan cross-asset signals—crypto, FX, commodities, VC, supply chain, and headlines—in one place before you drill down. Refresh on demand; geography follows the top bar.
        </p>
        <p className="text-foreground/90">
          Next: choose a sector on the{" "}
          <Link to="/dashboard" className="text-primary font-medium hover:underline">
            Dashboard
          </Link>
          , run a{" "}
          <Link to="/cross-intel" className="text-primary font-medium hover:underline">
            Cross-industry
          </Link>{" "}
          scan, or compose a scoped brief in{" "}
          <Link to="/custom-intel" className="text-primary font-medium hover:underline">
            Intel Lab
          </Link>
          .
        </p>
      </PageIntro>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Radio className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Live market feed</span>
          <span className="text-xs text-muted-foreground">11+ sources · refresh 60s</span>
          <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          {feed?.sources_status && <SourcesStatus status={feed.sources_status} timestamp={feed.timestamp} />}
          <button onClick={refresh} disabled={loading || isFree} className="p-1 rounded border border-border/50 hover:bg-muted/30 transition-colors text-muted-foreground disabled:opacity-50">
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {isFree ? (
        <div className="glass-panel p-6">
          <ProUpgradePrompt feature="Upgrade for full access to real-time market data from 11+ sources including crypto, forex, commodities, VC signals, and supply chain intelligence." />
        </div>
      ) : loading && !feed ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : error && !feed ? (
        <div className="text-center py-20">
          <p className="text-[11px] text-destructive">Feed error: {error}</p>
          <button onClick={refresh} className="text-[11px] text-primary hover:underline mt-2">Retry</button>
        </div>
      ) : feed ? (
        <>
          <AlertsBanner alerts={feed.alerts} />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
            <div className="xl:row-span-2"><CryptoPanel data={feed.intel.crypto} /></div>
            <div><CommoditiesPanel data={feed.intel.commodities} /></div>
            <div className="xl:row-span-2"><VCPanel data={feed.intel.vc_signals} /></div>
            <div><ForexPanel data={feed.intel.forex} /></div>
            <div><SupplyChainPanel data={feed.intel.supply_chain} /></div>
            <div className="xl:col-span-2"><MarketSignalsPanel data={feed.intel.market_signals} /></div>
          </div>
        </>
      ) : null}
    </div>
  );
}
