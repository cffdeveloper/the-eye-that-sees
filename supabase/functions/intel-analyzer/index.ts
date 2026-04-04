import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { temporalIntelRules } from "../_shared/temporalPrompt.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not set");

    const sb = createClient(supabaseUrl, serviceKey);

    // 1. Fetch recent raw data (last 6h for freshness)
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const { data: rawData } = await sb.from("raw_market_data")
      .select("source, data_type, geo_scope, payload, tags, created_at")
      .gte("created_at", sixHoursAgo)
      .order("created_at", { ascending: false })
      .limit(500);

    // 2. Fetch existing insights to avoid duplicates
    const { data: existingInsights } = await sb.from("intel_insights")
      .select("title, insight_type, created_at")
      .eq("still_relevant", true)
      .order("created_at", { ascending: false })
      .limit(50);

    // 3. Categorize and summarize for AI
    const byType: Record<string, any[]> = {};
    for (const r of (rawData || [])) {
      const key = r.data_type;
      if (!byType[key]) byType[key] = [];
      if (byType[key].length < 25) byType[key].push(r.payload);
    }

    const existingTitles = existingInsights?.map(i => i.title).join("; ") || "none";

    // 4. INTELLIGENCE-FIRST analysis
    const systemPrompt = `You are a REAL-TIME market intelligence engine with access to live data feeds from Google News, Reddit, Hacker News, GDELT, cryptocurrency markets, forex, GitHub, economic indicators, and (when present) academic paper metadata from Semantic Scholar / arXiv ingestion.

YOUR PRIMARY MISSION: Be a comprehensive intelligence system that tells the user EVERYTHING happening in every industry RIGHT NOW.

PHASE 1 — LIVE INTELLIGENCE (80% of your output):
For EVERY data point, extract and report:
- **WHO**: Name specific companies, CEOs, investors, funds, government officials. Be specific — "Safaricom CEO Peter Ndegwa" not "a telecom company"
- **WHAT**: Exact actions — product launches, M&A deals, funding rounds, regulatory filings, strategy pivots, hirings/firings
- **WHEN**: Exact dates, "today", "this week", "3 hours ago" — freshness is CRITICAL
- **WHERE**: Countries, cities, markets affected
- **WHY**: The strategic reasoning — why is this move happening now?
- **WITH WHO**: Partners, competitors responding, supply chain implications
- **HOW MUCH**: Deal values, market sizes, investment amounts, revenue figures

CROSS-REFERENCE everything: If Company A in tech does something, check if it affects Company B in finance. Track EVERY player across industries.

PHASE 2 — ACTIONABLE INTELLIGENCE (20%):
From the intelligence, derive:
- Stock/crypto recommendations with confidence levels (e.g., "BUY signal for $AAPL — 78% confidence based on...")
- Arbitrage opportunities between markets/geographies
- Gaps where demand exists but supply doesn't
- Timing windows that are closing

ACCURACY RULES:
- If you recommend buying/selling, explain the EXACT data points supporting it
- Include risk assessment for every recommendation
- Mark confidence: HIGH (80%+), MEDIUM (50-79%), LOW (<50%)
- NEVER fabricate specific numbers — use data from the feeds or clearly mark estimates

DO NOT repeat: ${existingTitles}

Return ONLY valid JSON array. Each object:
{
  "insight_type": "player_move|deal|partnership|product_launch|regulatory|market_shift|stock_signal|crypto_signal|arbitrage|gap|warning|competitor_intel",
  "title": "SPECIFIC title naming companies/people/amounts",
  "detail": "5-6 sentences: WHO is doing WHAT, WHEN it happened, WHY it matters, WHO else is affected, WHAT the opportunity/risk is, cross-industry connections",
  "source_industry": "primary industry",
  "related_industries": ["all affected industries"],
  "geo_context": ["specific country codes"],
  "estimated_value": "$X with basis",
  "urgency": "immediate|short-term|medium-term",
  "score": 0-100,
  "confidence": "HIGH|MEDIUM|LOW",
  "action": "specific action to take (buy/sell/watch/build/partner)",
  "risk_level": "low|medium|high",
  "tags": ["relevant", "tags", "company-names"],
  "data_freshness": "hours/minutes old"
}

Return 15-20 insights. PRIORITIZE freshness — data from the last hour > last day > older.

${temporalIntelRules()}

When deriving gaps or regulatory angles, favor forward-looking implications; do not present dated election cycles as current.`;

    const userPrompt = `ANALYZE THIS LIVE DATA AND TELL ME EVERYTHING HAPPENING RIGHT NOW:

BREAKING NEWS (Google News + GDELT): ${JSON.stringify(byType["news_signal"]?.slice(0, 20))}

SOCIAL SIGNALS (Reddit + HackerNews): ${JSON.stringify(byType["social_signal"]?.slice(0, 15))}

CRYPTO MARKETS (Live): ${JSON.stringify(byType["crypto_price"]?.slice(0, 15))}

FOREX RATES (Live): ${JSON.stringify(byType["forex_rate"]?.slice(0, 15))}

TECH TRENDS (GitHub + DevTo): ${JSON.stringify(byType["tech_signal"]?.slice(0, 10))}

ECONOMIC INDICATORS: ${JSON.stringify(byType["economic_indicator"]?.slice(0, 20))}

MARKET SENTIMENT: ${JSON.stringify(byType["market_sentiment"]?.slice(0, 5))}

I need to know: Who are the key players? What are they doing RIGHT NOW? What deals just happened? What should I buy/sell/watch? What gaps exist? Be specific with names, amounts, dates.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (aiRes.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limited", retry: true }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiRes.json();
    let content = aiData.choices?.[0]?.message?.content || "[]";
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let insights: any[];
    try {
      insights = JSON.parse(content);
      if (!Array.isArray(insights)) insights = [insights];
    } catch {
      console.error("Failed to parse AI response:", content.substring(0, 300));
      insights = [];
    }

    // 5. Store insights
    let stored = 0;
    for (const insight of insights) {
      const { error } = await sb.from("intel_insights").insert({
        insight_type: insight.insight_type || "opportunity",
        title: insight.title || "Untitled",
        detail: insight.detail || "",
        source_industry: insight.source_industry || null,
        related_industries: insight.related_industries || [],
        geo_context: insight.geo_context || ["global"],
        estimated_value: insight.estimated_value || null,
        urgency: insight.urgency || "medium-term",
        score: insight.score || 50,
        tags: [...(insight.tags || []), insight.confidence || "MEDIUM", insight.action || "watch"],
        raw_data: {
          source: "intel-analyzer",
          confidence: insight.confidence,
          action: insight.action,
          risk_level: insight.risk_level,
          data_freshness: insight.data_freshness,
          analyzed_at: new Date().toISOString(),
        },
      });
      if (!error) stored++;
      else console.error("Insert insight error:", error.message);
    }

    // 6. Create intel_matches for high-value cross-industry opportunities
    const highValue = insights.filter(i => (i.score || 0) >= 65 && (i.related_industries?.length || 0) > 1);
    let matches = 0;
    for (const h of highValue) {
      const { error } = await sb.from("intel_matches").insert({
        match_type: h.insight_type || "opportunity",
        title: h.title,
        description: h.detail,
        industries: [h.source_industry, ...(h.related_industries || [])].filter(Boolean),
        geo_context: h.geo_context || ["global"],
        estimated_value: h.estimated_value,
        confidence: h.score || 70,
        action_items: h.action ? [{ step: h.action, priority: h.urgency || "medium" }] : [],
        challenges: h.risk_level ? [{ challenge: `Risk: ${h.risk_level}`, mitigation: "Monitor closely" }] : [],
      });
      if (!error) matches++;
    }

    return new Response(JSON.stringify({
      raw_data_analyzed: rawData?.length || 0,
      data_types: Object.keys(byType).length,
      insights_generated: insights.length,
      insights_stored: stored,
      matches_created: matches,
      timestamp: new Date().toISOString(),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    console.error("Intel analyzer error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
