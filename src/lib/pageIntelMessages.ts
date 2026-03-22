import type { Industry, SubFlow } from "@/lib/industryData";
import { industries } from "@/lib/industryData";

/** Value copy for PageIntro-style blocks: eyebrow, title, body (use \\n\\n for paragraph breaks). */
export type PageValueBlock = {
  eyebrow: string;
  title: string;
  body: string;
};

/** Dashboard hero — replaces generic “Coverage / What you can do” paragraphs. */
const flowCount = industries.reduce((n, i) => n + i.subFlows.length, 0);

export const dashboardIntelCopy = {
  coverage: `Maverick AI is your proactive intelligence desk: it continuously ingests markets, macro, news, and social signals—mapped to ${industries.length} industries and ${flowCount} money flows—so you see where supply, regulation, and demand misalign before they become obvious in spreadsheets.`,
  capabilities: `Use the Live feed for a cross-asset pulse; Cross-industry to spot bridges and gaps between sectors; Intel Lab for briefs scoped to the flows you choose; open any industry or money-flow lane for deep analysis, alerts, and snapshot history. Geography and profile settings tune what rises to the top.`,
} as const;

export const liveFeedIntelCopy: PageValueBlock = {
  eyebrow: "Live market pulse",
  title: "What this feed does for you",
  body: `This page streams a cross-asset snapshot—crypto, FX, commodities, VC, supply chain, and headline risk—in one place so you can orient fast before you drill into a sector.\n\nMaverick AI pulls from multiple live sources (refresh on a short cadence), highlights dislocations and follow-on questions, and keeps the view current as prices and flows move. Pair it with a specific industry lane or Intel Lab when you need depth, not just tempo.`,
};

export const crossIndustryIntelCopy: PageValueBlock = {
  eyebrow: "Strategic mesh",
  title: "Why run a cross-industry pass",
  body: `Single-sector views can miss second-order links. Here, Maverick AI compares mapped industries and capital lanes for your geography to surface gaps, deals, bridges, and alerts that only appear when sectors are read together.\n\nIt is built for “what breaks if this moves?” questions—regulatory spillovers, shared suppliers, funding contagion, and demand knock-ons—then keeps the synthesis tied to the region you set in the top bar.`,
};

export const intelLabIntelCopy: PageValueBlock = {
  eyebrow: "Scoped research",
  title: "What Intel Lab is for",
  body: `Intel Lab is where you define the thesis: promote money flows to Primary (the main story) and Secondary (context), add free-text on a deal, client, or question, and Maverick AI returns a structured brief—then chat in-scope for follow-ups.\n\nIt complements the Live feed (speed) and Cross-industry (breadth) with depth you control, using the same block style as industry and flow pages so outputs stay comparable.`,
};

/** One opening line per industry id — sets domain tone before sub-flow specifics. */
const INDUSTRY_VOICE: Record<number, string> = {
  1: "Technology and software reward timing: product cycles, funding, and supply chains can diverge fast.",
  2: "Telecommunications sit at the intersection of infrastructure spend, regulation, and everyday behavior.",
  3: "Financial services turn on rates, risk, liquidity, and policy—small shifts can reprice whole markets.",
  4: "Energy lanes track physical supply, policy, and weather—gaps often show up before spot prices fully adjust.",
  5: "Agriculture and food tie weather, inputs, logistics, and consumer demand into one fragile chain.",
  6: "Real estate and construction move on land, credit, materials pricing, and execution risk.",
  7: "Trade and retail are margin games: inventory, route-to-market, and consumer confidence must align.",
  8: "Transport and logistics convert macro stress into delays, rates, and port-level bottlenecks.",
  9: "Health and pharma hinge on regulation, access, and clinical reality—headlines and outcomes often diverge.",
  10: "Education balances policy, demographics, and delivery models—capital follows enrollment and outcomes.",
  11: "Media and entertainment monetize attention; rights, platforms, and regulation reshape who captures value.",
  12: "Hospitality and tourism swing on mobility, safety perception, and disposable income—all at once.",
  13: "Mining and resources tie geology, price decks, and ESG constraints into long-cycle bets.",
  14: "Water and environment work are infrastructure-plus: pricing, climate, and compliance move together.",
  15: "Professional services sell judgment and trust—revenue follows cycles, regulation, and deal flow.",
  16: "Fashion and textiles span farm gate to shelf—input costs and trade policy hit margins unevenly.",
  17: "Automotive links import rules, financing, energy transition, and after-sales ecosystems.",
  18: "Aerospace and defence combine long programs, procurement, and geopolitical risk.",
  19: "Consumer electronics ride product cycles, distribution, and repair ecosystems.",
  20: "Chemicals and petrochemicals sit upstream of almost every physical industry—feedstock stress propagates wide.",
  21: "Politics and government set the rules: elections, legislation, and procurement reshape markets.",
  22: "Climate and sustainability bridge policy, capital markets, and physical risk on the ground.",
  23: "Sports and leisure blend media rights, consumer spend, and regulation of wagering and events.",
  24: "Non-profit and development work track donor cycles, delivery risk, and geopolitical access.",
  25: "Shipping and maritime translate global demand into freight rates, port choke points, and hull risk.",
  26: "Creative and design economies monetize IP, talent, and distribution—often before scale shows in KPIs.",
  27: "Religious and faith organizations blend community economics, media, and philanthropy.",
  28: "Gambling and betting are regulated velocity businesses—policy and tech change the odds for operators.",
  29: "Blockchain and digital assets sit at the edge of finance, law, and infrastructure—narrative and regulation move first.",
  30: "Personal and household services track labor, trust, and urbanization—fragmented but locally decisive.",
};

function describeApis(apis: string[]): string {
  const map: Record<string, string> = {
    stocks: "equity and market data",
    news: "news wires and sector headlines",
    commodities: "commodity benchmarks",
    forex: "FX and rates",
    funding: "funding and venture signals",
    crypto: "digital-asset markets",
    rates: "rates and curves",
    weather: "weather and climate inputs",
    flights: "aviation and mobility data",
  };
  const parts = apis.map((a) => map[a] || a).filter(Boolean);
  if (parts.length === 0) return "curated market and news inputs";
  if (parts.length === 1) return parts[0];
  return parts.slice(0, -1).join(", ") + ", and " + parts[parts.length - 1];
}

/**
 * Composes a unique message per money-flow lane using sector voice + flow metadata.
 * Each page gets different wording because name, description, keywords, and APIs differ.
 */
export function buildSubFlowIntelCopy(industry: Industry, subFlow: SubFlow): PageValueBlock {
  const voice = INDUSTRY_VOICE[industry.id] ?? `${industry.name} is a mapped sector in Maverick AI’s global mesh.`;
  const desc = subFlow.description.trim();
  const descSentence = desc.endsWith(".") ? desc : `${desc}.`;
  const apis = describeApis(subFlow.dataApis);
  const kw = subFlow.keywords.slice(0, 8).join(", ");
  const body = `${voice}

You opened the ${subFlow.name} lane in ${industry.name}. ${descSentence}

Here is how money is intended to move in this lane: ${subFlow.moneyFlow}. Maverick AI uses that path as a scaffold—so alerts, gaps, and briefs refer to real stages (who pays whom, who holds risk, who regulates) rather than abstract “sector sentiment.”

Maverick AI connects ${apis} to news and social signals around ${kw} for your geography. It highlights where those stages stop lining up; suggests what to validate next (capacity, policy, credit, or demand); and refreshes this lane as new data lands.

Use the structured brief below for synthesis, the news and social panels for tempo, and snapshots for how this flow evolved over time.`;

  return {
    eyebrow: `${subFlow.shortName} · ${industry.icon}`,
    title: `${subFlow.name} — how Maverick AI helps you on this money flow`,
    body,
  };
}

/** Hand-written sector workspace copy — one block per industry slug. */
export const industryIntelBySlug: Record<string, PageValueBlock> = {
  technology: {
    eyebrow: "Sector workspace · Technology",
    title: "Why Technology & Software intel here",
    body: `From semiconductors to SaaS, this sector runs on product velocity, funding cycles, and fragile supply chains. Maverick AI ingests market, news, and social layers across every mapped flow so you catch pricing gaps, platform policy shifts, and competitor moves—not just ticker commentary.\n\nOpen each money flow for lane-specific analysis: where demand, capacity, and regulation misalign, and what to monitor next as releases and earnings land.`,
  },
  telecommunications: {
    eyebrow: "Sector workspace · Telecoms",
    title: "Why Telecommunications intel here",
    body: `Coverage, spectrum, data pricing, and mobile money sit on the same physical network. Maverick AI pulls cross-source signal so you see when infrastructure spend, regulation, or consumer stress diverge—before churn or ARPU shifts show up in one headline.\n\nEach flow below isolates a revenue path—MNO, distribution, towers, ISP, or digital payments—so you can compare how value moves from spectrum to handset.`,
  },
  "financial-services": {
    eyebrow: "Sector workspace · Finance",
    title: "Why Financial Services intel here",
    body: `Rates, credit, FX, and policy interact here: a move in one lane reprices others fast. Maverick AI aggregates markets, macro, and news so you spot where spreads, funding conditions, or consumer stress imply gaps worth digging into—across banks, markets, fintech, and insurance.\n\nUse individual flows to stress-test how capital actually moves for your geography, not just how products are marketed.`,
  },
  energy: {
    eyebrow: "Sector workspace · Energy",
    title: "Why Energy intel here",
    body: `Physical supply, policy, and weather meet price decks. Maverick AI tracks commodities, utilities, and headline risk together so you see when grid stress, fuel imports, or renewable rollouts imply bottlenecks—or when carbon and transition policy create new arbitrage.\n\nEach flow isolates a different path from resource to bill—from oil & gas to mini-grids—so you can connect local reality to global benchmarks.`,
  },
  agriculture: {
    eyebrow: "Sector workspace · Agriculture",
    title: "Why Agriculture & Food intel here",
    body: `Inputs, weather, logistics, and retail margins stack on top of each other. Maverick AI merges commodity, news, and social signal so you catch early stress in fertilizers, cold chain, or export windows—not just spot prices.\n\nOpen a flow to see where the chain binds: farmer credit, processing capacity, or consumer demand, with alerts as conditions shift.`,
  },
  "real-estate": {
    eyebrow: "Sector workspace · Real estate",
    title: "Why Real Estate & Construction intel here",
    body: `Land, credit, materials, and labor have to clear at the same time for projects to work. Maverick AI surfaces when policy, rates, or input costs pull development and transaction markets in different directions.\n\nEach money flow tracks a distinct path—development, contracting, materials, agencies—so you can separate cyclical noise from structural stress.`,
  },
  "trade-retail": {
    eyebrow: "Sector workspace · Trade & retail",
    title: "Why Trade, Retail & FMCG intel here",
    body: `Route-to-market and consumer confidence can diverge sharply. Maverick AI ingests channel, pricing, and headline risk so you see where inventory, e-commerce, or informal trade imply gaps before same-store trends do.\n\nFlows cover distribution, marketplaces, franchise retail, and informal trade—each with its own margin logic.`,
  },
  "transport-logistics": {
    eyebrow: "Sector workspace · Transport",
    title: "Why Transport & Logistics intel here",
    body: `Freight rates, fuel, ports, and last-mile labor convert macro shocks into operational reality. Maverick AI ties mobility and trade headlines to flow-level stress so you can see choke points—not only indices.\n\nPick road, sea, air, rail, clearing, or 3PL lanes to compare how cost and time stack for your region.`,
  },
  health: {
    eyebrow: "Sector workspace · Health",
    title: "Why Health & Pharmaceuticals intel here",
    body: `Access, regulation, and clinical evidence move on different clocks. Maverick AI blends market and news layers so you see where reimbursement, supply, or digital adoption create tension—across pharma, providers, diagnostics, and payers.\n\nEach flow focuses a different revenue and risk path so you can separate headline risk from delivery reality.`,
  },
  education: {
    eyebrow: "Sector workspace · Education",
    title: "Why Education intel here",
    body: `Enrollment, affordability, and delivery models are under pressure everywhere. Maverick AI tracks policy, funding, and consumer signal so you spot stress in private schools, EdTech, universities, or vocational paths—not just enrollment statistics.\n\nFlows isolate how money moves from student to institution to outcome, including study-abroad and corporate training.`,
  },
  "media-entertainment": {
    eyebrow: "Sector workspace · Media",
    title: "Why Media & Entertainment intel here",
    body: `Attention is the product; rights, platforms, and ad markets set who gets paid. Maverick AI aggregates news and social layers so you catch format shifts, regulatory pressure, and sponsor risk across TV, digital, music, film, gaming, and events.\n\nEach flow tracks a different monetization path—from broadcast to creator economy to OOH.`,
  },
  "hospitality-tourism": {
    eyebrow: "Sector workspace · Hospitality",
    title: "Why Hospitality & Tourism intel here",
    body: `Mobility, safety perception, and FX move bookings before RevPAR charts update. Maverick AI merges travel, consumer, and policy signal so you see when routes, visas, or local spend imply opportunity or fragility.\n\nFlows separate hotels, safaris, food service, OTAs, short-lets, and MICE—each with distinct working capital and seasonality.`,
  },
  mining: {
    eyebrow: "Sector workspace · Mining",
    title: "Why Mining & Natural Resources intel here",
    body: `Geology, price decks, and ESG constraints define long-cycle risk. Maverick AI tracks commodities and headline risk so you see when grades, logistics, or policy threaten production—not just spot prices.\n\nFlows cover large-scale mining, ASM/gems, quarries, and processing—each with different capex and community exposure.`,
  },
  "water-environment": {
    eyebrow: "Sector workspace · Water & environment",
    title: "Why Water & Environment intel here",
    body: `Water, waste, and climate adaptation are infrastructure problems with pricing and politics layered on top. Maverick AI surfaces stress in supply, collection, irrigation, and carbon forestry so you catch gaps before crises make headlines.\n\nEach flow maps a different path from source to value or mitigation.`,
  },
  "professional-services": {
    eyebrow: "Sector workspace · Prof. services",
    title: "Why Professional Services intel here",
    body: `Revenue follows deal flow, compliance load, and corporate budgets. Maverick AI ties macro and sector news so you see when legal, audit, consulting, HR, marketing, engineering, or research spend is likely to inflect.\n\nFlows reflect how fees and utilization actually accrue—not generic “services GDP.”`,
  },
  "fashion-textiles": {
    eyebrow: "Sector workspace · Fashion",
    title: "Why Fashion & Textiles intel here",
    body: `Cotton, labor, trade rules, and brand distribution stack into thin margins. Maverick AI tracks commodity and trade headlines alongside consumer signal so you see when input costs or route-to-market break symmetry.\n\nFlows span textiles, mitumba, brands, and leather—each with distinct sourcing and retail risk.`,
  },
  automotive: {
    eyebrow: "Sector workspace · Automotive",
    title: "Why Automotive intel here",
    body: `Imports, financing, parts, and energy transition interact on the same fleet. Maverick AI merges market and policy news so you catch when duties, credit, or EV infrastructure shift demand—not just unit sales.\n\nFlows separate new cars, used imports, parts, EV, and motor finance.`,
  },
  "aerospace-defence": {
    eyebrow: "Sector workspace · Aerospace",
    title: "Why Aerospace & Defence intel here",
    body: `Long programs, procurement, and geopolitical risk define outcomes. Maverick AI tracks aviation, defence, space, drones, and security services so you see where budgets, regulation, and supply chains misalign.\n\nEach flow isolates a different risk/reward path—from civil MRO to defence primes.`,
  },
  "consumer-electronics": {
    eyebrow: "Sector workspace · Electronics",
    title: "Why Consumer Electronics intel here",
    body: `Product cycles, distribution, and repair ecosystems decide who captures margin. Maverick AI ingests market and trade signal so you spot inventory stress, component bottlenecks, and IoT adoption gaps.\n\nFlows cover manufacturing, retail/repair, and smart home—each with different upgrade cadence.`,
  },
  chemicals: {
    eyebrow: "Sector workspace · Chemicals",
    title: "Why Chemicals & Petrochemicals intel here",
    body: `Feedstock and capacity ripple downstream fast. Maverick AI tracks commodities and industrial news so you see when fertilizer, plastics, or pharma chemicals face margin or regulatory pressure.\n\nEach flow maps a distinct input→product path.`,
  },
  "politics-government": {
    eyebrow: "Sector workspace · Politics",
    title: "Why Politics & Government intel here",
    body: `Rules, budgets, and legitimacy move markets—even when politics feels noisy. Maverick AI structures elections, legislation, geopolitics, procurement, lobbying, governance, and tax policy so you can connect headlines to second-order economic effects.\n\nPick a flow to stress-test how power and money interact for your questions.`,
  },
  "climate-sustainability": {
    eyebrow: "Sector workspace · Climate",
    title: "Why Climate & Sustainability intel here",
    body: `Policy, capital, and physical risk have to align for projects to scale. Maverick AI aggregates climate, finance, and resilience news so you see where disclosure, adaptation spend, or circular models create real option value—not just slogans.\n\nFlows separate climate policy, ESG finance, adaptation, and circular economy.`,
  },
  "sports-leisure": {
    eyebrow: "Sector workspace · Sports",
    title: "Why Sports & Leisure intel here",
    body: `Rights, wagering, sponsorship, and fitness spend respond to regulation and consumer mood together. Maverick AI ties media and consumer signal so you catch when leagues, platforms, or betting rules shift economics.\n\nEach flow isolates a different monetization path.`,
  },
  "non-profit-development": {
    eyebrow: "Sector workspace · Development",
    title: "Why Non-Profit & Development intel here",
    body: `Donor cycles, delivery risk, and access constraints define outcomes. Maverick AI maps multilateral, NGO, social enterprise, and humanitarian flows so you see where funding, politics, and operations diverge.\n\nUse flows to compare how capital reaches beneficiaries across institutions.`,
  },
  "shipping-maritime": {
    eyebrow: "Sector workspace · Maritime",
    title: "Why Shipping & Maritime intel here",
    body: `Freight rates, fuel, hull risk, and port capacity convert global demand into operator P&L. Maverick AI tracks commodities, equities, and trade news so you see choke points and rate drivers—not only indices.\n\nFlows cover containers, bulk/tankers, ports, shipbuilding, and maritime insurance.`,
  },
  "creative-design": {
    eyebrow: "Sector workspace · Creative",
    title: "Why Creative & Design intel here",
    body: `IP, talent, and distribution decide who gets paid in the creative economy. Maverick AI merges culture and business headlines so you catch platform shifts, commissioning cycles, and rights disputes early.\n\nFlows span design, art market, publishing, photo/video, and product design.`,
  },
  "religious-faith": {
    eyebrow: "Sector workspace · Faith orgs",
    title: "Why Religious & Faith Organizations intel here",
    body: `Community economics, media, and philanthropy interact in ways standard sector tags miss. Maverick AI tracks giving, travel, and media signal so you see how congregations, pilgrimages, and faith-based institutions evolve.\n\nEach flow reflects a different revenue and mission path.`,
  },
  "gambling-lottery": {
    eyebrow: "Sector workspace · Gambling",
    title: "Why Gambling & Betting intel here",
    body: `Regulation and technology reset operator economics quickly. Maverick AI surfaces policy, market, and consumer news so you see where taxation, product mix, or channel shift change the odds.\n\nFlows separate online betting, casino/iGaming, lottery, and racing.`,
  },
  "blockchain-digital-assets": {
    eyebrow: "Sector workspace · Digital assets",
    title: "Why Blockchain & Digital Assets intel here",
    body: `Liquidity, law, and infrastructure move at different speeds. Maverick AI tracks crypto, funding, and policy news so you see when exchanges, DeFi, mining, NFTs, or stablecoins face stress or adoption inflections.\n\nEach flow isolates a different risk stack.`,
  },
  "personal-household": {
    eyebrow: "Sector workspace · Household",
    title: "Why Personal & Household Services intel here",
    body: `Labor, trust, and urbanization shape fragmented local markets. Maverick AI ties consumer and policy news so you spot stress in beauty, domestic work, childcare, eldercare, home repair, and pet care—where regulation and demographics move fast.\n\nFlows map how spend and labor actually meet.`,
  },
};

export function getIndustryIntelCopy(slug: string): PageValueBlock | undefined {
  return industryIntelBySlug[slug];
}
