import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { UpgradeButton } from "@/components/SubscriptionGate";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionGateSkeleton } from "@/components/ui/PageSkeletons";

/** Shown while access state is loading so we do not flash empty-state copy before prompts. */
export function ProGateLoading({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <div
      className={cn(
        "flex w-full flex-col justify-center text-muted-foreground",
        compact ? "py-4" : "py-8",
        className,
      )}
    >
      <SubscriptionGateSkeleton compact={compact} />
      <span className={cn("mt-2 text-center opacity-80", compact ? "text-[10px]" : "text-xs")}>Loading access…</span>
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
 * Inline prompt when the user has no credits (and no legacy access).
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
          Credits required
        </p>
        <p className={`text-muted-foreground mt-0.5 max-w-xs ${compact ? "text-[10px]" : "text-xs"}`}>
          {feature ||
            "Add AI credits for full access to analysis, live data, and advanced workflows."}
        </p>
      </div>
      <UpgradeButton size="sm" />
    </div>
  );
}

/**
 * Hook helper — true when the user has no paid access (no credits / legacy / admin).
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
