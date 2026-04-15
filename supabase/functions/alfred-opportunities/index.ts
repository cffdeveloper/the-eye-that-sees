import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { temporalIntelRules } from "../_shared/temporalPrompt.ts";
import { requireAuthUser, debitCreditsOrResponse } from "../_shared/authUser.ts";
import { USAGE_COST_USD } from "../_shared/creditsConfig.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const auth = await requireAuthUser(
      req,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      Deno.env.get("SUPABASE_URL")!,
    );
    if (!auth.ok) return auth.response;

    const body = await req.json().catch(() => ({}));
    const trainingCorpus = String(body.trainingCorpus || "").trim().slice(0, 24_000);
    const geoHint = String(body.geoHint || "global").trim().slice(0, 200);
    const addressAs = String(body.addressAs || "the user").trim().slice(0, 48) || "the user";
    const mergeProactiveGaps = Boolean(body.mergeProactiveGaps);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sbAuth = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const paywall = await debitCreditsOrResponse(
      sbAuth,
      auth.userId,
      USAGE_COST_USD.alfred_opportunities,
      "alfred_opportunities",
      corsHeaders,
      auth.email,
    );
    if (paywall) return paywall;

    const system = `You are Infinitygap's personal opportunity research assistant.

The user prefers to be addressed as "${addressAs}" in executiveSummary tone where natural (not in JSON keys).

Your job is to know WHO this user is from their training notes (skills, capital, time budget, risk tolerance, geography, goals, what they have tried), then surface ideas that CONNECT GAPS across industries — arbitrage, white space, skill stacks, distribution holes, regulatory friction, talent/capital mismatches — so they can earn money, reposition, or build leverage. You are not a single-industry screener: deliberately scan and link multiple domains.

STRICT RULES:
1. Output VALID JSON ONLY — no markdown fences, no prose outside the JSON object.
2. BEFORE the deck: internalize training notes. If notes exist, executiveSummary must name 1–2 inferred constraints (e.g. time, capital, skills) and how the deck respects them. If notes are empty, say you lack a profile and encourage them to add training notes in the app — still deliver a cross-industry gap-oriented deck.
3. Include 14–22 items in "insights". Each must be actionable and cite at least TWO distinct industry/domain angles in the summary or actions (e.g. "content + fintech", "local services + AI tooling", "commodities + policy").
4. "priority" is an integer 1–100 (100 = highest fit + urgency for THIS user; down-rank ideas that ignore their constraints).
5. Categories may include: stocks, crypto, forex, commodities, online_business, freelancing, content, ecommerce, real_estate, geo_arbitrage, skills, savings, labor_market, ai_tools, policy_regulatory, other.
6. Each insight.summary should explicitly name a GAP or CONNECTION (who is underserved, what is inefficient, what stack could win) — not generic motivation.
7. For anything resembling securities: EDUCATIONAL research only; every insight.caveats must mention verification with licensed professionals or primary sources where relevant.
8. Never claim guaranteed returns. Use "hypothesis", "watch", "consider researching".
9. Include non-coding and low-tech paths where appropriate.
10. Use ${geoHint} as geographic lens; still tie in global liquid markets or remote demand where useful.

${temporalIntelRules()}

JSON schema:
{
  "executiveSummary": "3-5 sentences: who they seem to be (from notes), how this deck connects cross-industry gaps for them",
  "insights": [
    {
      "priority": 85,
      "title": "short headline",
      "summary": "70-120 words: the gap/connection, why now for THIS user, what to verify",
      "category": "stocks",
      "timing": "this_week | this_month | this_quarter | watchlist",
      "actions": ["3-5 concrete steps spanning research + positioning + optional execution"],
      "caveats": ["not financial advice", "verify with broker/data or licensed advisor where relevant"]
    }
  ],
  "disclaimer": "single paragraph legal-style disclaimer"
}`;

    const userMsg =
      trainingCorpus.length > 0
        ? `GEO / MARKET LENS: ${geoHint}

USER TRAINING NOTES — this is your primary model of who they are; weight every priority and gap against it:
${trainingCorpus}

---

Produce the JSON opportunity brief now. Insights must span multiple industries and emphasize connectable gaps this person could exploit.`
        : `GEO / MARKET LENS: ${geoHint}

No personal training notes yet. Produce a cross-industry, gap-focused opportunity deck anyway, and in executiveSummary clearly say you do not yet know their profile — urge them to add training notes with goals, skills, capital, time, and country.`;

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
          { role: "user", content: userMsg },
        ],
        temperature: 0.55,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("alfred-opportunities gateway:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error", detail: t.slice(0, 500) }), {
        status: response.status === 402 ? 402 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    let parsed: {
      executiveSummary?: string;
      insights?: unknown[];
      disclaimer?: string;
    };
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      parsed = JSON.parse(start >= 0 ? cleaned.slice(start, end + 1) : cleaned);
    } catch (e) {
      console.error("alfred JSON parse:", e, content.slice(0, 400));
      return new Response(JSON.stringify({ error: "Could not parse AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rawInsights = Array.isArray(parsed.insights) ? parsed.insights : [];
    const baseInsights = rawInsights
      .map((x: any) => ({
        id: typeof x.id === "string" ? x.id : undefined,
        priority: Math.min(100, Math.max(1, Number(x.priority) || 50)),
        title: String(x.title || "Opportunity").slice(0, 200),
        summary: String(x.summary || "").slice(0, 1200),
        category: String(x.category || "other").slice(0, 80),
        timing: String(x.timing || "watchlist").slice(0, 80),
        actions: Array.isArray(x.actions) ? x.actions.map((a: unknown) => String(a).slice(0, 400)).slice(0, 8) : [],
        caveats: Array.isArray(x.caveats) ? x.caveats.map((c: unknown) => String(c).slice(0, 400)).slice(0, 6) : [],
      }))
      .sort((a, b) => b.priority - a.priority);

    let insights = baseInsights;
    if (mergeProactiveGaps) {
      try {
        const sbGap = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        );
        const { data: gaps } = await sbGap
          .from("proactive_gaps")
          .select("insight")
          .eq("user_id", auth.userId)
          .order("created_at", { ascending: false })
          .limit(12);
        const proactiveRows = (gaps || [])
          .map((g: { insight: Record<string, unknown> }) => {
            const x = g.insight;
            const titleRaw = String(x.title || "Opportunity");
            const title = titleRaw.startsWith("[Proactive]") ? titleRaw : `[Proactive] ${titleRaw}`.slice(0, 200);
            return {
              id: typeof x.id === "string" ? x.id : undefined,
              priority: Math.min(100, Math.max(1, Number(x.priority) || 62)),
              title,
              summary: String(x.summary || "").slice(0, 1200),
              category: String(x.category || "other").slice(0, 80),
              timing: String(x.timing || "watchlist").slice(0, 80),
              actions: Array.isArray(x.actions) ? x.actions.map((a: unknown) => String(a).slice(0, 400)).slice(0, 8) : [],
              caveats: Array.isArray(x.caveats) ? x.caveats.map((c: unknown) => String(c).slice(0, 400)).slice(0, 6) : [],
            };
          });
        const seen = new Set<string>();
        const merged = [...proactiveRows, ...baseInsights].filter((row) => {
          const k = row.title.toLowerCase();
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });
        insights = merged.slice(0, 24);
      } catch (e) {
        console.warn("mergeProactiveGaps:", e);
      }
    }

    return new Response(
      JSON.stringify({
        executiveSummary: String(parsed.executiveSummary || "").slice(0, 2000),
        insights,
        disclaimer: String(parsed.disclaimer || "").slice(0, 1500),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("alfred-opportunities:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
