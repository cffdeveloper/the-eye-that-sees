import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { temporalIntelRules } from "../_shared/temporalPrompt.ts";
import { requireAuthUser, debitCreditsOrResponse } from "../_shared/authUser.ts";
import { USAGE_COST_USD } from "../_shared/creditsConfig.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Must match src/lib/parseBlocks.ts — only :::metrics|comparison|framework|insights|steps|score render as cards.
const BLOCK_INSTRUCTIONS = `
## STRUCTURED OUTPUT BLOCKS

Your brief MUST use the SAME syntax as Infinitygap Deep Dive reports. Plain prose alone is not enough for analytical sections.

### METRICS
:::metrics
[{"label":"Strait of Hormuz share","value":"~20% crude","trend":"up","delta":"risk-on"}]
:::

### COMPARISON (tables, player vs player, linkage matrices)
:::comparison
{"title":"Linkage matrix","headers":["Signal","Mechanism","Impact"],"rows":[["Hormuz risk","Supply shock","Long energy"]],"verdict":"..."}
:::

### FRAMEWORK
:::framework
{"title":"Dislocation triad","type":"custom","sections":[{"label":"Tier 1","color":"emerald","items":["..."]}]}
:::

### INSIGHTS
:::insights
{"title":"Key findings","items":[{"text":"...","score":8,"tag":"High"}]}
:::

### STEPS
:::steps
{"title":"Action roadmap","items":[{"phase":"Phase 1","duration":"Weeks 1-4","tasks":["..."],"status":"critical"}]}
:::

### SCORE
:::score
{"title":"Thesis score","score":7.8,"maxScore":10,"label":"Asymmetric","summary":"...","breakdown":[{"category":"Upside","score":9}]}
:::

RULES:
1. Use at least 5 structured blocks per brief (mix metrics, insights, framework, comparison, steps, score as relevant).
2. JSON inside ::: blocks MUST be valid — no trailing commas, double quotes only.
3. Put short narrative BETWEEN blocks. The ::: lines must be on their own lines; opening :::type and closing ::: with nothing else on those lines.
4. NEVER use markdown code fences (\`\`\`json or \`\`\`) — the UI does not treat them as cards. All machine-readable structure goes ONLY inside :::...::: blocks.
5. NEVER emit a lone label like "comparison" or "score" — always the full :::comparison ... ::: wrapper with JSON between.
6. Do NOT use GFM pipe tables for content that should be visual cards — use :::comparison for tabular data (headers/rows) instead.
7. NEVER label blocks with headings like "### METRICS BLOCK" immediately before ::: — flow from prose straight into :::metrics on the next line.
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const auth = await requireAuthUser(
      req,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      Deno.env.get("SUPABASE_URL")!,
    );
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const {
      primarySubflows = [],
      secondarySubflows = [],
      freeTextPrimary = "",
      freeTextMode = "primary",
      geoContext = "global",
    } = body;

    const isGlobalGeo = !geoContext || geoContext === "global";
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const sbAuth = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const paywall = await debitCreditsOrResponse(
      sbAuth,
      auth.userId,
      USAGE_COST_USD.custom_intel,
      "custom_intel",
      corsHeaders,
    );
    if (paywall) return paywall;

    const primaryLines = (primarySubflows as { industryName: string; subFlowName: string; moneyFlow?: string }[])
      .map((p) => `- ${p.industryName} → ${p.subFlowName}${p.moneyFlow ? ` (${p.moneyFlow})` : ""}`)
      .join("\n");

    const secondaryLines = (secondarySubflows as { industryName: string; subFlowName: string; moneyFlow?: string }[])
      .map((s) => `- ${s.industryName} → ${s.subFlowName}${s.moneyFlow ? ` (${s.moneyFlow})` : ""}`)
      .join("\n");

    const hasPrimary =
      (primarySubflows as unknown[]).length > 0 || (String(freeTextPrimary || "").trim() && freeTextMode === "primary");

    const systemPrompt = `You are Infinitygap, an elite cross-domain intelligence engine. The user has defined a CUSTOM scope with optional PRIMARY focus areas and SECONDARY lenses.

${BLOCK_INSTRUCTIONS}

RULES FOR THIS MODE:
1. ${hasPrimary ? "If primary exists, it defines success: tie every major insight back to primary implications unless it's direct risk." : "No explicit primary selected: treat all selected non-primary lanes as one generic basket and infer a single center of gravity from that basket."}
2. SECONDARY is not "general market trivia." Explain what is happening OUT THERE and why it matters to the center of gravity (explicit primary if present, inferred generic basket if not).
3. Explicitly map linkages: "Because X moved in [secondary], the focal scope faces Y opportunity / Z risk in ${isGlobalGeo ? "global markets" : geoContext}."
4. Name companies, policies, numbers, dates where plausible. Mark uncertainty.
5. Include forward-looking gaps and scenarios (not stale headlines as if current news).

${temporalIntelRules()}`;

    const userPrompt = `Generate a COMPREHENSIVE CUSTOM INTELLIGENCE BRIEF.

${freeTextPrimary && String(freeTextPrimary).trim() ? `## USER TEXT CONTEXT (${freeTextMode === "primary" ? "PRIMARY POSITION" : "GENERIC CONTEXT"})\n${String(freeTextPrimary).trim()}\n` : ""}

## PRIMARY SUBCATEGORIES (what to optimize for / strategic home base)
${primaryLines || "(none selected)"}

## SECONDARY SUBCATEGORIES (peripheral markets; if no primary, these become the generic focal basket)
${secondaryLines || "(none — use only primary scope)"}

## GEO FOCUS
${isGlobalGeo ? "Worldwide / global." : `Mandatory: ${geoContext}. Localize examples, regulators, channels, and sizing to this geography.`}

OUTPUT REQUIREMENTS:
1. Open with a short executive summary in normal paragraphs (no code fences), then deploy structured blocks — same card pipeline as Deep Dive.
2. Linkage matrix: MUST be a :::comparison block with columns for signal, mechanism, and ${hasPrimary ? "primary impact" : "basket impact"}. Do not use markdown pipe tables for this.
3. Include :::metrics (quantified KPIs), :::insights (scored bullets), :::framework (landscape or thesis framing), :::comparison (at least one), :::steps (actionable roadmap), :::score (overall conviction).
4. "What to watch" — use :::insights or prose + bullets; keep monitors concrete.
5. Gaps & white space — prose and/or :::insights; stay specific to ${isGlobalGeo ? "global" : geoContext} context.

Be specific. No generic consulting filler.`;

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
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), {
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
    console.error("custom-intel error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
