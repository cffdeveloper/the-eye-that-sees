import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type ProactiveGapRow = {
  id: string;
  insight: Record<string, unknown>;
  created_at: string;
  feasibility: Record<string, unknown>;
};

export function useProactiveGaps(enabled: boolean) {
  const { user } = useAuth();
  const [rows, setRows] = useState<ProactiveGapRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled || !user) {
      setRows([]);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: qErr } = await supabase
      .from("proactive_gaps")
      .select("id, insight, created_at, feasibility")
      .order("created_at", { ascending: false })
      .limit(20);
    setLoading(false);
    if (qErr) {
      setError(qErr.message);
      setRows([]);
      return;
    }
    setRows((data || []) as ProactiveGapRow[]);
  }, [enabled, user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const lastUpdated = rows[0]?.created_at ?? null;

  return { rows, loading, error, lastUpdated, refresh };
}
