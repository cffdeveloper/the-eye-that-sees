import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type SubscriptionStatus = "active" | "inactive" | "pending" | "cancelled" | "past_due";

interface Subscription {
  id: string;
  status: SubscriptionStatus;
  current_period_end: string | null;
  amount: number;
  currency: string;
}

const ADMIN_EMAILS = ["intelgoldmine@gmail.com"];

/**
 * Open-source / no-paywall: all authenticated users have full feature access.
 * Subscription/credit fields are still loaded for profile transparency only.
 */
export function useSubscription() {
  const { user, refreshProfile } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [creditBalanceUsd, setCreditBalanceUsd] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchAccessState = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setCreditBalanceUsd(0);
      return;
    }

    const [subRes, profRes] = await Promise.all([
      supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("profiles").select("credit_balance_usd").eq("id", user.id).maybeSingle(),
    ]);

    setSubscription(subRes.data as Subscription | null);
    setCreditBalanceUsd(Number(profRes.data?.credit_balance_usd) || 0);
  }, [user]);

  useEffect(() => {
    void fetchAccessState();
  }, [fetchAccessState]);

  const isAdmin = ADMIN_EMAILS.includes(user?.email?.toLowerCase() ?? "");

  const legacySubActive = subscription?.status === "active";
  const hasCredits = true;
  const isActive = true;
  const isPro = true;

  const startPaystackCheckout = async (_opts: {
    kind: "credits" | "donation";
    amountUsd: number;
    callbackUrl?: string;
  }) => {
    /* Payments disabled in open-source build */
  };

  const verifyPayment = async (_reference: string) => {
    await fetchAccessState();
    await refreshProfile();
    return { verified: false as const };
  };

  return {
    subscription,
    creditBalanceUsd,
    loading,
    isActive,
    isPro,
    hasCredits,
    legacySubActive,
    isAdmin,
    startPaystackCheckout,
    verifyPayment,
    refresh: fetchAccessState,
  };
}
