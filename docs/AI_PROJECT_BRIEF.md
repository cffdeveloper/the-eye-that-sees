# Infinitygap — AI handoff brief

This document is written for **another AI assistant** (or a new engineer) that needs to understand **what Infinitygap is**, **how the codebase is organized**, and **what capabilities exist** without reading the entire repository. Treat it as orientation, not a substitute for reading the code when implementing changes.

---

## 1. Product identity

**Infinitygap** is a **B2C / prosumer web application** for **AI-powered market and industry intelligence**. Positioning (from marketing copy and UI):

- Tracks **many industries** and **money flows** (capital lanes, supply chains, sector dynamics).
- Surfaces **structured, actionable intel** — not only raw headlines — including **cross-industry** links, **gaps**, and **research angles**.
- Delivers **live market signals** (crypto, forex, commodities, VC, supply chain, etc.) where the user has **Pro** access.
- Offers **user-scoped “lab” experiences**: custom briefs, cross-industry scans, and a **personal opportunity desk** tuned to the user’s profile and training notes.

The **npm package name** in `package.json` is still `maverick-market-intel` (legacy). The **product brand in the UI** is **Infinitygap**.

---

## 2. What the user can do (high-level capabilities)

| Area | Capability |
|------|------------|
| **Auth & profile** | Email/password auth via Supabase; optional OAuth path via Lovable cloud auth (`src/integrations/lovable`). Profile stores goals, industries of interest, regions, onboarding state, etc. (`profiles` table / `AuthContext`). |
| **Dashboard** | Hub with world map of intel, links into industries, subscription state, trial showcase, and wayfinding into other product areas. |
| **Industry & sub-flow intel** | For each **industry** (slug) and **sub-flow** (money-flow lane), the app shows intel **snapshots**, news, and deep content driven by Edge Functions and cached data. Industry definitions live in `src/lib/industryData.ts` (large static config: keywords, money flows, APIs). |
| **Live intel feed** | `/intel` — aggregated **market feed** (crypto, forex, commodities, VC signals, supply chain, market signals, alerts). **Free users** see a **paywall**; **Pro** gets full feed. |
| **Cross-industry** | `/cross-intel` — analysis that connects sectors (bridges, gaps, knock-on effects). |
| **Infinity Lab (custom intel)** | `/custom-intel` — user provides scope/context; system generates **research-grade briefs** with **structured blocks** (metrics, comparisons, frameworks, insights, steps, scores). |
| **Saved library** | `/saved` — persisted intel / exports (local + server patterns depending on feature; see `savedIntelStorage` and related hooks). |
| **Opportunity desk** | `/my-desk` — personalized **opportunity deck** from user **training notes** + geo; **cross-industry gap** ideas; **deep-dive** per insight. UI uses the user’s **name from profile** (first name / display patterns in `src/lib/profileDisplayName.ts`). **Free** tier: truncated summary, limited insight cards, upgrade prompts; **Pro**: full deck + deep dives. Legacy URLs `/alfred` and `/jordan` redirect to `/my-desk`. |
| **Subscription** | **Paystack** (initialize, verify, webhook Edge Functions). `subscriptions` table; `useSubscription` hook exposes `isPro`, payment flow. |
| **Theme** | Light/dark via `next-themes` / `ThemeProvider`. |

---

## 3. Technical stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite 5, React Router 6, TanStack Query, Tailwind, shadcn-style UI (`src/components/ui`), Framer Motion, Leaflet maps, Recharts, html2pdf for PDF export, Vitest for tests. |
| **Backend** | **Supabase**: Postgres, Auth, Edge Functions (Deno), Storage as needed. |
| **AI / LLM** | Edge Functions call **Lovable’s AI gateway** using `LOVABLE_API_KEY` in **Edge Function secrets** (never in `VITE_*`). Various functions: intel generation, chat (`maverick-ai`), custom intel, cross-intel, deep dives, opportunity desk (`alfred-opportunities`, `alfred-deep-dive`), etc. |
| **Payments** | Paystack secret in Edge Functions; webhooks verify signatures. |
| **Hosting** | `render.yaml` exists for a static/web service pattern (build + `vite preview` style start). Env vars for Supabase **must** be set at build time for `VITE_*`. |

---

## 4. Repository layout (where to look)

| Path | Purpose |
|------|---------|
| `src/App.tsx` | Routes, auth gates, legacy redirects for opportunity desk. |
| `src/pages/` | Page components: Dashboard, Intel, CrossIntel, CustomIntel, Profile, Auth, Opportunity desk, etc. |
| `src/components/intel/` | Live feed panels, map, dialogs, news, social intel UI. |
| `src/components/layout/` | `AppLayout`, `TopBar`, `MobileBottomNav`, `appNavConfig` (nav labels include dynamic **desk** name from profile). |
| `src/contexts/AuthContext.tsx` | Session, `profiles` shape. |
| `src/contexts/GeoContext.tsx` | User geo context for intel scope. |
| `src/hooks/` | Data hooks: `useIntelFeed`, `useIndustryIntel`, `useSubscription`, `useSocialIntel`, etc. |
| `src/lib/` | Domain logic: `industryData`, `blockTypes`, `parseBlocks`, `alfredStorage` (local cache for opportunity desk training + insights), `assistantBranding`, `profileDisplayName`, `pricing`, etc. |
| `src/integrations/supabase/` | Typed Supabase client + DB types. |
| `src/lib/supabaseEnv.ts` | **Client-only** Supabase URL + anon/publishable key via `VITE_*`; surfaces `SUPABASE_ENV_ERROR` if missing. |
| `supabase/functions/` | One folder per Edge Function; each has `index.ts`. Shared code under `supabase/functions/_shared/`. |
| `supabase/migrations/` | SQL migrations: schema, RLS, **pg_cron** jobs calling Edge Functions. |
| `docs/cron-scheduling.md` | How scheduled `data-collector` + `auto-intel` work and required DB `app.supabase_service_role_jwt`. |

---

## 5. Backend: Edge Functions (inventory)

These are **deployed names** (folder names under `supabase/functions/`). All use **secrets** via `Deno.env.get`, not hardcoded keys in source.

| Function | Role (summary) |
|----------|----------------|
| `intel-feed` | Aggregates live market intel for the `/intel` dashboard. |
| `data-collector` | Scheduled ingestion into `raw_market_data` (many sources, countries, pruning). |
| `auto-intel` | Scheduled rotation: writes **intel snapshots** for industries/sub-flows. |
| `industry-intel` | Industry/sub-flow structured intel. |
| `industry-news` | News for industries. |
| `cross-intel` | Cross-industry analysis. |
| `custom-intel` | User-scoped custom briefs; structured blocks. |
| `deep-dive` | Deep-dive analysis (generic intel path). |
| `alfred-opportunities` | Opportunity desk **deck** generation (JSON), personalized with `addressAs` from client. |
| `alfred-deep-dive` | Per-insight **deep dive** (JSON). |
| `maverick-ai` | Chat / streaming AI (referenced in README). |
| `intel-capture` / `intel-analyzer` | Pipeline pieces for capturing and analyzing intel. |
| `social-intel` | Social signals + synthesis (uses X bearer etc. when configured). |
| `trial-showcase-intel` | Trial/demo intel generation. |
| `paystack-initialize` / `paystack-verify` / `paystack-webhook` | Subscription payment lifecycle. |

**Cron:** `pg_cron` + `pg_net` invoke `data-collector` and `auto-intel` on a schedule **after** DB JWT configuration (see `docs/cron-scheduling.md`).

---

## 6. Structured intel output (blocks)

Custom intel and similar flows parse **LLM JSON** into **typed blocks** (`src/lib/blockTypes.ts`, `parseBlocks.ts`, `BlockRenderer.tsx`):

- `metrics`, `comparison`, `framework`, `insights`, `steps`, `score` — each with a dedicated view under `src/components/blocks/`.

---

## 7. Authentication & subscription model

- **Supabase Auth** for sessions; **profiles** row per user (onboarding, preferences).
- **Pro** = `subscriptions.status === 'active'` (see `useSubscription.ts`).
- **Feature gating**: Components like `ProUpgradePrompt`, `SubscriptionGate`, `useIsFreeUser` limit live feed, opportunity desk depth, etc.

---

## 8. Environment & security (for implementers)

- **Browser bundle:** Only **`VITE_SUPABASE_URL`**, **`VITE_SUPABASE_PUBLISHABLE_KEY`** (and optional Google site verification, etc.) belong in the **client** build. They are **public** in the shipped JS.
- **Never** put **service role**, **Paystack secret**, **LOVABLE_API_KEY**, or **Twitter/X bearer** in `VITE_*`. Those belong in **Supabase Edge Function secrets** or DB settings for cron.
- **`.env`** is gitignored; **`.env.example`** documents variable **names** only.

---

## 9. Naming & legacy notes

- **URLs:** Personal desk is **`/my-desk`** and **`/my-desk/deep-dive/:insightId`** (`src/lib/assistantBranding.ts`).
- **Code:** Internal storage keys and Edge Function names may still use **`alfred`** prefixes (e.g. `alfredStorage.ts`, `alfred-opportunities`) — **product naming moved to “Opportunity desk” / profile-based labels**; do not assume a fixed persona name like “Jordan” in new UI.
- **Package name** `maverick-market-intel` is historical.

---

## 10. Testing & quality

- **Vitest** + Testing Library (`src/test/`, `vitest.config.ts`).
- **Playwright** config present for e2e (`playwright.config.ts`).
- **ESLint** via `npm run lint`.

---

## 11. What this document does not cover

- Exact **database schema** — read `supabase/migrations/` and `src/integrations/supabase/types.ts`.
- **Row-level security** policies — in migrations.
- **Every** UI string and marketing claim — use `src/pages/LandingPage.tsx` and product copy files as needed.

---

## 12. Quick mental model for an AI

> **Infinitygap** = Supabase-backed React app that combines **scheduled + on-demand data ingestion**, **LLM-generated structured intelligence** (industry, cross-industry, custom, personal opportunity), **maps and live feeds** for Pro users, and **Paystack subscriptions** — with a strong emphasis on **money flows**, **sectors**, and **actionable briefs** rather than unstructured news alone.

When in doubt, start from **`src/App.tsx` (routes)** → **`src/pages/*` (features)** → **`src/hooks/*` (data)** → **`supabase/functions/*` (server logic)**.

---

## 13. Proactive Market-Gap Agent (add-on)

**Pro** users get a **scheduled** (`pg_cron` every 4h) **`proactive-gap-scanner`** that writes rows to **`proactive_gaps`**, merges into **`alfred-opportunities`** when `mergeProactiveGaps` is true, and shows a **Proactive gaps** section on **`/my-desk`**. See **[PROACTIVE_GAP_AGENT.md](./PROACTIVE_GAP_AGENT.md)** and **[INFINITYGAP_PROACTIVE_UPGRADE_HANDOFF.md](./INFINITYGAP_PROACTIVE_UPGRADE_HANDOFF.md)**.
