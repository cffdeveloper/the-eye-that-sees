# Infinitygap: integrations, APIs, secrets, and cross-market / aviation partner playbook

This document describes how **Infinitygap** connects to external systems: data sources, AI gateways, payments, scheduling, and the React client. It is written for **operators** who deploy the stack and for **partner systems** (for example an aviation data platform) that want to **consume** or **enrich** the same intelligence layer and compare markets.

---

## Critical security note about API keys

**Do not paste real API keys, bearer tokens, or JWTs into any markdown file, wiki, or chat log that might be committed to git or shared broadly.**

- **Client (Vite)**: Only **public** values belong in `VITE_*` variables. They are embedded in the browser bundle.
- **Server (Supabase Edge Functions)**: All sensitive keys belong in **Supabase → Project Settings → Edge Functions → Secrets** (or `supabase secrets set ...`), **never** in `VITE_*`.
- **Database cron**: The service-role JWT for `pg_cron` → Edge Function calls is set via SQL (`app.supabase_service_role_jwt`). Treat it like a root credential.

This document lists **names** of secrets and **where** to obtain keys from vendors. Replace placeholders such as `<YOUR_LOVABLE_API_KEY>` locally in `.env` (gitignored) or in your host’s secret store only.

---

## High-level architecture

| Layer | Technology | Role |
|--------|------------|------|
| Frontend | React + Vite | UI, maps, dashboards, invokes Edge Functions with user JWT |
| Backend / DB | Supabase (Postgres, Auth, Storage, Realtime) | Persistence, RLS, PostgREST API |
| Compute | Supabase Edge Functions (Deno) | Ingestion, LLM orchestration, payments, admin |
| Scheduling | `pg_cron` + `pg_net` (when enabled) | Periodic `data-collector` and `auto-intel` (and other jobs per migrations) |
| AI | Lovable AI Gateway (`https://ai.gateway.lovable.dev/v1/...`) | Chat completions, structured JSON intel |
| Optional search | Tavily (`https://api.tavily.com/search`) | Web grounding for briefs, network events, proactive scanner |
| Payments | Paystack | Subscriptions and webhooks |

Data generally flows:

1. **Collect** → `raw_market_data` (and related tables) via `data-collector` and live fetches in `intel-feed` / `social-intel`.
2. **Synthesize** → LLM-backed Edge Functions write **`intel_snapshots`**, **`intel_insights`**, **`intel_matches`**, **`proactive_gaps`**, user briefs, etc.
3. **Serve** → Frontend reads via Supabase client (anon key + RLS) or invokes functions with the user’s session.

---

## Environment variables and secrets (inventory)

### Frontend — Vite (`VITE_*`)

Set in `.env` locally and in the hosting provider (e.g. Render) at **build time**.

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL, e.g. `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase **anon** (publishable) key for browser client |
| `VITE_SUPABASE_PROJECT_ID` | Optional; project ref for tooling/telemetry |
| `VITE_GOOGLE_SITE_VERIFICATION` or `GOOGLE_SITE_VERIFICATION` | Google Search Console HTML tag token (build injects meta) |

**Placeholder example (never use real values in docs):**

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-public-jwt-from-supabase-dashboard>
```

### Edge Functions — Supabase secrets (server-only)

Configured in **Supabase Dashboard → Edge Functions → Secrets** or CLI `supabase secrets set NAME=value`.

| Secret | Used for | Notes |
|--------|-----------|--------|
| `LOVABLE_API_KEY` | Primary LLM calls to Lovable gateway | Required for most AI features |
| `SUPABASE_URL` | Usually auto-injected | Project URL |
| `SUPABASE_ANON_KEY` | JWT verification in functions | Same value as publishable key; still server-side in functions |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role DB access | **Never** expose to browser |
| `TAVILY_API_KEY` | Tavily web search | Strongly recommended for daily brief / proactive / network-events paths |
| `TWITTER_BEARER_TOKEN` or `X_BEARER_TOKEN` | X/Twitter Recent Search v2 | Optional; improves social signals |
| `PAYSTACK_SECRET_KEY` | Paystack server verification | Webhooks and server calls |
| `PAYSTACK_PUBLIC_KEY` | Client checkout init (if used) | Public but often kept server-side for initialize flow |
| `OPENAI_API_KEY` | OpenAI Embeddings API | Optional; `memory-manager` → `memory_embeddings` (pgvector) |
| `SEMANTIC_SCHOLAR_API_KEY` | Semantic Scholar Graph API | Optional; higher rate limits in `data-collector` |
| `ALPHAVANTAGE_API_KEY` | Alpha Vantage equity/sector endpoints | Optional in `data-collector` |
| `FRED_API_KEY` | St. Louis Fed FRED | Optional macro series in `data-collector` |
| `OPENWEATHER_API_KEY` | OpenWeatherMap | Optional agricultural-city weather rows |
| `GROK_API_KEY` | Reserved / partial wiring | Referenced in `multi-tool-search` / `proactive-gap-scanner`; extend as needed |
| `GNEWS_API_KEY` | GNews paid tier | Registry entry in admin migrations; `industry-news` may use free tier pattern |
| `ADMIN_EMAIL` | Gate for `admin-api` | Must align with app admin constants |

**Placeholder block for a secure local reference file (not committed):**

```env
# Edge secrets — set in Supabase, not in Vite
LOVABLE_API_KEY=<from Lovable project secrets>
TAVILY_API_KEY=<from Tavily dashboard>
TWITTER_BEARER_TOKEN=<from X developer portal>
PAYSTACK_SECRET_KEY=<from Paystack dashboard>
OPENAI_API_KEY=<from OpenAI>
SEMANTIC_SCHOLAR_API_KEY=<from Semantic Scholar>
ALPHAVANTAGE_API_KEY=<from Alpha Vantage>
FRED_API_KEY=<from FRED>
OPENWEATHER_API_KEY=<from OpenWeatherMap>
```

### Database setting for cron (not `.env`)

| Setting | Purpose |
|---------|---------|
| `app.supabase_service_role_jwt` | JWT used by Postgres (`pg_net`) to invoke Edge Function URLs |

See `docs/cron-scheduling.md` for the exact `ALTER DATABASE` statement. **Never** commit the JWT string.

### Admin registry table

Migration `20260403120000_admin_dashboard.sql` seeds `public.api_integrations` with rows describing integrations (metadata + optional `secret_value` for admin UI). **RLS**: no policies for anon/auth users — intended for **service role / admin-api** only. Do not rely on this table as a public key store.

---

## Supabase Edge Functions (catalog)

Each function is deployed under `https://<project-ref>.supabase.co/functions/v1/<name>` unless otherwise configured.

| Function | Auth pattern (typical) | Primary responsibility |
|----------|-------------------------|-------------------------|
| `data-collector` | Service / cron | Mass ingestion into `raw_market_data`; prunes old rows (~3 days) |
| `auto-intel` | Service / cron | Rotates industries; writes `intel_snapshots` for global scope |
| `intel-feed` | Often open CORS | Live bundle: crypto, forex, commodities, GDELT routes, VC/market signals + DB blend |
| `intel-analyzer` | Service | LLM analysis pipeline |
| `intel-capture` | Service | Consolidates `intel_insights` / `intel_matches` via Lovable |
| `industry-intel` | User JWT | Per-industry structured intel; credits |
| `social-intel` | User JWT | Multi-platform social + synthesis; credits |
| `cross-intel` | User JWT | Cross-industry reasoning |
| `custom-intel` | User JWT | User-defined queries |
| `deep-dive` | User JWT | Deep dive on an insight |
| `maverick-ai` | User JWT | Chat / assistant style flows |
| `trial-showcase-intel` | Mixed | Trial / showcase generation |
| `alfred-opportunities` | CORS / JWT per config | Opportunity deck JSON; can merge proactive gaps |
| `alfred-deep-dive` | `verify_jwt = false` in config.toml | Deep dive for desk (CORS for local dev) |
| `network-events` | `verify_jwt = false` | Event-style intel with optional Tavily |
| `daily-read-brief` | `verify_jwt = false` | Long-form brief; optional Tavily waves |
| `proactive-gap-scanner` | `verify_jwt = false` | Scheduled proactive gaps |
| `gap-feasibility-engine` | User / service | Feasibility scoring + optional LLM |
| `memory-manager` | User JWT | User memory + optional embeddings |
| `multi-tool-search` | Service | Tavily + optional Grok plumbing |
| `paystack-initialize` | User JWT | Start payment |
| `paystack-verify` | User JWT | Verify transaction |
| `paystack-webhook` | Paystack signatures | Subscription lifecycle |
| `admin-api` | User JWT + email gate | Admin dashboard operations |

`supabase/config.toml` disables JWT verification for specific functions (e.g. `alfred-deep-dive`, `daily-read-brief`) — **rely on application-level checks** inside those handlers where implemented.

---

## External HTTP APIs and feeds (by subsystem)

### Lovable AI Gateway

- **Endpoint**: `https://ai.gateway.lovable.dev/v1/chat/completions`
- **Auth**: `Authorization: Bearer <LOVABLE_API_KEY>`
- **Usage**: Nearly all structured JSON generation (industry intel, cross-intel, desk, deep dives, auto-intel, intel-capture, analyzer, etc.)
- **Models**: Code references include e.g. `google/gemini-2.5-flash` (verify current gateway model IDs in Lovable docs).

### Tavily

- **Endpoint**: `https://api.tavily.com/search` (POST)
- **Auth**: API key in JSON body (`api_key`)
- **Usage**: `_shared/searchTools.ts`, `daily-read-brief`, `network-events`, `proactive-gap-scanner`, `multi-tool-search`

### X (Twitter) API v2

- **Endpoints**: `https://api.x.com/2/tweets/search/recent` and (in shared tools) `https://api.twitter.com/2/tweets/search/recent`
- **Auth**: Bearer token (`TWITTER_BEARER_TOKEN` / `X_BEARER_TOKEN`)
- **Usage**: `data-collector`, `social-intel`, `_shared/searchTools.ts`

### OpenAI (embeddings only in this repo)

- **Endpoint**: `https://api.openai.com/v1/embeddings`
- **Auth**: `Authorization: Bearer <OPENAI_API_KEY>`
- **Usage**: `memory-manager`

### Paystack

- **Usage**: Initialize, verify, webhook handlers under `supabase/functions/paystack-*`
- **Secrets**: `PAYSTACK_SECRET_KEY` (and public key where required)

### Market and macro data (representative list)

Many of these are **unauthenticated** or use optional keys. Implementations live primarily in `supabase/functions/data-collector/index.ts` and `supabase/functions/intel-feed/index.ts`.

| Provider | Example use |
|----------|-------------|
| CoinGecko | Crypto markets + trending |
| open.er-api.com | Forex (USD base) |
| api.metals.dev | Commodities (intel-feed uses demo key pattern) |
| api.gold-api.com | Precious metals |
| GDELT 2.0 DOC API | News/events, tone, supply chain, VC narratives |
| Google News RSS | Per-country search URLs |
| Reddit | `.json` hot feeds |
| YouTube | Channel RSS feeds |
| Hacker News Firebase API | Top stories + items |
| dev.to | Articles API |
| GitHub | Repository search |
| World Bank API | Indicators |
| Alpha Vantage | Gainers/losers, sectors (if key set) |
| FRED (St. Louis Fed) | Series observations (if key set) |
| UN Comtrade preview API | Trade flows |
| IMF DataMapper API | GDP growth projections |
| OpenWeatherMap | City weather (if key set) |
| Alternative.me | Fear & Greed |
| Open Food Facts | Product search |
| officeholidays.com ICS | Public holidays (Kenya example) |
| arXiv API | Preprints |
| Semantic Scholar Graph API | Paper search (optional API key) |
| Product Hunt | RSS fallback when GraphQL unauthenticated |
| GNews | `industry-news` function (free tier pattern in code) |

### News RSS (tier-1 and regional)

`data-collector` includes a large static catalog (BBC, CNN, Reuters, regional African/Asian/Middle East outlets, business/tech verticals). See `GLOBAL_NEWS_FEEDS` and related structures in `data-collector/index.ts` for the full list.

---

## Key database surfaces for intelligence

### `raw_market_data`

- **Purpose**: Append-only style store for collected signals (news, social, papers, macro snippets, etc.).
- **RLS**: Migration history includes **public SELECT** (“Anyone can read raw data”) and insert policies intended for collection pipelines — **confirm current policies** in your branch before exposing anon keys to partners.
- **Typical columns**: `source`, `data_type`, `geo_scope`, `payload` (JSON), `tags`, `industry`, timestamps (see migrations).

### `intel_snapshots`

- Cached LLM reports per scope (e.g. industry + `::global`).
- **Public read** policy exists in early migration; writes via service role / functions.

### `intel_insights`, `intel_matches`

- Used by `intel-capture` and related flows for consolidation and opportunity tracking.

### Proactive / desk

- `proactive_gaps`, `user_memory`, `memory_embeddings`, `proactive_search_cache` — see `docs/PROACTIVE_GAP_AGENT.md`.

### Payments / subscriptions

- Tables per `src/integrations/supabase/types.ts` (e.g. `subscriptions`, Paystack fields).

---

## How the frontend talks to the backend

- **Supabase JS client**: `src/integrations/supabase/client.ts` uses `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`.
- **Edge Functions**: `supabase.functions.invoke("function-name", { body })` with the user session sends the JWT (unless the function disables verify_jwt).
- **Admin**: `src/lib/adminApi.ts` invokes `admin-api` with the current user’s JWT; server checks admin email.

---

## Scheduling and throughput

- **Every ~5 minutes** (when configured): `data-collector` + `auto-intel` via `pg_cron` invoking Edge URLs with the service-role JWT.
- **auto-intel** processes **one top-level industry per tick** (each with all sub-flows), so a full industry cycle scales with industry count × interval.
- **Geo-scoped** snapshots are produced when users run geo-aware flows, not necessarily by `auto-intel` alone.

Details: `docs/cron-scheduling.md`.

---

## Partner playbook: aviation (or any vertical) data + cross-market insights

This section is for a **separate aviation system** that holds flight, route, fare, MRO, or airport data and wants to **combine** it with Infinitygap’s cross-market intelligence (macro, trade, tech, energy, geopolitics, supply chain chokepoints, etc.).

### 1. Clarify the trust boundary

| Integration style | Pros | Cons |
|-------------------|------|------|
| **A. Push into Infinitygap DB** (service role or dedicated Edge Function) | Single model for `raw_market_data` + same RLS/analytics | Requires API contract + auth between partners |
| **B. Pull from Infinitygap** (read-only API) | Partner keeps write path | Expose only what RLS allows; consider a **partner read role** |
| **C. Federated / event bus** | Loose coupling | More moving parts (queues, schemas) |

Recommended starting point: **B** (read anonymized/global signals) + **A** for a **narrow, validated** write path (Edge Function that validates a partner HMAC or mTLS).

### 2. Map aviation signals into `raw_market_data`

Use a consistent JSON shape in `payload` so downstream LLM prompts and dashboards can filter.

Suggested fields inside `payload` (illustrative):

```json
{
  "title": "NBO-JFK load factor vs jet fuel spot",
  "metric": "load_factor",
  "value": 0.81,
  "unit": "ratio",
  "route": "NBO-JFK",
  "period": "2026-03",
  "source_detail": "partner_aviation_warehouse_v1"
}
```

Suggested `tags` examples: `["aviation", "passenger", "route", "nbo"]`.

Set `data_type` to something explicit, e.g. `aviation_metric` or `mobility_signal`, and document it for your team.

### 3. Cross-market reasoning layers you can reuse

Once aviation rows exist in `raw_market_data`:

- **`intel-feed`** already blends **GDELT** + DB rows for market narratives — extend queries or add a **partner-specific** Edge Function that selects `data_type` in (`aviation_metric`, …) and merges with the same GDELT / macro sources.
- **`cross-intel`** (authenticated) is the natural place to ask: *“How do Red Sea shipping disruptions correlate with jet fuel and long-haul yields?”* if prompts include both aviation payloads and supply-chain signals.
- **`industry-intel` / `social-intel`**: Register aviation as an industry or sub-flow in the industry registry (see `auto-intel` industry list and `INDUSTRY_SOURCES` in `data-collector`) so keyword/RSS/GDELT/Twitter/YouTube collectors amplify **aviation-adjacent** global signals.
- **Proactive agent**: For Pro users, `proactive-gap-scanner` + Tavily can surface **external** regulatory or OEM news that your internal aviation DB might not capture.

### 4. External access patterns

1. **Supabase PostgREST** (anon key): Only if RLS explicitly allows the partner principal to `SELECT` required views. Prefer a **`SECURITY DEFINER` view** that exposes **aggregates** only.
2. **Dedicated Edge Function** `partner-aviation-bridge`:
   - Input: partner-signed JWT or HMAC headers.
   - Output: JSON aggregates from `raw_market_data` + latest `intel_snapshots` for scopes like `Aviation::global`.
3. **Export jobs**: Nightly CSV/Parquet to object storage (not in repo by default) if the partner wants warehouse sync.

### 5. Insight products the partner can build on top

| Product idea | Data inputs |
|--------------|-------------|
| **Route-level risk brief** | GDELT (geopolitics), fuel/commodity APIs, weather (OpenWeather if enabled), partner load factors |
| **OEM / regulatory watch** | Tavily + Lovable summarization over filings and news |
| **Competitive fare context** | Macro FX from open.er-api.com + regional news |
| **MRO supply chain** | Existing supply-chain GDELT routes in `intel-feed` + semiconductors / Taiwan Strait narratives |

### 6. Legal and compliance

- Respect **X/Twitter**, **YouTube**, **Reddit**, and **news site** terms; this app aggregates public signals — partners should confirm **redistribution** rights for their own product.
- **Paystack** and **EU/US** data rules may apply to user-linked data; keep aviation metrics **separate** from PII unless contracts allow merging.

---

## Operations checklist

1. Copy `.env.example` → `.env` for local Vite; set `VITE_SUPABASE_*`.
2. In Supabase, set **Edge Function secrets** (at minimum `LOVABLE_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY` as needed by functions).
3. Configure **cron** JWT per `docs/cron-scheduling.md` if you need automated ingestion.
4. Optionally set **TavILY**, **X bearer**, **OpenAI**, **FRED**, **Alpha Vantage**, **Semantic Scholar**, **OpenWeather** for richer collectors.
5. Deploy frontend (e.g. `render.yaml` pattern: `npm run build` + `npm run start`).
6. Verify function list matches `supabase/functions/*/index.ts` after local changes.

---

## File reference map

| Topic | Location |
|-------|----------|
| Client env validation | `src/lib/supabaseEnv.ts` |
| Supabase client | `src/integrations/supabase/client.ts` |
| Env template | `.env.example` |
| Data ingestion orchestration | `supabase/functions/data-collector/index.ts` |
| Live dashboard API | `supabase/functions/intel-feed/index.ts` |
| Tavily + X search helpers | `supabase/functions/_shared/searchTools.ts` |
| Cron setup | `docs/cron-scheduling.md` |
| Proactive agent | `docs/PROACTIVE_GAP_AGENT.md` |
| Project brief | `docs/AI_PROJECT_BRIEF.md` |
| Admin integration registry migration | `supabase/migrations/20260403120000_admin_dashboard.sql` |
| JWT verify exceptions | `supabase/config.toml` |

---

## Changelog suggestion

When you add a new vendor API or secret, update this document **and** the `api_integrations` seed list (if you use the admin registry) so operators have a single checklist — still **without** embedding real secret values.
