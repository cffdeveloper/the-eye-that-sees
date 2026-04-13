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
  let q = `${focus} ${ind.replace(/-/g, " ")} ${lens} ${primary} ${geo} market sector outlook policy data`.replace(/\s+/g, " ").trim();
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

  const trainingSlice = trainingCorpus.slice(0, 14_000);

  const focusNote = customFocus
    ? `SPECIAL FOCUS TOPIC: "${customFocus}" — weave this theme throughout every section as the primary lens.\n`
    : "";

  const system = `You are Infinitygap's **head of research**. Produce a **global intelligence gazette**: exhaustive, principal-level, and grounded in evidence — like a merged **sector primer + macro note + policy scan + cross-industry radar**.

${focusNote}HARD LENGTH FLOOR (non-negotiable):
- Output MUST be at least **10,000 words** of substantive prose (≈ **50 pages** at ~200 words/page). If you are under this, you have failed the task — keep writing until you exceed 10,000 words.
- Do not pad with repetition; add real sections, tables, scenario detail, and cross-industry linkages until the floor is met.

GAZETTE MINDSET — "tell me everything relevant":
- The reader expects to be **fully briefed** on what matters across **all industries listed below**, **globally**, with explicit links to **${primary}** where applicable.
- Continuously tie analysis back to the **TRAINING NOTES** (memory): themes, priorities, and constraints the user stored — this is their personalized spine; every major part should reflect how developments intersect **their** stated context (role, goals, geography).
- Synthesize across **waves** (web research) as your evidence base; label inference clearly as **Analytical inference:** when you go beyond snippets.

VOICE & TONE:
- Third-person analytical ("The market…", "Regulators…"). No novel scenes, no fictional named protagonists.
- Do **not** invent named companies, deals, or precise statistics. Use ranges, "reportedly", or "not disclosed in sources".
- Healthcare / regulated sectors: **market structure** (payers, reimbursement, compliance), not magazine lifestyle copy.

MARKDOWN FORMAT (critical — UI renders real bold, not asterisks):
- Use valid CommonMark only. For labeled bullets use: \`- **Label:** explanation\` on its own line.
- **Never** emit \`***\` triple-asterisk pseudo-bold. Never leave raw \`**\` visible — close all emphasis pairs.
- Use \`**bold**\` for emphasis; use \`##\` / \`###\` for headings.

GLOBAL + CROSS-INDUSTRY:
- Cover trade, FX/rates, commodities, geopolitics, sanctions, climate policy, tech regulation, and labor where waves support it.
- At least **5** Markdown tables (risk matrix, sector heatmap, scenario grid, catalyst list, etc.).

READER & PERSONALIZATION:
- Primary market: ${primary}
- Industries in scope (touch **each** materially, not one-line dismissals): ${topicLine}
- Role: ${String(profile?.title || "")} / ${String(profile?.role || "")}
- Bio: ${bio || "(none)"}
- Goals: ${goals || "(none)"}
- **Training notes (memory — integrate throughout, not only at end):**
${trainingSlice || "(none)"}

MULTI-WAVE RESEARCH NOTES (60 Tavily-backed waves — cite as substrate):
${corpus}

STRUCTURE (minimum **28** top-level ## sections). Include:
1. "# " + professional title with ${dayStr}
2. "## Executive snapshot" — dense bullets; map to user's training priorities.
3. "## How to read this gazette" — scope, geography, industries, data limits.
4. "## Global macro & markets"
5. "## Geopolitics, trade & supply chain"
6. "## Regulatory & policy watch"
7. "## Cross-industry synthesis" — forces tying sectors together.
8. One ## section per **major industry** in scope (substantive, not token).
9. "## Healthcare & life sciences cross-cut" if health-adjacent industries present.
10. "## Scenarios & stress cases"
11. "## Catalysts & calendar"
12. "## Risks & debates"
13. "## Data gaps"
14. "## Source material & methodology"
15. "## Implications for the reader" — second person; connect skills, goals, and training notes to actions (may exceed 800 words if needed for clarity).

FORMATTING: Markdown only; **> blockquotes** for "Key takeaway:" lines; no JSON.`;

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
          content: `Write the COMPLETE extended Markdown gazette now. First line must be the # title.

Requirements: (1) Minimum **10,000 words** — count mentally; do not stop short. (2) Valid Markdown bold only — use \`- **Label:**\` for lead-ins, never \`***\`. (3) Cover every industry in scope + global angles + training-note integration. (4) Ground claims in waves; mark **Analytical inference:** when needed.

Do not end until length floor is satisfied.`,
        },
      ],
      temperature: 0.32,
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

        // Obvious failure / empty compile (length target is enforced in the LLM prompt: ≥10k words)
        if (bodyMarkdown.length < 4_000) {
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
      const q1 = await tavilySearch(`latest sector market developments ${searchTopic} last 14 days`, TAVILY_API_KEY);
      const q2 = await tavilySearch(`global macro policy regulatory outlook ${searchTopic}`, TAVILY_API_KEY);
      const q3 = await tavilySearch(`${searchTopic} competitive landscape investment funding trends`, TAVILY_API_KEY);
      evidence = `${q1}\n\n${q2}\n\n${q3}`.slice(0, 32_000);
    } else {
      evidence = "(Limited: add TAVILY_API_KEY for fresher web grounding.)";
    }

    const dayStr = new Date().toISOString().slice(0, 10);

    const system = `You are Infinitygap's research editor. Write **one** Markdown **daily intelligence gazette** — comprehensive, global, cross-industry, personalized to the reader's training notes.

${focusNote}STYLE:
- Analyst / memo tone. NOT fiction. No fake company names or fabricated stats.
- Integrate **training notes** throughout (themes, priorities) — not only in the last section.
- Anchor claims in FRESH WEB SNIPPETS; use **Analytical inference:** when extrapolating.

MARKDOWN (critical for UI):
- Valid CommonMark bold: \`**phrase**\` or \`- **Label:** text\`. **Never** use \`***\` triple-star bullets. Close all \`**\` pairs.

READER:
- Geography/market: ${primary}
- Industries (address each with substance): ${topicLine}
- Role/title: ${String(profile?.title || "")} / ${String(profile?.role || "")}
- Bio: ${bio || "(none)"}
- Goals: ${goals || "(none)"}
- Training notes (memory): ${trainingCorpus.slice(0, 9000) || "(none)"}

FRESH WEB SNIPPETS:
${evidence}

DOCUMENT:
1. "# " + professional title including ${dayStr}.
2. Minimum **3,000 words**; aim **4,000–6,000** when evidence supports. Include ≥1 table.
3. Sections: "## Executive snapshot", "## Global & macro", "## Cross-sector & industry developments", "## Risks & debates", "## What to watch this week", "## Implications for your role", "## Sources & methodology".
4. No JSON.`;

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
            content: `Write the full Markdown digest for ${dayStr}. Begin with # title. Meet the word floor; use proper **bold** markdown; cover industries + global angles + training-note integration.`,
          },
        ],
        temperature: 0.35,
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
    if (bodyMarkdown.length < 2_000) {
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
