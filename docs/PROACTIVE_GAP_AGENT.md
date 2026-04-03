# Proactive Market-Gap Agent — deployment

## Overview

- **`proactive-gap-scanner`** (cron, every 4h): loads **active `subscriptions`**, pulls **`profiles`** + **`user_memory`**, runs **Tavily/X/browse** via `_shared/searchTools.ts`, calls **Lovable AI** with **`_shared/proactivePrompts.ts`**, applies **`_shared/guardrails.ts`**, inserts rows into **`proactive_gaps`**.
- **`multi-tool-search`**: HTTP wrapper around `runParallelSearches` (optional for debugging).
- **`gap-feasibility-engine`**: Hard guardrails + optional LLM score via Lovable.
- **`memory-manager`**: Authenticated **`user_memory`** inserts; optional **`OPENAI_API_KEY`** embeddings into **`memory_embeddings`** (pgvector).

## Secrets (Supabase → Edge Functions)

| Secret | Purpose |
|--------|---------|
| `LOVABLE_API_KEY` | Required for scanner + feasibility LLM. |
| `TAVILY_API_KEY` | Web search (recommended). |
| `TWITTER_BEARER_TOKEN` or `X_BEARER_TOKEN` | X recent search (optional). |
| `OPENAI_API_KEY` | Embeddings for `memory-manager` only (optional). |
| `GROK_API_KEY` | Not wired in code yet — add as optional provider later. |

## Database

1. Apply migrations (includes `vector`, `profiles` columns, `proactive_gaps`, `user_memory`, `memory_embeddings`, `proactive_search_cache`, cron job).
2. Set **`app.supabase_service_role_jwt`** for cron HTTP calls (see [cron-scheduling.md](./cron-scheduling.md)).

## Migrations

```bash
supabase db push
# or
supabase migration up
```

## Edge Functions

```bash
supabase functions deploy proactive-gap-scanner
supabase functions deploy multi-tool-search
supabase functions deploy gap-feasibility-engine
supabase functions deploy memory-manager
supabase functions deploy alfred-opportunities
```

## Frontend

- **`/my-desk`**: Pro users see **Proactive gaps** + **`mergeProactiveGaps: true`** on `alfred-opportunities` so proactive rows prepend to the deck.
- Free users see an upgrade prompt for proactive scanning.

## Guardrails

Defaults: **Kenya / online**, **max `profiles.max_startup_capital_usd`** (default 1000), **employ-people preference** in `profiles.prefers_business_that_employs`. Adjust in DB or extend Profile UI later.

## Manual test

Invoke scanner once (uses service role in cron; local test with service key):

```bash
curl -X POST "https://<PROJECT_REF>.supabase.co/functions/v1/proactive-gap-scanner" \
  -H "Authorization: Bearer <SERVICE_ROLE_JWT>" \
  -H "Content-Type: application/json" \
  -d "{}"
```
