import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/lib/supabaseEnv";

/**
 * In dev, send Edge Function requests through the Vite `/supabase-functions` proxy so they stay
 * same-origin (localhost). Otherwise the browser preflights OPTIONS to *.supabase.co and the
 * gateway often fails CORS before our function runs.
 */
function devFunctionsProxyFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (!import.meta.env.DEV) {
    return fetch(input, init);
  }
  const base = SUPABASE_URL.replace(/\/$/, "");
  if (!base.startsWith("https://") || base.includes("invalid.localhost")) {
    return fetch(input, init);
  }
  const url =
    typeof input === "string" ? input : input instanceof Request ? input.url : input instanceof URL ? input.href : String(input);
  if (url.startsWith(base) && url.includes("/functions/v1/")) {
    const path = url.slice(base.length);
    const prefix = `${(import.meta.env.BASE_URL ?? "/").replace(/\/$/, "")}/supabase-functions`;
    return fetch(`${prefix}${path}`, init).then((res) => {
      // Some local setups can return 404/502 before proxy middleware handles the route.
      // Fall back to direct Supabase call rather than hard-failing the request.
      if (res.status === 404 || res.status === 502) {
        return fetch(url, init);
      }
      return res;
    });
  }
  return fetch(input, init);
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    fetch: devFunctionsProxyFetch,
  },
});