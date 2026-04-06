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

const EXTENDED_RESEARCH_STEPS = 60;

type Body = {
  action?: string;
  trainingCorpus?: string;
  geoHint?: string;
  jobId?: string;
  focusIndustries?: string[];
  customFocus?: string;
};

function buildUniqueQuery(
  step: number,
  industries: string[],
  primary: string,
  geo: string,
  used: string[],
  customFocus?: string,
): string {
  const lenses = [
    "policy regulatory developments",
    "venture capital startup funding",
    "commodity trade flows price trends",
    "labor market skills hiring trends",
    "competitive dynamics M&A consolidation",
    "consumer demand retail patterns",
    "infrastructure projects megaprojects",
    "healthcare delivery innovation biotech",
    "agriculture food systems sustainable",
    "fintech payments digital banking",
    "real estate commercial residential trends",
    "manufacturing capacity reshoring",
    "logistics freight supply disruptions",
    "climate transition green investment",
    "AI adoption enterprise use cases stories",
    "cybersecurity incidents breaches response",
    "education upskilling workforce training",
    "energy grid transition renewables",
    "telecom spectrum 5G connectivity",
    "water resources sanitation access",
    "defense procurement military tech",
    "insurance underwriting actuarial",
    "pharma clinical trials drug pricing",
    "automotive EV battery supply chain",
    "chemicals feedstocks plastics",
    "ocean shipping container rates",
    "mining exploration critical minerals",
    "hospitality travel tourism recovery",
    "media streaming advertising revenue",
    "public sector procurement digital",
    "ESG disclosure sustainability ratings",
    "cross-border sanctions geopolitics",
    "currency forex emerging markets volatility",
    "sovereign debt bonds fiscal policy",
    "private credit direct lending growth",
    "warehouse automation robotics",
    "semiconductor chip capacity fab",
    "battery metals lithium cobalt",
    "carbon credits voluntary markets",
    "biodiversity nature finance",
    "digital identity biometrics",
    "open-source ecosystem developer",
    "patent litigation IP disputes",
    "franchise expansion models",
    "DTC brand economics margins",
    "B2B marketplace SaaS platforms",
    "last-mile delivery gig economy",
    "cold chain perishable logistics",
    "microfinance financial inclusion",
    "remittance corridors diaspora",
    "tourism visas mobility trends",
    "space commercialization satellites",
    "synthetic biology fermentation",
    "quantum computing enterprise readiness",
    "data center power consumption",
    "rare earth processing supply",
    "steel decarbonization hydrogen",
    "aviation sustainable fuel SAF",
    "rail freight intermodal investment",
    "crop yields climate adaptation",
    "fisheries aquaculture blue economy",
    "urban mobility transit fares",
    "student education workforce pipelines",
    "elder care aging population demand",
    "pet care premiumization D2C",
    "gaming esports monetization",
    "creator economy tools platforms",
    "blockchain DeFi tokenization real-world",
    "sports business media rights",
    "luxury goods market emerging",
  ];

  const focus = customFocus ? customFocus : "";
  const ind = industries.length ? industries[step % industries.length] : "business";
  const lens = lenses[step % lenses.length];
  let q = `${focus} ${ind.replace(/-/g, " ")} ${lens} ${primary} ${geo} latest developments analysis`.replace(/\s+/g, " ").trim();
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
  customFocus?: string;
}): Promise<string> {
  const { LOVABLE_API_KEY, profile, trainingCorpus, primary, topicLine, waves, customFocus } = params;
  const bio = String(profile?.bio || "").slice(0, 800);
  const goals = Array.isArray(profile?.goals) ? (profile!.goals as string[]).join(", ") : "";
  const dayStr = new Date().toISOString().slice(0, 10);

  const corpus = waves
    .map((w) => `### Wave ${w.step} (query: ${w.query})\n${w.snippet}`)
    .join("\n\n---\n\n")
    .slice(0, 120_000);

  const focusNote = customFocus
    ? `SPECIAL FOCUS TOPIC: "${customFocus}" — weave this theme throughout every section as the primary lens.\n`
    : "";

  const system = `You are Infinitygap's chief research editor producing a PREMIUM private research pack.

${focusNote}TARGET SCALE: approximately **50 printed pages** (~20,000-25,000 words) of substantive, narrative-driven content. This is NOT a summary or blog post — it is an immersive research document that reads like a premium industry report mixed with investigative journalism.

WRITING STYLE REQUIREMENTS:
- Write in a NARRATIVE style with stories, case studies, and real examples woven throughout
- Start sections with compelling hooks — a story about a company, a striking data point, a historical parallel
- Use concrete examples: "When Company X launched Y in Z market, they discovered…"
- Include scenario analysis: "If oil prices reach $X, here's what happens to…"
- Add "What this means for YOU" callouts specific to the reader
- Use analogies and metaphors to make complex ideas accessible
- Include contrarian views and debates — don't just present consensus
- Add "Deep dive" subsections that explore one angle exhaustively
- Include tables for comparisons, timelines for developments, and bullet lists for action items
- Every section should feel like a chapter in a book, not a bullet summary

READER:
- Market: ${primary}
- Industries: ${topicLine}
- Role: ${String(profile?.title || "")} / ${String(profile?.role || "")}
- Bio: ${bio || "(none)"}
- Goals: ${goals || "(none)"}
- Training notes: ${trainingCorpus.slice(0, 8000) || "(none)"}

MULTI-WAVE RESEARCH NOTES (60 unique queries — each wave explored a different angle):
${corpus}

STRUCTURE REQUIREMENTS:
1. First line: "# " + compelling title including ${dayStr}
2. "## Executive Summary" — 500-word narrative overview with key takeaways
3. "## Table of Contents" with all sections listed
4. Minimum **30** top-level ## sections organized into thematic parts:
   - Part I: Macro landscape & geopolitics
   - Part II: Sector-by-sector deep dives (one ## per industry)
   - Part III: Cross-sector patterns & convergences
   - Part IV: Opportunities, risks & action items for the reader
   - Part V: Forward-looking scenarios & predictions
5. Use ### liberally under each section for depth
6. Include at least 5 "🔍 Deep Dive" callout boxes (use > blockquotes)
7. Include at least 3 comparison tables
8. End with "## Sources & Verification" and "## Personal Action Items for [Name]"
9. Cite uncertainty — no fabricated statistics
10. Markdown only — no JSON
11. PUSH LENGTH: keep writing until you exhaust every angle from the research waves. Aim for maximum depth.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: `Write the complete ~50-page Markdown research pack now. Begin with the # title line. Write comprehensively with stories, examples, and deep analysis. Do NOT stop early — fill every section with rich narrative content.`,
        },
      ],
      temperature: 0.45,
      max_tokens: 65_536,
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
    const focusIndustries = Array.isArray(body.focusIndustries) ? body.focusIndustries.slice(0, 12) : [];
    const customFocus = typeof body.customFocus === "string" ? body.customFocus.trim().slice(0, 500) : "";

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
            error: "An extended research job is already in progress.",
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
          message: "Extended research started.",
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

      let industries = (profile?.industries_of_interest as string[] | null)?.slice(0, 12) ?? [];
      if (focusIndustries.length > 0) industries = focusIndustries;
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

        const query = buildUniqueQuery(step, industries, primary, job.geo_hint || geoHint, used, customFocus);
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
            message: `Research wave ${step + 1}/${EXTENDED_RESEARCH_STEPS} stored.`,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // step === EXTENDED_RESEARCH_STEPS → compile
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
          customFocus: customFocus || undefined,
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

    let industries = (profile?.industries_of_interest as string[] | null)?.slice(0, 10) ?? [];
    if (focusIndustries.length > 0) industries = focusIndustries;
    const primary = String(profile?.primary_market || "").trim() || geoHint;
    const bio = String(profile?.bio || "").slice(0, 800);
    const goals = Array.isArray(profile?.goals) ? (profile!.goals as string[]).join(", ") : "";
    const topicLine = industries.length ? industries.map((s) => s.replace(/-/g, " ")).join(", ") : "global markets, technology, policy";

    const focusNote = customFocus
      ? `\nSPECIAL FOCUS: The reader specifically wants to read about "${customFocus}". Make this the central theme while connecting to their broader context.\n`
      : "";

    let evidence = "";
    if (TAVILY_API_KEY) {
      const searchTopic = customFocus || `${primary} ${topicLine}`;
      const q1 = await tavilySearch(`breaking news analysis ${searchTopic} last 7 days`, TAVILY_API_KEY);
      const q2 = await tavilySearch(`macro economy ${searchTopic} sector outlook trends`, TAVILY_API_KEY);
      const q3 = await tavilySearch(`${searchTopic} opportunities innovation developments`, TAVILY_API_KEY);
      evidence = `${q1}\n\n${q2}\n\n${q3}`.slice(0, 32_000);
    } else {
      evidence = "(Limited: add TAVILY_API_KEY for fresher web grounding.)";
    }

    const dayStr = new Date().toISOString().slice(0, 10);

    const system = `You are Infinitygap's research editor. Write a SINGLE long-form Markdown document for ONE reader.

${focusNote}WRITING STYLE:
- Write in a NARRATIVE style — not dry summaries. Tell stories, use real examples, paint scenarios.
- Start with a compelling hook. Each section should open with something interesting — a story, a striking fact, a question.
- Include "What this means for YOU" analysis throughout.
- Add contrarian perspectives and debates where relevant.
- Use tables for comparisons, blockquotes for key insights.

READER CONTEXT:
- Geography/market: ${primary}
- Industries: ${topicLine}
- Role/title: ${String(profile?.title || "")} / ${String(profile?.role || "")}
- Bio: ${bio || "(none)"}
- Goals: ${goals || "(none)"}
- Private training notes: ${trainingCorpus.slice(0, 6000) || "(none)"}

FRESH WEB SNIPPETS:
${evidence}

DOCUMENT REQUIREMENTS:
1. Title line: first line must be "# " followed by a compelling title including ${dayStr}.
2. Use Markdown: ## and ### sections, bullet lists, **bold**, tables where helpful, > blockquotes for key insights.
3. Length: aim for 3,000-5,000 words minimum. Many ## sections with real depth.
4. Content: synthesize what matters for THIS person — with stories, examples, scenarios.
5. Include a "## What to watch this week" section with specific things to monitor.
6. Include a "## Sources & verification" section.
7. Do NOT fabricate statistics; when uncertain, say so.
8. No JSON — Markdown body only.`;

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
            content: `Write the full Markdown digest for ${dayStr} now. Be narrative, deep, and story-driven. Begin with the # title line.`,
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
