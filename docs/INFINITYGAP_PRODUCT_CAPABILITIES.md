# Infinitygap — Product capabilities (value surfaces)

This document describes **what the product does** in the authenticated app: routes, screens, UI building blocks, AI flows, training/memory, exports, and subscription boundaries. It **intentionally omits** marketing-only surfaces (landing, auth flows, password reset) except where they affect billing.

---

## 1. Route map (logged-in, `AppLayout`)

| Path | Page component | Primary purpose |
|------|----------------|-----------------|
| `/dashboard` | `Dashboard` | Hub: coverage stats, quick links, geo map, industry grid, Pro upsell / status, payment return handling |
| `/intel` | `IntelDashboard` | Live multi-source market feed (crypto, FX, commodities, VC, supply chain, signals) |
| `/cross-intel` | `CrossIntelPage` | One coordinated AI pass across **all** mapped industries for the selected geography |
| `/custom-intel` | `CustomIntelPage` | **Infinity Lab**: user-scoped briefs from primary/secondary money flows + free text + follow-up chat |
| `/my-desk` | `OpportunityDeskPage` | Personal opportunity desk: training notes, AI-ranked insights, proactive gaps (Pro), deep-dive links |
| `/my-desk/deep-dive/:insightId` | `OpportunityDeskDeepDivePage` | Long-form execution brief for a single desk insight (`alfred-deep-dive`) |
| `/industry/:slug` | `IndustryPage` | Sector workspace: AI industry brief, alerts, news, social, snapshots |
| `/industry/:slug/:subFlowId` | `SubFlowPage` | Lane (“money flow”) workspace: deep analysis, gaps, news, social, snapshots |
| `/saved` | `SavedLibraryPage` | Offline-capable **Saved** library (IndexedDB) + PDF export |
| `/profile` | `ProfilePage` | Identity, org, subscription, fields that tune copy/prioritization |

Legacy redirects: `/alfred`, `/jordan`, and their `deep-dive` URLs → `/my-desk` equivalents (`assistantBranding.ts`).

---

## 2. Cross-cutting behavior

### 2.1 Geography (`GeoContext`)

- A **geo scope** (global vs region string + stable `geoScopeId`) is shared across industry intel, sub-flow intel, cached intel, snapshots, cross-intel, custom intel, and desk flows.
- Changing region from the shell **invalidates relevance** of cached cross-industry output until refreshed.

### 2.2 Subscription (`useSubscription` / `useIsFreeUser`)

- **Pro** unlocks: live `intel-feed`, industry/sub-flow AI, cross-intel, Infinity Lab, deep-dive dialogs, full desk deep dives, saved library, and most AI panels.
- **Free** users see upgrade prompts (`ProUpgradePrompt`, `FullPagePaywall` on `/saved`) and reduced desk limits (see §8).
- **Paystack**: successful checkout can land on `/dashboard?payment=verify`; the dashboard reads `paystack_reference` from `localStorage` and calls `verifyPayment` on the subscription hook.

### 2.3 Structured content pipeline

1. **Model output** may include markdown plus fenced “block” segments.
2. **`parseBlocks`** (`src/lib/parseBlocks.ts`) scans for `:::metrics|comparison|framework|insights|steps|score` … `:::` and splits into `ContentSegment[]`.
3. **`BlockRenderer`** renders each segment: markdown (`react-markdown` + GFM) or a typed block component.

This pipeline is used anywhere long intel is shown as structured UI—notably **DeepDiveDialog**, **Infinity Lab** report, **Saved** detail view, and exports that clone DOM.

---

## 3. Dashboard (`/dashboard`)

### 3.1 Hero and personalization

- Greets by `profile.display_name` when set.
- Surfaces **role** and **organization** from profile (formatted from `profile.role`); copy explains these calibrate tone/depth and can be changed in Profile.
- Static copy from `dashboardIntelCopy` explains **coverage** and **capabilities** (`pageIntelMessages`).

### 3.2 Subscription card

- **Non-Pro**: price (`SUBSCRIPTION_USD_MONTHLY`), “Try it for free” opens `TrialShowcaseDialog`, and `UpgradeButton` for Paystack.
- **Pro**: renewal date from `subscription.current_period_end` when present.

### 3.3 Quick navigation

Primary CTAs: **Live feed** (`/intel`), **Cross-industry** (`/cross-intel`), **Infinity Lab** (`/custom-intel`).  
A four-card grid repeats those themes plus a deep-link into **Technology** sector as the default “deep dives” example.

### 3.4 “Live data pipeline” metrics

- Displays marketing-scale constants (**140+** sources, **30+** industries, **170+** money flows) plus **animated rolling numbers** for raw data / insights / matches (client-side random walk for visual energy—not a live backend counter).

### 3.5 Alerts toggle

- Uses `useAlertNotifications` to request **browser notification permission** when the user enables alerts.

### 3.6 Global coverage map

- **`DashboardIntelMap`**: Leaflet + OpenStreetMap; list/map of macro regions, optional geolocation for distances; ties into the same regional framing as cross-industry work (see component for markers/panels).

### 3.7 Industry grid

- Lists every entry in `industries` from `industryData.ts`, **sorted** with `profile.industries_of_interest` first when the user has picked interests.
- Each card shows icon, name, description snippet, **flow count**, and sample short names; links to `/industry/:slug`.

---

## 4. Live intel feed (`/intel`)

### 4.1 Purpose

Macro **tempo** before drilling into sectors: aggregated panels fed by the `intel-feed` Edge Function on a **60s** poll (`useIntelFeed`).

### 4.2 Hook behavior (`useIntelFeed`)

- If not Pro: no polling, loading ends quickly.
- If Pro: initial fetch + `setInterval` 60 000 ms; exposes `feed`, `loading`, `error`, `lastRefresh`, `refresh`.

### 4.3 UI composition

- **`PageIntro`**: narrative from `liveFeedIntelCopy`.
- **Header**: manual refresh (disabled for free), `SourcesStatus` when `feed.sources_status` exists.
- **Panels** (from `lib/intelTypes` / feed payload):
  - `AlertsBanner` ← `feed.alerts`
  - `CryptoPanel` ← `feed.intel.crypto`
  - `CommoditiesPanel` ← `feed.intel.commodities`
  - `ForexPanel` ← `feed.intel.forex`
  - `VCPanel` ← `feed.intel.vc_signals`
  - `SupplyChainPanel` ← `feed.intel.supply_chain`
  - `MarketSignalsPanel` ← `feed.intel.market_signals`
- Responsive grid: crypto and VC span multiple rows on xl breakpoints; market signals can span two columns.

### 4.4 Free vs Pro

- Free: single glass panel with `ProUpgradePrompt` listing multi-source value.
- Pro: full grid; errors show retry.

---

## 5. Industry sector page (`/industry/:slug`)

### 5.1 Data sources

| Concern | Hook / source | Notes |
|--------|----------------|-------|
| AI industry brief | `useIndustryIntel` + `useCachedIntel` | Keywords from all sub-flows; geo from `GeoContext` |
| News | `useIndustryNews` | Keyword-based articles |
| Social | `useSocialIntel` | Industry-level (no sub-flow) |
| Snapshots | `useSnapshots("industry", industry.name, geoScopeId)` | Timeline history |
| Copy | `getIndustryIntelCopy` | Per-sector intro in `PageIntro` |

### 5.2 Sections (typical order)

1. **Glass header**: icon, name, description, flow count.
2. **`PageIntro`**: sector-specific “why here” + links to Cross-intel, Live feed, Infinity Lab.
3. **`ClickableItem` — AI industry brief**: shows cached or live analysis snippet (`BlockMarkdown`); Pro-gated; opens **`DeepDiveDialog`** on click (invokes `deep-dive` Edge Function with topic + context + geo). Shows auto-intel timestamp when cached.
4. **Auto-detected alerts**: from `cachedReport.alerts` with severity styling (critical / warning / default).
5. **News**: `NewsFeed`.
6. **Social**: `SocialIntelPanel`.
7. **Partnerships / ecosystem** (if present in file).
8. **Snapshot timeline**: `SnapshotTimeline`.

Invalid slug → redirect to `/dashboard`.

---

## 6. Sub-flow (“money flow”) page (`/industry/:slug/:subFlowId`)

### 6.1 Data sources

| Concern | Hook |
|--------|------|
| AI analysis + gaps | `useSubFlowIntel` + `useCachedIntel` with scope key `industryName::subFlowName` |
| News / social | Keywords from **this** sub-flow; social gets `subFlowName` |
| Snapshots | `useSnapshots("subflow", scopeKey, geoScopeId)` |

### 6.2 UI highlights

- Breadcrumb back to sector; **Refresh** on analysis (respects Pro/loading).
- **Money flow** callout: the canonical `subFlow.moneyFlow` string.
- **AI deep analysis** in `ClickableItem` → `DeepDiveDialog` / `deep-dive`.
- **Gaps & opportunities**: list of `ClickableItem` per gap (each can open deep dive with gap detail).
- Additional sections mirror industry page (news, social, snapshots) with lane-specific context.

---

## 7. Cross-industry intelligence (`/cross-intel`)

### 7.1 Behavior

- **Pro-only** full page (`useSubscription`); free users see upgrade prompt.
- On load and on refresh: `supabase.functions.invoke("cross-intel", { body: { industries: [...], geoContext, geoScopeId } })` where `industries` is built from **all** `industryData` entries (names, sub-flow names, keyword samples).
- `useSnapshots("cross-industry", "all", geoScopeId)` for history.
- `useAlertNotifications(data?.alerts)` optionally surfaces OS notifications from returned alerts.

### 7.2 Typical layout

- Executive summary as **`ClickableItem`** (markdown summary).
- **`WorldMap`** visualization.
- **Cross-industry operators**, **deals** (when present): card grids with `ClickableItem` for detail.
- **Gaps**, **connections**, **alerts**: structured lists with markdown snippets.
- Snapshot timeline at bottom.

### 7.3 Types (`CrossIntelPage` local type)

Includes `cross_industry_players`, `deals`, `gaps`, `connections`, `alerts`, `summary`—the UI branches on optional arrays.

---

## 8. Infinity Lab — custom intel (`/custom-intel`)

### 8.1 Scoping model

- **Industry dropdown** → loads that industry’s sub-flows.
- **Pool / Primary / Secondary** sets of sub-flow keys (`buildSubFlowKey`, `customIntelTypes`): users move flows between buckets to tell the model what matters most vs supporting context.
- **Shuffle roles** randomly redistributes keys across primary/secondary (pool cleared).
- **Free text** + mode: `primary` vs `generic` (see `freeTextMode` in invoke body).
- **Money flow pick** (optional string) for extra narrowing.

### 8.2 Run brief

- **Pro gate** with toast if not Pro.
- Validates: at least one of free text **or** any sub-flow selected.
- Invokes **`custom-intel`** with:
  - `primarySubflows`, `secondarySubflows` (secondary includes pool in payload)
  - `freeTextPrimary`, `freeTextMode`
  - `geoContext`, `geoScopeId`

### 8.3 Output and chat

- Main **`report`** string stored in state; **`parseBlocks(report)`** → **`BlockRenderer`** for structured briefs.
- **Follow-up chat** (`sendFollowUp`): client builds a scope summary + user question; streams via `streamChat` (see `streaming.ts` for provider) to extend the session without replacing the geo/corpus model entirely in one shot.

### 8.4 Persistence and export

- **`SaveIntelButton`**: writes to IndexedDB via `savedIntelStorage` (source `custom_intel`).
- **`DownloadIntelPdfButton`**: targets a DOM node by `contentRootId` and calls `downloadIntelBriefPdf` (see §12).

---

## 9. Opportunity desk (`/my-desk`)

### 9.1 Concepts

- **Training notes** (local): `alfredStorage` — `appendTrainingEntry`, `loadTrainingEntries`, `getTrainingCorpus`.
- **Insights cache** (local): `saveInsightsCache` / `loadInsightsCache` — executive summary, ranked insights, disclaimer.
- **Server opportunities**: `supabase.functions.invoke("alfred-opportunities", { trainingCorpus, geoHint, addressAs, mergeProactiveGaps })`.
- **Proactive gaps** (Pro): `useProactiveGaps` reads `proactive_gaps` table (latest 20) with `insight` + `feasibility` JSON.

### 9.2 Insight shape (`AlfredInsight`)

- `id`, `priority` (1–100), `title`, `summary`, `category`, `timing`, `actions[]`, `caveats[]`.
- IDs are **deterministic** when needed (`deterministicInsightId`) so URLs remain stable across reloads.

### 9.3 Free vs Pro limits (desk)

- Constants in page: **`FREE_INSIGHT_LIMIT = 2`**, **`FREE_EXEC_SUMMARY_CHARS = 480`** — free users see truncated summary and only the first N insights; deep-dive links are replaced with upgrade copy.

### 9.4 UI flow

- **Train** dialog: append text notes; refreshes corpus used on next run.
- **Run / refresh insights**: calls `alfred-opportunities`, updates cache; toast on error.
- **Auto-run** option on first load (implementation detail in page) to populate empty cache.
- Cards: priority badge (Urgent / High / Medium / Watch), category, timing, summary, numbered actions, caveats.
- **Full deep dive** → `/my-desk/deep-dive/:insightId` (Pro).

### 9.5 Proactive gaps section

- When Pro: shows rows from `useProactiveGaps` with timestamps (`formatDistanceToNow`), links/feasibility summaries as implemented in the page.

---

## 10. Desk deep dive (`/my-desk/deep-dive/:insightId`)

### 10.1 Loading the seed

- Resolves `insight` via `findInsightById(loadInsightsCache(), insightId)` — **must have run desk at least once** with that insight in cache.

### 10.2 Analysis payload (`DeepDiveAnalysis` type in page)

Includes narrative and planning sections, for example:

- `userProfileMirror`, `executiveThesis`, `landscape`
- `crossIndustry[]` (industry, why it matters, link to idea)
- `gapBridges[]` (gap, underserved, how to fill, industries, difficulty)
- `positioningPlaybook`, `monetizationPaths[]`, `ninetyDayPlan[]`
- `risksMissteps[]`, `researchQueries[]`, `disclaimer`

### 10.3 Invocation

- `supabase.functions.invoke("alfred-deep-dive", { trainingCorpus, geoHint, addressAs, insightSeed: { title, summary, category, timing, ... } })`.

### 10.4 UX

- Back link to desk (`assistantHomePath`); external **research** link helper builds a Google query from title + category.
- Pro gate + loading states; manual refresh control.

---

## 11. Saved library (`/saved`)

### 11.1 Storage model (`savedIntelStorage.ts`)

- **IndexedDB** database `infinitygap_saved_intel_v1`, store `items`.
- Record: `id`, timestamps, `title`, `subtitle`, `source` (`trial_showcase` | `region_analytics` | `custom_intel` | `other`), `sourceDetail`, **`body`** (markdown + optional `:::` blocks).

### 11.2 UI

- **Pro-only** (`FullPagePaywall` if not Pro).
- Left: scrollable list with source labels; right: selected item rendered through **`parseBlocks` + `BlockRenderer`**.
- **Delete** with confirmation dialog.
- **`DownloadIntelPdfButton`** on the detail pane (requires a wrapper element with stable `id` matching the button prop).

### 11.3 Offline behavior

- Copy explains intel stays **on device**—no refetch, works after save without network.

---

## 12. PDF / “pitch deck” export (intel brief)

### 12.1 Entry points

- **`DownloadIntelPdfButton`**: finds `document.getElementById(contentRootId)`, calls `downloadIntelBriefPdf({ contentElement, documentTitle })`.
- Used from Infinity Lab, Saved library, and any view that wraps intel in an element with the expected id.

### 12.2 Mechanism (`exportIntelBriefPdf.ts`)

- Dynamic import **`html2pdf.js`** (html2canvas + jsPDF).
- Builds an off-DOM **`data-pdf-export`** wrapper (~740px wide) cloning the **content** node so Tailwind + block styles survive.
- **Theme**: reads `document.documentElement` for `dark` class → light vs dark palette for header rule, typography, table, pre, links; replaces problematic `backdrop-filter` on glass classes with solid card colors for canvas fidelity.
- **Header**: logo from `BRAND_LOGO_PATH`, brand line, **`documentTitle`** (default `"Intelligence Brief"`), subtitle line (currently `"Showcase intelligence brief"` in code—shared for all exports), **generated** local datetime.
- **Footer**: Infinitygap mark, confidentiality disclaimer, UTC timestamp.
- **Filename**: `Infinitygap-Intel-Brief-YYYY-MM-DD.pdf`.
- **Paper**: A4 portrait, margins 10 mm, JPEG images at 0.98 quality, html2canvas scale 2, pagebreak modes to reduce ugly splits.

### 12.3 Visual character

- Looks like a **branded brief**: top accent border, DM Sans / Inter stack, dense prose and tables inherited from `.pdf-export-blocks` and block components.
- **Not** a slide deck PDF—it's a **single- or multi-page document** export of the same content users read in-app (markdown + structured blocks).

---

## 13. Deep dive dialog (in-sector / cross-item)

- **`ClickableItem`** wraps any card; click opens **`DeepDiveDialog`**.
- On open, Pro users trigger **`deep-dive`** once with `topic`, `context`, `industryName`, `subFlowName`, `geoContext`, optional `socialIntelContext`.
- Response parsed with **`parseBlocks`** and rendered in a large modal (`max-w-4xl`, scrollable).

---

## 14. Block types and rendering

### 14.1 Markers

`:::metrics`, `:::comparison`, `:::framework`, `:::insights`, `:::steps`, `:::score` with JSON body between markers (`parseBlocks`).

### 14.2 Typed blocks (`blockTypes.ts`)

| Type | Purpose |
|------|---------|
| `metrics` | Label / value / trend / delta grid |
| `comparison` | Table + optional verdict |
| `framework` | titled framework with colored sections, items, optional status |
| `insights` | scored insight lines with tags |
| `steps` | phased steps with duration, tasks, status |
| `score` | headline score + breakdown categories |

Each maps to `components/blocks/*BlockView.tsx` via **`BlockRenderer`**.

### 14.3 Markdown segments

- `prose-infinitygap` styling: headings, lists with custom bullets, links, code, blockquotes, GFM tables where applicable.

### 14.4 Framework parsing resilience

- If JSON fails, raw content may fall back to fenced code text; `framework` has a **`parseLooseFrameworkObject`** path for partially malformed payloads.

---

## 15. Supporting intel components (non-page)

Examples referenced across industry/sub-flow/cross pages:

- **`NewsFeed`**, **`SocialIntelPanel`**, **`SnapshotTimeline`**, **`SourcesStatus`**, **`AlertsBanner`**, **`WorldMap`**, **`DashboardIntelMap`**
- **`BlockMarkdown` / `InlineMarkdown`** for lighter markdown than full `BlockRenderer`

---

## 16. Hooks catalog (product-relevant)

| Hook | Role |
|------|------|
| `useIntelFeed` | Poll `intel-feed` |
| `useIndustryIntel` / `useSubFlowIntel` | Sector/lane AI |
| `useCachedIntel` | DB-cached auto-intel reports |
| `useIndustryNews` | News articles |
| `useSocialIntel` | Social layer |
| `useSnapshots` | User/snapshot history |
| `useSubscription` / `useIsFreeUser` | Gating |
| `useProactiveGaps` | Desk proactive rows |
| `useAlertNotifications` | Browser notifications |
| `useGeoContext` | Geo string + scope id |

---

## 17. Edge Functions (feature mapping)

| Function | Product use |
|----------|-------------|
| `intel-feed` | Live dashboard feed |
| `industry-intel` | Sector AI brief |
| `industry-news` | News fetching (if called from hooks) |
| `social-intel` | Social panels |
| `cross-intel` | Cross-industry pass |
| `custom-intel` | Infinity Lab reports |
| `deep-dive` | Modal deep dives from ClickableItems |
| `alfred-opportunities` | Desk insight generation + optional proactive merge |
| `alfred-deep-dive` | Desk per-insight long brief |
| `auto-intel` | Background/cron intel refresh |
| `trial-showcase-intel` | Trial / showcase flows |
| `paystack-initialize` / `paystack-verify` / `paystack-webhook` | Billing |
| `memory-manager` | Server-side user memory (used by proactive / multi-tool flows) |
| `multi-tool-search` | Tool-augmented search |
| `gap-feasibility-engine` | Feasibility scoring for gaps |
| `proactive-gap-scanner` | Scheduled scanning (paired with DB migrations) |
| `intel-capture` / `intel-analyzer` / `data-collector` / `maverick-ai` | Pipeline / experimentation (wire per deployment) |

*(Exact orchestration is defined in each function’s `index.ts` and Supabase config.)*

---

## 18. Training & memory — two layers

### 18.1 Local (Opportunity Desk)

- **Storage keys**: `alfred_training_v1`, `alfred_insights_cache_v1` in `localStorage`.
- **Training**: ordered notes concatenated into `getTrainingCorpus()` and sent to `alfred-opportunities` and `alfred-deep-dive`.
- **Insights cache**: persists last run’s executive summary + insights for UI and deep-dive ID resolution.

### 18.2 Server (Proactive / memory stack)

- Migrations and functions implement **`user_memory`**, **`proactive_gaps`**, pgvector, and schedulers—**`useProactiveGaps`** exposes the latest rows to the desk UI when Pro.
- **`memory-manager`**, **`proactive-gap-scanner`**, **`gap-feasibility-engine`** participate in the server-side loop (scan → insight → feasibility), complementing desk training rather than replacing it.

---

## 19. Profile (`/profile`) — product-relevant fields

- **display_name**, **full_name**, **organization**, **title**, **bio**, **avatar_url** — persisted to `profiles`.
- **`industries_of_interest`** lives on the profile row and is used on the **Dashboard** to sort industry cards first; it is **set during onboarding**, not on this page.
- **`role`** (and related onboarding fields) may still influence copy elsewhere when present—Dashboard surfaces role/org when set.
- Geography is **not** edited here (shell / geo picker).
- Subscription management: Pro status, renewal info, upgrade, Paystack billing copy, downgrade messaging (support contact).

---

## 20. Content scale reference (`industryData.ts`)

- The dashboard computes **`industries.length`** sectors and **`totalFlows`** = sum of `subFlows.length` across all industries (UI shows this in the industry grid header).
- Each **SubFlow** carries: `id`, `name`, `shortName`, `description`, **`moneyFlow`**, **`keywords`**, **`dataApis`**.

---

*This document reflects the repository structure and key files under `src/pages`, `src/components`, `src/lib`, `src/hooks`, and `supabase/functions`. For business positioning, see `docs/INFINITYGAP_COMPREHENSIVE_PITCH.md`; for engineering onboarding, see `docs/AI_PROJECT_BRIEF.md` and migration notes under `supabase/migrations`.*
