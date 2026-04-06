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
  end_date: string | null;
  location: string | null;
  venue: string | null;
  format: "in-person" | "online" | "hybrid" | "unknown";
  entrance_fee: string | null;
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

    const now = new Date();
    const currentYear = now.getFullYear();
    const nextYear = currentYear + 1;

    const queries = [
      `networking events conferences summits ${primary} ${topicLine} ${currentYear} ${nextYear} upcoming`,
      `tech startup meetups hackathons pitch events ${primary} ${currentYear} ${nextYear}`,
      `trade shows exhibitions ${topicLine} ${primary} ${currentYear} schedule registration`,
      `finance fintech blockchain conferences ${primary} ${currentYear} ${nextYear} upcoming dates`,
      `agriculture health innovation summits ${primary} ${currentYear} registration tickets`,
    ];

    let evidence = "";
    if (TAVILY_API_KEY) {
      const chunks = await Promise.all(queries.map((q) => tavilySearch(q, TAVILY_API_KEY)));
      evidence = chunks.join("\n---\n").slice(0, 28_000);
    } else {
      evidence =
        "(No Tavily key: synthesize from public knowledge only; flag uncertainty. Prefer well-known recurring events and verifiable URLs when possible.)";
    }

    const system = `You are a networking research assistant for Infinitygap users.
They want to FIND IN-PERSON AND ONLINE EVENTS to meet people and learn — conferences, meetups, summits, trade shows, workshops, pitch nights, hackathons, sector forums.

CRITICAL DATE RULES:
- Today's date is ${now.toISOString().slice(0, 10)}.
- ONLY include events from ${currentYear} or ${nextYear} that are UPCOMING (start_date >= today or unknown).
- NEVER return events from past years (2024 or earlier). If evidence mentions a 2024 event, find its ${currentYear}/${nextYear} edition instead.
- If you cannot find an upcoming date for an event, set start_date to null and note "Date TBC — check website" in relevance_note.

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
2. Each NetworkEvent MUST have ALL these fields:
   - title: string (specific event name)
   - start_date: ISO date string YYYY-MM-DD or null if unknown (MUST be ${currentYear} or ${nextYear})
   - end_date: ISO date string YYYY-MM-DD or null if unknown
   - location: city/country e.g. "Nairobi, Kenya" or "Online" or null
   - venue: specific venue name e.g. "KICC" or "Zoom" or null if unknown
   - format: one of "in-person" | "online" | "hybrid" | "unknown"
   - entrance_fee: string describing cost e.g. "Free", "$50-$200", "KES 5,000", "Free for students, $100 general" or null if unknown
   - url: registration or official page URL if available, else null
   - source_hint: short label e.g. "Conference website", "Eventbrite", "Meetup.com"
   - relevance_note: 2-3 sentences explaining why this event matters for THIS specific user based on their profile, and what they could gain from attending
   - topics: string[] 2-5 tags e.g. ["fintech", "Nairobi", "AI"]
3. Prefer events that match their industries and region; include a mix across their sectors.
4. Return 15–25 events. Sort by date ascending (soonest first), nulls last.
5. For each event, try hard to find: the venue name, whether it's free or paid, and exact dates.
6. If evidence is thin for an event, note "Verify on official website" in relevance_note.`;

    const userMsg = `Produce the JSON object with "events" array now. Remember: ONLY ${currentYear}/${nextYear} events, with venue, fee, and format details.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        temperature: 0.3,
        max_tokens: 10_000,
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

    return new Response(JSON.stringify({ events, disclaimer: "Verify dates, venues, and fees on official websites before booking. Sources are public web signals." }), {
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
