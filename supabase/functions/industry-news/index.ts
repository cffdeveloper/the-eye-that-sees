import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { recencyAnchoringUserLine } from "../_shared/temporalPrompt.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function safeFetch(url: string, timeout = 8000): Promise<any> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Newest first; prefer items under ~20 months old when enough exist (avoids 2022–2023 dominating when GNews returns mixed). */
function sortNewsByRecency(articles: any[], max: number): any[] {
  const sorted = [...articles].sort((a, b) => {
    const ta = Date.parse(a.publishedAt || "") || 0;
    const tb = Date.parse(b.publishedAt || "") || 0;
    return tb - ta;
  });
  const maxAgeMs = 620 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const fresh = sorted.filter((a) => {
    if (!a?.publishedAt) return true;
    const t = Date.parse(a.publishedAt);
    if (Number.isNaN(t)) return true;
    return now - t <= maxAgeMs;
  });
  const use = fresh.length >= 2 ? fresh : sorted;
  return use.slice(0, max);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keywords, limit = 10 } = await req.json();
    if (!keywords || keywords.length === 0) {
      return new Response(JSON.stringify({ articles: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use multiple free news sources
    const query = encodeURIComponent(keywords.slice(0, 5).join(" OR "));
    
    // Source 1: WikiMedia / Wikipedia Current Events (via RSS-to-JSON proxy)
    // Source 2: GNews API (free tier, 100 req/day)
    // Source 3: Use AI to generate contextual news summary based on keywords
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    // Try free news APIs first
    const newsApiResults: any[] = [];
    
    // Try GNews free API
    const gnewsUrl = `https://gnews.io/api/v4/search?q=${query}&lang=en&max=${limit}&apikey=free`;
    const gnewsData = await safeFetch(gnewsUrl);
    
    if (gnewsData?.articles) {
      for (const a of gnewsData.articles.slice(0, limit)) {
        newsApiResults.push({
          title: a.title,
          summary: a.description?.slice(0, 150) || "",
          source: a.source?.name || "Unknown",
          url: a.url,
          publishedAt: a.publishedAt,
          image: a.image,
        });
      }
    }

    const rankedGnews = sortNewsByRecency(newsApiResults, limit);

    // If we have enough real news, return it
    if (rankedGnews.length >= 3) {
      return new Response(JSON.stringify({ articles: rankedGnews, source: "gnews" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: Use AI to generate current news analysis
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ articles: rankedGnews, source: "limited" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a news analyst. Generate realistic, current news headlines and summaries aligned to the present period. ${recencyAnchoringUserLine()} Return valid JSON only.`,
          },
          {
            role: "user",
            content: `Generate ${limit} realistic current news items for these topics: ${keywords.join(", ")}. publishedAt must be ISO-8601 within the last 72 hours of the anchoring date above. Return JSON: {"articles": [{"title": "...", "summary": "30-word summary", "source": "realistic source name", "publishedAt": "ISO date", "category": "business|tech|finance|science"}]}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ articles: rankedGnews, source: "limited" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { articles: [] };
    }

    // Merge real + AI-generated, then prefer fresher items
    const combined = sortNewsByRecency([...rankedGnews, ...(parsed.articles || [])], limit);

    return new Response(JSON.stringify({ articles: combined, source: "ai-enhanced" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("industry-news error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
