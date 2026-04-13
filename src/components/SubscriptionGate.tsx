import { Zap } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

interface SubscriptionGateProps {
  children: React.ReactNode;
  feature?: string;
}

/** Open-source build: no overlay; premium content is always visible when rendered. */
export function SubscriptionGate({ children }: SubscriptionGateProps) {
  return <>{children}</>;
}

/** Retained for imports; unused in open-source build (no full-page paywall). */
export function FullPagePaywall() {
  return null;
}

/** Payments removed — renders nothing. */
export function UpgradeButton(_props: { size?: "sm" | "default"; className?: string }) {
  return null;
}

export function SubscriptionBadge() {
  const { loading } = useSubscription();
  if (loading) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
      <Zap className="h-3 w-3" />
      Open source
    </span>
  );
}
