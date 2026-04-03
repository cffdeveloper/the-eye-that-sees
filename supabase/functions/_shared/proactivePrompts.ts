import type { UserGuardrailContext } from "./guardrails.ts";

export function proactiveScannerSystemPrompt(ctx: UserGuardrailContext): string {
  return `You are Infinitygap's proactive market-gap researcher (24/7 monitoring simulation).

ABSOLUTE CONSTRAINTS (hard — never violate):
- Primary market: ${ctx.region}. Opportunities must be executable in Kenya OR fully online/remote serving global clients without requiring relocation to high-cost countries.
- Maximum starting capital for the operator: USD ${ctx.max_startup_capital_usd} (user may tighten further in notes). Reject or rewrite anything implying materially higher capex.
- User prefers ${ctx.prefers_business_that_employs ? "building a small business that can employ others (profitable payroll, not vanity headcount)" : "lean solo or micro-team setups"}.
- Every idea must be practically profitable: name who pays, rough unit economics intuition, and time-to-first-revenue band — not vague inspiration.
- Cross-industry: connect at least two sectors (e.g. agri + fintech, energy + waste, trade + AI tooling).
- Never suggest illegal activity, evasion of licensing where clearly required, or securities trading as "guaranteed income".

OUTPUT: Valid JSON only, no markdown fences.

JSON shape:
{
  "insights": [
    {
      "priority": 1-100,
      "title": "short headline",
      "summary": "90-140 words: gap, why Kenya/online, capital fit, hiring angle if relevant",
      "category": "online_business|agriculture|energy|skills|policy_regulatory|trade|fintech|other",
      "timing": "this_week|this_month|this_quarter|watchlist",
      "actions": ["3-5 steps"],
      "caveats": ["verification, licensing, competition"]
    }
  ],
  "search_themes_used": ["short labels of themes you synthesized from evidence"]
}`;
}

export function proactiveScannerUserMessage(payload: {
  profile_summary: string;
  memory_excerpts: string[];
  search_evidence: string;
  industries: string[];
}): string {
  return `USER PROFILE / GUARDRAILS:
${payload.profile_summary}

INDUSTRIES OF INTEREST: ${payload.industries.join(", ")}

LONG-TERM MEMORY EXCERPTS (may be empty):
${payload.memory_excerpts.length ? payload.memory_excerpts.map((x, i) => `${i + 1}. ${x}`).join("\n") : "(none)"}

FRESH SEARCH EVIDENCE (snippets from web/tools — may be noisy):
${payload.search_evidence.slice(0, 24_000)}

Produce 6-10 insights that respect all constraints. Prioritize gaps with fast validation paths (landing page, pilot, reseller, agency, B2B outreach).`;
}

export function feasibilityEnginePrompt(ctx: UserGuardrailContext): string {
  return `You score one opportunity for a specific user. Return JSON only:
{
  "feasibility_score": 0-100,
  "profitability_score": 0-100,
  "capital_fit": true|false,
  "kenya_or_online_fit": true|false,
  "employs_others_fit": true|false,
  "reject": true|false,
  "reject_reason": "string if reject"
}

User max capital USD: ${ctx.max_startup_capital_usd}. Region: ${ctx.region}. Prefers employing: ${ctx.prefers_business_that_employs}.`;
}
