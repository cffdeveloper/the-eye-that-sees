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

const MIN_ACCESS_BALANCE = 0.005;

export function useSubscription() {
  const { user, refreshProfile } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [creditBalanceUsd, setCreditBalanceUsd] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAccessState = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setCreditBalanceUsd(0);
      setLoading(false);
      return;
    }

    const [subRes, profRes] = await Promise.all([
      supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("profiles").select("credit_balance_usd").eq("id", user.id).maybeSingle(),
    ]);

    setSubscription(subRes.data as Subscription | null);
    setCreditBalanceUsd(Number(profRes.data?.credit_balance_usd) || 0);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void fetchAccessState();
  }, [fetchAccessState]);

  const ADMIN_EMAILS = ["intelgoldmine@gmail.com"];
  const isAdmin = ADMIN_EMAILS.includes(user?.email?.toLowerCase() ?? "");

  const legacySubActive = subscription?.status === "active";
  const hasCredits = creditBalanceUsd >= MIN_ACCESS_BALANCE;
  const isActive = hasCredits || legacySubActive || isAdmin;
  /** Kept for minimal churn across the codebase — means "paid access (credits or legacy sub)". */
  const isPro = isActive;

  const startPaystackCheckout = async (opts: {
    kind: "credits" | "donation";
    amountUsd: number;
    callbackUrl?: string;
  }) => {
    if (!user) return;
    const { data, error } = await supabase.functions.invoke("paystack-initialize", {
      body: {
        kind: opts.kind,
        amountUsd: opts.amountUsd,
        callbackUrl: opts.callbackUrl ?? `${window.location.origin}/dashboard?payment=verify`,
      },
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    if (data?.authorization_url) {
      localStorage.setItem("paystack_reference", data.reference);
      localStorage.setItem("paystack_expected_kind", opts.kind);
      window.location.href = data.authorization_url;
    }
  };

  const verifyPayment = async (reference: string) => {
    const { data, error } = await supabase.functions.invoke("paystack-verify", {
      body: { reference },
    });
    if (error) throw error;
    if (data?.verified) {
      await fetchAccessState();
      await refreshProfile();
    }
    return data;
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
