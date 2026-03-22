import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";

export function useIndustryNews(keywords: string[]) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isPro } = useSubscription();

  const fetch_ = useCallback(async () => {
    if (!keywords.length) return;
    if (!isPro) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("industry-news", {
        body: { keywords: keywords.slice(0, 5), limit: 8 },
      });
      if (error) throw error;
      setArticles(data?.articles || []);
    } catch (e) {
      console.error("News fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [keywords.join(","), isPro]);

  useEffect(() => {
    fetch_();
    if (!isPro) return;
    const id = setInterval(fetch_, 300_000);
    return () => clearInterval(id);
  }, [fetch_, isPro]);

  return { articles, loading, refresh: fetch_ };
}
