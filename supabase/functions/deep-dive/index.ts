import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BLOCK_INSTRUCTIONS = `
## STRUCTURED OUTPUT BLOCKS

You are a world-class intelligence analyst. Your responses MUST contain structured data blocks using this exact syntax:

### METRICS BLOCK
:::metrics
[{"label":"Market Size","value":"$4.2T","trend":"up","delta":"+12.3%"}]
:::

### COMPARISON BLOCK
:::comparison
{"title":"...","headers":["Criteria","A","B"],"rows":[["Speed","Fast","Slow"]],"verdict":"..."}
:::

### FRAMEWORK BLOCK
:::framework
{"title":"SWOT Analysis","type":"swot","sections":[{"label":"Strengths","color":"emerald","items":["..."]}]}
:::

### INSIGHTS BLOCK
:::insights
{"title":"Key Findings","items":[{"text":"...","score":9,"tag":"Critical"}]}
:::

### STEPS BLOCK
:::steps
{"title":"Roadmap","items":[{"phase":"Phase 1","duration":"Weeks 1-4","tasks":["..."],"status":"critical"}]}
:::

### SCORE BLOCK
:::score
{"title":"Assessment","score":7.8,"maxScore":10,"label":"Strong","summary":"...","breakdown":[{"category":"Market","score":9}]}
:::

RULES:
1. ALWAYS use 3-5 structured blocks per report
2. JSON must be valid
3. Put narrative text BETWEEN blocks
4. Be extremely specific with numbers, percentages, company names
5. Score and rate everything
6. The ::: delimiters must be on their own line
7. NEVER label blocks before them — flow naturally into ::: syntax
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, context, industryName, subFlowName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are NEXUS ATLAS, an elite intelligence deep-dive engine. You produce comprehensive structured intelligence reports that feel like $50,000 McKinsey deliverables.

${BLOCK_INSTRUCTIONS}

Your reports MUST include:
1. Executive summary (2-3 sentences)
2. METRICS block with 4+ key quantitative findings
3. INSIGHTS block with 4+ scored findings
4. FRAMEWORK block (SWOT or relevant framework)
5. COMPARISON block if multiple players/options exist
6. STEPS block with actionable recommendations
7. SCORE block with overall assessment

Cross-reference data across ALL related industries. Identify market gaps, disruption risks, and emerging opportunities. Be ruthlessly specific.`;

    const userPrompt = `Generate a comprehensive deep-dive intelligence report on: "${topic}"

${industryName ? `Industry context: ${industryName}` : ""}
${subFlowName ? `Money flow: ${subFlowName}` : ""}
${context ? `Additional context: ${context}` : ""}

Pull all relevant data: market sizes, growth rates, key players, recent developments, regulatory changes, technology disruptions, supply chain dynamics, competitive landscape. Cross-reference with adjacent industries and money flows where relevant.

Identify ALL market gaps, underserved segments, and emerging opportunities. Rate each by potential and risk. Provide a detailed action plan.`;

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
        return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await response.json();
    const report = aiData.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ report }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("deep-dive error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
