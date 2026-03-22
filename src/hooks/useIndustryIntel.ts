import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";

const REFRESH_MS = 180_000;

export function useIndustryIntel(industryName: string, keywords: string[], geoContext?: string, geoScopeId?: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isPro } = useSubscription();

  const fetch_ = useCallback(async () => {
    if (!industryName) return;
    if (!isPro) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("industry-intel", {
        body: {
          industry: industryName,
          keywords,
          geoContext: geoContext || "global",
          geoScopeId: geoScopeId || "global",
        },
      });
      if (error) throw error;
      setData(result);
    } catch (e) {
      console.error("Industry intel error:", e);
    } finally {
      setLoading(false);
    }
  }, [industryName, keywords.join(","), geoContext, geoScopeId, isPro]);

  useEffect(() => {
    fetch_();
    if (!isPro) return;
    const id = setInterval(fetch_, REFRESH_MS);
    return () => clearInterval(id);
  }, [fetch_, isPro]);

  return { data, loading, refresh: fetch_ };
}
