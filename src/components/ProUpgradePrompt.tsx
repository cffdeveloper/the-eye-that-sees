import { useSubscription } from "@/hooks/useSubscription";

/** Open-source build: no upgrade / credit prompts. */
export function ProGateLoading(_props: { compact?: boolean; className?: string }) {
  return null;
}

/** Open-source build: no upgrade / credit prompts. */
export function ProUpgradePrompt(_props: { feature?: string; compact?: boolean; className?: string }) {
  return null;
}

/**
 * Hook helper — `isFree` is always false in the open-source build (full access for signed-in flows).
 */
export function useIsFreeUser() {
  const { isPro, loading: subscriptionLoading } = useSubscription();
  return {
    isFree: false,
    isPro: !subscriptionLoading && isPro,
    subscriptionLoading,
    loading: subscriptionLoading,
  };
}
