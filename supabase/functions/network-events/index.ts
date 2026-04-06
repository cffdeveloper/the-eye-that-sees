import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { requireAuthUser, debitCreditsOrResponse } from "../_shared/authUser.ts";
import { USAGE_COST_USD } from "../_shared/creditsConfig.ts";
import { tavilySearch } from "../_shared/searchTools.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export type NetworkEvent = {
  title: string;
  start_date: string | null;
  location: string | null;
  url: string | null;
  source_hint: string;
  relevance_note: string;
  topics: string[];
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const auth = await requireAuthUser(req, Deno.env.get("SUPABASE_ANON_KEY")!, Deno.env.get("SUPABASE_URL")!);
    if (!auth.ok) return auth.response;

    const body = await req.json().catch(() => ({}));
    const trainingCorpus = String(body.trainingCorpus || "").trim().slice(0, 24_000);
    const geoHint = String(body.geoHint || "global").trim().slice(0, 200);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const TAVILY_API_KEY = Deno.env.get("TAVILY_API_KEY") || "";
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const paywall = await debitCreditsOrResponse(
      sb,
      auth.userId,
      USAGE_COST_USD.network_events,
      "network_events",
      corsHeaders,
      auth.email,
    );
    if (paywall) return paywall;

    const { data: profile } = await sb.from("profiles").select("industries_of_interest, primary_market, bio, goals, title").eq("id", auth.userId).maybeSingle();

    const industries = (profile?.industries_of_interest as string[] | null)?.slice(0, 8) ?? [];
    const primary = String(profile?.primary_market || "").trim() || geoHint;
    const bio = String(profile?.bio || "").slice(0, 600);
    const goals = Array.isArray(profile?.goals) ? (profile!.goals as string[]).slice(0, 8).join(", ") : "";

    const topicLine = industries.length ? industries.map((s) => s.replace(/-/g, " ")).join(", ") : "technology, business, innovation";

    const queries = [
      `networking events conferences summits ${primary} ${topicLine} 2025 2026`,
      `tech startup meetups hackathons pitch events ${primary}`,
      `agriculture agritech trade shows field days ${primary} 2025 2026`,
      `finance fintech banking conferences seminars ${primary} 2025 2026`,
    ];

    let evidence = "";
    if (TAVILY_API_KEY) {
      const chunks = await Promise.all(queries.map((q) => tavilySearch(q, TAVILY_API_KEY)));
      evidence = chunks.join("\n---\n").slice(0, 24_000);
    } else {
      evidence =
        "(No Tavily key: synthesize from public knowledge only; flag uncertainty. Prefer well-known recurring events and verifiable URLs when possible.)";
    }

    const system = `You are a networking research assistant for Infinitygap users.
They want to FIND IN-PERSON AND ONLINE EVENTS to meet people and learn — conferences, meetups, summits, trade shows, workshops, pitch nights, hackathons, sector forums.

USER CONTEXT (respect geography and industries):
- Region/market lens: ${primary}
- Industries of interest: ${topicLine}
- Training notes (who they are): ${trainingCorpus.slice(0, 4000) || "(none)"}
- Profile bio: ${bio || "(none)"}
- Goals: ${goals || "(none)"}

WEB RESEARCH SNIPPETS (may be incomplete):
${evidence}

RULES:
1. Output VALID JSON ONLY — a single object: { "events": NetworkEvent[] }
2. Each NetworkEvent:
   - title: string (specific event name if known, else descriptive)
   - start_date: ISO date string YYYY-MM-DD or null if unknown
   - location: city/region or "Online" or null
   - url: registration or official page URL if inferable from evidence, else null
   - source_hint: short label e.g. "Conference site", "Association", "Event platform"
   - relevance_note: 1-2 sentences why this fits THIS user
   - topics: string[] 1-4 tags e.g. ["fintech", "Nairobi"]
3. Prefer events that match their industries and region; include a mix of tech / business / their sectors.
4. Do NOT claim you scraped LinkedIn or any private platform — events may come from public web listings; if unsure, lower confidence in relevance_note.
5. Return 12–20 events. Sort is done client-side; include diverse dates.
6. If evidence is thin, still return plausible public events and note verification in relevance_note.`;

    const userMsg = `Produce the JSON object with "events" array now.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        temperature: 0.35,
        max_tokens: 8192,
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
      }),
    });

    const raw = await res.text();
    if (!res.ok) {
      console.error("network-events LLM", res.status, raw.slice(0, 500));
      return new Response(JSON.stringify({ error: "Model request failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const j = JSON.parse(raw);
    const text = String(j?.choices?.[0]?.message?.content ?? "");
    let parsed: { events?: NetworkEvent[] };
    try {
      const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      parsed = JSON.parse(start >= 0 ? cleaned.slice(start, end + 1) : cleaned);
    } catch {
      return new Response(JSON.stringify({ error: "Could not parse events", raw: text.slice(0, 400) }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const events = Array.isArray(parsed.events) ? parsed.events : [];

    return new Response(JSON.stringify({ events, disclaimer: "Verify dates and links before booking. Sources are public web signals, not private inboxes." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("network-events", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
