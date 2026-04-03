# Infinitygap — Proactive Market-Gap Agent Upgrade (Handoff to Cursor AI)

## Product goal

Evolve Infinitygap into a **proactive 24/7 AI researcher** that continuously monitors many industries and cross-industry intersections, surfaces **low-capital** practical market gaps (default cap **&lt; ~$1,000 USD**, configurable per user in `profiles.max_startup_capital_usd`), and prefers ideas where the user can **build a profitable business that employs people** (not only solo gigs) when `profiles.prefers_business_that_employs` is true.

Focus geography: **Kenya and/or fully online / remote** opportunities — the system must **not** push ideas that violate the user’s real constraints (location, capital, skills, industries of interest, risk, training notes).

> **Note:** The full product vision includes “hundreds of thousands” of tool calls with heavy parallelization. The shipped implementation uses **batched queries**, **DB-backed search cache** (`proactive_search_cache`), and **per-run user limits** to stay within Edge timeouts; scale up gradually.

---

## Canonical codebase brief

See **[AI_PROJECT_BRIEF.md](./AI_PROJECT_BRIEF.md)** for stack, routes, Edge Functions inventory, and architecture.

---

## What was implemented (this upgrade)

| Piece | Location |
|-------|----------|
| DB: `vector`, `proactive_gaps`, `user_memory`, `memory_embeddings`, `proactive_search_cache`, profile columns | `supabase/migrations/20260402190000_proactive_market_gap_agent.sql` |
| Cron every **4 hours** | `supabase/migrations/20260402190100_schedule_proactive_gap_scanner.sql` |
| Shared guardrails + prompts + search | `supabase/functions/_shared/guardrails.ts`, `proactivePrompts.ts`, `searchTools.ts` |
| Edge: `proactive-gap-scanner`, `multi-tool-search`, `gap-feasibility-engine`, `memory-manager` | `supabase/functions/*/index.ts` |
| Merge proactive rows into deck | `supabase/functions/alfred-opportunities/index.ts` (`mergeProactiveGaps`) |
| UI: Proactive section + Pro merge flag | `src/pages/OpportunityDeskPage.tsx`, `src/hooks/useProactiveGaps.ts` |
| Deploy notes | [PROACTIVE_GAP_AGENT.md](./PROACTIVE_GAP_AGENT.md) |

---

## New capabilities (roadmap vs shipped)

| Capability | Status |
|------------|--------|
| Proactive cron scanner | Shipped (`proactive-gap-scanner`) |
| Multi-source search (Tavily + optional X + page fetch) | Shipped (`searchTools` + `multi-tool-search`) |
| Hard guardrails (Kenya/online, capital heuristics) | Shipped (`guardrails.ts`) |
| LLM personalization + JSON insights | Shipped (Lovable gateway) |
| pgvector + optional OpenAI embeddings | Shipped (tables + `memory-manager`; requires `OPENAI_API_KEY`) |
| Full tool-calling loop (LLM picks tools iteratively) | **Partial** — search is batched first, then one LLM synthesis pass |
| RAG retrieval over embeddings before every gap | **Partial** — memory text is passed; vector similarity search can be added |
| Grok API | **Not wired** — add optional env + branch in scanner |
| UI for `max_startup_capital_usd` / monitoring intensity | **DB defaults only** — add Profile fields later |

---

## Technical constraints (honoured)

- Backend: **Supabase Edge Functions (Deno)**.
- LLM: **Lovable AI gateway** (`LOVABLE_API_KEY`).
- Scheduling: **pg_cron + pg_net** + `cron_invoke_edge_function`.
- Opportunity desk JSON contract: **unchanged**; proactive rows use the same **`AlfredInsight`** shape inside `proactive_gaps.insight` and merge into `alfred-opportunities` responses when `mergeProactiveGaps: true`.
- **Pro-only** proactive UI and merge (free users see upgrade copy).

---

## Human follow-ups

1. Run migrations and deploy all new functions.
2. Set secrets: `TAVILY_API_KEY` (strongly recommended), optional X bearer, optional `OPENAI_API_KEY` for embeddings.
3. Add Profile UI sliders for capital / monitoring intensity when ready.
4. Optional: implement **true** iterative tool-calling (multi-turn LLM ↔ tools) and **vector similarity** RPC for RAG.
