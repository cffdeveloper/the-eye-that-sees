import { Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { UpgradeButton } from "@/components/SubscriptionGate";
import { useSubscription } from "@/hooks/useSubscription";

/** Shown while subscription tier is loading so we do not flash empty-state copy before upgrade prompts. */
export function ProGateLoading({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 text-muted-foreground",
        compact ? "py-4" : "py-8",
        className,
      )}
    >
      <Loader2 className={cn("animate-spin text-primary", compact ? "h-4 w-4" : "h-5 w-5")} />
      <span className={cn(compact ? "text-xs" : "text-sm")}>Loading access…</span>
    </div>
  );
}

interface ProUpgradePromptProps {
  /** Short description shown below the heading */
  feature?: string;
  /** Compact mode for smaller cards */
  compact?: boolean;
  className?: string;
}

/**
 * Inline upgrade prompt shown inside data cards when user is on free plan.
 * Use this instead of "No data" / "No gaps detected" messages.
 */
export function ProUpgradePrompt({ feature, compact, className }: ProUpgradePromptProps) {
  return (
    <div className={`flex flex-col items-center text-center ${compact ? "py-4 gap-2" : "py-8 gap-3"} ${className || ""}`}>
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
        <Lock className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className={`font-semibold text-foreground ${compact ? "text-xs" : "text-sm"}`}>
          Full access required
        </p>
        <p className={`text-muted-foreground mt-0.5 max-w-xs ${compact ? "text-[10px]" : "text-xs"}`}>
          {feature ||
            "Upgrade to Pro for full access to AI analysis, live data, and advanced workflows."}
        </p>
      </div>
      <UpgradeButton size="sm" />
    </div>
  );
}

/**
 * Hook helper — returns true if the user is on free plan (i.e. should show upgrade prompts).
 */
export function useIsFreeUser() {
  const { isPro, loading: subscriptionLoading } = useSubscription();
  return {
    isFree: !subscriptionLoading && !isPro,
    isPro: !subscriptionLoading && isPro,
    subscriptionLoading,
    loading: subscriptionLoading,
  };
}
