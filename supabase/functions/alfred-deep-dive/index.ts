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

type GapBridge = {
  gap: string;
  whoIsUnderserved: string;
  howYouCouldFill: string;
  industriesInvolved: string[];
  roughDifficulty: string;
};

type CrossIndustryRow = {
  industry: string;
  whyItMattersForTheUser: string;
  linkToThisIdea: string;
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
    const seed = body.insightSeed && typeof body.insightSeed === "object" ? body.insightSeed : {};

    const title = String(seed.title || "").trim().slice(0, 200);
    const summary = String(seed.summary || "").trim().slice(0, 1200);
    const category = String(seed.category || "").trim().slice(0, 80);
    const timing = String(seed.timing || "").trim().slice(0, 80);
    const priority = Number(seed.priority) || 50;
    const actions = Array.isArray(seed.actions) ? seed.actions.map((a: unknown) => String(a).slice(0, 500)).slice(0, 10) : [];
    const caveats = Array.isArray(seed.caveats) ? seed.caveats.map((c: unknown) => String(c).slice(0, 500)).slice(0, 8) : [];

    if (!title || !summary) {
      return new Response(JSON.stringify({ error: "insightSeed.title and insightSeed.summary are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
      USAGE_COST_USD.alfred_deep_dive,
      "alfred_deep_dive",
      corsHeaders,
      auth.email,
    );
    if (paywall) return paywall;

    const system = `You are Infinitygap's opportunity desk in deep-dive mode — produce a long-form, analyst-style brief.

Personalize for the user they call themselves "${addressAs}" in userProfileMirror where appropriate.

The user wants industry-grade depth: situation analysis, cross-industry links, explicit "gaps" (white space, friction, arbitrage, skill stacks, distribution holes) they could exploit to earn income or improve positioning — not a short blog post.

STRICT RULES:
1. Output VALID JSON ONLY — no markdown fences, no prose outside the JSON object.
2. Ground everything in the USER TRAINING NOTES when provided: infer constraints (capital, time/week, skills, risk, geography, goals). If notes are thin, say what you are assuming and still deliver cross-industry analysis.
3. Scan broadly across domains where relevant: e.g. finance (stocks/crypto/FX/commodities), labor & skills, online business, content, e-commerce, local services, real estate, policy/regulatory, AI tooling, emerging markets / geo arbitrage. Connect at least 3 industries to the seed idea where plausible.
4. "gapBridges" must be concrete: who is underserved, what is broken or expensive, what proof or asset would reduce risk.
5. Securities / regulated activity: educational framing only; risks and verification steps required; never promise returns.
6. Tone: decisive, specific, testable hypotheses — still honest about uncertainty.

${temporalIntelRules()}

JSON schema (all string fields plain text; arrays of strings; obey lengths):
{
  "userProfileMirror": "3-6 sentences: who this person appears to be from their notes + geo — constraints, goals, what they should optimize for.",
  "executiveThesis": "2-4 sentences: the core bet / opportunity in one sharp thesis tied to them.",
  "landscape": "3-5 dense paragraphs: forces, players, trends, why this theme matters now for someone with their profile.",
  "crossIndustry": [
    { "industry": "short label", "whyItMattersForTheUser": "1-3 sentences", "linkToThisIdea": "1-3 sentences — explicit bridge" }
  ],
  "gapBridges": [
    {
      "gap": "name the gap",
      "whoIsUnderserved": "who feels the pain",
      "howYouCouldFill": "specific ways this user could step in (products, services, content, capital, ops)",
      "industriesInvolved": ["two or more short industry tags"],
      "roughDifficulty": "e.g. low | medium | high — plus one line why"
    }
  ],
  "positioningPlaybook": "2-4 paragraphs: narrative, niche, credibility stack, what to be known for, what to avoid claiming.",
  "monetizationPaths": ["6-12 bullets — revenue models, pricing logic, first dollar path"],
  "ninetyDayPlan": ["week-by-week style but as 10-14 numbered steps for the next ~90 days"],
  "risksMissteps": ["6-10 bullets — what fails, compliance blind spots, common mistakes"],
  "researchQueries": ["5-8 precise search queries the user should run next"],
  "disclaimer": "one short legal-style disclaimer (not personalized advice)"
}`;

    const userMsg =
      trainingCorpus.length > 0
        ? `GEO / MARKET LENS: ${geoHint}

USER TRAINING NOTES (primary source — internalize before writing):
${trainingCorpus}

---

SEED OPPORTUNITY CARD (expand this into the full JSON brief):
Title: ${title}
Category: ${category}
Timing: ${timing}
Priority (1-100): ${priority}
Summary: ${summary}
Suggested actions from card: ${JSON.stringify(actions)}
Caveats from card: ${JSON.stringify(caveats)}`
        : `GEO / MARKET LENS: ${geoHint}

No training notes yet — infer a cautious default profile (limited verified facts), state assumptions explicitly, and still deliver cross-industry gap analysis.

SEED OPPORTUNITY CARD:
Title: ${title}
Category: ${category}
Timing: ${timing}
Priority: ${priority}
Summary: ${summary}
Actions: ${JSON.stringify(actions)}
Caveats: ${JSON.stringify(caveats)}`;

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
        temperature: 0.45,
        max_tokens: 8192,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("alfred-deep-dive gateway:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error", detail: t.slice(0, 500) }), {
        status: response.status === 402 ? 402 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    let parsed: Record<string, unknown>;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      parsed = JSON.parse(start >= 0 ? cleaned.slice(start, end + 1) : cleaned) as Record<string, unknown>;
    } catch (e) {
      console.error("alfred-deep-dive JSON parse:", e, content.slice(0, 400));
      return new Response(JSON.stringify({ error: "Could not parse AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const crossRaw = Array.isArray(parsed.crossIndustry) ? parsed.crossIndustry : [];
    const crossIndustry: CrossIndustryRow[] = crossRaw
      .map((row: unknown) => {
        const r = row && typeof row === "object" ? (row as Record<string, unknown>) : {};
        return {
          industry: String(r.industry || "").slice(0, 120),
          whyItMattersForTheUser: String(r.whyItMattersForTheUser || "").slice(0, 800),
          linkToThisIdea: String(r.linkToThisIdea || "").slice(0, 800),
        };
      })
      .filter((r) => r.industry.length > 0);

    const gapsRaw = Array.isArray(parsed.gapBridges) ? parsed.gapBridges : [];
    const gapBridges: GapBridge[] = gapsRaw
      .map((row: unknown) => {
        const r = row && typeof row === "object" ? (row as Record<string, unknown>) : {};
        const ind = Array.isArray(r.industriesInvolved)
          ? r.industriesInvolved.map((x: unknown) => String(x).slice(0, 80)).slice(0, 8)
          : [];
        return {
          gap: String(r.gap || "").slice(0, 300),
          whoIsUnderserved: String(r.whoIsUnderserved || "").slice(0, 500),
          howYouCouldFill: String(r.howYouCouldFill || "").slice(0, 1200),
          industriesInvolved: ind,
          roughDifficulty: String(r.roughDifficulty || "").slice(0, 200),
        };
      })
      .filter((r) => r.gap.length > 0);

    const strArr = (k: string, max: number, maxLen: number) =>
      Array.isArray(parsed[k])
        ? (parsed[k] as unknown[]).map((x) => String(x).slice(0, maxLen)).slice(0, max)
        : [];

    const payload = {
      userProfileMirror: String(parsed.userProfileMirror || "").slice(0, 2500),
      executiveThesis: String(parsed.executiveThesis || "").slice(0, 1200),
      landscape: String(parsed.landscape || "").slice(0, 12_000),
      crossIndustry,
      gapBridges,
      positioningPlaybook: String(parsed.positioningPlaybook || "").slice(0, 8000),
      monetizationPaths: strArr("monetizationPaths", 14, 500),
      ninetyDayPlan: strArr("ninetyDayPlan", 16, 600),
      risksMissteps: strArr("risksMissteps", 12, 500),
      researchQueries: strArr("researchQueries", 10, 200),
      disclaimer: String(parsed.disclaimer || "").slice(0, 1500),
    };

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("alfred-deep-dive:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
