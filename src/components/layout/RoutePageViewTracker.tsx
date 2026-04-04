import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Records authenticated route views for admin analytics (page traffic).
 * Fire-and-forget; failures are ignored.
 */
export function RoutePageViewTracker() {
  const location = useLocation();
  const { user } = useAuth();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const path = `${location.pathname}${location.search || ""}`;
    if (path === lastPath.current) return;
    lastPath.current = path;

    const id = window.setTimeout(() => {
      void supabase.from("page_views").insert({ user_id: user.id, path });
    }, 450);

    return () => clearTimeout(id);
  }, [location.pathname, location.search, user?.id]);

  return null;
}
