import { useSubscription } from "@/hooks/useSubscription";
import { Shield, Sparkles, Zap, Lock } from "lucide-react";
import { SUBSCRIPTION_USD_MONTHLY } from "@/lib/pricing";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { BrandHexMark } from "@/components/BrandHexMark";
import { BrandWordmark } from "@/components/BrandWordmark";

interface SubscriptionGateProps {
  children: React.ReactNode;
  feature?: string;
}

/** Wraps premium features — shows upgrade prompt if not subscribed. */
export function SubscriptionGate({ children, feature }: SubscriptionGateProps) {
  const { isPro, loading } = useSubscription();

  if (loading) return <>{children}</>;
  if (isPro) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-30 blur-[2px] select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-xl">
        <div className="text-center p-6 max-w-sm">
          <Lock className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Upgrade to Pro
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {feature
              ? `${feature} requires a Pro subscription.`
              : "This feature requires a Pro subscription."}
          </p>
          <UpgradeButton size="default" />
        </div>
      </div>
    </div>
  );
}

/** Full-page paywall shown when free users try to access premium pages. */
export function FullPagePaywall() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center p-8 max-w-lg">
        <BrandHexMark size="lg" className="mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-foreground mb-2 font-display">
          Upgrade to unlock this page
        </h2>
        <p className="text-base text-muted-foreground mb-8 leading-relaxed">
          This section is available to Pro subscribers. Upgrade now to access all Intel GoldMine features — live feeds, cross-industry scans, custom intel lab, and more.
        </p>
        <UpgradeButton size="default" className="mx-auto" />
        <p className="text-xs text-muted-foreground mt-4">Cancel anytime · Instant access</p>
      </div>
    </div>
  );
}

export function UpgradeButton({
  size = "default",
  className = "",
}: {
  size?: "sm" | "default";
  className?: string;
}) {
  const { initializePayment } = useSubscription();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await initializePayment();
    } catch (err: any) {
      toast.error(err.message || "Failed to initialize payment");
      setLoading(false);
    }
  };

  const sizeClasses =
    size === "sm"
      ? "px-3 py-1.5 text-xs gap-1.5"
      : "px-5 py-2.5 text-sm gap-2";

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className={`inline-flex items-center justify-center rounded-lg bg-primary font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors disabled:opacity-50 ${sizeClasses} ${className}`}
    >
      <Sparkles className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
      {loading ? "Redirecting…" : `Subscribe — $${SUBSCRIPTION_USD_MONTHLY}/mo`}
    </button>
  );
}

export function SubscriptionBadge() {
  const { isPro, subscription, loading } = useSubscription();

  if (loading) return null;

  if (isPro) {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25 font-medium">
        <Zap className="w-3 h-3" />
        Pro
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border font-medium">
      Free
    </span>
  );
}
