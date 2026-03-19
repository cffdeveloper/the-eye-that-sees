import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSnapshots(scopeType: string, scopeKey: string) {
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!scopeKey) return;
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("intel_snapshots")
          .select("id, created_at, analysis, gaps, alerts, live_data, summary")
          .eq("scope_type", scopeType)
          .eq("scope_key", scopeKey)
          .order("created_at", { ascending: false })
          .limit(20);
        if (error) throw error;
        setSnapshots(data || []);
      } catch (e) {
        console.error("Snapshots error:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [scopeType, scopeKey]);

  return { snapshots, loading };
}
