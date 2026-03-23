import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { temporalIntelRules } from "../_shared/temporalPrompt.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BLOCK_INSTRUCTIONS = `
## STRUCTURED OUTPUT BLOCKS

You are a world-class market opportunity analyst. Your responses MUST contain structured data blocks using this exact syntax:

### METRICS BLOCK
:::metrics
[{"label":"Addressable Market","value":"$4.2T","trend":"up","delta":"+12.3%"}]
:::

### COMPARISON BLOCK
:::comparison
{"title":"...","headers":["Criteria","A","B"],"rows":[["Revenue Potential","$2B","$500M"]],"verdict":"..."}
:::

### FRAMEWORK BLOCK
:::framework
{"title":"Opportunity Analysis","type":"swot","sections":[{"label":"Strengths","color":"emerald","items":["..."]}]}
:::

### INSIGHTS BLOCK
:::insights
{"title":"Key Findings","items":[{"text":"...","score":9,"tag":"High ROI"}]}
:::

### STEPS BLOCK
:::steps
{"title":"Exploitation Roadmap","items":[{"phase":"Phase 1","duration":"Weeks 1-4","tasks":["..."],"status":"critical"}]}
:::

### SCORE BLOCK
:::score
{"title":"Opportunity Score","score":7.8,"maxScore":10,"label":"Strong Play","summary":"...","breakdown":[{"category":"Market Size","score":9}]}
:::

RULES:
1. ALWAYS use 4-6 structured blocks per report (this is a VALUE showcase — same visual power as Pro deep dives).
2. JSON must be valid; ::: delimiters on their own lines.
3. Put narrative text BETWEEN blocks.
4. Be extremely specific with numbers, companies, and regional nuance where the user scoped geography.
5. NEVER use markdown code fences for structured data — only ::: blocks.
6. NEVER put a heading like "### METRICS" immediately before ::: — flow from prose into :::metrics.

`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Sign in required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !anonKey || !serviceKey) {
      throw new Error("Supabase env not configured");
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: sub } = await admin
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (sub?.status === "active") {
      return new Response(
        JSON.stringify({
          error:
            "Trial showcase is for free accounts. As a Pro member, use Infinity Lab and industry deep dives for full intelligence.",
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json();
    const specialization = String(body.specialization || "").trim().slice(0, 2500);
    const userPrompt = String(body.userPrompt || "").trim().slice(0, 4000);
    const geoLabels: string[] = Array.isArray(body.geoLabels)
      ? body.geoLabels.map((x: unknown) => String(x).trim()).filter(Boolean).slice(0, 24)
      : [];
    const scopeMode = String(body.scopeMode || "all") as "all" | "industries" | "flows";
    const industryNames: string[] = Array.isArray(body.industryNames)
      ? body.industryNames.map((x: unknown) => String(x).trim()).filter(Boolean).slice(0, 16)
      : [];
    const flowDescriptors: string[] = Array.isArray(body.flowDescriptors)
      ? body.flowDescriptors.map((x: unknown) => String(x).trim()).filter(Boolean).slice(0, 24)
      : [];
    const profileHint = body.profileHint && typeof body.profileHint === "object" ? body.profileHint as Record<string, unknown> : {};

    if (!specialization || specialization.length < 8) {
      return new Response(JSON.stringify({ error: "Please describe who you are and what you focus on (a bit more detail)." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!userPrompt || userPrompt.length < 10) {
      return new Response(JSON.stringify({ error: "Please add a clearer question (a bit more detail)." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isGlobalGeo = geoLabels.length === 0;
    const geoSection = isGlobalGeo
      ? "GEO: Whole globe — use worldwide lens; still name regional hotspots where relevant."
      : `GEO (mandatory lens): ${geoLabels.join("; ")}. Anchor examples, regulations, and market sizes to these geographies.`;

    let scopeSection = "";
    if (scopeMode === "all") {
      scopeSection =
        "SCOPE: All mapped industries and money flows may be referenced — prioritize what matters for this user’s question.";
    } else if (scopeMode === "industries") {
      scopeSection = `SCOPE — INDUSTRIES ONLY (prioritize these sectors):\n${industryNames.map((n) => `- ${n}`).join("\n")}`;
    } else {
      scopeSection = `SCOPE — SPECIFIC MONEY FLOWS (prioritize these lanes):\n${flowDescriptors.map((n) => `- ${n}`).join("\n")}`;
    }

    const interest =
      Array.isArray(profileHint.industries_of_interest) && profileHint.industries_of_interest.length
        ? (profileHint.industries_of_interest as string[]).slice(0, 16).join(", ")
        : "";
    const regions =
      Array.isArray(profileHint.preferred_regions) && profileHint.preferred_regions.length
        ? (profileHint.preferred_regions as string[]).slice(0, 12).join(", ")
        : "";

    const profileBits = [
      profileHint.display_name ? `Name / display: ${profileHint.display_name}` : "",
      profileHint.organization ? `Organization: ${profileHint.organization}` : "",
      profileHint.role ? `Role type: ${profileHint.role}` : "",
      interest ? `Profile industries of interest (from account): ${interest}` : "",
      regions ? `Preferred regions (from account): ${regions}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are Infinitygap — elite market intelligence. This request is a CONTROLLED FREE-TIER SHOWCASE: the user is evaluating whether to subscribe. The output must feel as rich and structured as a paid deep dive.

${BLOCK_INSTRUCTIONS}

Your mission:
1) INTERNALIZE who this person is — role, organization, stated specialization, geography, and industry/flow scope — and calibrate tone, depth, and examples to them.
2) Treat their question as a serious desk briefing — not a blog post.
3) This is our value proposition moment: demonstrate structured metrics, comparisons, frameworks, scored insights, action steps, and an overall score — same visual block grammar as Pro reports.

${temporalIntelRules()}`;

    const userMessage = `## USER PROFILE (calibrate everything to this)
${profileBits || "(No extra profile fields — rely on specialization below.)"}

## HOW THEY DESCRIBE THEMSELVES / THEIR SPECIALIZATION
${specialization}

## ${geoSection}

## ${scopeSection}

## THEIR QUESTION (answer this directly, comprehensively)
${userPrompt}

## REQUIREMENTS
- Lead with an executive read tailored to THEIR lens (${specialization.slice(0, 120)}…).
- Use the same block richness as a Pro deep dive: multiple :::metrics, :::insights, :::framework, :::comparison, :::steps, :::score as appropriate.
- Name companies, regulators, figures, and dates where plausible; mark forecasts clearly.
- If scope is global, still tie implications to their geo list when they gave one.
- End with a concise "why Infinitygap" line in plain prose (one short paragraph) — not a sales cliché; tie to what you just showed.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted — try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await response.json();
    const report = aiData.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ report }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("trial-showcase-intel error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
