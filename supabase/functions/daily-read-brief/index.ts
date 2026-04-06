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

/** 60 research waves + 1 compile tick ≈ 61 client calls at 2min spacing ≈ 2h wall clock. */
const EXTENDED_RESEARCH_STEPS = 60;

type Body = {
  action?: string;
  trainingCorpus?: string;
  geoHint?: string;
  jobId?: string;
};

function buildUniqueQuery(
  step: number,
  industries: string[],
  primary: string,
  geo: string,
  used: string[],
): string {
  const lenses = [
    "policy regulatory developments",
    "venture capital startup funding",
    "commodity trade flows",
    "labor market skills hiring",
    "competitive dynamics M&A",
    "consumer demand retail",
    "infrastructure projects",
    "healthcare delivery innovation",
    "agriculture food systems",
    "fintech payments rails",
    "real estate commercial",
    "manufacturing capacity",
    "logistics freight",
    "climate transition investment",
    "AI adoption enterprise",
    "cybersecurity incidents",
    "education upskilling",
    "energy grid transition",
    "telecom spectrum connectivity",
    "water resources",
    "defense industrial base",
    "insurance underwriting",
    "pharma clinical trials",
    "automotive EV supply chain",
    "chemicals feedstocks",
    "ocean shipping rates",
    "mining exploration",
    "hospitality travel recovery",
    "media streaming advertising",
    "public sector procurement",
    "ESG disclosure",
    "cross-border sanctions",
    "currency volatility emerging markets",
    "sovereign debt issuance",
    "private credit direct lending",
    "warehouse automation",
    "semiconductor capacity",
    "battery metals",
    "carbon credits markets",
    "biodiversity finance",
    "digital identity",
    "open-source ecosystem",
    "patent litigation",
    "franchise expansion",
    "DTC brand economics",
    "B2B marketplace liquidity",
    "last-mile delivery",
    "cold chain food",
    "microfinance inclusion",
    "remittance corridors",
    "tourism visas mobility",
    "space commercialization",
    "synthetic biology",
    "quantum computing roadmap",
    "data center power",
    "rare earth processing",
    "steel decarbonization",
    "aviation SAF mandates",
    "rail freight investment",
    "crop yields climate",
    "fisheries quotas",
    "urban mobility fares",
    "student debt workforce",
    "elder care demand",
    "pet care premiumization",
    "gaming monetization",
    "creator economy tools",
  ];
  const ind = industries.length ? industries[step % industries.length] : "business";
  const lens = lenses[step % lenses.length];
  let q = `${ind.replace(/-/g, " ")} ${lens} ${primary} ${geo}`.replace(/\s+/g, " ").trim();
  q = `${q} wave ${step}`;
  if (used.includes(q)) q = `${q} alt ${step}-${Date.now()}`;
  return q.slice(0, 420);
}

async function compileExtendedBrief(params: {
  LOVABLE_API_KEY: string;
  profile: Record<string, unknown>;
  trainingCorpus: string;
  primary: string;
  topicLine: string;
  waves: { step: number; query: string; snippet: string }[];
}): Promise<string> {
  const { LOVABLE_API_KEY, profile, trainingCorpus, primary, topicLine, waves } = params;
  const bio = String(profile?.bio || "").slice(0, 800);
  const goals = Array.isArray(profile?.goals) ? (profile!.goals as string[]).join(", ") : "";
  const dayStr = new Date().toISOString().slice(0, 10);

  const corpus = waves
    .map((w) => `### Wave ${w.step} (query: ${w.query})\n${w.snippet}`)
    .join("\n\n---\n\n")
    .slice(0, 120_000);

  const system = `You are Infinitygap's chief research editor. Produce ONE Markdown document for ONE executive reader.

TARGET SCALE: approximately **50 printed pages** of substantive content — exhaustive sections, subsections, data callouts, scenario tables where useful, and cross-linked themes. This is not a blog post; it is a private research pack.

READER:
- Market: ${primary}
- Industries: ${topicLine}
- Role: ${String(profile?.title || "")} / ${String(profile?.role || "")}
- Bio: ${bio || "(none)"}
- Goals: ${goals || "(none)"}
- Training notes: ${trainingCorpus.slice(0, 8000) || "(none)"}

MULTI-WAVE RESEARCH NOTES (unique queries; do not repeat the same claim without synthesis):
${corpus}

REQUIREMENTS:
1. First line: "# " + title including ${dayStr} and "Extended research pack"
2. Then a "## Executive overview" and "## Table of contents" with links to sections.
3. Minimum **25** top-level ## sections (you may use ### liberally under each). Cover macro, sector, geography, risks, opportunities, and personal relevance.
4. Cite uncertainty; no fabricated statistics.
5. Markdown only.
6. Push length: aim for ~15,000–25,000 words total if the gateway allows — keep writing until you exhaust the research angles.`;

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
          content: `Write the complete Markdown pack now. Begin with the # title line.`,
        },
      ],
      temperature: 0.4,
      max_tokens: 32_768,
    }),
  });

  if (!response.ok) {
    const t = await response.text();
    throw new Error(`compile ${response.status}: ${t.slice(0, 300)}`);
  }

  const aiData = await response.json();
  return String(aiData.choices?.[0]?.message?.content || "").trim();
}

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

    const body = (await req.json().catch(() => ({}))) as Body;
    const action = String(body.action || "standard").toLowerCase();
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

    if (action === "status") {
      const jobId = String(body.jobId || "").trim();
      if (!jobId) {
        return new Response(JSON.stringify({ error: "jobId required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: job, error } = await sb.from("user_read_brief_jobs").select("*").eq("id", jobId).eq("user_id", auth.userId).maybeSingle();
      if (error || !job) {
        return new Response(JSON.stringify({ error: "Job not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ job }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "start_extended") {
      const { data: active } = await sb
        .from("user_read_brief_jobs")
        .select("id")
        .eq("user_id", auth.userId)
        .in("status", ["running", "compiling"])
        .limit(1);

      if (active && active.length > 0) {
        return new Response(
          JSON.stringify({
            error: "An extended research job is already in progress. Wait for it to finish or open Read to see progress.",
            code: "JOB_ACTIVE",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const paywall = await debitCreditsOrResponse(
        sb,
        auth.userId,
        USAGE_COST_USD.daily_read_brief_extended,
        "daily_read_brief_extended_start",
        corsHeaders,
        auth.email,
      );
      if (paywall) return paywall;

      const { data: job, error: insErr } = await sb
        .from("user_read_brief_jobs")
        .insert({
          user_id: auth.userId,
          status: "running",
          step: 0,
          max_steps: EXTENDED_RESEARCH_STEPS,
          training_corpus_snapshot: trainingCorpus,
          geo_hint: geoHint,
          research_waves: [],
          queries_used: [],
        })
        .select("id, step, max_steps, status, created_at")
        .single();

      if (insErr || !job) {
        console.error("start_extended", insErr);
        return new Response(JSON.stringify({ error: "Could not start job" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          jobId: job.id,
          step: job.step,
          maxSteps: job.max_steps,
          message:
            "Extended research started. Call tick every 2 minutes (120s). After 60 research waves, the next tick compiles your ~50-page pack.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (action === "tick") {
      const jobId = String(body.jobId || "").trim();
      if (!jobId) {
        return new Response(JSON.stringify({ error: "jobId required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: jobRow, error: jobErr } = await sb
        .from("user_read_brief_jobs")
        .select("*")
        .eq("id", jobId)
        .eq("user_id", auth.userId)
        .maybeSingle();

      if (jobErr || !jobRow) {
        return new Response(JSON.stringify({ error: "Job not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // deno-lint-ignore no-explicit-any
      const job = jobRow as any;
      if (job.status === "complete") {
        return new Response(JSON.stringify({ status: "complete", resultBriefId: job.result_brief_id }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (job.status === "failed") {
        return new Response(JSON.stringify({ status: "failed", error: job.error || "failed" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: profile } = await sb
        .from("profiles")
        .select("industries_of_interest, primary_market, bio, goals, title, role")
        .eq("id", auth.userId)
        .maybeSingle();

      const industries = (profile?.industries_of_interest as string[] | null)?.slice(0, 12) ?? [];
      const primary = String(profile?.primary_market || "").trim() || job.geo_hint || geoHint;
      const topicLine = industries.length
        ? industries.map((s) => s.replace(/-/g, " ")).join(", ")
        : "global markets, technology, policy";

      const waves: { step: number; query: string; snippet: string }[] = Array.isArray(job.research_waves) ? job.research_waves : [];
      const used: string[] = Array.isArray(job.queries_used) ? job.queries_used : [];

      const step = Number(job.step) || 0;

      if (step < EXTENDED_RESEARCH_STEPS) {
        if (!TAVILY_API_KEY) {
          await sb
            .from("user_read_brief_jobs")
            .update({
              status: "failed",
              error: "TAVILY_API_KEY required for extended research waves",
              updated_at: new Date().toISOString(),
            })
            .eq("id", jobId);
          return new Response(JSON.stringify({ error: "TAVILY_API_KEY required for extended pipeline" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const query = buildUniqueQuery(step, industries, primary, job.geo_hint || geoHint, used);
        used.push(query);
        let snippet = "";
        try {
          snippet = await tavilySearch(query, TAVILY_API_KEY);
        } catch (e) {
          snippet = `[fetch error: ${e instanceof Error ? e.message : "unknown"}]`;
        }
        waves.push({ step, query, snippet: snippet.slice(0, 14_000) });

        await sb
          .from("user_read_brief_jobs")
          .update({
            step: step + 1,
            research_waves: waves,
            queries_used: used,
            updated_at: new Date().toISOString(),
          })
          .eq("id", jobId);

        return new Response(
          JSON.stringify({
            status: "running",
            step: step + 1,
            maxSteps: EXTENDED_RESEARCH_STEPS,
            phase: "research",
            message: `Research wave ${step + 1}/${EXTENDED_RESEARCH_STEPS} stored. Next tick in ~2 minutes.`,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // step === EXTENDED_RESEARCH_STEPS → compile once
      await sb
        .from("user_read_brief_jobs")
        .update({ status: "compiling", updated_at: new Date().toISOString() })
        .eq("id", jobId);

      try {
        const bodyMarkdown = await compileExtendedBrief({
          LOVABLE_API_KEY,
          profile: (profile || {}) as Record<string, unknown>,
          trainingCorpus: String(job.training_corpus_snapshot || trainingCorpus),
          primary,
          topicLine,
          waves,
        });

        if (bodyMarkdown.length < 2000) {
          throw new Error("Compiled brief too short");
        }

        const titleLine =
          bodyMarkdown.split("\n").find((l) => l.startsWith("# ")) ||
          `# Extended research pack ${new Date().toISOString().slice(0, 10)}`;
        const title = titleLine.replace(/^#\s+/, "").slice(0, 220);

        const { data: inserted, error: insErr } = await sb
          .from("user_read_briefs")
          .insert({
            user_id: auth.userId,
            title,
            body_markdown: bodyMarkdown,
            brief_kind: "extended",
          })
          .select("id, title, body_markdown, created_at, brief_kind")
          .single();

        if (insErr || !inserted) {
          throw new Error(insErr?.message || "insert failed");
        }

        await sb
          .from("user_read_brief_jobs")
          .update({
            status: "complete",
            result_brief_id: inserted.id,
            step: EXTENDED_RESEARCH_STEPS,
            updated_at: new Date().toISOString(),
          })
          .eq("id", jobId);

        return new Response(
          JSON.stringify({
            status: "complete",
            phase: "compiled",
            brief: inserted,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : "compile failed";
        await sb
          .from("user_read_brief_jobs")
          .update({
            status: "failed",
            error: msg,
            updated_at: new Date().toISOString(),
          })
          .eq("id", jobId);
        return new Response(JSON.stringify({ error: msg, status: "failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // --- standard (fast) digest ---
    if (action !== "standard") {
      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
      const q1 = await tavilySearch(`breaking news analysis ${primary} ${topicLine} last 7 days`, TAVILY_API_KEY);
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
3. Length: substantial coverage — many ## sections. Prioritize depth over fluff.
4. Content: synthesize what matters for THIS person in their industries and region.
5. Include a short "Sources & verification" section.
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
      console.error("daily-read-brief standard", response.status, t);
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
        brief_kind: "standard",
      })
      .select("id, title, body_markdown, created_at, brief_kind")
      .single();

    if (insErr || !inserted) {
      console.error("insert user_read_briefs", insErr);
      return new Response(JSON.stringify({ error: "Could not save brief" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ brief: inserted, action: "standard" }), {
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
