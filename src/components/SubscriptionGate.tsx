import { useSubscription } from "@/hooks/useSubscription";
import { Zap, Lock, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { BrandHexMark } from "@/components/BrandHexMark";
import { PaymentModal } from "@/components/PaymentModal";

interface SubscriptionGateProps {
  children: React.ReactNode;
  feature?: string;
}

/** Wraps premium features — shows add-credits prompt when the user has no balance. */
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
            AI credits required
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {feature ||
              "Add credits to run this flow. Credits are spent when you generate AI intel."}
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
        <BrandHexMark size="xl" className="mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-foreground mb-2 font-display">
          Add credits to unlock this page
        </h2>
        <p className="text-base text-muted-foreground mb-8 leading-relaxed">
          Buy AI credits to use the live feed, cross-industry scans, Infinity Lab, and the rest of the platform. Credits are used when you run AI-powered features.
        </p>
        <UpgradeButton size="default" className="mx-auto" />
        <p className="text-xs text-muted-foreground mt-4">Minimum purchase $5 · Top up anytime</p>
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
  const [modalOpen, setModalOpen] = useState(false);

  const sizeClasses =
    size === "sm"
      ? "px-3 py-1.5 text-xs gap-1.5"
      : "px-5 py-2.5 text-sm gap-2";

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setModalOpen(true);
        }}
        className={`inline-flex items-center justify-center rounded-lg bg-primary font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors ${sizeClasses} ${className}`}
      >
        <ArrowUpRight className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
        Add credits
      </button>
      <PaymentModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}

export function SubscriptionBadge() {
  const { isPro, creditBalanceUsd, legacySubActive, loading } = useSubscription();

  if (loading) return null;

  if (isPro) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
        <Zap className="h-3 w-3" />
        {legacySubActive && creditBalanceUsd < 0.01 ? "Legacy Pro" : `$${creditBalanceUsd.toFixed(2)} credits`}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      No credits
    </span>
  );
}
