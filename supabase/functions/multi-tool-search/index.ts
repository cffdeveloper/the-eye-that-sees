import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { runParallelSearches } from "../_shared/searchTools.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const body = await req.json().catch(() => ({}));
    const queries = Array.isArray(body.queries) ? body.queries.map((q: unknown) => String(q).slice(0, 500)).slice(0, 24) : [];
    const browseUrls = Array.isArray(body.browseUrls)
      ? body.browseUrls.map((u: unknown) => String(u).slice(0, 2000)).slice(0, 8)
      : [];

    if (!queries.length) {
      return new Response(JSON.stringify({ error: "queries[] required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tavilyApiKey = Deno.env.get("TAVILY_API_KEY") || undefined;
    const xBearer = Deno.env.get("TWITTER_BEARER_TOKEN") || Deno.env.get("X_BEARER_TOKEN") || undefined;

    const evidence = await runParallelSearches({
      supabaseUrl,
      serviceKey,
      queries,
      tavilyApiKey,
      xBearer,
      browseUrls,
    });

    return new Response(JSON.stringify({ evidence, queries_used: queries.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("multi-tool-search:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
