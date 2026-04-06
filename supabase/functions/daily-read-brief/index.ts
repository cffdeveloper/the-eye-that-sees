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

const MIN_HOURS_BETWEEN = 20;

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

    const { data: lastRows } = await sb
      .from("user_read_briefs")
      .select("created_at")
      .eq("user_id", auth.userId)
      .order("created_at", { ascending: false })
      .limit(1);

    const last = lastRows?.[0] as { created_at?: string } | undefined;
    if (last?.created_at) {
      const delta = Date.now() - new Date(last.created_at).getTime();
      if (delta < MIN_HOURS_BETWEEN * 3600 * 1000) {
        const hoursLeft = Math.ceil((MIN_HOURS_BETWEEN * 3600 * 1000 - delta) / 3600000);
        return new Response(
          JSON.stringify({
            error: `Next digest available in about ${hoursLeft}h. Open a previous brief below or try again later.`,
            code: "RATE_LIMIT",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    const paywall = await debitCreditsOrResponse(
      sb,
      auth.userId,
      USAGE_COST_USD.daily_read_brief,
      "daily_read_brief",
      corsHeaders,
      auth.email,
    );
    if (paywall) return paywall;

    const { data: profile } = await sb
      .from("profiles")
      .select("industries_of_interest, primary_market, bio, goals, title, role")
      .eq("id", auth.userId)
      .maybeSingle();

    const industries = (profile?.industries_of_interest as string[] | null)?.slice(0, 10) ?? [];
    const primary = String(profile?.primary_market || "").trim() || geoHint;
    const bio = String(profile?.bio || "").slice(0, 800);
    const goals = Array.isArray(profile?.goals) ? (profile!.goals as string[]).join(", ") : "";
    const topicLine = industries.length ? industries.map((s) => s.replace(/-/g, " ")).join(", ") : "global markets, technology, policy";

    let evidence = "";
    if (TAVILY_API_KEY) {
      const q1 = await tavilySearch(
        `breaking news analysis ${primary} ${topicLine} last 7 days`,
        TAVILY_API_KEY,
      );
      const q2 = await tavilySearch(`macro economy regulation ${primary} sector outlook`, TAVILY_API_KEY);
      evidence = `${q1}\n\n${q2}`.slice(0, 28_000);
    } else {
      evidence = "(Limited: add TAVILY_API_KEY for fresher web grounding.)";
    }

    const dayStr = new Date().toISOString().slice(0, 10);

    const system = `You are Infinitygap's research editor. Write a SINGLE long-form Markdown document for ONE reader.

READER CONTEXT:
- Geography/market: ${primary}
- Industries: ${topicLine}
- Role/title: ${String(profile?.title || "")} / ${String(profile?.role || "")}
- Bio: ${bio || "(none)"}
- Goals: ${goals || "(none)"}
- Private training notes (voice, constraints): ${trainingCorpus.slice(0, 6000) || "(none)"}

FRESH WEB SNIPPETS (may be partial):
${evidence}

DOCUMENT REQUIREMENTS:
1. Title line: first line must be "# " followed by a compelling title including ${dayStr}.
2. Use Markdown only: ## and ### sections, bullet lists, **bold** for emphasis, tables where helpful.
3. Length: aim for VERY substantial coverage — many sections (e.g. 12–25 ## sections), comparable to a serious internal research pack. Prioritize depth over fluff.
4. Content: synthesize what matters for THIS person in their industries and region — opportunities, risks, policy, competitive moves, talent, capital, technology shifts. Connect dots across sectors.
5. Include a short "Sources & verification" section reminding readers to confirm facts and dates.
6. Do NOT fabricate specific statistics; when uncertain, say so.
7. No JSON — Markdown body only.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: `Write the full Markdown digest for ${dayStr} now. Begin with the # title line.`,
          },
        ],
        temperature: 0.45,
        max_tokens: 32_768,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("daily-read-brief", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error", detail: t.slice(0, 400) }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const bodyMarkdown = String(aiData.choices?.[0]?.message?.content || "").trim();
    if (bodyMarkdown.length < 500) {
      return new Response(JSON.stringify({ error: "Brief too short — try again." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const titleLine = bodyMarkdown.split("\n").find((l) => l.startsWith("# ")) || `# Research digest ${dayStr}`;
    const title = titleLine.replace(/^#\s+/, "").slice(0, 200);

    const { data: inserted, error: insErr } = await sb
      .from("user_read_briefs")
      .insert({
        user_id: auth.userId,
        title,
        body_markdown: bodyMarkdown,
      })
      .select("id, title, body_markdown, created_at")
      .single();

    if (insErr || !inserted) {
      console.error("insert user_read_briefs", insErr);
      return new Response(JSON.stringify({ error: "Could not save brief" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ brief: inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("daily-read-brief", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
