import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import type { IntelFeed } from "@/lib/intelTypes";

const REFRESH_INTERVAL = 60_000;

export function useIntelFeed() {
  const [feed, setFeed] = useState<IntelFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const { isPro } = useSubscription();

  const fetchFeed = useCallback(async () => {
    if (!isPro) {
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const { data, error: fnError } = await supabase.functions.invoke("intel-feed");
      if (fnError) throw fnError;
      setFeed(data as IntelFeed);
      setLastRefresh(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch intel");
    } finally {
      setLoading(false);
    }
  }, [isPro]);

  useEffect(() => {
    fetchFeed();
    if (!isPro) return;
    intervalRef.current = setInterval(fetchFeed, REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchFeed, isPro]);

  return { feed, loading, error, lastRefresh, refresh: fetchFeed };
}
