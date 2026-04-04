/**
 * Injected into Edge Function system prompts so outputs stay forward-looking.
 * Models otherwise hallucinate "upcoming 2024 cycle" style copy from stale training data.
 */

/** ISO timestamp for Supabase `.gte("created_at", …)` — only insights/signals after this are injected as context. */
export function recentInsightCutoffIso(daysBack: number): string {
  return new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();
}

/** Appended to user prompts so industry-scoped and cross-industry outputs share the same recency bar. */
export function recencyAnchoringUserLine(): string {
  const now = new Date();
  const iso = now.toISOString().slice(0, 10);
  const y = now.getUTCFullYear();
  return `Today's date (UTC): ${iso}. For "recent" developments, prioritize the current horizon (${y} and the ~12–18 months before ${iso}). If you cite older events, label them explicitly as historical context — do not treat years before ${y - 1} as the present market unless they describe a still-unfolding structural fact.`;
}

export function temporalIntelRules(): string {
  const now = new Date();
  const iso = now.toISOString().slice(0, 10);
  const y = now.getUTCFullYear();
  return `
TEMPORAL GROUNDING (mandatory — read before writing):
- Server "now" (UTC): ${iso}. Current calendar year: ${y}.
- Product positioning: this is a PREDICTIONS, FORECASTS, SCENARIOS, and MARKET / POLICY GAPS platform — not a retrospective news archive. Most of the value must be forward-looking: next 6–36 months, unresolved risks, emerging opportunities, structural white space, and testable hypotheses users can act on.
- Historical data, past election cycles, old filings, or prior-year headlines are CONTEXT ONLY. When you mention them, label explicitly: "historical (YYYY)", "completed cycle", or "pre-${y} backdrop". Never frame a past cycle as "upcoming", "this cycle", "anticipated", or "projected" unless you clearly mean a FUTURE cycle after ${iso}.
- Do NOT recycle generic training examples (e.g. a specific past national election) as if they were still in the future. Anchor political/regulatory discussion to the next relevant cycle or the current legislative/administrative reality as of ${y}.
- Keep three layers distinct: (A) recent verifiable developments with approximate timing, (B) forecasts and scenarios (mark as such), (C) historical reference only — never present (C) as live or breaking.
- RECENCY PARITY: Single-industry briefs and cross-industry briefs must feel **equally current**. Do not pack industry analysis with outdated training-era examples while cross-industry reads like ${y}; both should default to the same near-term horizon unless older material is explicitly labeled as history.
- PRIOR DATABASE SNIPPETS: If the prompt includes rows from intel_insights or raw_market_data, they may contain old dates. Use them only for continuity, trend, or contrast — never as the headline "latest news" unless the timestamp is clearly recent relative to ${iso}.
`.trim();
}
