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

  const focusNote = customFocus
    ? `SPECIAL FOCUS TOPIC: "${customFocus}" — weave this theme throughout every section as the primary lens.\n`
    : "";

  const system = `You are Infinitygap's **head of research**. Produce an **institutional-grade extended intelligence pack** — the kind a strategy consulting team or sell-side research desk would circulate internally: dense, analytical, globally aware, and grounded in evidence.

${focusNote}TARGET SCALE: very long Markdown (~20,000–28,000 words target when possible). Think **sector primer + global macro cross-asset note + policy/regulatory scan**, NOT a novel, blog, or biography.

VOICE & TONE (critical):
- Third-person analytical voice ("The market…", "Policy makers…"). Professional memo style.
- **Do NOT** cast the reader as a fictional protagonist, use their first name in narrative scenes, or write cinematic "day in the life" prose.
- **Do NOT** invent named companies, products, deals, or statistics. If you lack a number, write "not disclosed in sources" or give a **qualitative** range and label it **indicative**.
- Ground claims in the MULTI-WAVE RESEARCH NOTES below. When you infer beyond them, prefix with **Analytical inference:** and keep it clearly labeled.
- Prefer **health systems, payer dynamics, biotech/pharma, medtech, public health, and digital health** angles when industries touch healthcare — treat them like market segments (demand, regulation, reimbursement, competition), not lifestyle copy.

WHAT "INTELLIGENT" MEANS HERE:
- **Global lens**: tie ${primary} and selected industries to **trade, rates/FX, commodities, geopolitics, cross-border regulation**, and major economies — not only one country unless the evidence is overwhelmingly local.
- **Analyst tables**: at least **4** Markdown tables (e.g. risk matrix, scenario summary, sector snapshot with drivers/headwinds, catalyst calendar).
- **Metrics mindset**: where possible discuss growth direction, funding climate, margin pressure, utilization, pricing, reimbursement — even qualitatively.
- **Debate & uncertainty**: include bull vs bear / optimist vs skeptic **as analytical positions**, not fictional characters.
- **Action**: concrete monitoring checklist and "what would change our view" — not motivational fluff.

READER (use lightly — mainly for one closing section):
- Primary market: ${primary}
- Industries: ${topicLine}
- Role: ${String(profile?.title || "")} / ${String(profile?.role || "")}
- Bio (reference briefly only where relevant): ${bio || "(none)"}
- Goals: ${goals || "(none)"}
- Training notes (themes only — do not quote verbatim at length): ${trainingCorpus.slice(0, 8000) || "(none)"}

MULTI-WAVE RESEARCH NOTES (60 Tavily-backed waves — primary factual substrate):
${corpus}

STRUCTURE (minimum **28** top-level ## sections). Suggested backbone — adapt titles to the sectors above:
1. "# " + professional title including ${dayStr}
2. "## Executive snapshot" — **tight**: 8–12 bullet **themes** + 1 short paragraph on overall risk posture (no storytelling hook).
3. "## Global macro & markets context" — rates, inflation/growth, FX, commodities, risk appetite as they relate to these sectors.
4. "## Geopolitics, trade & sanctions" — supply chain, localization, export controls where relevant.
5. "## Regulatory & policy watch" — health authorities, data privacy, digital health rules, reimbursement bodies as relevant.
6. "## Sector-by-sector analysis" — one ## per major industry in scope; each with ### Demand, ### Supply & capacity, ### Competition, ### Technology & innovation, ### Risks.
7. "## Healthcare & life sciences cross-cut" (if any health-related industry) — systems, payers, pharma/biotech/medtech, public health — **market structure**, not patient anecdotes.
8. "## Cross-sector themes" — AI, energy transition, labor, cybersecurity, etc., only as **industry drivers**.
9. "## Scenarios" — base / upside / downside with **triggers**, not fiction.
10. "## Catalysts to monitor" — dated where possible (quarters, policy milestones).
11. "## Key risks" — operational, regulatory, macro, technology.
12. "## Data gaps & unknowns" — what is missing from public sources.
13. "## Source material & methodology" — state clearly that synthesis is from web-research waves + model reasoning; no fake citations.
14. "## Implications for the reader" — **only section** that speaks directly to their role/goals in second person; max ~800 words.

FORMATTING:
- Markdown only. Use ### subsections liberally.
- Use **> blockquotes** for 4–6 "**Key research takeaway:**" one-liners (not emoji labels).
- No JSON.

LENGTH: exhaust the substance in the waves — maximal analytical depth, minimal prose padding.`;

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
          content: `Write the full extended Markdown pack now. Start with the # title line. Prioritize analyst-grade substance, global context, and evidence-grounded reasoning. Do not write novel-style scenes or personalized fiction. Fill all required sections with analytical depth.`,
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
      const q1 = await tavilySearch(`latest sector market developments ${searchTopic} last 14 days`, TAVILY_API_KEY);
      const q2 = await tavilySearch(`global macro policy regulatory outlook ${searchTopic}`, TAVILY_API_KEY);
      const q3 = await tavilySearch(`${searchTopic} competitive landscape investment funding trends`, TAVILY_API_KEY);
      evidence = `${q1}\n\n${q2}\n\n${q3}`.slice(0, 32_000);
    } else {
      evidence = "(Limited: add TAVILY_API_KEY for fresher web grounding.)";
    }

    const dayStr = new Date().toISOString().slice(0, 10);

    const system = `You are Infinitygap's research editor. Write **one** long-form Markdown **market & sector intelligence digest** for a professional reader.

${focusNote}STYLE (critical):
- **Analyst / memo tone**: clear, dense, global where relevant. NOT a novel, NOT a profile biography, NOT invented case studies with fake company names.
- **Do NOT** write the reader as a character in a story or use their name in narrative scenes. Use bio/role only to frame **Implications** at the end.
- Anchor claims in FRESH WEB SNIPPETS below; label stronger extrapolations **Analytical inference:**.
- Prefer: macro/regulatory/competitive **dynamics**, **risks**, **catalysts**, **metrics directions** (even qualitative). Healthcare content should read like **sector/market analysis** (payers, providers, policy, innovation), not lifestyle magazine copy.

READER CONTEXT (light touch):
- Geography/market: ${primary}
- Industries: ${topicLine}
- Role/title: ${String(profile?.title || "")} / ${String(profile?.role || "")}
- Bio: ${bio || "(none)"}
- Goals: ${goals || "(none)"}
- Private training notes (themes): ${trainingCorpus.slice(0, 6000) || "(none)"}

FRESH WEB SNIPPETS (evidence substrate):
${evidence}

DOCUMENT REQUIREMENTS:
1. First line: "# " + professional title including ${dayStr}.
2. Markdown: ## / ###, bullets, **bold**, ≥1 comparison **table**, > blockquotes for 3–5 "**Takeaway:**" lines.
3. Length: **3,000–6,000 words** target; many ## sections with analytical depth.
4. Required sections:
   - "## Executive snapshot" (bullets + short wrap)
   - "## Global & macro context" (how this ties to wider markets/policy)
   - "## Sector developments" (by theme or industry)
   - "## Risks & debates" (bull/bear or policy tension)
   - "## What to watch this week" (specific monitors)
   - "## Implications for your role" (second person OK **only here**)
   - "## Sources & methodology" (web snippets + reasoning; no fake URLs)
5. Do NOT fabricate statistics; when uncertain, say so.
6. No JSON — Markdown only.`;

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
            content: `Write the full Markdown digest for ${dayStr}. Begin with the # title. Deliver analyst-grade intelligence: global context, evidence-grounded analysis, minimal narrative padding.`,
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
