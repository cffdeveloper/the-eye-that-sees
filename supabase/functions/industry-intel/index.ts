import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { industry, subFlow, keywords, detailed, geoContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const keywordStr = (keywords || []).slice(0, 8).join(", ");
    const scope = subFlow ? `the "${subFlow}" money flow within the ${industry} industry` : `the ${industry} industry broadly`;
    const isGlobal = !geoContext || geoContext === "global";
    const geoStr = isGlobal ? "" : geoContext;

    // Fetch historical insights from DB for context
    let historicalContext = "";
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (supabaseUrl && supabaseKey) {
        const sb = createClient(supabaseUrl, supabaseKey);
        const { data: pastInsights } = await sb
          .from("intel_insights")
          .select("title, detail, insight_type, estimated_value, created_at")
          .eq("source_industry", industry)
          .eq("still_relevant", true)
          .order("created_at", { ascending: false })
          .limit(10);
        if (pastInsights?.length) {
          historicalContext = `\n\nHISTORICAL INSIGHTS FROM PREVIOUS ANALYSES (reference these, build on them, note changes):\n${pastInsights.map(i => `- [${i.insight_type}] ${i.title}: ${i.detail} (Value: ${i.estimated_value || 'N/A'}, Date: ${i.created_at})`).join("\n")}`;
        }
      }
    } catch (e) {
      console.error("Historical fetch error:", e);
    }

    const geoPromptSection = isGlobal
      ? ""
      : `\n\nCRITICAL GEO-CONTEXT: The user is focused on ${geoStr}. ALL analysis MUST be contextualized to this specific market:
- How does each global trend affect ${geoStr} specifically?
- What are the local regulations, market conditions, and cultural factors in ${geoStr}?
- What are the specific local players, competitors, and market sizes in ${geoStr}?
- How can global opportunities be adapted and exploited in ${geoStr}?
- What cross-border opportunities exist between ${geoStr} and global markets?
- What infrastructure, talent, and capital availability exists in ${geoStr}?
- Reference specific local companies, government programs, and market data for ${geoStr}.
Every single insight and gap must be actionable in the context of ${geoStr}.`;

    const systemPrompt = `You are a ruthless market intelligence analyst who finds MONEY-MAKING OPPORTUNITIES. Your job is to identify exploitable gaps in money flows, underserved markets, arbitrage opportunities, and emerging plays that someone with capital could leverage RIGHT NOW.

You think like a private equity analyst, a venture capitalist, and a hedge fund strategist combined. Every gap you find must have a clear path to profit. You cross-reference industries to find where value leaks between sectors.

You MUST respond with valid JSON only — no markdown, no explanation outside the JSON.${geoPromptSection}

KEY PRINCIPLES:
- Every gap must include estimated addressable market value
- Rate each opportunity by urgency (window closing), capital required, and expected ROI
- Identify who's already trying (and failing) and WHY they're failing
- Connect to adjacent industries that could provide unfair advantages
- Flag regulatory tailwinds/headwinds that create timing opportunities
- Note historical parallels — what worked before in similar situations
- Reference and build upon previous analyses when available${historicalContext}`;

    const userPrompt = detailed
      ? `Analyze ${scope} for EXPLOITABLE MONEY-MAKING OPPORTUNITIES.${!isGlobal ? ` Focus on the ${geoStr} market specifically.` : ""} Keywords: ${keywordStr}.

Return JSON with these exact keys:
{
  "analysis": "250-word deep analysis${!isGlobal ? ` contextualized to ${geoStr}` : ""}: Where is money flowing? Where is it STUCK? Where are the biggest inefficiencies? Who is overpaying? Who is underserved? What's about to break open? Be ruthlessly specific with numbers, company names, and dollar amounts${!isGlobal ? ` relevant to ${geoStr}` : ""}.",
  "news": [{"title": "...", "summary": "30-word summary of why this matters for making money${!isGlobal ? ` in ${geoStr}` : ""}"}] (5 recent developments that create opportunities),
  "gaps": [{"title": "...", "detail": "60-word explanation: What's the gap, its estimated market value, why it exists, and how to exploit it${!isGlobal ? ` in ${geoStr}` : ""}", "value": "$X estimate", "urgency": "high|medium|low", "capital_needed": "low|medium|high"}] (6 exploitable gaps with profit potential),
  "alerts": [{"title": "...", "detail": "...", "level": "critical|high|medium|info"}] (4 time-sensitive market alerts),
  "liveData": {"metric_name": value} (8 relevant quantitative metrics${!isGlobal ? ` for ${geoStr}` : ""})
}`
      : `Give a money-flow brief for ${scope}.${!isGlobal ? ` Focus on the ${geoStr} market.` : ""} Keywords: ${keywordStr}.

Return JSON:
{
  "analysis": "150-word overview${!isGlobal ? ` for ${geoStr}` : ""}: Where does money flow? Where are the biggest leaks and underserved segments?",
  "news": [{"title": "...", "summary": "..."}] (3 developments creating opportunities),
  "gaps": [{"title": "...", "detail": "...", "value": "$X estimate"}] (3 major exploitable gaps)
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { analysis: content, news: [], gaps: [], alerts: [], liveData: {} };
    }

    // Persist snapshot + individual insights
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (supabaseUrl && supabaseKey) {
        const sb = createClient(supabaseUrl, supabaseKey);
        const geoArray = isGlobal ? [] : geoStr.split(",").map((g: string) => g.trim());

        // Store snapshot
        await sb.from("intel_snapshots").insert({
          scope_type: subFlow ? "subflow" : "industry",
          scope_key: subFlow ? `${industry}::${subFlow}` : industry,
          analysis: parsed.analysis,
          gaps: parsed.gaps || [],
          alerts: parsed.alerts || [],
          live_data: parsed.liveData || {},
          news: parsed.news || [],
        });

        // Store individual insights for persistent learning
        const insights: any[] = [];

        for (const gap of (parsed.gaps || [])) {
          insights.push({
            insight_type: "gap",
            title: gap.title,
            detail: gap.detail,
            source_industry: industry,
            source_subflow: subFlow || null,
            geo_context: geoArray,
            estimated_value: gap.value || null,
            urgency: gap.urgency || null,
            tags: [gap.capital_needed ? `capital:${gap.capital_needed}` : ""].filter(Boolean),
            raw_data: gap,
          });
        }

        for (const alert of (parsed.alerts || [])) {
          insights.push({
            insight_type: "alert",
            title: alert.title,
            detail: alert.detail,
            source_industry: industry,
            source_subflow: subFlow || null,
            geo_context: geoArray,
            urgency: alert.level,
            raw_data: alert,
          });
        }

        for (const news of (parsed.news || [])) {
          insights.push({
            insight_type: "trend",
            title: news.title,
            detail: news.summary,
            source_industry: industry,
            source_subflow: subFlow || null,
            geo_context: geoArray,
            raw_data: news,
          });
        }

        if (insights.length > 0) {
          await sb.from("intel_insights").insert(insights);
        }

        // Also cache for geo
        if (!isGlobal) {
          await sb.from("geo_intel_cache").insert({
            geo_scope: geoStr,
            scope_type: subFlow ? "subflow" : "industry",
            scope_key: subFlow ? `${industry}::${subFlow}` : industry,
            analysis: parsed.analysis,
            gaps: parsed.gaps || [],
            alerts: parsed.alerts || [],
            market_data: parsed.liveData || {},
          });
        }
      }
    } catch (snapErr) {
      console.error("Storage error:", snapErr);
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("industry-intel error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
