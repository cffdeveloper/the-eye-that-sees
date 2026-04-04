# Infinitygap — Comprehensive narrative pitch (word deck)

*Purpose: single source you can compress into decks, DMs, investor notes, or influencer briefs. Figures below are grounded in the current product codebase and UI unless noted as directional marketing language.*

---

## 1. One-sentence essence

**Infinitygap is a subscription intelligence platform** that **ingests market and industry signal at scale**, **maps how money moves across sectors**, and **delivers structured research-style output**—live feeds, sector workspaces, cross-industry analysis, custom briefs, and a **personal opportunity desk**—so users get **actionable clarity** instead of an endless stream of disconnected headlines.

---

## 2. The problem we solve

| Pain | What breaks |
|------|-------------|
| **Fragmentation** | Serious readers juggle terminals, newsletters, social feeds, and national news—none of it stitched into **one coherent picture**. |
| **Volume without structure** | “More data” rarely means **better decisions**; people need **frameworks**, **relationships**, and **gaps**, not noise. |
| **Single-ticker thinking** | Real opportunities and risks often sit **between** industries (policy ↔ commodities ↔ finance ↔ logistics). Most tools optimize for **one** asset class or **one** sector. |
| **Time cost** | Building a private research stack (sources, alerts, notes) is a **job**—Infinitygap is built for people who want **operator-grade rhythm** without building a Bloomberg stack themselves. |

---

## 3. What Infinitygap is (product shape)

- **Web application** (React / Vite), **account-based**, **Pro** subscription via **Paystack** (hosted checkout, webhooks, subscription records in the database).
- **Backend** on **Supabase**: Postgres, Auth, **Edge Functions** (serverless) for ingestion, AI synthesis, payments, and scheduled jobs.
- **AI layer** via **Lovable’s AI gateway** (structured JSON, long-form briefs, chat-style flows)—used for intel generation, custom briefs, cross-industry synthesis, deep dives, and the **opportunity desk**—not a single generic chat bolt-on; it’s wired into **specific product surfaces** with **typed outputs** (e.g. metrics blocks, frameworks, steps, scores) where applicable.

**Positioning line (from marketing):** global market intelligence in **one command center**—not “another news app,” but a **desk** metaphor: aggregation, mapping, synthesis, follow-up.

---

## 4. Scale: industries, money flows, and “connections”

### 4.1 Industries & money-flow lanes (core taxonomy)

- The product ships a **first-class industry registry** in code (`industryData.ts`): **30 global sectors** (e.g. technology, financial services, energy, agriculture, trade & retail, transport & logistics, health, media, mining, climate, blockchain, etc.).
- Each sector is decomposed into **sub-flows**—explicit **money-flow and value-chain lanes** (e.g. MNO → mobile money → agent networks; or fab → brand → distributor → retailer).  
- **Count in repo:** on the order of **~170 distinct sub-flow rows** (each with keywords, descriptions, and `dataApis` hints such as stocks, news, commodities, funding).  
- **Marketing copy on the public landing** uses **“120+” capital lanes** as a rounded, user-facing label; the underlying model is **large and explicit**—this is a **differentiation**: we’re not “30 tickers”; we’re **30 sectors × many lanes** designed for **how capital actually moves**.

### 4.2 Data sources, APIs, and integrations (honest framing)

“Connections” here means **live and batch integrations across public APIs, open data, RSS, and third-party feeds**, orchestrated by **Edge Functions** and **scheduled collectors**—not a single vendor dashboard.

**Examples evidenced in code (non-exhaustive):**

| Area | Examples of what’s wired |
|------|---------------------------|
| **Live market feed (`intel-feed`)** | Crypto (e.g. **CoinGecko**-style pricing), forex (**open.er-api.com** / Frankfurter-style usage), commodities (**metals.dev** demo paths, fallbacks), **GDELT** for supply-chain / disruption article clusters, VC / risk panels as structured feed sections, **11+ source “types”** surfaced in the UI with **~60s refresh** semantics (exact cadence depends on deployment and caching). |
| **Macro ingestion (`data-collector`)** | Large scheduled job: **many countries** for **Google News RSS**, **GDELT**, **Reddit**, **YouTube**, **X/Twitter** (when bearer token configured), **Hacker News**, **Dev.to**, **GitHub** signals, **World Bank**-style series where applicable, plus industry-specific waves—designed to multiply **effective source count** per industry/sub-flow (the internal architecture comments describe **20–100+ effective combinations** per sub-flow when all channels are active—**directional engineering intent**, not a single static integer in the UI). |
| **Social / narrative (`social-intel`)** | X/Twitter (when secrets exist); synthesis into structured intel—**optional** depending on env. |
| **News** | `industry-news` and RSS/GDELT-backed flows. |
| **Global outlet registry (`globalSources`)** | **Comment in source:** registry oriented toward **1000+** outlet slots across regions (Google News country editions, domains, YouTube handles, subreddits)—**infrastructure for breadth**, with **per-run sampling** in collectors rather than “poll 1000 APIs every second.” |

**Marketing numbers used on the homepage** (for public storytelling): **“40+” integrated feed/source types** and **“120+” capital lanes**—aligned with **breadth + lane model**, while the **engineering implementation** emphasizes **parallel queries × geographies × keywords** to approximate “hundreds of thousands of connections” **over time** via **batching and rotation**, not one HTTP call per human click.

**Important nuance for investors/partners:** raw **API count** is the wrong metric; **coverage × refresh × dedupe × synthesis** is the right one. Infinitygap optimizes for **repeatable ingestion + structured output**, not a sticker chart of logos.

---

## 5. User-facing surfaces (how value shows up)

### 5.1 Dashboard

- **World map** and **geo-scoped intel** mental model; entry to **industry** and **sub-flow** routes; subscription state; wayfinding into deeper modules.

### 5.2 Industry & sub-flow workspaces

- Per **slug** and **sub-flow id**: intel **snapshots**, news, and deep content driven by **Edge Functions** + cached tables (`intel_snapshots`, etc.).  
- **Auto-intel** (scheduled) **rotates** industries/sub-flows so the product feels **alive** without manual refresh.

### 5.3 Live intel feed (`/intel`)

- **Panels** include crypto, forex, commodities, VC-style signals, supply-chain / disruption clusters, market signals, alerts.  
- **Free tier:** paywall / upgrade prompts. **Pro:** full feed.  
- UI copy: **“11+ sources”** in the feed header (aggregate of source families in the bundle).

### 5.4 Cross-industry (`/cross-intel`)

- Explicit **bridges, gaps, knock-on effects** across sectors—built for **systems thinking**, not single-name screens.

### 5.5 Infinity Lab / Custom intel (`/custom-intel`)

- User supplies **scope and context**; system returns **research-grade briefs** with **structured blocks**: metrics, comparisons, frameworks, insights, steps, scores—**exportable** (e.g. PDF pipeline elsewhere in product).

### 5.6 Opportunity desk (`/my-desk`)

- **Personalized opportunity deck** from **training notes** (local + optional server memory direction) + **geo** + **profile**.  
- **Cross-industry gap** framing; **deep-dive** per insight for Pro.  
- **Proactive gap agent** (where deployed): scheduled scanning, **guardrails** (e.g. region, capital limits), optional **multi-tool search** (e.g. Tavily) + merge into deck—**Pro**-oriented.

### 5.7 Saved / library

- Persisted intel and exports (patterns vary by feature—local + server).

### 5.8 Auth & profile

- Email/password; optional **Lovable** OAuth path.  
- **Profile**: goals, industries of interest, regions, onboarding, and (where migrated) **capital / monitoring** fields for proactive features.

---

## 6. Gaps: what we mean (product + philosophy)

1. **Market gaps** — pricing inefficiencies, timing windows, regulatory friction, **white space** between supply and demand.  
2. **Information gaps** — what **headlines don’t connect** (second-order effects, cross-border links).  
3. **Execution gaps** — what a **solo operator or small team** could validate next (especially emphasized on the **opportunity desk** with caveats—not financial advice).  

**Differentiation:** we don’t only label “bullish/bearish”; we push **relationships**, **constraints**, and **follow-up**—closer to **research desk output** than a sentiment widget.

---

## 7. How we’re different (competitive framing)

| Typical alternative | Infinitygap |
|---------------------|-------------|
| **Single-domain apps** (crypto-only, macro-only) | **Multi-sector map** + **cross-industry** mode + **money-flow decomposition**. |
| **Headline firehose** | **Structured intel** (blocks, snapshots, briefs) + **geo** + **user scope**. |
| **Generic ChatGPT tab** | **Productized workflows**: industry routes, feed, custom lab, **opportunity desk**, **scheduled** ingestion and snapshots. |
| **Enterprise-only terminals** | **Prosumer / serious individual** UX; **Paystack** billing; clear **Free vs Pro** split. |

**Moat (realistic):** not “secret data” alone—most sources are **public**. Moat is **orchestration + taxonomy (sectors/lanes) + synthesis UX + user memory + scheduling + vertical copy** tuned to **cross-domain** operators.

---

## 8. Business model

- **Subscription:** **Pro** is the full product; reference price in repo: **USD 30 / month** (`pricing.ts`)—confirm in-app before external commitments.  
- **Payments:** **Paystack** (initialize, verify, webhook Edge Functions).  
- **Free tier:** discovery and previews; **Pro** unlocks full feed, full desk, deep dives, and proactive features where enabled.

---

## 9. Technical credibility (for technical partners)

- **Supabase Edge Functions (Deno)** for **all** sensitive logic; secrets via **platform env**, not `VITE_*` in the browser.  
- **pg_cron + pg_net** for scheduled **data-collector** and **auto-intel** (requires DB JWT configuration per ops docs).  
- **Typed DB** client; **RLS** on user tables; **migrations** in repo.

---

## 10. Risks & disclosures (say them out loud)

- **Not financial advice**—education and research-style output; users must verify with professionals where relevant.  
- **Third-party dependencies:** APIs change rate limits; **X** requires tokens; **GDELT** is noisy; **commodity** endpoints may use demos/fallbacks—**production** requires monitoring and keys.  
- **AI quality** varies with prompts and models; **guardrails** and **human review** still matter for high-stakes decisions.

---

## 11. Elevator pitches (pick length)

**10 seconds:**  
*Infinitygap is one command center for global industry and market intelligence—live feeds, sector deep dives, cross-industry links, and a personal opportunity desk.*

**30 seconds:**  
*We map 30 sectors and 100+ capital lanes, pull signal from many public and feed sources, and synthesize structured intel—not just headlines. Pro users get the full live desk, custom briefs, and an AI opportunity desk tuned to their profile.*

**2 minutes:**  
Use sections **1, 4, 5, 7, 8** above.

---

## 12. Appendix — inventory-style fact sheet

| Item | Approximate / verified |
|------|-------------------------|
| **Sectors in registry** | **30** (explicit slugs in `industryData.ts`) |
| **Sub-flow / money-flow lanes** | **~170** rows in codebase; marketing may show **120+** |
| **Live feed “sources” (UI)** | **11+** aggregated families |
| **Marketing: feed integration types** | **40+** (landing copy) |
| **Pro price (code default)** | **$30/mo USD** — verify in live billing UI |
| **Payments** | **Paystack** |
| **Primary AI gateway** | **Lovable** (`LOVABLE_API_KEY` on Edge Functions) |
| **Core backend** | **Supabase** (Postgres, Auth, Edge Functions, cron) |

---

*Last aligned to repository concepts: product registry, intel-feed/data-collector patterns, marketing labels on `LandingPage`, `pricing.ts`, and `docs/AI_PROJECT_BRIEF.md`. Update this doc when pricing or public numbers change.*
