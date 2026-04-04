import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";

const REFRESH_MS = 180_000;

type FetchMode = "full" | "background";

export function useSubFlowIntel(subFlowName: string, keywords: string[], industryName: string, geoContext?: string, geoScopeId?: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const dataRef = useRef<any>(null);
  const { isPro } = useSubscription();

  dataRef.current = data;

  const fetch_ = useCallback(
    async (mode: FetchMode = "full") => {
      if (!subFlowName) return;
      if (!isPro) {
        setLoading(false);
        setRefreshing(false);
        return;
      }
      const background = mode === "background" && dataRef.current != null;
      if (background) setRefreshing(true);
      else setLoading(true);
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
        setRefreshing(false);
      }
    },
    [subFlowName, industryName, keywords.join(","), geoContext, geoScopeId, isPro],
  );

  useEffect(() => {
    void fetch_("full");
    if (!isPro) return;
    const id = setInterval(() => void fetch_("background"), REFRESH_MS);
    return () => clearInterval(id);
  }, [fetch_, isPro]);

  const refresh = useCallback(() => void fetch_(dataRef.current != null ? "background" : "full"), [fetch_]);

  return { data, loading, refreshing, refresh };
}
