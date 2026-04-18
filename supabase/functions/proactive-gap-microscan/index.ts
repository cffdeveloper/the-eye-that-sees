import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { runParallelSearches } from "../_shared/searchTools.ts";
import { defaultGuardrailContext, type UserGuardrailContext } from "../_shared/guardrails.ts";
import { proactiveMicroScanPrompt } from "../_shared/proactivePrompts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Runs every ~3 minutes (cron). Picks ONE rotating theme, does a small fast search,
 * asks the LLM for 3-6 raw candidate deals, and stores them in proactive_search_cache
 * under a buffer key (TTL 2h+10min). The 2h scanner then consumes the entire buffer
 * and turns the best candidates into full business plans.
 */

const ROTATING_THEMES: string[] = [
  // Outside-Kenya waves to import
  "China 1688 trending consumer products 2025 small importers Africa",
  "TikTok Shop best selling categories 2025 niche resellers",
  "Amazon US returns pallets liquidation suppliers ship to Africa",
  "Yiwu Dubai wholesalers underexploited categories Kenya importers",
  "India D2C playbook Kenya replicate 2025",
  "LatAm fintech models replicate East Africa 2025",
  "MENA capital flows Kenya SME 2025",
  "AGOA 2025 Kenya export windows opportunity small exporter",
  "EU CBAM tariffs East Africa supplier opportunity 2025",
  // Niche local pain points
  "Kenya SME underserved services 2025 pain points entrepreneurs",
  "Nairobi suburbs new business gaps 2025 niche services",
  "Mt Kenya towns Eldoret Nakuru Thika business gaps 2025",
  "matatu termini Nairobi small business opportunity",
  "Kenya diaspora demand local sourcing niche products",
  "Kilimall Jiji Jumia top selling niches Kenya 2025 small reseller",
  // Acquisition / distressed
  "failing small businesses Kenya for sale 2025 acquisition cheap",
  "abandoned Shopify stores Etsy shops for sale 2025 niche",
  "expired domains Kenya East Africa traffic acquire 2025",
  // Policy windows
  "KRA new tax filing 2025 SME compliance service opportunity",
  "Kenya county licensing 2025 new permits business opportunity",
  "EPRA Kenya solar mini-grid 2025 SME opportunity",
  "NEMA Kenya waste recycling 2025 small business opportunity",
  // Online global
  "productized service ideas 2025 Upwork Fiverr underserved niche",
  "AI wrapper micro-SaaS niche 2025 underserved vertical",
  "faceless YouTube niches 2025 underexploited high CPM",
  "Etsy Printify trending niches 2025 small operator",
];

function pickThemeForNow(): string {
  // Deterministically rotate based on the current 3-min slot of the day.
  const slot = Math.floor(Date.now() / (3 * 60 * 1000));
  return ROTATING_THEMES[slot % ROTATING_THEMES.length];
}

function bufferKeyFor(twoHourWindowStartMs: number): string {
  return `microscan_buffer_${twoHourWindowStartMs}`;
}

function currentTwoHourWindowStartMs(): number {
  const now = Date.now();
  const twoH = 2 * 60 * 60 * 1000;
  return Math.floor(now / twoH) * twoH;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tavilyApiKey = Deno.env.get("TAVILY_API_KEY") || undefined;
    const xBearer = Deno.env.get("TWITTER_BEARER_TOKEN") || Deno.env.get("X_BEARER_TOKEN") || undefined;
    const grokApiKey = Deno.env.get("GROK_API_KEY") || undefined;

    const theme = pickThemeForNow();
    const queries = [theme, `${theme} site:reddit.com OR site:x.com OR site:linkedin.com`];

    let evidence = "";
    try {
      evidence = await runParallelSearches({
        supabaseUrl,
        serviceKey,
        queries,
        tavilyApiKey,
        xBearer,
        grokApiKey,
        browseUrls: [],
      });
    } catch (e) {
      console.error("microscan search failed:", e);
      return new Response(JSON.stringify({ ok: false, theme, reason: "search_failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!evidence || evidence.length < 100) {
      return new Response(JSON.stringify({ ok: true, theme, candidates: 0, reason: "no_evidence" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use a generic guardrail context for micro-scan (not user-specific — the 2h job
    // will personalize from buffered seeds against each user profile).
    const ctx = defaultGuardrailContext({}) as UserGuardrailContext;
    const system = proactiveMicroScanPrompt(ctx);
    const userMsg = `THEME: ${theme}\n\nFRESH EVIDENCE:\n${evidence.slice(0, 14_000)}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
        temperature: 0.5,
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("microscan LLM err:", aiRes.status, t.slice(0, 200));
      return new Response(JSON.stringify({ ok: false, status: aiRes.status }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiRes.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    let parsed: { candidates?: unknown[] } = {};
    try {
      parsed = JSON.parse(start >= 0 ? cleaned.slice(start, end + 1) : cleaned);
    } catch {
      return new Response(JSON.stringify({ ok: false, reason: "parse_error" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newCandidates = Array.isArray(parsed.candidates) ? parsed.candidates : [];
    if (newCandidates.length === 0) {
      return new Response(JSON.stringify({ ok: true, theme, candidates: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Append to the current 2-hour window buffer in proactive_search_cache.
    const windowStart = currentTwoHourWindowStartMs();
    const key = bufferKeyFor(windowStart);

    const { data: existing } = await sb
      .from("proactive_search_cache")
      .select("payload, expires_at")
      .eq("cache_key", key)
      .maybeSingle();

    let buffered: unknown[] = [];
    if (existing && (existing as { payload?: { candidates?: unknown[] } }).payload?.candidates) {
      buffered = (existing as { payload: { candidates: unknown[] } }).payload.candidates;
    }

    const merged = [
      ...buffered,
      ...newCandidates.map((c) => ({
        ...(c as Record<string, unknown>),
        _theme: theme,
        _scanned_at: new Date().toISOString(),
      })),
    ].slice(-200); // hard cap so payload stays small

    // expire 10 min after the 2h window closes (so the 2h scanner has time to read it)
    const expiresAt = new Date(windowStart + 2 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString();

    await (sb.from("proactive_search_cache") as unknown as {
      upsert: (row: Record<string, unknown>) => Promise<unknown>;
    }).upsert({
      cache_key: key,
      payload: { candidates: merged, theme_last: theme, last_scanned_at: new Date().toISOString() },
      expires_at: expiresAt,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        theme,
        new_candidates: newCandidates.length,
        buffered_total: merged.length,
        window_start: new Date(windowStart).toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("proactive-gap-microscan:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
