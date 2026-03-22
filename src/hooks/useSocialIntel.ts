import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";

export function useSocialIntel(
  industry: string,
  subFlow: string | null,
  keywords: string[],
  geoContext?: string,
  geoScopeId?: string,
) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isPro } = useSubscription();

  const fetch_ = useCallback(async () => {
    if (!industry && !keywords.length) return;
    if (!isPro) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("social-intel", {
        body: {
          industry,
          subFlow,
          keywords: keywords.slice(0, 8),
          geoContext: geoContext || "global",
          geoScopeId: geoScopeId && geoScopeId !== "global" ? geoScopeId : undefined,
        },
      });
      if (error) throw error;
      setData(result);
    } catch (e) {
      console.error("Social intel error:", e);
    } finally {
      setLoading(false);
    }
  }, [industry, subFlow, keywords.join(","), geoContext, geoScopeId, isPro]);

  useEffect(() => {
    fetch_();
    if (!isPro) return;
    const id = setInterval(fetch_, 120_000);
    return () => clearInterval(id);
  }, [fetch_, isPro]);

  return { data, loading, refresh: fetch_ };
}
