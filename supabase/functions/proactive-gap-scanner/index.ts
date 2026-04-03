import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { runParallelSearches } from "../_shared/searchTools.ts";
import { defaultGuardrailContext, hardRejectGap, type UserGuardrailContext } from "../_shared/guardrails.ts";
import { proactiveScannerSystemPrompt, proactiveScannerUserMessage } from "../_shared/proactivePrompts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function deterministicInsightId(generatedAt: number, index: number, title: string): string {
  const s = `${generatedAt}|${index}|${title}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `ins_${(h >>> 0).toString(16)}_${index}`;
}

function buildQueries(profile: Record<string, unknown>): string[] {
  const ind = (Array.isArray(profile.industries_of_interest) ? profile.industries_of_interest : []) as string[];
  const primary = String(profile.primary_market || "KE");
  const base: string[] = [
    `Kenya SME underserved services ${new Date().getFullYear()}`,
    "Nairobi B2B digital agency gap remote clients",
    "East Africa cross-border payments small business opportunity",
    "M-Pesa ecosystem micro-SaaS Kenya",
    "Kenya agri value chain logistics gap low capital",
    "renewable energy mini-grid Kenya rural SME",
    "Kenya waste recycling circular economy small business",
    "online freelancing Kenya to US EU clients profitable niche",
  ];
  for (const slug of ind.slice(0, 6)) {
    base.push(`${slug} Kenya market gap small business`);
    base.push(`${slug} online remote business low startup cost`);
  }
  for (let a = 0; a < Math.min(ind.length, 3); a++) {
    for (let b = a + 1; b < Math.min(ind.length, 4); b++) {
      base.push(`${ind[a]} ${ind[b]} intersection Kenya opportunity`);
    }
  }
  if (primary && primary !== "KE") {
    base.push(`online business ${primary} remote work global`);
  }
  return [...new Set(base)].slice(0, 18);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tavilyApiKey = Deno.env.get("TAVILY_API_KEY") || undefined;
    const xBearer = Deno.env.get("TWITTER_BEARER_TOKEN") || Deno.env.get("X_BEARER_TOKEN") || undefined;

    const { data: subs, error: subErr } = await sb
      .from("subscriptions")
      .select("user_id, status")
      .eq("status", "active");

    if (subErr) throw subErr;
    const userIds = [...new Set((subs || []).map((s: { user_id: string }) => s.user_id))].slice(0, 12);

    const batchId = `batch_${Date.now()}`;
    const results: { user_id: string; inserted: number }[] = [];

    for (const userId of userIds) {
      const { data: profile } = await sb.from("profiles").select("*").eq("id", userId).maybeSingle();
      if (!profile) continue;

      const ctx = defaultGuardrailContext({
        region: String(profile.primary_market || "KE"),
        max_startup_capital_usd: Number(profile.max_startup_capital_usd) || 1000,
        prefers_business_that_employs: Boolean(profile.prefers_business_that_employs ?? true),
        skills_hint: [profile.bio, profile.title, ...(profile.goals || [])].filter(Boolean).join(" ").slice(0, 1200),
        industries_of_interest: (profile.industries_of_interest as string[]) || [],
        risk_tolerance: String(profile.experience_level || "moderate"),
      });

      const { data: memories } = await sb
        .from("user_memory")
        .select("content")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(12);

      const memoryExcerpts = (memories || []).map((m: { content: string }) => m.content.slice(0, 500));

      const queries = buildQueries(profile as Record<string, unknown>);
      let searchEvidence = "";
      try {
        searchEvidence = await runParallelSearches({
          supabaseUrl,
          serviceKey,
          queries,
          tavilyApiKey,
          xBearer,
          browseUrls: [
            "https://www.knbs.or.ke/",
            "https://www.worldbank.org/en/country/kenya",
          ],
        });
      } catch (e) {
        console.error("parallel search:", e);
        searchEvidence = "(search tools failed — model will use profile only)";
      }

      const profileSummary = [
        `Region: ${ctx.region}`,
        `Max startup capital USD: ${ctx.max_startup_capital_usd}`,
        `Prefers employing others: ${ctx.prefers_business_that_employs}`,
        `Industries: ${ctx.industries_of_interest.join(", ")}`,
        `Goals: ${(profile.goals || []).join("; ")}`,
        `Bio/title: ${profile.bio || ""} ${profile.title || ""}`,
      ].join("\n");

      const system = proactiveScannerSystemPrompt(ctx as UserGuardrailContext);
      const userMsg = proactiveScannerUserMessage({
        profile_summary: profileSummary,
        memory_excerpts: memoryExcerpts,
        search_evidence: searchEvidence,
        industries: ctx.industries_of_interest,
      });

      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
        }),
      });

      if (!aiRes.ok) {
        console.error("scanner LLM", await aiRes.text());
        continue;
      }

      const aiData = await aiRes.json();
      const content = aiData.choices?.[0]?.message?.content || "{}";
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      let parsed: { insights?: unknown[]; search_themes_used?: string[] };
      try {
        parsed = JSON.parse(start >= 0 ? cleaned.slice(start, end + 1) : cleaned);
      } catch {
        continue;
      }

      const rawList = Array.isArray(parsed.insights) ? parsed.insights : [];
      const generatedAt = Date.now();
      let inserted = 0;

      for (let i = 0; i < rawList.length; i++) {
        const x = rawList[i] as Record<string, unknown>;
        const title = String(x.title || "Opportunity").slice(0, 200);
        const summary = String(x.summary || "").slice(0, 1200);
        const rej = hardRejectGap(summary, title, ctx as UserGuardrailContext);
        if (rej.reject) continue;

        const insight = {
          id: deterministicInsightId(generatedAt, i, title),
          priority: Math.min(100, Math.max(1, Number(x.priority) || 55)),
          title,
          summary,
          category: String(x.category || "other").slice(0, 80),
          timing: String(x.timing || "watchlist").slice(0, 80),
          actions: Array.isArray(x.actions) ? x.actions.map((a: unknown) => String(a).slice(0, 400)).slice(0, 8) : [],
          caveats: Array.isArray(x.caveats) ? x.caveats.map((c: unknown) => String(c).slice(0, 400)).slice(0, 6) : [],
        };

        const feasibility = {
          hard_reject: false,
          capital_max_usd: ctx.max_startup_capital_usd,
          region: ctx.region,
        };

        const { error: insErr } = await sb.from("proactive_gaps").insert({
          user_id: userId,
          insight,
          feasibility,
          search_evidence: { search_themes_used: parsed.search_themes_used ?? [], queries: queries.slice(0, 8) },
          user_context_snapshot: ctx,
          batch_id: batchId,
        });

        if (!insErr) inserted++;
      }

      await sb.from("user_memory").insert({
        user_id: userId,
        kind: "profile_snapshot",
        content: `Proactive scan ${batchId}: inserted ${inserted} gaps.`,
        metadata: { batch_id: batchId },
      });

      results.push({ user_id: userId, inserted });
    }

    return new Response(
      JSON.stringify({ ok: true, batch_id: batchId, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("proactive-gap-scanner:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
