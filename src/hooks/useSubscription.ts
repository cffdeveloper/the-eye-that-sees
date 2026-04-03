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

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    setSubscription(data as Subscription | null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Admin emails bypass all paywalls
  const ADMIN_EMAILS = ["intelgoldmine@gmail.com"];
  const isAdmin = ADMIN_EMAILS.includes(user?.email?.toLowerCase() ?? "");

  const isActive = subscription?.status === "active" || isAdmin;
  const isPro = isActive;

  const initializePayment = async () => {
    if (!user) return;

    const { data, error } = await supabase.functions.invoke("paystack-initialize", {
      body: {
        callbackUrl: `${window.location.origin}/dashboard?payment=verify`,
      },
    });

    if (error) throw error;
    if (data?.authorization_url) {
      // Store reference for verification
      localStorage.setItem("paystack_reference", data.reference);
      window.location.href = data.authorization_url;
    }
  };

  const verifyPayment = async (reference: string) => {
    const { data, error } = await supabase.functions.invoke("paystack-verify", {
      body: { reference },
    });

    if (error) throw error;
    if (data?.verified) {
      await fetchSubscription();
    }
    return data;
  };

  return {
    subscription,
    loading,
    isActive,
    isPro,
    initializePayment,
    verifyPayment,
    refresh: fetchSubscription,
  };
}
