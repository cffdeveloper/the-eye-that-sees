/**
 * Hand-written value copy per money-flow lane (SubFlow.id).
 * Each block is unique: role, data mix, gaps, and how Infinitygap beats generic AI or headline skimming.
 */
export type SubFlowIntelBlock = {
  eyebrow: string;
  title: string;
  body: string;
};

export const SUBFLOW_INTEL_COPY: Record<string, SubFlowIntelBlock> = {
  // --- Technology & Software ---
  "1.1": {
    eyebrow: "Hardware · 💻",
    title: "See fab, inventory, and brand risk before your next hardware bet",
    body: `If you allocate to OEMs, distributors, or component plays, you need the chain—not a single vendor headline. Infinitygap maps this lane from raw materials through retail so you can stress-test where margin or allocation breaks first when TSMC slots, memory pricing, or trade rules move.\n\nIt weaves equity and commodity benchmarks with news and social chatter on semiconductors, rare earths, and major brands, tuned to your geography. That surfaces misalignment between backlog narrative and what ports, distributors, and retailers are actually saying.\n\nUse the structured brief for synthesis, alerts when stages in the flow stop matching, and snapshots to compare this cycle to the last—instead of asking a generic chatbot for “chip stocks.”`,
  },
  "1.2": {
    eyebrow: "SaaS · 💻",
    title: "Track ARR narrative against funding reality and cloud spend",
    body: `SaaS investors and operators live in two worlds: reported recurring revenue and the venture/credit cycle that funds growth. This lane is built so Infinitygap can flag when MAU/ARPU story, funding headlines, and enterprise IT budgets diverge—before guidance catches up.\n\nPulls combine listed-company tape, funding and venture signals, and sector news so you see who is actually scaling versus buying growth. Keywords like vertical SaaS and platform shifts are cross-read against macro and competitor moves.\n\nCompared with a one-off ChatGPT summary, you get geography-aware alerts, flow-anchored gaps, and history on how similar SaaS cohorts behaved in prior rate regimes.`,
  },
  "1.3": {
    eyebrow: "Mobile Apps · 💻",
    title: "Connect store economics, ad markets, and regional handset behavior",
    body: `Mobile monetization is a three-way tug: platform fees, ad/IAP yield, and download mix. Infinitygap helps publishers and investors spot when policy changes, ATT-style privacy shifts, or regional handset trends imply revenue risk that App Store rankings alone won’t show.\n\nNews and market layers cover the ecosystem (Google Play, iOS, AdMob-class dynamics) while social signal catches creator and user sentiment in your markets. That is the integration generic tools skip.\n\nExpect gap callouts where store take rates, UA spend, and ARPDAU assumptions no longer line up—plus briefs you can share without re-explaining the value chain.`,
  },
  "1.4": {
    eyebrow: "IT Services · 💻",
    title: "Size IT services demand from enterprise budgets and migration waves",
    body: `Managed services and SI firms win when clients prioritize uptime, compliance, and cloud migration—often before GDP headlines move. Infinitygap ties contract and procurement news to labor and cybersecurity stress so you see pipeline risk and margin pressure earlier.\n\nEquity and news feeds cover global IT services names and regional integrators; social adds ground noise from practitioners and buyers. Together they highlight where outsourcing, BPO, or security spend is inflecting.\n\nYou are not asking an AI for a generic “IT trends” essay—you are monitoring a mapped money path with alerts when client verticals or regulator-driven projects misalign with billing cadence.`,
  },
  "1.5": {
    eyebrow: "Distribution · 💻",
    title: "Follow device dollars from master distributor to informal retail",
    body: `Handset and electronics distribution is working-capital intensive and brutally local. Infinitygap is tuned for national distributors, brand country offices, and anyone underwriting inventory in emerging markets where grey imports and FX matter as much as sell-through.\n\nNews-led monitoring on brands, channels, and regional players supplements what tickers miss. The flow scaffold keeps questions anchored: who holds stock, who extends credit, who eats shrink.\n\nThat yields concrete gaps—e.g., when MNO promotions or import duties imply margin compression that a headline about “smartphone growth” obscures.`,
  },
  "1.6": {
    eyebrow: "AI/Data · 💻",
    title: "Separate AI hype from enterprise adoption and GPU economics",
    body: `AI and data services sit at the intersection of model APIs, enterprise procurement, and labeling economics. Infinitygap helps strategists and investors compare narrative velocity to capex, cloud pricing, and real deployment stories in your region.\n\nStocks, funding flows, and dense news coverage are blended so you see when API vendors, consultancies, or data-label players face different constraints. Social signal catches practitioner backlash or surprise adoption pockets.\n\nAgainst generic AI chat, you get flow-specific briefs: where data rights, latency, or sovereign-cloud rules break the standard “AI will fix it” story.`,
  },
  "1.7": {
    eyebrow: "Cybersecurity · 💻",
    title: "Anticipate security spend from incidents, regulation, and insurer pressure",
    body: `Cyber is an expectations game: breaches reprice demand overnight; compliance deadlines force multi-year budgets. Infinitygap tracks incident cadence, vendor earnings, and policy moves together so security buyers and investors see which layers—SIEM, identity, MSSP—are actually seeing budget.\n\nNews and equities cover global vendors and regional integrators; the lane keywords keep ransomware and enterprise deployment in frame. Gaps surface when insurance requirements or national cyber rules outpace product readiness.\n\nAlerts plus snapshots help you prove whether spend is recurring uplift or one-time panic—something a static report rarely captures.`,
  },
  "1.8": {
    eyebrow: "Cloud · 💻",
    title: "Read hyperscaler capex against enterprise workload shifts",
    body: `Cloud infrastructure is where energy costs, interest rates, and AI training demand meet. Infinitygap maps IaaS/PaaS/SaaS cash paths so you can test whether hyperscaler guidance, data-center build-outs, and regional sovereignty rules tell one story or three.\n\nMarket data on major cloud parents plus infrastructure news give you pricing and capacity context; geography settings keep sovereign and edge-compute narratives relevant.\n\nThe tool highlights when enterprise migration slows while GPU-heavy workloads spike—market gaps that generic sector summaries flatten into “cloud is growing.”`,
  },
  "1.9": {
    eyebrow: "Chips · 💻",
    title: "Trade the semiconductor cycle with wafer, geo, and end-market links",
    body: `Semiconductors are the economy’s fulcrum: autos, data centers, and handsets pull different fabs. Infinitygap links commodity and equity moves to news on fabs, export controls, and major chip designers so you see which end-market is driving allocation.\n\nKeywords span NVIDIA-class leaders, foundries, and shortage vocabulary; data mixes stocks, commodities, and headlines. That is how you catch when automotive softness diverges from AI accelerator tightness.\n\nUse this lane to challenge simple “semis up/down” takes with stage-by-stage reasoning and time-stamped snapshots for your thesis journal.`,
  },
  "1.10": {
    eyebrow: "Open Source · 💻",
    title: "Track OSS adoption, commercial dual-licensing, and M&A optionality",
    body: `Open source funds strategy, support, and cloud-hosted monetization in parallel. Infinitygap helps vendors, investors, and platform teams see when community traction, enterprise support contracts, and cloud attach rates imply different valuation paths.\n\nNews, equities, and funding data cover projects and commercial OSS vendors; social captures maintainer sentiment and licensing drama early.\n\nGeneric AI rarely connects GitHub stars to revenue—this lane does, by anchoring analysis on the enterprise adoption → support → hosted SaaS → exit path you are actually underwriting.`,
  },
  
  // --- Telecommunications ---
  "2.1": {
    eyebrow: "MNO · 📡",
    title: "Model MNO economics: spectrum, ARPU, and mobile money in one frame",
    body: `Operators live on capex cycles, regulatory moments, and consumer willingness to pay for data. Infinitygap ties tower narratives, spectrum auctions, and fintech-linked ARPU so investors and strategists see when network quality, pricing, or agent commissions stop adding up.\n\nStocks and news cover listed telcos; social surfaces consumer anger or praise that KPIs lag. The mapped flow forces questions about who captures value when mobile money scales.\n\nYou get proactive gaps—e.g., when capex guides stay flat but FX or fuel costs imply maintenance stress—without stitching feeds by hand.`,
  },
  "2.2": {
    eyebrow: "Airtime · 📡",
    title: "See distributor liquidity and agent economics under the hood",
    body: `Airtime and data distribution is a float and trust business: national distributors finance inventory down to the kiosk. Infinitygap highlights when MNO incentives, agent commissions, or digital-wallet cannibalization threaten the chain before retail complaints spike.\n\nNews-led monitoring captures regulatory and MNO policy shifts; geography keeps informal trade dynamics in view. This is operational intel, not a stock screen.\n\nCompared with generic research, you see where working capital stress or SIM-registration rules will hit margins first.`,
  },
  "2.3": {
    eyebrow: "ISP · 📡",
    title: "Connect submarine cable news to last-mile pricing and competition",
    body: `ISPs sit between international bandwidth, national backhaul, and consumers comparing fibre vs fixed wireless vs satellite. Infinitygap merges infrastructure headlines with retail ISP moves so you know whether margin pressure is upstream (capacity) or downstream (price war).\n\nNews covers Starlink-class entrants, fibre overbuilds, and national broadband policy. The lane explains who pays whom from cable landing to home router.\n\nAlerts flag when international outages, currency moves, or tower access disputes misalign with subscriber growth stories.`,
  },
  "2.4": {
    eyebrow: "MVNO · 📡",
    title: "Stress-test niche MVNO models against wholesale rates and churn",
    body: `MVNOs rent capacity—economics hinge on wholesale discounts, brand, and segment focus. Infinitygap helps product and finance teams compare MNO wholesale policy chatter, competitive launches, and consumer sentiment for the niches you care about.\n\nNews and social layers surface regulatory and partnership moves equity screens can miss. The flow clarifies who bears churn risk when wholesale prices reset.\n\nYou move faster than generic market reports because gaps tie directly to wholesale → MVNO → subscriber economics.`,
  },
  "2.5": {
    eyebrow: "Towers · 📡",
    title: "Treat tower cos as real assets with tenant mix and lease escalators",
    body: `Tower companies monetize co-location and escalators—tenant health is everything. Infinitygap combines listed tower equities with MNO capex and rural rollout news so you see when tenancy ratios or forex-denominated leases threaten dividends.\n\nKeywords cover major tower names and co-location vocabulary across regions. Social adds community friction stories (planning, rent disputes) that precede regulatory action.\n\nThis beats a one-page “towers are stable” thesis by surfacing where tenant consolidation or national roaming rules change the rent equation.`,
  },
  "2.6": {
    eyebrow: "Cable/CDN · 📡",
    title: "Map international bandwidth to IXPs, CDNs, and edge demand",
    body: `Subsea cables and CDNs decide latency, resilience, and who bills whom for eyeballs. Infinitygap helps infra investors and cloud buyers align cable faults, new builds, and data-center expansion with user growth—not just hype about “more data.”\n\nNews covers cable consortia, IXPs, and major CDN/cloud peering stories. The lane scaffolds how global bits become local revenue.\n\nGap alerts appear when content demand shifts (video, gaming) but landing station or regulatory permitting lags—hard to see in a generic AI summary.`,
  },
  "2.7": {
    eyebrow: "Mobile Money · 📡",
    title: "Follow agent liquidity, regulatory caps, and wallet competition",
    body: `Mobile money is part telco, part bank, part retail network. Infinitygap connects MNO and fintech headlines to agent-network stress and consumer protection rules so you see when fee caps, interoperability mandates, or bank partnerships reroute float.\n\nNews and equities cover major mobile-money operators where listed; social captures fraud and outage narratives early.\n\nYou get intel knowledge on who captures interchange vs cash-out vs treasury yield—gaps generic “fintech” briefs rarely dissect.`,
  },

  // --- Financial Services ---
  "3.1": {
    eyebrow: "Banking · 🏦",
    title: "Read bank earnings through deposits, sovereign rates, and asset quality",
    body: `Commercial banking is spread and credit quality dressed in macro. Infinitygap ties rate moves, FX, and headline risk on NPLs to bank equities and policy news for your market—so you see when funding costs or sovereign paper crowds out private credit.\n\nStocks, forex, rates, and news integrate into one lane; keywords anchor local central-bank vocabulary. That is how you catch divergence between NII optimism and emerging-market funding stress.\n\nUse alerts when deposit betas, regulatory forbearance, or currency pressure imply a different book than the last quarter’s slide deck.`,
  },
  "3.2": {
    eyebrow: "Insurance · 🏦",
    title: "Separate underwriting cycles from investment income and cat risk",
    body: `Insurers live on combined ratio and float yield—climate, medical inflation, and asset markets hit different lines. Infinitygap blends listed insurer tape with catastrophe and regulatory news so life, P&C, and reinsurance exposures don’t get lumped into “financials.”\n\nNews covers claims trends and reinsurance renewals; equities show how markets price solvency. Social sometimes surfaces early fraud or consumer pain.\n\nThe lane highlights market gaps: when premium growth looks fine but investment income or reinsurance capacity is about to bite.`,
  },
  "3.3": {
    eyebrow: "Markets · 🏦",
    title: "Place IPO and bond windows next to retail flow and regulator tone",
    body: `Capital markets activity is issuance × appetite × rules. Infinitygap helps issuers, bankers, and investors sync exchange news, listing requirements, and global risk appetite with local liquidity—before you size a mandate.\n\nStocks, crypto (for risk appetite), and news combine; keywords map local exchanges and securities regulators. You see when emerging-market windows slam shut while headlines still say “risk-on.”\n\nVersus generic AI: you get geography-tuned alerts on filings, lock-ups, and macro shocks that change clearing prices—not a Wikipedia overview of what an IPO is.`,
  },
  "3.4": {
    eyebrow: "Forex · 🏦",
    title: "Track remittance corridors, spread economics, and policy shocks",
    body: `Forex bureaus and digital remittance apps compete on spread, speed, and compliance. Infinitygap links FX benchmarks and policy news to corridor-specific chatter so treasurers and fintech operators see when capital controls, KYC rules, or banking partner risk break pricing.\n\nForex data plus news is the core integration; social adds migrant and SME stress signals early.\n\nGaps show up when official rates and street rates diverge—exactly where headline CPI won’t help.`,
  },
  "3.5": {
    eyebrow: "Fintech · 🏦",
    title: "Compare payment volume narrative to funding, regulation, and incumbents",
    body: `Fintech scales on rails, float, and trust. Infinitygap merges venture and public-market signals with payments and banking news so you see when BNPL, wallets, or neobanks face funding winter while incumbents launch competing rails.\n\nStocks, funding, and news together beat a pure VC database. Keywords span global and local payment names.\n\nThe lane exposes market gaps: interchange compression, sponsor-bank risk, or national switch mandates that generic “fintech is growing” reports ignore.`,
  },
  "3.6": {
    eyebrow: "Microfinance · 🏦",
    title: "Monitor SACCO and MFI health against agri cycles and political risk",
    body: `Microfinance and SACCOs are community leverage—repayment tracks employment, harvests, and election cycles. Infinitygap focuses news and field-relevant keywords on cooperative finance so analysts see stress before portfolio-at-risk metrics print.\n\nThis is intentionally not global equity-heavy; the value is curated headlines and social signal on inclusion programs and regulatory caps.\n\nYou get intel on where group liability or interest-rate caps change the model—something broad financial AI rarely grounds in local law.`,
  },
  "3.7": {
    eyebrow: "DFI · 🏦",
    title: "Align development finance pledges with disbursement reality and ESG backlash",
    body: `DFIs and multilateral lenders bridge policy and project finance. Infinitygap tracks World Bank–class institutions, blended finance headlines, and geopolitical friction so sponsors see when capital availability or conditionality shifts mid-project.\n\nNews is primary; keywords map major DFIs and impact vocabulary. Social adds NGO and community opposition that precedes delays.\n\nGaps appear when headline commitments diverge from actual board approvals or currency hedging—critical for anyone bidding PPP work.`,
  },
  "3.8": {
    eyebrow: "Leasing · 🏦",
    title: "Underwrite asset finance against residual values and enforcement risk",
    body: `Leasing lives or dies on residual assumptions and repossession enforceability. Infinitygap connects equipment and vehicle markets to credit and legal headlines so lessors see when asset prices, import rules, or court backlogs threaten recoveries.\n\nNews-led with sector keywords on hire purchase and asset finance; equities where major lessors are listed.\n\nYou move beyond generic credit scoring talk to stage-specific risk: who holds title, who insures, who eats auction delays.`,
  },
  "3.9": {
    eyebrow: "PE/VC · 🏦",
    title: "Connect LP sentiment, deployment pace, and exit windows",
    body: `Private markets are pacing and pricing: DPI, TVPI, and exit liquidity dominate LP decisions. Infinitygap aggregates funding news, listed alternatives proxies, and macro tape so GPs and founders see when secondaries, IPO windows, or cross-border M&A imply real exits—not slide optimism.\n\nStocks, funding, and news combine; keywords span fund terms and venture stages.\n\nCompared with chatbots, you get alerts when carry math, currency repatriation, or sovereign wealth appetite shifts—mapped to actual fund mechanics.`,
  },
  "3.10": {
    eyebrow: "Wealth Mgmt · 🏦",
    title: "See fee pressure, product mix, and custody risk for HNWI books",
    body: `Wealth managers juggle fees, product shelf, and regulatory scrutiny. Infinitygap ties market volatility and rate paths to headline risk on private banking and family offices—so you see when AUM growth masks margin compression or compliance drag.\n\nNews and equities cover global private banks and regional players; keywords include HNWI and family-office vocabulary.\n\nThe lane highlights gaps: when clients demand alts or offshore structures faster than your platform can deliver—intel generic summaries rarely quantify.`,
  },

  // --- Energy ---
  "4.1": {
    eyebrow: "Oil & Gas · ⚡",
    title: "Trade crude shocks through refining, subsidy politics, and retail pass-through",
    body: `Oil & gas is geopolitics encoded in crack spreads and local pump prices. Infinitygap merges commodities, energy equities, and policy news so traders and strategists see when Brent moves won’t reach retail—or when subsidy reform blows up fiscal plans.\n\nCommodity benchmarks plus stocks and news give integrated timing; geography captures import dependence and strategic storage.\n\nAlerts surface when OPEC+ rhetoric and physical inventory diverge—market gaps headline trackers miss.`,
  },
  "4.2": {
    eyebrow: "Power Grid · ⚡",
    title: "Link generation, transmission losses, and tariff politics",
    body: `Grid economics are capacity × losses × tariff recovery × politics. Infinitygap helps utilities investors and industrial buyers track outages, IPP announcements, and regulatory reviews alongside commodity fuel inputs.\n\nNews and commodities integrate; keywords map national utilities and independent power vocabulary.\n\nYou see when load shedding or drought-induced hydro shortfall invalidates tariff assumptions—something a generic “utilities” screen won’t narrate.`,
  },
  "4.3": {
    eyebrow: "Solar · ⚡",
    title: "Follow panel costs, PAYG collections, and distributed policy",
    body: `Solar is hardware cost curves plus financeability: PAYG firms need repayment data; utilities fear cannibalization. Infinitygap combines commodity and equity moves with distributed-energy headlines so you see when panel prices, currency, or import duties break rooftop vs utility-scale economics.\n\nStocks, commodities, and news together; social adds installer and customer sentiment.\n\nGaps appear when national net-metering rules or curtailment risk diverge from global “solar LCOE down” stories.`,
  },
  "4.4": {
    eyebrow: "Wind/Hydro · ⚡",
    title: "Size renewable PPAs against weather, FX, and offtaker credit",
    body: `Wind and hydro projects are long-dated PPAs tied to weather volatility and sovereign offtakers. Infinitygap tracks project finance news, weather stress, and grid integration issues so developers and lenders see when generation profiles or curtailment threaten debt service.\n\nNews-led with renewable keywords; integrates with broader energy context.\n\nVersus generic green-energy blurbs, you get stage-specific risks: transmission wheeling, community consent, and seasonal hydrology.`,
  },
  "4.5": {
    eyebrow: "Carbon · ⚡",
    title: "Navigate credit issuance, verification backlog, and corporate buyer demand",
    body: `Carbon markets are policy, MRV quality, and corporate net-zero promises in tension. Infinitygap follows voluntary standard news, compliance program updates, and commodity-linked carbon pricing so traders and project developers see when credit supply or reputational risk shifts.\n\nNews plus commodities context; keywords map Verra-class standards and corporate buyers.\n\nAlerts highlight when corporate retirements slow while project pipelines grow—classic gap generic ESG scores flatten.`,
  },
  "4.6": {
    eyebrow: "LPG · ⚡",
    title: "Track LPG imports, cylinder economics, and safety-driven regulation",
    body: `LPG is logistics-heavy and politically visible—price spikes hit kitchens fast. Infinitygap connects global propane/butane benchmarks to local distribution and safety news so importers and regulators see margin squeeze before protests force caps.\n\nCommodities and news integrate; geography captures subsidy regimes.\n\nYou get operational intel on bottlenecks at filling plants and illegal refills—nuance headline inflation data won’t carry.`,
  },
  "4.7": {
    eyebrow: "Mini-Grid · ⚡",
    title: "Model rural tariffs against opex, theft, and donor finance",
    body: `Mini-grids blend development finance with metered tariffs in cash economies. Infinitygap focuses news on rural electrification, donor programs, and technology (smart metering) so developers see when tariff enforcement or currency risk breaks models.\n\nNews-led; social sometimes surfaces community payment behavior early.\n\nGaps show when grant milestones and commercial sustainability diverge—key for blended finance investors.`,
  },
  "4.8": {
    eyebrow: "Biogas · ⚡",
    title: "Connect waste supply, digester uptime, and end-use offtake",
    body: `Biogas projects tie feedstock contracts to energy and fertilizer outputs. Infinitygap tracks agri-waste policy, energy pricing, and organic fertilizer markets so operators see when input availability or grid connection delays erode IRR.\n\nNews coverage anchors the lane; keywords span digesters and waste-to-energy.\n\nCompared with generic “circular economy” talk, you see who pays for gas vs slurry and where carbon credits might actually attach.`,
  },
  "4.9": {
    eyebrow: "Nuclear · ⚡",
    title: "Follow uranium, enrichment, and long-cycle procurement without the hype",
    body: `Nuclear is decades-long: fuel, construction risk, and geopolitical dependence on enrichment. Infinitygap merges uranium and equity benchmarks with nuclear policy news so investors separate SMR optimism from licensing and EPC reality.\n\nCommodities, stocks, and news combine; keywords map major nuclear vendors and SMR vocabulary.\n\nMarket gaps surface when public sentiment on climate turns faster than plant build times—exactly where traders and policymakers mis-time each other.`,
  },

  // --- Agriculture & Food ---
  "5.1": {
    eyebrow: "Food Chain · 🌾",
    title: "See food inflation as input, logistics, and retail margin stacked",
    body: `The food value chain is only as strong as its tightest link—inputs, weather, aggregation, or retail power. Infinitygap merges commodity benchmarks, weather inputs, and news so processors and traders see where bottlenecks will bite next.\n\nCommodities, news, and weather integrate; keywords span crops and food security vocabulary.\n\nYou beat generic CPI commentary by staging stress from farm gate to shelf—including when politics freeze exports or open borders.`,
  },
  "5.2": {
    eyebrow: "Inputs · 🌾",
    title: "Track fertilizer and seed costs against farmer credit and subsidy timing",
    body: `Input supply is global chemistry plus local distribution credit. Infinitygap ties commodity fertilizer benchmarks to agrochemical headlines and agrovet channel news so you see when affordability breaks before yields do.\n\nCommodities, stocks, and news together; social captures farmer distress signals.\n\nAlerts highlight when global nutrient prices diverge from local retail prices—margin gaps distributors live or die on.`,
  },
  "5.3": {
    eyebrow: "Export · 🌾",
    title: "Align cold chain reliability with EU/UK phytosanitary rules and freight",
    body: `Export horticulture is timing, certification, and freight rates in one package. Infinitygap connects perishable logistics headlines to commodity and air-freight stress so exporters see when rejections at destination or port delays destroy margin.\n\nCommodities and news integrate; keywords map avocados, flowers, and cold-chain vocabulary.\n\nGaps appear when global demand looks strong but local packhouse capacity or inspection backlogs cap volume—intel slide decks often skip.`,
  },
  "5.4": {
    eyebrow: "Agri-Finance · 🌾",
    title: "Monitor crop insurance and warehouse receipts against weather and fraud",
    body: `Agri-finance hinges on collateral quality and weather correlation. Infinitygap focuses insurance and credit news with weather overlays so lenders see when indemnity patterns or warehouse-receipt scandals threaten book quality.\n\nNews-led with agri-fintech keywords; weather adds seasonal stress context.\n\nYou move beyond generic “financial inclusion” narratives to stage-specific risks on index insurance and digital disbursement.`,
  },
  "5.5": {
    eyebrow: "Processing · 🌾",
    title: "Connect raw commodity swings to branded FMCG shelf power",
    body: `Processors sit between volatile commodities and price-sensitive consumers. Infinitygap merges commodity inputs with FMCG equities and retail news so you see when hedging, private label, or forex breaks margin narratives.\n\nStocks, commodities, and news combine; keywords span milling, dairy, oils.\n\nMarket gaps show when input costs fall but promotional intensity rises—EBITDA stories diverge from headline commodity moves.`,
  },
  "5.6": {
    eyebrow: "Food Service · 🌾",
    title: "Read restaurant economics: food cost, labor, and delivery take rates",
    body: `Restaurants are small-ticket operating leverage. Infinitygap tracks food commodity spikes, labor regulation, and delivery-platform dynamics so operators and investors see margin risk before same-store sales roll over.\n\nNews-led with QSR and delivery vocabulary; social captures diner trends early.\n\nCompared with generic hospitality chatter, you get integration of procurement, wage, and aggregator fee stress in one lane.`,
  },
  "5.7": {
    eyebrow: "Livestock · 🌾",
    title: "Follow feed costs, disease outbreaks, and processor gate prices",
    body: `Livestock is feed conversion plus regulatory health risk. Infinitygap ties feed commodity benchmarks to animal health headlines and processor news so ranchers and traders see when import bans or drought alter supply curves.\n\nCommodities and news integrate; keywords map dairy and meat chains.\n\nAlerts surface when global protein demand diverges from local veterinary capacity—classic gap for integrated intel.`,
  },

  // --- Real Estate & Construction ---
  "6.1": {
    eyebrow: "Land Dev · 🏗️",
    title: "Stress-test land banks against rates, approvals, and absorption",
    body: `Development is land optionality financed by presales and credit. Infinitygap connects mortgage and rates news to planning approvals and affordable-housing policy so developers and lenders see when absorption or title risk breaks IRR—not just “housing demand.”\n\nNews-led with local real-estate vocabulary; geography keeps zoning and infrastructure narratives relevant.\n\nGaps surface when land prices rise while sales velocity or construction cost inflation diverge—intel generic AI flattens into “property is hot.”`,
  },
  "6.2": {
    eyebrow: "Construction · 🏗️",
    title: "Track contractor cash flow against materials spikes and retention risk",
    body: `Construction contracting is milestone billing under input inflation. Infinitygap merges commodity and headline news on steel, cement, and labor so contractors and sureties see when fixed-price jobs become loss-makers.\n\nNews and commodities integrate; keywords map civil works and national contractor registries.\n\nYou get alerts when procurement delays or currency moves misalign with bid assumptions—something spreadsheet models update too late.`,
  },
  "6.3": {
    eyebrow: "Materials · 🏗️",
    title: "Link cement and steel pricing to inventory days and import parity",
    body: `Building materials distributors live on spread and volume. Infinitygap ties commodity benchmarks to listed cement/steel names and hardware-channel news so you see when import duties, energy costs, or transport strikes compress margin.\n\nCommodities, stocks, and news together; social adds site-level anecdotes early.\n\nMarket gaps appear when global scrap or coal prices diverge from local retail stickiness—exactly where traders and retailers miscommunicate.`,
  },
  "6.4": {
    eyebrow: "PropMgt/REIT · 🏗️",
    title: "Read REIT yields against vacancy, rates, and collection risk",
    body: `Property management and REITs are cap-rate and collection stories. Infinitygap combines listed property tape with macro rates and tenant-sector news so investors see when office WFH, retail footfall, or currency lease exposure threaten dividends.\n\nStocks and news integrate; keywords map REITs and commercial property vocabulary.\n\nVersus generic “real estate” chat, you get flow-specific stress on rent rolls and maintenance capex.`,
  },
  "6.5": {
    eyebrow: "Agents · 🏗️",
    title: "See commission pools and transaction velocity under credit conditions",
    body: `Agency revenue is transactions × price × commission—credit availability matters as much as listings. Infinitygap tracks mortgage and policy news alongside property market headlines so agents and portals see pipeline risk early.\n\nNews-led; social captures buyer sentiment and price cuts in real time.\n\nGaps show when listing growth outpaces qualified buyers—classic intel for fee-based businesses.`,
  },

  // --- Trade, Retail & FMCG ---
  "7.1": {
    eyebrow: "FMCG · 🛒",
    title: "Follow route-to-market margin from manufacturer to informal shelf",
    body: `FMCG is working capital and distributor power. Infinitygap merges listed consumer names with trade and FX news so brand teams see when route-to-market costs or parallel imports threaten share—not just Nielsen headlines.\n\nStocks and news integrate; geography captures informal trade and national distributor dynamics.\n\nAlerts highlight when global commodity relief doesn’t reach shelf price because retailers or wholesalers capture margin.`,
  },
  "7.2": {
    eyebrow: "E-Commerce · 🛒",
    title: "Connect GMV hype to logistics cost, returns, and payment friction",
    body: `E-commerce is logistics dressed as tech. Infinitygap ties marketplace and logistics headlines to listed e-com names and consumer news so investors separate GMV growth from contribution margin after delivery subsidies.\n\nStocks and news together; keywords map major marketplaces and social commerce.\n\nMarket gaps surface when take rates compress while ad load rises—generic “online retail growing” misses the squeeze.`,
  },
  "7.3": {
    eyebrow: "Franchise · 🛒",
    title: "Monitor franchisee health, royalty disputes, and FX-denominated imports",
    body: `Franchise chains are royalty streams on local operators—FX, rent, and labor law hit them unevenly. Infinitygap tracks retail and labor headlines with brand news so franchisors see when store economics break regionally.\n\nNews-led with supermarket and franchise vocabulary; equities where chains are listed.\n\nYou get intel on where corporate same-store sales mask franchisee distress—critical for expansion timing.`,
  },
  "7.4": {
    eyebrow: "Informal · 🛒",
    title: "Read informal trade through enforcement, inputs, and consumer down-trading",
    body: `Jua kali and kiosk trade absorb shocks and set price floors. Infinitygap focuses news and social signal on informal commerce so policymakers and brands see when harassment, input costs, or credit access shift street-level supply.\n\nNews is primary; social captures raids, associations, and consumer coping strategies early.\n\nGeneric AI rarely quantifies informal share—this lane tracks the stress points that precede formal sector share moves.`,
  },
  "7.5": {
    eyebrow: "Private Label · 🛒",
    title: "Compare contract manufacturing economics to brand marketing spend",
    body: `Private label wins when retailers control shelf and factories have spare capacity. Infinitygap connects FMCG and trade news with manufacturing headlines so buyers see when input volatility or MOQs break white-label margin.\n\nNews-led; keywords map contract manufacturing and retailer own-brand strategy.\n\nGaps appear when retailers push private label during inflation but suppliers face ingredient shortages—integration generic category reports skip.`,
  },

  // --- Transport & Logistics ---
  "8.1": {
    eyebrow: "Trucking · 🚛",
    title: "Model freight rates against diesel, axle rules, and fleet finance",
    body: `Road freight is fuel and utilization with thin margins. Infinitygap merges commodity diesel proxies with logistics news and fleet financing chatter so operators see when spot rates diverge from contract lanes.\n\nNews and commodities integrate; keywords map trucking and freight forwarding.\n\nAlerts surface when border delays or driver shortages invalidate routing assumptions—operational intel, not a macro essay.`,
  },
  "8.2": {
    eyebrow: "Shipping · 🚛",
    title: "Track container lines, port dwell, and demurrage before invoices spike",
    body: `Shipping is global demand converted into berth and box availability. Infinitygap ties maritime headlines to listed shipping lines and port news so importers see when congestion or schedule reliability breaks landed cost.\n\nStocks and news together; geography maps your port and clearing path.\n\nMarket gaps show when freight indices fall but local charges and demurrage stay high—classic disconnect headline indices hide.`,
  },
  "8.3": {
    eyebrow: "Aviation · 🚛",
    title: "Connect airline yields to jet fuel, FX debt, and slot access",
    body: `Air cargo and passenger airlines share fuel and currency sensitivity with different revenue mixes. Infinitygap combines flight-related data context with aviation news and equities so analysts see when yield recovery diverges from fuel spikes.\n\nFlights, news, and stocks integrate; keywords map major airlines and airports.\n\nVersus generic travel recovery stories, you get lane-specific stress on MRO backlogs and bilateral traffic rights.`,
  },
  "8.4": {
    eyebrow: "Last-Mile · 🚛",
    title: "See ride-hail and delivery take rates under regulator and driver pressure",
    body: `Last-mile platforms monetize trips and meals with thin take rates and high churn. Infinitygap tracks gig-economy regulation, fuel prices, and consumer news so platforms and investors see when subsidies or strikes break unit economics.\n\nNews and stocks cover listed mobility names; social surfaces driver coordination early.\n\nGaps highlight when city caps on commissions or insurance mandates land before earnings calls admit it.`,
  },
  "8.5": {
    eyebrow: "Rail · 🚛",
    title: "Align rail cargo tariffs with maintenance spend and political freight mandates",
    body: `Rail is asset-heavy with political visibility—passenger subsidies can crowd freight. Infinitygap focuses rail and infrastructure headlines so miners and traders see when axle loads, theft, or scheduling hit unit costs.\n\nNews-led; keywords map SGR-class projects and rail freight.\n\nYou beat generic “infrastructure spend” blurbs by tying cargo pricing to actual service levels.`,
  },
  "8.6": {
    eyebrow: "Clearing · 🚛",
    title: "Anticipate customs delays and duty changes that blow landed cost",
    body: `Clearing agents translate policy into minutes at the gate. Infinitygap tracks customs, trade, and port headlines with import-dependent sector news so traders see when documentation rules or scanner deployments change dwell time.\n\nNews-led with clearing and forwarding vocabulary; social adds SME pain early.\n\nMarket gaps appear when official duty tables diverge from what importers pay in practice—intel customs brokers live for.`,
  },
  "8.7": {
    eyebrow: "3PL · 🚛",
    title: "Size 3PL contracts against warehouse rents and automation capex",
    body: `Third-party logistics wins on network density and labor productivity. Infinitygap merges industrial real-estate and labor news with logistics equities so customers and investors see when fulfillment costs or automation bets break contract margins.\n\nNews and stocks integrate; keywords map warehousing and cold chain.\n\nCompared with generic supply-chain commentary, you see when inventory destocking ends but rent stays elevated—margin risk for 3PLs.`,
  },

  // --- Health & Pharmaceuticals ---
  "9.1": {
    eyebrow: "Pharma · 🏥",
    title: "Track essential medicines policy against import parity and tender timing",
    body: `Pharma distribution in price-sensitive markets is tender math plus FX. Infinitygap ties listed pharma and distributor news to regulatory headlines on registration and local manufacturing mandates so you see when margins or shortages diverge.\n\nStocks and news integrate; keywords map generics, NHIF, and national procurement.\n\nAlerts surface when global API prices fall but local duties or forex keep shelf prices sticky—gaps slide decks gloss over.`,
  },
  "9.2": {
    eyebrow: "Hospitals · 🏥",
    title: "Model hospital revenue mix: NHIF/SHA, private insurance, and cash pay",
    body: `Hospitals are reimbursement games under clinical capacity constraints. Infinitygap merges healthcare policy news with provider equities and social sentiment on access so operators see when payer delays or nursing shortages threaten EBITDA.\n\nStocks and news together; keywords map NHIF/SHA and hospital accreditation.\n\nYou move beyond generic “healthcare demand” to who actually pays and how fast—core to underwriting facility expansions.`,
  },
  "9.3": {
    eyebrow: "Diagnostics · 🏥",
    title: "Connect lab network expansion to reagent costs and test menu competition",
    body: `Diagnostics scale on hub-and-spoke logistics and reagent supply security. Infinitygap tracks medtech and distributor headlines alongside lab chain news so investors see when consumables inflation or courier failures hit margins.\n\nNews-led; keywords map pathology networks and lab accreditation.\n\nGaps show when test volume grows but reimbursement per test falls—volume alone misleads.`,
  },
  "9.4": {
    eyebrow: "MedTech · 🏥",
    title: "Align equipment procurement cycles with FX, tenders, and service contracts",
    body: `MedTech is upfront capex plus annuity service—FX and government tenders dominate emerging markets. Infinitygap combines listed device names with hospital budget news so suppliers see when procurement freezes or currency gaps break pricing.\n\nStocks and news integrate; keywords map major OEMs and reagent razor-blade models.\n\nVersus generic equipment lists, you get stage risk on installation, training, and maintenance attach rates.`,
  },
  "9.5": {
    eyebrow: "Digital Health · 🏥",
    title: "Separate telehealth traction from prescribing rules and data residency",
    body: `Digital health scales on trust, reimbursement, and lightweight regulation. Infinitygap merges funding and healthtech news with policy updates so founders see when cross-border data rules or pharmacy integration bottlenecks cap growth.\n\nNews and funding integrate; social captures clinician adoption friction early.\n\nMarket gaps appear when downloads look fine but paid consults stall—intel app charts won’t show.`,
  },
  "9.6": {
    eyebrow: "Health Insurance · 🏥",
    title: "Track premium adequacy against claims inflation and provider negotiations",
    body: `Health insurers live in the spread between premium growth and medical inflation—policy redesign is constant. Infinitygap ties payer news to hospital and pharma headlines so analysts see when benefit cuts or fraud crackdowns shift the game.\n\nNews-led with NHIF/SHA and managed-care vocabulary.\n\nAlerts highlight when political promises on coverage diverge from reserve math—something generic health AI won’t tie to local regulation.`,
  },
  "9.7": {
    eyebrow: "Mental Health · 🏥",
    title: "See therapy demand against workforce supply and insurance coverage gaps",
    body: `Mental health services scale on clinician supply and stigma-sensitive distribution—apps, clinics, and employers differ. Infinitygap tracks health policy and benefits news with social sentiment on access so providers see where reimbursement and talent constraints bind.\n\nNews-led; keywords map therapy, psychiatry, and workplace wellness.\n\nGaps surface when awareness rises faster than supervised capacity—classic market failure generic summaries miss.`,
  },

  // --- Education ---
  "10.1": {
    eyebrow: "Schools · 📚",
    title: "Monitor fee affordability, enrollment mix, and regulatory oversight",
    body: `Private schools run on enrollment × fees minus teacher and facility inflation. Infinitygap connects household stress headlines with education policy news so owners see when scholarships, currency, or curriculum rules threaten net revenue.\n\nNews-led; social captures parent sentiment on fees and quality early.\n\nYou get intel on where premium positioning diverges from actual learning outcomes—brand risk generic rankings hide.`,
  },
  "10.2": {
    eyebrow: "EdTech · 📚",
    title: "Compare EdTech growth to CAC, completion rates, and B2B procurement",
    body: `EdTech is not “online learning” in the abstract—it is sales cycles and churn. Infinitygap merges funding news with listed EdTech proxies and enterprise training headlines so investors separate durable ARR from pandemic pull-forward.\n\nStocks, funding, and news integrate; keywords map LMS and cohort-based courses.\n\nMarket gaps show when signups rise but employer-sponsored budgets freeze—headline MAU won’t flag it.`,
  },
  "10.3": {
    eyebrow: "Vocational · 📚",
    title: "Link skills programs to employer demand and certification credibility",
    body: `Vocational training pays out when graduates get hired—curriculum must track industry needs. Infinitygap tracks labor-market and industry headlines alongside TVET policy news so providers see when placement rates or accreditation risk enrollment.\n\nNews-led; keywords map bootcamps, NITA/TVETA-style bodies, and sector skills.\n\nVersus generic “youth unemployment” talk, you see which credentials employers actually pay for.`,
  },
  "10.4": {
    eyebrow: "Corporate · 📚",
    title: "Track L&D budgets through hiring freezes, compliance deadlines, and M&A",
    body: `Corporate training spend follows headcount, regulation, and integration costs. Infinitygap ties macro hiring news to compliance-driven mandates (AML, safety) so training vendors see pipeline before RFP seasons shift.\n\nNews-led; keywords map L&D, leadership programs, and compliance training.\n\nGaps appear when enterprises cut travel but still need certification—digital vs onsite mix matters for vendors.`,
  },
  "10.5": {
    eyebrow: "University · 📚",
    title: "Read higher-ed finance: tuition, HELB-style aid, and research grants",
    body: `Universities balance student revenue, government grants, and research funding—demographics and policy move together. Infinitygap merges education policy headlines with macro labor news so administrators see enrollment risk early.\n\nNews-led; keywords map higher education finance and postgraduate demand.\n\nInfinitygap highlights when international student visas or currency swings change fee mix—generic “education” AI rarely models.`,
  },
  "10.6": {
    eyebrow: "Study Abroad · 📚",
    title: "Anticipate consultant pipeline from visa rules, FX, and destination policy",
    body: `Study-abroad economics is lead volume × conversion × commission—border policy is your demand curve. Infinitygap tracks migration and education policy news with FX moves so agencies see when destinations tighten or families down-trade.\n\nNews-led; keywords map IELTS, scholarships, and major destination countries.\n\nGaps show when marketing spend rises but visa approval rates collapse—conversion intel generic rankings won’t surface.`,
  },

  // --- Media, Content & Entertainment ---
  "11.1": {
    eyebrow: "TV/Radio · 🎬",
    title: "Read broadcast revenue under audience fragmentation and ad regulation",
    body: `Linear TV and radio still monetize reach—ad loads and political cycles matter. Infinitygap merges listed media equities with advertising and regulatory headlines so you see when audience shifts or political ad rules move revenue before ratings books print.\n\nStocks and news integrate; keywords map major stations and ad markets.\n\nAlerts highlight when digital audiences grow but ARPU falls—gaps headline “TV is dead” stories oversimplify.`,
  },
  "11.2": {
    eyebrow: "Digital · 🎬",
    title: "Track creator payouts against platform policy and brand safety",
    body: `Digital content is algorithmic distribution with volatile monetization rules. Infinitygap ties social-platform news to creator-economy headlines so brands and managers see when CPMs, payouts, or moderation shifts change who gets paid.\n\nNews and stocks cover platform parents; social is native signal for trends.\n\nVersus generic “creator economy” hype, you see when brand budgets move faster than creator supply can professionalize.`,
  },
  "11.3": {
    eyebrow: "Music · 🎬",
    title: "Connect streaming economics to live touring and local royalty collection",
    body: `Music revenue is streaming plus live—each responds to different shocks. Infinitygap tracks label and streaming news with event-industry headlines so artists and investors see when ticketing, sponsorship, or royalty disputes reroute cash.\n\nStocks and news integrate; keywords map PROs and streaming platforms.\n\nMarket gaps surface when streaming growth masks weak touring economics in your region—integrated intel matters.`,
  },
  "11.4": {
    eyebrow: "Film · 🎬",
    title: "Model production finance against distribution windows and subsidy rules",
    body: `Film is project finance with hit risk—tax incentives and streamer acquisitions change ROI. Infinitygap merges entertainment news with platform strategy headlines so producers see when commissioning slows or local content quotas shift demand.\n\nStocks and news together; keywords map Nollywood-style ecosystems and global streamers.\n\nYou beat generic box-office chatter by staging pre-production → exhibition → platform revenue realistically.`,
  },
  "11.5": {
    eyebrow: "Gaming · 🎬",
    title: "Separate game pipeline risk from platform fees and monetization regulation",
    body: `Gaming blends development capex with live-ops monetization—regulators increasingly care about loot boxes and minors. Infinitygap tracks publisher equities with policy news so studios see when store fees, ad IDs, or age rules change LTV.\n\nStocks and news integrate; keywords map mobile gaming and esports.\n\nGaps appear when downloads look strong but payer conversion falls—metrics public cheerleaders omit.`,
  },
  "11.6": {
    eyebrow: "Events · 🎬",
    title: "Stress-test sponsorship and ticketing against safety, FX, and visas",
    body: `Events are upfront costs with binary outcomes—permits and insurance can kill margin. Infinitygap connects tourism, city, and brand headlines so organizers see when sponsor budgets or artist travel rules shift before ticket sales do.\n\nNews-led; keywords map conferences, festivals, and venues.\n\nInfinitygap highlights when corporate marketing cuts hit B2B events first—segmentation generic “events rebound” misses.`,
  },
  "11.7": {
    eyebrow: "OOH · 🎬",
    title: "See OOH yield as traffic patterns, digitization, and municipal rents collide",
    body: `Out-of-home advertising monetizes impressions on roads and buildings—mobility and urban planning reshape it. Infinitygap tracks municipal advertising rules, mobility data headlines, and brand spend news so operators see when digitization or rent resets change ROI.\n\nNews-led; keywords map billboard and digital signage ecosystems.\n\nGaps show when traffic returns but zoning bans new faces—local intel global ad reports skip.`,
  },

  // --- Hospitality, Tourism & Food Service ---
  "12.1": {
    eyebrow: "Hotels · 🏨",
    title: "Connect RevPAR drivers: airlift, security perception, and corporate travel",
    body: `Hotels are RevPAR machines under FX and staffing constraints. Infinitygap merges listed hospitality tape with travel bans, airline capacity, and safety headlines so owners see when bookings diverge from global “revenge travel” narratives.\n\nStocks and news integrate; geography pins local events and security shocks.\n\nAlerts surface when average daily rate rises but occupancy falls—mix shift intel generic averages hide.`,
  },
  "12.2": {
    eyebrow: "Safari/Tours · 🏨",
    title: "Track safari pipeline from park fees, community agreements, and long-haul airlift",
    body: `Safari tourism is perishable inventory with conservation politics layered on. Infinitygap ties wildlife and conservation headlines to aviation and visa news so operators see when park access or community revenue-sharing shifts demand.\n\nNews-led; keywords map national parks, conservancies, and KWS-style bodies.\n\nMarket gaps appear when global marketing works but local road or security issues cap bed nights.`,
  },
  "12.3": {
    eyebrow: "Restaurants · 🏨",
    title: "Mirror hospitality F&B with local supply shocks and tourism mix",
    body: `Restaurant economics in tourism hubs differ from pure urban QSR plays. Infinitygap merges tourism and hospitality headlines with food-cost news so operators see when visitor mix or import parity changes margin faster than menus can adjust.\n\nNews and stocks where relevant; social captures diner trends.\n\nYou get intel on where tourism recovery is party-heavy vs family—check averages mislead staffing plans.`,
  },
  "12.4": {
    eyebrow: "Travel Agency · 🏨",
    title: "See agency commissions and float as airlines reprice distribution",
    body: `Travel agencies live on commissions and float—airline NDC and direct booking threaten both. Infinitygap tracks airline distribution and OTA news so agents see when carriers cut overrides or payment timelines change.\n\nNews and stocks cover major OTAs and carriers; keywords map GDS and agency networks.\n\nGaps highlight when headline travel volume rises but agency EBITDA falls—classic structural squeeze.`,
  },
  "12.5": {
    eyebrow: "Short-Let · 🏨",
    title: "Read short-let yields against regulation, tax enforcement, and hotel competition",
    body: `Short-term rentals arbitrage hotel regulation until cities clamp down. Infinitygap merges housing and tourism policy headlines with platform news so hosts see when registration rules, tax audits, or hotel lobbying shift net income.\n\nNews-led; keywords map Airbnb-class dynamics and local enforcement.\n\nVersus generic “sharing economy” blurbs, you see owner-level risks: mortgage clauses, insurance, and neighbor complaints.`,
  },
  "12.6": {
    eyebrow: "MICE · 🏨",
    title: "Size conference calendars against corporate budgets and public-sector events",
    body: `MICE is B2B travel spend—corporate austerity hits fast. Infinitygap tracks corporate earnings and government event budgets alongside venue news so planners see when delegate sponsorship or public conferences shrink pipelines.\n\nNews-led; keywords map convention centers and business travel.\n\nAlerts flag when international association bids succeed but local SME attendance can’t fill halls—pipeline intel aggregate tourism stats miss.`,
  },

  // --- Mining & Natural Resources ---
  "13.1": {
    eyebrow: "Mining · ⛏️",
    title: "Trade mining equities against grade, logistics, and royalty disputes",
    body: `Large-scale mining is geology plus jurisdiction. Infinitygap merges commodity benchmarks with listed miners and ESG headlines so investors see when ore grades, power contracts, or community agreements threaten production guidance.\n\nCommodities, stocks, and news integrate; social captures local protest signal early.\n\nMarket gaps surface when global metal prices rise but royalty renegotiations capture upside—generic “commodities up” misses local splits.`,
  },
  "13.2": {
    eyebrow: "ASM/Gems · ⛏️",
    title: "Follow ASM governance, export licensing, and artisanal price discovery",
    body: `Artisanal mining and gemstones are informality meeting global certification. Infinitygap focuses ethical sourcing and trade headlines with commodity color so buyers see when export bans or traceability rules reroute supply.\n\nCommodities and news together; keywords map ASM and gemstone trading hubs.\n\nInfinitygap highlights when international premiums diverge from local gate prices—integration compliance officers need.`,
  },
  "13.3": {
    eyebrow: "Quarry · ⛏️",
    title: "Link quarry volumes to construction cycles and environmental enforcement",
    body: `Sand, ballast, and stone track construction intensity—environmental crackdowns can halt supply overnight. Infinitygap ties construction news to infrastructure spend headlines so contractors see when permitted extraction or transport routes become the bottleneck.\n\nNews-led; keywords map quarry licensing and manufactured sand.\n\nGaps appear when building booms but illegal sand seizures spike input costs—local intel national cement indices won’t show.`,
  },
  "13.4": {
    eyebrow: "Processing · ⛏️",
    title: "Model smelter economics against power tariffs and concentrate grades",
    body: `Mineral processing is energy and chemistry—power outages or reagent costs swing margins. Infinitygap tracks industrial energy and mining policy news alongside commodity benchmarks so processors see when refining capacity or export bans change netbacks.\n\nCommodities and news integrate; keywords map smelters and refineries.\n\nYou beat generic “mining” summaries by separating concentrate logistics from metal price.`,
  },

  // --- Water & Environment ---
  "14.1": {
    eyebrow: "Water · 💧",
    title: "Anticipate water stress from drought, tariff politics, and non-revenue water",
    body: `Water utilities balance chemistry, infrastructure, and affordability—non-revenue water can destroy viability. Infinitygap merges climate and infrastructure headlines with utility news so operators see when rationing, drilling booms, or tariff protests threaten cash flows.\n\nNews-led; keywords map water utilities, boreholes, and bottled water competition.\n\nGaps surface when headline coverage focuses on cities but industrial users quietly build private boreholes—demand destruction intel.`,
  },
  "14.2": {
    eyebrow: "Waste/Recycle · 💧",
    title: "Connect waste tariffs to collection coverage and recycling offtake prices",
    body: `Waste management is gate fees plus commodity recovery—plastic and metal prices matter. Infinitygap tracks recycling markets and municipal contracting news with listed waste names so investors see when EPR rules or import bans shift economics.\n\nNews and stocks integrate; keywords map e-waste and circular economy programs.\n\nVersus generic “green” narratives, you see when landfill gate fees cap but sorting labor costs spike.`,
  },
  "14.3": {
    eyebrow: "Irrigation · 💧",
    title: "Model irrigation ROI against energy costs, water rights, and crop prices",
    body: `Irrigation projects tie water rights to crop margins—energy for pumping can dominate opex. Infinitygap ties agricultural commodity news to water infrastructure headlines so farmers and investors see when tariffs or river basin rules change payback.\n\nNews-led; weather adds drought/irrigation stress context.\n\nMarket gaps appear when seed companies push precision ag faster than grid reliability allows—integration field officers notice first.`,
  },
  "14.4": {
    eyebrow: "Carbon/Green · 💧",
    title: "Align forestry carbon projects with community land rights and verification quality",
    body: `Carbon forestry is decades-long with reversal risk—tenure disputes can void credits. Infinitygap tracks climate policy, forestry, and carbon-market headlines so project developers see when MRV standards or community benefit rules tighten.\n\nNews-led; keywords map REDD+ and afforestation programs.\n\nAlerts highlight when corporate buyers demand additionality proofs local projects can’t meet—quality gaps headline tonnage misses.`,
  },

  // --- Professional Services ---
  "15.1": {
    eyebrow: "Legal · 👔",
    title: "See legal demand from deal flow, enforcement waves, and regulatory complexity",
    body: `Law firms are utilization × rates minus talent cost—deal and dispute cycles drive both. Infinitygap merges corporate activity headlines with legal-sector news so practice leaders see when M&A, fintech licensing, or tax disputes will pull hours.\n\nNews-led; keywords map bar associations and high-stakes practice areas.\n\nYou move beyond generic “legal AI” hype to which lanes actually bill when—transactional vs disputes diverge sharply.`,
  },
  "15.2": {
    eyebrow: "Accounting · 👔",
    title: "Track audit and tax advisory cycles against filing deadlines and restatements",
    body: `Accounting firms live on compliance calendars and corporate event volume—restatements and regulator tone shift risk. Infinitygap ties earnings and governance headlines to audit industry news so partners see when independence rules or talent shortages threaten coverage.\n\nNews and stocks where Big Four parents matter; keywords map audit and tax advisory.\n\nGaps surface when IPO windows close but advisory still grows—mix intel topline revenue charts hide.`,
  },
  "15.3": {
    eyebrow: "Consulting · 👔",
    title: "Connect consulting bookings to CEO confidence, restructuring, and AI projects",
    body: `Management consulting tracks board urgency—cost programs and digital transformations cluster in downturns. Infinitygap merges macro and earnings headlines with consulting industry news so firms see when procurement freezes or AI mandates shift SOW mix.\n\nNews and stocks integrate; keywords map strategy firms and implementation partners.\n\nMarket gaps appear when headline “AI consulting” grows but clients won’t pay for strategy—rate compression risk.`,
  },
  "15.4": {
    eyebrow: "HR/Recruit · 👔",
    title: "Read placement fees against hiring freezes, visa rules, and skill shortages",
    body: `Recruitment is placements × fee minus sourcing cost—immigration policy is a demand lever. Infinitygap tracks labor-market and sector hiring headlines with HR industry news so agencies see when retainers replace success fees.\n\nNews-led; keywords map staffing, executive search, and outsourcing.\n\nInfinitygap highlights when job postings rise but offers stall—conversion gaps job boards won’t explain.`,
  },
  "15.5": {
    eyebrow: "Marketing/PR · 👔",
    title: "Model agency revenue as brand budgets shift to performance and in-house",
    body: `Marketing services fight for share of wallet with platforms—performance marketing resets retainers. Infinitygap ties ad-market and platform news to agency M&A headlines so leaders see when media rebates or in-house teams squeeze fees.\n\nNews-led; keywords map agencies, media buying, and brand safety.\n\nGaps show when clients demand AI content volume while cutting strategic fees—mix risk headline “digital ad growth” obscures.`,
  },
  "15.6": {
    eyebrow: "Arch/Eng · 👔",
    title: "Align professional fees with project pipelines and liability climate",
    body: `Architecture and engineering fees ride infrastructure and real estate cycles—liability and insurance costs matter. Infinitygap merges construction and infrastructure headlines with professional indemnity news so firms see when project finance stalls or BIM mandates shift scope.\n\nNews-led; keywords map engineering consultancies and registration bodies.\n\nYou beat generic “infrastructure boom” talk by seeing which project types actually reach detailed design.`,
  },
  "15.7": {
    eyebrow: "Research · 👔",
    title: "Differentiate syndicated research from custom work as data costs rise",
    body: `Market research competes with DIY surveys and cheap panels—quality and speed decide wins. Infinitygap tracks corporate insight budgets and data-privacy headlines with research industry news so shops see when enterprise buyers cut syndicated spend.\n\nNews-led; keywords map insights firms and survey methods.\n\nMarket gaps surface when headline “data explosion” meets panel fraud concerns—intel buyers actually care about methodology.`,
  },

  // --- Fashion & Textiles ---
  "16.1": {
    eyebrow: "Textiles · 👗",
    title: "Track cotton and labor costs through ginning, CMT, and export orders",
    body: `Textiles are commodity inputs plus labor arbitrage in EPZs. Infinitygap merges cotton and freight benchmarks with trade and labor headlines so manufacturers see when order books or duty schemes break margin.\n\nCommodities, news, and stocks integrate; keywords map CMT, EPZ, and fast fashion.\n\nAlerts highlight when global fast-fashion demand slows but local wage pressure rises—classic squeeze generic “apparel” indices flatten.`,
  },
  "16.2": {
    eyebrow: "Mitumba · 👗",
    title: "Read second-hand import policy against consumer down-trading and local jobs",
    body: `Mitumba is trade policy meeting household budgets—ban threats move prices overnight. Infinitygap focuses import and retail headlines with social sentiment on affordability so traders see when enforcement or FX changes supply.\n\nNews-led; keywords map bale imports and Gikomba-class markets.\n\nGaps surface when political rhetoric on bans diverges from port reality—intel domestic producers need before investing.`,
  },
  "16.3": {
    eyebrow: "Fashion Brands · 👗",
    title: "Connect brand heat to sourcing reliability, influencer ROI, and retail shelf",
    body: `Fashion brands monetize desirability with thin inventory risk—lead times matter. Infinitygap ties trade and logistics news to social and culture headlines so founders see when sourcing countries face shocks or influencer fatigue hits conversion.\n\nNews-led; keywords map African fashion and direct-to-consumer brands.\n\nVersus generic trend reports, you see when marketing spend rises faster than sell-through—burn rate intel.`,
  },
  "16.4": {
    eyebrow: "Leather/Shoes · 👗",
    title: "Model tannery supply against hide costs, effluent rules, and footwear retail",
    body: `Leather chains combine agriculture residuals with chemical processing and retail distribution. Infinitygap tracks livestock and environmental headlines with footwear industry news so operators see when hide supply or wastewater compliance shifts costs.\n\nNews-led; keywords map tanneries, Bata-class retailers, and footwear imports.\n\nMarket gaps appear when global sneaker hype diverges from local price sensitivity—segmentation generic “fashion” misses.`,
  },

  // --- Automotive ---
  "17.1": {
    eyebrow: "New Cars · 🚗",
    title: "Anticipate new vehicle demand from distributor incentives, credit, and duties",
    body: `New car distribution is franchise economics plus captive finance—rates and FX hit monthly payments hard. Infinitygap merges auto equities and credit headlines with import policy news so dealers see when inventory months or incentive wars shift.\n\nStocks and news integrate; keywords map OEM distributors and vehicle finance.\n\nAlerts surface when global model launches diverge from local affordability—pipeline intel headline “units sold” obscures.`,
  },
  "17.2": {
    eyebrow: "Used Cars · 🚗",
    title: "Track used import arbitrage: auction prices, clearing friction, and age rules",
    body: `Used imports are Japan auction prices plus landed duty math—rule changes move markets fast. Infinitygap focuses automotive import and clearing headlines with currency moves so importers see when duty bands or inspection rules alter supply.\n\nNews-led; keywords map auction exporters and port clearing.\n\nGaps show when CIF falls but clearing delays raise effective cost—integration spreadsheet models miss.`,
  },
  "17.3": {
    eyebrow: "Parts/Service · 🚗",
    title: "See aftermarket margin as OEM parts pricing meets parallel import competition",
    body: `Parts and service monetize fleet age and brand loyalty—counterfeits erode trust. Infinitygap ties automotive retail news to import policy headlines so garages and distributors see when genuine parts pricing or EV-specific components shift demand.\n\nNews and stocks where parts giants are listed; keywords map aftermarket and service networks.\n\nYou beat generic “cars on the road” stats by spotting when EV adoption changes parts mix before bays retool.`,
  },
  "17.4": {
    eyebrow: "EV · 🚗",
    title: "Compare EV adoption to grid capacity, duty treatment, and charging economics",
    body: `Electric vehicles sit at the intersection of auto policy, power reliability, and charging business models. Infinitygap merges energy and automotive headlines with EV vendor news so planners see when imports, battery costs, or charging tariffs change TCO.\n\nStocks and news integrate; keywords map BYD-class entrants and e-boda conversion.\n\nMarket gaps surface when headline EV hype meets daily load-shedding reality—local intel global EV sales charts ignore.`,
  },
  "17.5": {
    eyebrow: "Insurance/Lease · 🚗",
    title: "Read motor underwriting cycles against claims inflation and asset prices",
    body: `Motor insurance and leasing are frequency × severity plus residual value risk. Infinitygap tracks traffic safety headlines with auto market and credit news so underwriters see when parts inflation or currency moves change loss ratios.\n\nNews-led; keywords map comprehensive cover and vehicle leasing programs.\n\nGaps highlight when premium growth masks rising claims severity—combined ratio intel generic “premiums up” misses.`,
  },

  // --- Aerospace & Defence ---
  "18.1": {
    eyebrow: "Aviation · ✈️",
    title: "Connect airline balance sheets to MRO backlogs, fuel hedges, and bilateral rights",
    body: `Civil aviation is yield management under FX-denominated leases and fuel swings. Infinitygap merges flight and aviation news with listed airline tape so analysts see when MRO slots, pilot supply, or slot constraints cap recovery.\n\nFlights, stocks, and news integrate; keywords map major OEMs, lessors, and airports.\n\nVersus generic travel demand indices, you get maintenance and lessor risk that determine cash burn.`,
  },
  "18.2": {
    eyebrow: "Defence · ✈️",
    title: "Track defence budgets, offsets, and procurement integrity risk",
    body: `Defence spending is lumpy and political—offsets and local content rules reshape supplier economics. Infinitygap ties geopolitical headlines to defence contractor equities and procurement news so strategists see when budget cycles or corruption probes shift awards.\n\nStocks and news together; keywords map major primes and national security procurement.\n\nAlerts surface when headline alliances diverge from actual disbursement—classic gap for anyone bidding.`,
  },
  "18.3": {
    eyebrow: "Space · ✈️",
    title: "Separate launch cost curves from satellite service demand and spectrum politics",
    body: `Space economics split launch, manufacturing, and downstream services—Starlink-class constellations change the game. Infinitygap tracks space industry and telecom headlines with listed space proxies so investors see when launch cadence or ITU spectrum filings threaten service rollout.\n\nNews and stocks integrate; keywords map launch providers and earth observation.\n\nMarket gaps appear when headline “space boom” meets long payback on bespoke satellites—segmentation matters.`,
  },
  "18.4": {
    eyebrow: "Drones · ✈️",
    title: "Model drone services against licensing, insurance, and client liability",
    body: `Commercial drones monetize inspections and agriculture—but regulators and insurers gate scale. Infinitygap merges aviation authority headlines with ag and mining news so operators see when permit backlogs or liability caps change ROI.\n\nNews-led; keywords map UAV services and precision agriculture.\n\nYou beat generic “drones are cool” pitches by tying revenue to mission repeatability and weather risk.`,
  },
  "18.5": {
    eyebrow: "Security · ✈️",
    title: "Read private security spend from crime trends, insurance, and outsourcing",
    body: `Private security is recurring guard hours plus technology upsell—labor regulation and minimum wages bite. Infinitygap tracks crime and insurance headlines with facilities-management news so buyers see when outsourcing or tech substitution accelerates.\n\nNews-led; keywords map major guard firms and electronic security.\n\nGaps surface when headline crime drops but corporate duty-of-care expectations rise—pricing power intel.`,
  },

  // --- Consumer Electronics ---
  "19.1": {
    eyebrow: "Manufacturing · 📱",
    title: "Track device cycles against component shortages and distribution power",
    body: `Electronics manufacturing is BOM volatility plus channel control. Infinitygap merges semiconductor and handset headlines with listed OEM tape so strategists see when component allocation or regional launches misalign.\n\nStocks and news integrate; keywords map smartphone and EMS giants.\n\nAlerts highlight when global launch hype diverges from local FX affordability—sell-through intel.`,
  },
  "19.2": {
    eyebrow: "Retail/Repair · 📱",
    title: "Connect grey-market supply to warranty rules and e-waste recovery",
    body: `Electronics retail and repair live on import arbitrage and trust—counterfeit screens destroy reputations. Infinitygap tracks trade enforcement and e-waste policy headlines with local retail news so shops see when duties or right-to-repair shifts margin.\n\nNews-led; keywords map repair districts and recycling economics.\n\nMarket gaps show when new device sales slow but repair volume spikes—mix shift intel.`,
  },
  "19.3": {
    eyebrow: "IoT · 📱",
    title: "See IoT attach rates against power reliability, telco partnerships, and cyber risk",
    body: `Smart home and fleet IoT monetize subscriptions on top of hardware—churn follows service quality. Infinitygap merges telecom and cybersecurity headlines with IoT vendor news so installers see when data residency or botnet scares slow adoption.\n\nNews and stocks integrate; keywords map smart meters, CCTV, and fleet tracking.\n\nVersus generic “IoT growth” charts, you see enterprise vs consumer divergence in your region.`,
  },

  // --- Chemicals & Petrochemicals ---
  "20.1": {
    eyebrow: "Chemicals · 🧪",
    title: "Trade chemical margins as feedstock spreads and capacity cycles move",
    body: `Industrial chemicals are spread businesses—natural gas vs naphtha routes matter. Infinitygap ties commodity and energy benchmarks to chemical equities and plant news so traders see when outages or trade flows shift regional pricing.\n\nCommodities, stocks, and news integrate; keywords map major chemical conglomerates.\n\nGaps surface when headline oil falls but specialty chemical tightness remains—product-level intel generic energy dashboards miss.`,
  },
  "20.2": {
    eyebrow: "Fertiliser · 🧪",
    title: "Connect fertiliser affordability to farmer credit and import subsidy timing",
    body: `Fertiliser is global nutrient pricing meeting seasonal cash flow. Infinitygap merges nutrient benchmarks with ag policy headlines so distributors see when subsidy programs or port delays break application windows.\n\nCommodities, news, and stocks together; keywords map urea, DAP, and national fertilizer programs.\n\nAlerts flag when global prices ease but local blending plants face energy rationing—effective price intel.`,
  },
  "20.3": {
    eyebrow: "Plastics · 🧪",
    title: "Read polymer demand against packaging regulation and recycled feedstock supply",
    body: `Plastics sit between petrochemical feedstocks and EPR pressure—ban lists move volumes fast. Infinitygap tracks plastic policy and recycling headlines with polymer market news so converters see when rPET availability or import rules change cost curves.\n\nCommodities and news integrate; keywords map PET, HDPE, and packaging.\n\nMarket gaps appear when consumer brands pledge circularity faster than collection infrastructure exists—execution risk intel.`,
  },
  "20.4": {
    eyebrow: "Pharma Chem · 🧪",
    title: "Track API economics under quality audits, freight, and pharma demand",
    body: `Pharmaceutical chemicals are regulatory manufacturing with logistics sensitivity—FDA-style inspections can halt plants. Infinitygap merges pharma manufacturing headlines with freight and trade news so buyers see when intermediate shortages threaten tablet supply.\n\nNews and stocks integrate; keywords map API synthesis and intermediate chemicals.\n\nYou beat generic “supply chain” blurbs by staging raw material → intermediate → dose form realistically.`,
  },

  // --- Politics & Government ---
  "21.1": {
    eyebrow: "Elections · 🏛️",
    title: "Translate campaign spend and polls into policy and procurement implications",
    body: `Elections reorder budgets, regulation, and business confidence. Infinitygap structures political news with sector keywords so investors see when campaign promises imply tax, trade, or sector-specific shifts—not just horse-race coverage.\n\nNews-led; social adds ground sentiment and turnout risk early.\n\nVersus generic polling summaries, you get second-order links to your flows: who benefits if coalitions change.`,
  },
  "21.2": {
    eyebrow: "Legislation · 🏛️",
    title: "Monitor bill progress and committee dynamics that move your sector",
    body: `Legislation is procedural—timing kills deals as much as content. Infinitygap tracks committee calendars, amendments, and lobbying headlines so operators see when compliance costs or market openings will actually land.\n\nNews-led; keywords map parliament/congress processes and regulatory agencies.\n\nGaps surface when headlines celebrate introduction but appropriations never fund enforcement—intel operators need for planning.`,
  },
  "21.3": {
    eyebrow: "Geopolitics · 🏛️",
    title: "Map sanctions, alliances, and trade corridors to your supply and funding",
    body: `Geopolitics rewrites trade and capital flows overnight—exposure is rarely single-country. Infinitygap merges diplomatic headlines with commodities and FX news so treasurers see when sanctions, aid, or alliance shifts reroute shipments.\n\nNews-led; keywords map major blocs and conflict regions.\n\nAlerts highlight when markets price peace headlines faster than customs reality changes—classic gap.`,
  },
  "21.4": {
    eyebrow: "Procurement · 🏛️",
    title: "Track tender pipelines, award integrity, and fiscal room for capital spend",
    body: `Public procurement is fiscal capacity times political willingness—audit scandals freeze pipelines. Infinitygap focuses government spending and infrastructure headlines with anti-corruption news so contractors see when payment risk or bid rules shift.\n\nNews-led; keywords map PPP, tenders, and national budgets.\n\nYou move beyond generic “government is inefficient” to which ministries actually have cash this quarter.`,
  },
  "21.5": {
    eyebrow: "Lobbying · 🏛️",
    title: "See policy influence markets before votes—who funds access and outcomes",
    body: `Lobbying spend signals where industries expect rule changes. Infinitygap tracks influence and think-tank headlines alongside sector news so strategists see when upcoming rules favor incumbents or insurgents.\n\nNews-led; keywords map PACs, industry associations, and regulatory comments.\n\nGaps appear when public rhetoric stays populist but draft rules stay industry-friendly—intel investors exploit.`,
  },
  "21.6": {
    eyebrow: "Governance · 🏛️",
    title: "Connect governance crackdowns to contract enforceability and capital flight risk",
    body: `Governance quality changes discount rates—suddenly. Infinitygap merges rule-of-law headlines with sector corruption probes so lenders see when judicial delays or asset seizures threaten recoveries.\n\nNews-led; keywords map anti-corruption bodies and judicial independence.\n\nVersus generic country risk scores, you get event-driven alerts tied to your counterparties.`,
  },
  "21.7": {
    eyebrow: "Tax Policy · 🏛️",
    title: "Model tax changes for digital services, transfer pricing, and investment incentives",
    body: `Tax policy moves FDI and operating margins—digital VAT and withholding rules hit differently by sector. Infinitygap tracks revenue authority headlines with industry reactions so CFOs see when incentive sunsets or enforcement waves land.\n\nNews-led; keywords map VAT, income tax, and digital services taxes.\n\nMarket gaps surface when headline “rate cuts” hide base broadening—effective rate intel.`,
  },

  // --- Climate & Sustainability ---
  "22.1": {
    eyebrow: "Climate Policy · 🌍",
    title: "Translate COP commitments into national implementation and capital availability",
    body: `Climate policy is global targets with local politics—NDCs mean different things by country. Infinitygap merges climate diplomacy headlines with energy and finance news so project developers see when funding windows or carbon border rules shift ROI.\n\nNews-led; keywords map Paris Agreement, net zero, and IPCC narratives.\n\nAlerts highlight when corporate pledges outpace grid or finance reality—implementation gaps matter.`,
  },
  "22.2": {
    eyebrow: "ESG · 🌍",
    title: "Read ESG fund flows against greenwashing enforcement and rating methodology shifts",
    body: `ESG investing is allocator mandates meeting noisy ratings—methodology changes move billions. Infinitygap ties asset-manager headlines to regulatory ESG news so issuers see when disclosure rules or green bond standards tighten.\n\nNews and stocks integrate; keywords map TCFD, green bonds, and ratings agencies.\n\nGaps show when funds market ESG while underlying holdings face fossil exposure—intel diligence teams need.`,
  },
  "22.3": {
    eyebrow: "Adaptation · 🌍",
    title: "Connect climate shocks to insurance gaps, humanitarian spend, and resilient infra",
    body: `Adaptation is where physical risk becomes fiscal risk—droughts and floods move budgets fast. Infinitygap merges climate impact headlines with insurance and infrastructure news so governments and NGOs see when aid or cat bonds won’t cover losses.\n\nNews-led; weather adds seasonal context where relevant.\n\nYou beat generic “climate risk” essays by tying events to procurement and migration second-order effects.`,
  },
  "22.4": {
    eyebrow: "Circular · 🌍",
    title: "Track circular business models against collection economics and brand commitments",
    body: `Circular economy projects need reliable feedstock—without collection, recycling plants starve. Infinitygap tracks waste policy and brand sustainability pledges with commodity recovery prices so operators see when EPR fees or import bans change feedstock.\n\nNews-led; keywords map extended producer responsibility and plastic credits.\n\nMarket gaps appear when brands promise recycled content faster than sorting quality allows—supplier intel.`,
  },

  // --- Sports & Leisure ---
  "23.1": {
    eyebrow: "Pro Sports · ⚽",
    title: "Model sports economics: media rights, salary caps, and sponsorship cyclicality",
    body: `Professional sports are media rights packages with labor rules—cord-cutting changes everything. Infinitygap merges broadcast and streaming headlines with league news so investors see when rights inflation or player share shifts EBITDA.\n\nNews-led; keywords map major leagues, federations, and media rights auctions.\n\nVersus fan chatter, you get revenue mix intel: ticketing vs broadcast vs sponsorship.`,
  },
  "23.2": {
    eyebrow: "Betting · ⚽",
    title: "Read betting GGR against taxation, responsible-gambling rules, and payment rails",
    body: `Sports betting is high-frequency revenue under heavy regulation—tax hikes hit fast. Infinitygap tracks gambling policy headlines with operator news and social sentiment on addiction so analysts see when markets mature or go dark.\n\nNews-led; keywords map bookmakers, GGR, and licensing.\n\nGaps surface when user growth looks strong but free-bet subsidies mask churn—unit economics intel.`,
  },
  "23.3": {
    eyebrow: "Sponsorship · ⚽",
    title: "Connect sponsorship budgets to brand safety and athlete reputation risk",
    body: `Sports marketing spend follows brand health and scandal cycles—one athlete headline can void value. Infinitygap merges consumer brand earnings with sports headlines so marketers see when naming rights or jersey deals reprice.\n\nNews-led; keywords map endorsements and sports marketing agencies.\n\nYou beat generic “sports marketing works” by tracking ROI pressure when macro cuts marketing budgets.`,
  },
  "23.4": {
    eyebrow: "Fitness · ⚽",
    title: "See fitness spend as subscription fatigue meets health insurance incentives",
    body: `Fitness blends discretionary spend with chronic-disease prevention narratives—employer wellness budgets matter. Infinitygap tracks health and consumer headlines with fitness brand news so operators see when gym churn or app competition shifts.\n\nNews-led; keywords map gyms, wearables, and wellness apps.\n\nMarket gaps appear when downloads rise but class attendance falls—hybrid model intel.`,
  },

  // --- Non-Profit & Development ---
  "24.1": {
    eyebrow: "Aid · 🤝",
    title: "Align donor commitments with disbursement rules and counterpart politics",
    body: `International aid is pledged capital under political conditionality—disbursement lags kill projects. Infinitygap tracks multilateral and bilateral headlines with local governance news so implementers see when funding windows or currency convertibility shift.\n\nNews-led; keywords map USAID, World Bank, IMF, and major grants.\n\nGaps surface when headline pledges exceed actual board approvals—pipeline intel NGOs live on.`,
  },
  "24.2": {
    eyebrow: "NGOs · 🤝",
    title: "Monitor NGO funding mix: grants, donations, and earned revenue under scrutiny",
    body: `NGOs compete for grants while managing reputational risk—scandals freeze donations fast. Infinitygap merges philanthropy headlines with sector-specific crises news so leaders see when donor priorities or compliance rules shift.\n\nNews-led; keywords map major foundations and humanitarian agencies.\n\nYou move beyond generic “nonprofit impact” to cash runway and restricted funding realities.`,
  },
  "24.3": {
    eyebrow: "Social Enterprise · 🤝",
    title: "Track impact metrics and blended finance terms against commercial viability",
    body: `Social enterprises must satisfy investors and mission—impact measurement costs real money. Infinitygap ties impact investing headlines with sector operating news so founders see when concessionary capital dries up or SDG-linked incentives improve.\n\nNews-led; keywords map B-Corps, impact funds, and SDGs.\n\nMarket gaps appear when impact reports look great but unit economics still fail—diligence intel.`,
  },
  "24.4": {
    eyebrow: "Humanitarian · 🤝",
    title: "Anticipate humanitarian response from conflict, climate, and funding appeals",
    body: `Humanitarian aid is logistics under chaos—access determines outcomes more than cash raised. Infinitygap merges conflict and disaster headlines with logistics and donor news so responders see when corridors close or earmarks block flexibility.\n\nNews-led; keywords map UN agencies, appeals, and refugee flows.\n\nAlerts highlight when headline donations surge but port access fails—execution gap intel.`,
  },

  // --- Shipping & Maritime ---
  "25.1": {
    eyebrow: "Containers · 🚢",
    title: "Trade container rates for schedule reliability, blank sailings, and port congestion",
    body: `Container shipping is global freight converted into line-item delays at your port. Infinitygap merges liner earnings headlines with port and trade news so shippers see when schedule reliability or equipment availability breaks contracts.\n\nNews and stocks integrate; keywords map major alliances and TEU pricing.\n\nGaps surface when spot rates fall but inland rail and trucking stay expensive—landed cost intel headline indices miss.`,
  },
  "25.2": {
    eyebrow: "Bulk/Tanker · 🚢",
    title: "Connect Baltic indices to charterer behavior and commodity pull",
    body: `Dry bulk and tankers are asset plays on trade flows and fuel costs—sanctions reroute ships. Infinitygap ties commodity benchmarks to shipping equities and maritime headlines so traders see when charter rates diverge from commodity narratives.\n\nCommodities, news, and stocks together; keywords map Capesize, VLCC, and LNG carriers.\n\nYou beat generic commodity charts by staging seaborne logistics constraints.`,
  },
  "25.3": {
    eyebrow: "Ports · 🚢",
    title: "Read terminal productivity as concession renewals and labor disputes bite",
    body: `Ports monetize throughput and fees—labor and equipment determine both. Infinitygap tracks port authority headlines with shipping congestion news so logistics buyers see when dwell times or crane availability break SLAs.\n\nNews and stocks where terminal operators are listed; keywords map stevedoring and berth fees.\n\nAlerts highlight when national policy pushes transshipment away from your hub—structural risk.`,
  },
  "25.4": {
    eyebrow: "Shipbuilding · 🚢",
    title: "Model shipyard orderbooks against steel costs and delivery delays",
    body: `Shipbuilding is long-cycle capex with steel input volatility—delays cascade to charter markets. Infinitygap merges industrial and maritime headlines with yard order news so financiers see when slot scarcity or classification disputes threaten delivery.\n\nNews and stocks integrate; keywords map major yards and newbuild prices.\n\nMarket gaps appear when headline fleet renewal meets financing winter—order cancellation intel.`,
  },
  "25.5": {
    eyebrow: "Maritime Law · 🚢",
    title: "See P&I and hull risk as sanctions, collisions, and cargo claims spike",
    body: `Maritime insurance is mutualized risk with legal tail—sanctions can void cover overnight. Infinitygap tracks sanctions and casualty headlines with insurance market news so owners see when war-risk premiums or claims inflation move.\n\nNews-led; keywords map P&I clubs, Lloyd’s, and admiralty disputes.\n\nVersus generic “shipping risk,” you get claims and subrogation dynamics that decide year-end results.`,
  },

  // --- Creative & Design Economy ---
  "26.1": {
    eyebrow: "Design · 🎨",
    title: "Track design demand from brand refreshes, funding winters, and platform shifts",
    body: `Design services follow marketing budgets and startup formation—both are cyclical. Infinitygap merges ad-spend and tech funding headlines with creative industry news so studios see when retainers replace project work.\n\nNews-led; keywords map agencies, Figma-class workflows, and branding.\n\nGaps surface when AI tools flood the market but clients still pay for strategic differentiation—pricing intel.`,
  },
  "26.2": {
    eyebrow: "Art Market · 🎨",
    title: "Read gallery and auction liquidity against crypto/NFT shocks and wealth cycles",
    body: `Art markets are luxury spend with speculative wings—NFT mania proved correlation to crypto. Infinitygap tracks auction headlines with wealth and crypto news so collectors see when liquidity or authenticity scandals freeze bidding.\n\nNews-led; keywords map major auction houses and art fairs.\n\nYou beat generic “art as an asset class” by spotting when guarantors and third-party bids distort clearing prices.`,
  },
  "26.3": {
    eyebrow: "Publishing · 🎨",
    title: "Connect publishing economics to platform algorithms, paper costs, and strikes",
    body: `Publishing spans books and newsprint—cost curves and distribution deals differ. Infinitygap merges paper and logistics headlines with media industry news so publishers see when returns policies or platform algorithms shift royalties.\n\nNews and stocks integrate; keywords map trade publishing and self-publishing platforms.\n\nMarket gaps appear when unit sales look flat but returns and ad revenue diverge—mix intel.`,
  },
  "26.4": {
    eyebrow: "Photo/Video · 🎨",
    title: "Model licensing revenue against AI-generated content and rights disputes",
    body: `Photography and video are usage rights businesses under AI disruption—stock libraries reprice. Infinitygap tracks copyright and AI policy headlines with media tech news so creators see when licensing markets or client budgets shift.\n\nNews-led; keywords map stock imagery and production houses.\n\nAlerts highlight when clients demand faster turnaround at lower fees—rate compression intel.`,
  },
  "26.5": {
    eyebrow: "Product Design · 🎨",
    title: "Link industrial design fees to manufacturing readiness and tooling spend",
    body: `Product design pays when prototypes become SKUs—tooling and MOQs decide winners. Infinitygap merges manufacturing and crowdfunding headlines with design industry news so consultancies see when clients pause NPD during downturns.\n\nNews-led; keywords map prototyping, CAD, and design-for-manufacturing.\n\nGaps show when headline innovation budgets shrink but compliance redesign still mandates work—pocket intel.`,
  },

  // --- Religious & Faith Organizations ---
  "27.1": {
    eyebrow: "Church · 🕊️",
    title: "See congregation economics: giving patterns, building debt, and staff costs",
    body: `Churches run on voluntary giving with capital campaigns—macro stress hits tithes. Infinitygap tracks household economics headlines with religious community news so leaders see when missions travel or building projects face financing gaps.\n\nNews-led; social captures generational giving shifts early.\n\nVersus generic philanthropy stats, you get cash-flow realism for campus expansion plans.`,
  },
  "27.2": {
    eyebrow: "Religious Media · 🕊️",
    title: "Track faith media revenue from donations, ads, and distribution deals",
    body: `Religious broadcasting blends donor support with advertising—platform rules matter. Infinitygap merges media industry headlines with faith-content news so producers see when distribution costs or platform policy shifts viewership economics.\n\nNews-led; keywords map religious networks and digital ministries.\n\nGaps surface when audience numbers look strong but donor conversion weakens—ARPU intel.`,
  },
  "27.3": {
    eyebrow: "Pilgrimage · 🕊️",
    title: "Model pilgrimage demand from visa quotas, airfare, and safety perception",
    body: `Religious tourism is peaky and policy-sensitive—visa caps move revenue overnight. Infinitygap ties aviation and travel headlines to religious event news so operators see when quotas, disease outbreaks, or diplomatic rows change flows.\n\nNews-led; keywords map Hajj, Umrah, and major pilgrimage sites.\n\nAlerts highlight when spiritual demand exceeds transport capacity—pricing power intel.`,
  },
  "27.4": {
    eyebrow: "Faith Schools · 🕊️",
    title: "Connect faith-based education finance to endowments, fees, and aid competition",
    body: `Faith-based schools and charities balance mission with solvency—donor fatigue is real. Infinitygap merges education policy headlines with nonprofit news so institutions see when voucher programs or regulatory scrutiny shift enrollment.\n\nNews-led; keywords map faith schools and religious charities.\n\nMarket gaps appear when enrollment is stable but unrestricted donations fall—balance sheet intel.`,
  },

  // --- Gambling, Lottery & Betting ---
  "28.1": {
    eyebrow: "Online Betting · 🎰",
    title: "Read online betting economics under tax raids and payment blocking",
    body: `Online sports betting competes on odds, UX, and regulatory tolerance—payment rails are existential. Infinitygap tracks gambling law headlines with fintech and telco news so operators see when deposit routes or advertising bans move GGR.\n\nNews and stocks integrate; keywords map major online bookmakers.\n\nGaps surface when user counts rise but effective tax rates jump—net revenue intel headline MAU hides.`,
  },
  "28.2": {
    eyebrow: "Casino · 🎰",
    title: "Connect casino visitation to travel, VIP mix, and junket regulation",
    body: `Casinos are destination and VIP economics—Macau-style junkets show how sensitive revenue is. Infinitygap merges travel and hospitality headlines with gaming operator news so investors see when visa rules or anti-money-laundering crackdowns hit premium play.\n\nNews and stocks together; keywords map integrated resorts and iGaming.\n\nYou beat generic “gaming growth” by separating mass market from VIP hold volatility.`,
  },
  "28.3": {
    eyebrow: "Lottery · 🎰",
    title: "Track lottery transfers to good causes against political appetite for revenue",
    body: `State lotteries are tax-like revenue with marketing budgets—public scrutiny swings. Infinitygap focuses national lottery headlines with fiscal policy news so analysts see when payout ratios or retailer commissions face reform.\n\nNews-led; keywords map national lotteries and scratch cards.\n\nAlerts highlight when governments raise lottery contributions to plug deficits—demand risk follows.`,
  },
  "28.4": {
    eyebrow: "Horse Racing · 🎰",
    title: "Model racing economics: purses, wagering takeout, and bloodstock cycles",
    body: `Horse racing ties wagering pools to breeding investment—long feedback loops. Infinitygap tracks racing authority headlines with gambling news so investors see when takeout changes or animal-welfare rules shift handle.\n\nNews-led; keywords map pari-mutuel pools and bloodstock auctions.\n\nMarket gaps appear when headline attendance falls but online wagering rises—channel mix intel.`,
  },

  // --- Blockchain & Digital Assets ---
  "29.1": {
    eyebrow: "Crypto Exchange · 🔗",
    title: "Separate exchange volumes from custody risk, listing politics, and proof-of-reserves",
    body: `Crypto exchanges are trust businesses under regulatory siege—proof of reserves became table stakes after failures. Infinitygap merges crypto market data with enforcement headlines so users and investors see when jurisdictions or banking partners shift.\n\nCrypto, news, and stocks integrate; keywords map major CEX and DEX dynamics.\n\nGaps surface when trading volumes look healthy but fiat ramps break—liquidity intel headline prices miss.`,
  },
  "29.2": {
    eyebrow: "DeFi · 🔗",
    title: "Track DeFi TVL against smart-contract risk, oracle failures, and regulatory mapping",
    body: `DeFi monetizes liquidity and leverage—bugs and governance attacks are existential. Infinitygap ties on-chain narrative headlines with policy news so strategists see when bridges, stablecoins, or sanctions lists break composability.\n\nCrypto and news together; keywords map major protocols and TVL.\n\nVersus generic “DeFi yields,” you get protocol-specific exploit and regulatory tail risk.`,
  },
  "29.3": {
    eyebrow: "Mining/Staking · 🔗",
    title: "Read mining and staking economics against energy prices and halving cycles",
    body: `Proof-of-work mining is energy arbitrage; staking is opportunity cost and slashing risk. Infinitygap merges energy and commodities headlines with crypto network news so operators see when power tariffs or hardware import rules change breakevens.\n\nCrypto, news, and commodities context integrate; keywords map miners and validators.\n\nAlerts highlight when coin price rises but hosting costs eat margin—local intel global hashrate charts ignore.`,
  },
  "29.4": {
    eyebrow: "NFTs/Tokens · 🔗",
    title: "Connect NFT liquidity to royalty enforcement, marketplace policy, and IP law",
    body: `NFT markets are thin liquidity with legal ambiguity—royalty defaults broke creator economics. Infinitygap tracks IP and platform policy headlines with crypto market moves so creators see when enforcement or marketplace fee wars shift secondary sales.\n\nCrypto and news integrate; keywords map major marketplaces and tokenization.\n\nGaps show when floor prices stabilize but volume collapses—liquidity illusion intel.`,
  },
  "29.5": {
    eyebrow: "Stablecoins · 🔗",
    title: "Model stablecoin flows against reserve transparency, yields, and CBDC competition",
    body: `Stablecoins sit between bank rails and crypto—reserve quality and yield on reserves matter. Infinitygap merges banking and regulatory headlines with stablecoin news so treasurers see when redemption gates or CBDC pilots reroute digital dollars.\n\nCrypto and news together; keywords map USDT, USDC, and CBDC programs.\n\nMarket gaps appear when peg holds but issuer yield compression threatens sustainability—risk intel.`,
  },

  // --- Personal & Household Services ---
  "30.1": {
    eyebrow: "Beauty/Salon · 🏠",
    title: "See salon economics: chair utilization, product margin, and rent escalators",
    body: `Beauty and grooming are high-touch local services—rent and labor dominate. Infinitygap merges consumer spending headlines with small-business policy news so owners see when product costs or licensing rules shift unit economics.\n\nNews-led; social captures style trends and local competition early.\n\nGaps surface when foot traffic returns but average ticket doesn’t—mix shift intel chain counts miss.`,
  },
  "30.2": {
    eyebrow: "Domestic Staff · 🏠",
    title: "Track domestic staffing regulation, minimum wages, and platform commission",
    body: `Domestic work platforms monetize matches—legal status and minimum wages reshape models overnight. Infinitygap focuses labor law headlines with gig-economy news so agencies see when compliance costs or union pressure rise.\n\nNews-led; keywords map domestic workers and staffing agencies.\n\nYou move beyond generic “gig economy” to household employer obligations and liability.`,
  },
  "30.3": {
    eyebrow: "Childcare · 🏠",
    title: "Connect childcare demand to female labor participation and fee regulation",
    body: `Childcare is demographic demand with staffing shortages—policy subsidies can flip viability. Infinitygap merges labor-market and family policy headlines with education news so providers see when voucher programs or school calendars shift enrollment.\n\nNews-led; keywords map daycare, nursery, and early childhood education.\n\nAlerts highlight when waitlists grow faster than qualified staff supply—quality risk intel.`,
  },
  "30.4": {
    eyebrow: "Eldercare · 🏠",
    title: "Model eldercare spend against medical inflation and family caregiving capacity",
    body: `Eldercare bridges healthcare and real estate—reimbursement rules dominate. Infinitygap ties health insurance headlines with senior living news so operators see when Medicaid-style coverage or migration patterns change occupancy.\n\nNews-led; keywords map assisted living and home nursing.\n\nGaps surface when aging demographics look inevitable but payer mix deteriorates—margin intel.`,
  },
  "30.5": {
    eyebrow: "Home Repair · 🏠",
    title: "Read home maintenance demand from weather events, rates, and DIY competition",
    body: `Home repair is emergency spend plus renovation cycles—rates affect discretionary upgrades. Infinitygap merges housing and weather headlines with gig platform news so artisans see when lead prices or materials inflation squeeze quotes.\n\nNews-led; keywords map handyman platforms and trades.\n\nMarket gaps appear when job postings rise but completion rates fall—capacity intel.`,
  },
  "30.6": {
    eyebrow: "Pet Care · 🏠",
    title: "Track pet spend premiumization against vet capacity and import parity on food",
    body: `Pet care follows humanization trends—vet shortages cap growth. Infinitygap ties consumer brand headlines with veterinary regulation news so clinics and brands see when import duties or pharmacy rules change COGS.\n\nNews and stocks integrate; keywords map pet food, insurance, and veterinary chains.\n\nVersus generic “pet boom” charts, you see when premium food sales outrun vet appointment slots—service bottleneck intel.`,
  },
};
