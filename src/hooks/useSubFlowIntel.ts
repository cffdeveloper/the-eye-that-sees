import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";

const REFRESH_MS = 180_000;

export function useSubFlowIntel(subFlowName: string, keywords: string[], industryName: string, geoContext?: string, geoScopeId?: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isPro } = useSubscription();

  const fetch_ = useCallback(async () => {
    if (!subFlowName) return;
    if (!isPro) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("industry-intel", {
        body: {
          industry: industryName,
          subFlow: subFlowName,
          keywords,
          detailed: true,
          geoContext: geoContext || "global",
          geoScopeId: geoScopeId || "global",
        },
      });
      if (error) throw error;
      setData(result);
    } catch (e) {
      console.error("SubFlow intel error:", e);
    } finally {
      setLoading(false);
    }
  }, [subFlowName, industryName, keywords.join(","), geoContext, geoScopeId, isPro]);

  useEffect(() => {
    fetch_();
    if (!isPro) return;
    const id = setInterval(fetch_, REFRESH_MS);
    return () => clearInterval(id);
  }, [fetch_, isPro]);

  return { data, loading, refresh: fetch_ };
}
