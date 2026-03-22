import { Lock, Sparkles } from "lucide-react";
import { UpgradeButton } from "@/components/SubscriptionGate";
import { useSubscription } from "@/hooks/useSubscription";

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
          Pro feature
        </p>
        <p className={`text-muted-foreground mt-0.5 max-w-xs ${compact ? "text-[10px]" : "text-xs"}`}>
          {feature || "Subscribe to Pro to unlock AI-powered analysis and live data."}
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
  const { isPro, loading } = useSubscription();
  return { isFree: !loading && !isPro, loading };
}
