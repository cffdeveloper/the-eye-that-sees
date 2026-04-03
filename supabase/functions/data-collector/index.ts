/**
 * System-1 data collector — scheduled ingestion into raw_market_data.
 *
 * ARCHITECTURE: Every industry/sub-flow gets 20-100+ dedicated data sources by
 * multiplying keyword queries across multiple platforms:
 *   • Google News RSS — per-country editions (45+ countries) × industry keywords
 *   • GDELT — industry-specific event queries
 *   • Reddit — industry-specific subreddits (5-30 per industry)
 *   • Twitter/X — industry keyword searches
 *   • YouTube — industry-specific channels
 *   • Specialized APIs — CoinGecko, forex, World Bank, etc.
 *   • Hacker News, Dev.to, GitHub — tech signals
 *
 * Each sub-flow's keywords are queried across ALL source platforms, giving
 * 20-100+ unique data source combinations per sub-category.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function safeFetch(url: string, timeout = 12000): Promise<any> {
  try {
    const c = new AbortController();
    const id = setTimeout(() => c.abort(), timeout);
    const r = await fetch(url, { signal: c.signal });
    clearTimeout(id);
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

async function safeFetchWithHeaders(url: string, headers: Record<string, string>, timeout = 15000): Promise<any> {
  try {
    const c = new AbortController();
    const id = setTimeout(() => c.abort(), timeout);
    const r = await fetch(url, { signal: c.signal, headers });
    clearTimeout(id);
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

async function safeTextFetch(url: string, timeout = 12000): Promise<string | null> {
  try {
    const c = new AbortController();
    const id = setTimeout(() => c.abort(), timeout);
    const r = await fetch(url, { signal: c.signal });
    clearTimeout(id);
    if (!r.ok) return null;
    return await r.text();
  } catch { return null; }
}

// ═══════════════════════════════════════════════════════════════════
// INDUSTRY SOURCE REGISTRY
// Maps every industry to dedicated subreddits, search terms, YouTube
// channels, and specialized API endpoints. Combined with country-level
// Google News and GDELT queries, each sub-flow reaches 20-100+ sources.
// ═══════════════════════════════════════════════════════════════════

interface IndustrySourceCfg {
  slug: string;
  subreddits: string[];
  googleQueries: string[];   // Queried across ALL 45+ country editions
  gdeltQueries: string[];    // Queried against GDELT
  twitterTerms: string[];    // Queried against Twitter API
  youtubeChannels: string[];
  specialApis?: (() => Promise<any[]>)[];
}

const INDUSTRY_SOURCES: IndustrySourceCfg[] = [
  {
    slug: "technology",
    subreddits: ["technology","programming","webdev","machinelearning","artificial","datascience","cybersecurity","netsec","cloud","aws","azure","googlecloud","devops","linux","Python","javascript","rust","golang","computerscience","startups","SaaS","sysadmin","selfhosted","homelab","apple","android","windows","hardware","buildapc","semiconductors","chipdesign"],
    googleQueries: ["technology+startup","SaaS+cloud+computing","artificial+intelligence+AI","cybersecurity+data+breach","semiconductor+chip","mobile+app+development","open+source+software","machine+learning+deep+learning","cloud+infrastructure+AWS+Azure","software+engineering","IT+services+outsourcing","5G+technology","quantum+computing"],
    gdeltQueries: ["technology%20startup%20innovation","cybersecurity%20breach%20hack","artificial%20intelligence%20machine%20learning","semiconductor%20chip%20shortage","cloud%20computing%20infrastructure","software%20SaaS%20platform"],
    twitterTerms: ["tech startup funding","AI artificial intelligence","cybersecurity breach","semiconductor chip","SaaS cloud","open source developer"],
    youtubeChannels: ["TechCrunch","TheVerge","Fireship","NetworkChuck","GoogleDevelopers","MicrosoftDeveloper"],
  },
  {
    slug: "telecommunications",
    subreddits: ["telecom","networking","cellphones","Starlink","5G","internetproviders","cordcutters","mobilenetwork","nocontract","spectrum","comcast","tmobile","verizon","fibre","VoIP","sysadmin"],
    googleQueries: ["telecom+5G+spectrum","mobile+network+operator","internet+service+provider","submarine+cable","mobile+money+digital+payments","tower+company+infrastructure","MVNO+virtual+network","broadband+fibre+connectivity"],
    gdeltQueries: ["telecom%20spectrum%20auction","mobile%20money%20payments","5G%20network%20rollout","submarine%20cable%20internet","tower%20company%20infrastructure"],
    twitterTerms: ["5G spectrum telecom","mobile money M-Pesa","broadband fiber","submarine cable","tower company"],
    youtubeChannels: ["MojoNetworks","LightReading"],
  },
  {
    slug: "financial-services",
    subreddits: ["finance","investing","stocks","wallstreetbets","personalfinance","FinancialPlanning","Banking","CreditCards","insurance","SecurityAnalysis","ValueInvesting","options","forex","cryptocurrency","venturecapital","privateequity","fintech","algotrading","econmonitor","economics","accounting","tax","CFP","RealEstate","FIREUK","AusFinance","IndianStreetBets","UKPersonalFinance","eupersonalfinance"],
    googleQueries: ["banking+finance+regulation","stock+market+IPO+listing","insurance+underwriting","fintech+digital+payments","venture+capital+funding","private+equity+deal","forex+currency+exchange","microfinance+financial+inclusion","wealth+management+HNWI","capital+markets+bonds","development+finance+DFI","asset+leasing"],
    gdeltQueries: ["banking%20interest%20rate","stock%20market%20crash%20rally","fintech%20payments%20mobile","venture%20capital%20startup%20funding","insurance%20claims%20regulation","forex%20currency%20exchange","private%20equity%20acquisition"],
    twitterTerms: ["stock market earnings","venture capital funding","fintech payments","banking regulation","forex currency","private equity deal","IPO listing"],
    youtubeChannels: ["Bloomberg","CNBC","YahooFinance","PatrickBoyle","EconomicsExplained","GrahamStephan"],
  },
  {
    slug: "energy",
    subreddits: ["energy","solar","renewableenergy","nuclear","oilandgas","electricvehicles","wind","geothermal","batteries","climatechange","NuclearPower","Futurology","GreenEnergy","oil","naturalgas","hydrogen","carbonmarkets","LPG","biogas"],
    googleQueries: ["oil+gas+crude+price","solar+energy+renewable","wind+power+turbine","nuclear+energy+reactor","carbon+credits+market","LPG+cooking+gas","electricity+grid+power","biogas+biomass+energy","energy+transition+climate","mini+grid+off+grid","geothermal+energy","hydrogen+fuel+cell"],
    gdeltQueries: ["oil%20gas%20crude%20price","solar%20energy%20renewable","nuclear%20power%20reactor","carbon%20credits%20market","energy%20transition%20green","electricity%20grid%20outage"],
    twitterTerms: ["oil price OPEC crude","solar energy renewable","nuclear power reactor","carbon credits market","energy transition","wind power turbine"],
    youtubeChannels: ["RealEngineering","UndecidedMattFerrell","JustHaveAThink","EngineeringExplained"],
  },
  {
    slug: "agriculture",
    subreddits: ["agriculture","farming","gardening","permaculture","AgTech","ranching","homestead","livestock","dairyfarming","organicfarming","foodscience","SupplyChain","foodindustry","nutrition","Aquaponics","Beekeeping","coffee","cacao"],
    googleQueries: ["agriculture+food+prices","farming+crop+harvest","fertilizer+agrochemical","food+processing+FMCG","agricultural+export+trade","cold+chain+logistics","agri+finance+insurance","livestock+dairy+poultry","food+security+famine","organic+farming+sustainable"],
    gdeltQueries: ["agriculture%20food%20prices","crop%20harvest%20farming","fertilizer%20shortage%20supply","food%20processing%20manufacturing","livestock%20dairy%20production","agricultural%20export%20trade"],
    twitterTerms: ["agriculture food prices","crop harvest farming","fertilizer supply","food processing FMCG","livestock dairy","agricultural export"],
    youtubeChannels: ["AGDaily","FarmingSecrets","SmithsonianChannel"],
  },
  {
    slug: "real-estate",
    subreddits: ["RealEstate","realestateinvesting","CommercialRealEstate","REBubble","PropertyManagement","Construction","architecture","urbanplanning","REIT","homebuilding","FirstTimeHomeBuyer","landlord","HomeImprovement","BuildingMaterials","civilengineering","AskEngineers"],
    googleQueries: ["real+estate+property+market","construction+infrastructure+project","building+materials+cement+steel","REIT+property+investment","affordable+housing+development","commercial+real+estate+office","architecture+urban+planning","facility+management+property"],
    gdeltQueries: ["real%20estate%20property%20market","construction%20infrastructure","building%20materials%20cement","housing%20development%20affordable","commercial%20real%20estate"],
    twitterTerms: ["real estate market","construction infrastructure","building materials","housing development","REIT property","commercial real estate"],
    youtubeChannels: ["GrahamStephan","MeetKevinREI","BiggerPockets"],
  },
  {
    slug: "trade-retail",
    subreddits: ["retail","ecommerce","smallbusiness","Entrepreneur","FulfillmentByAmazon","shopify","dropship","supplychain","logistics","FMCG","grocery","frugal","deals","flipping","Etsy","marketing","branding"],
    googleQueries: ["FMCG+consumer+goods+distribution","e-commerce+online+shopping","franchise+retail+chain","supermarket+grocery+retail","private+label+manufacturing","wholesale+trade+distribution","informal+trade+market"],
    gdeltQueries: ["ecommerce%20online%20shopping","FMCG%20consumer%20goods","retail%20franchise%20chain","wholesale%20trade%20distribution"],
    twitterTerms: ["ecommerce retail","FMCG consumer goods","franchise retail","wholesale trade","online shopping"],
    youtubeChannels: ["RetailDive","ModernRetail"],
  },
  {
    slug: "transport-logistics",
    subreddits: ["logistics","supplychain","Truckers","freight","aviation","flights","shipping","railroading","Trucking","maritime","lastmile","uberdrivers","lyftdrivers","deliverydrivers","rideshare","warehousing","3PL","FreightBrokers","AirCargo"],
    googleQueries: ["logistics+freight+transport","trucking+road+freight","shipping+container+port","aviation+airline+air+cargo","railway+rail+freight","last+mile+delivery","ride+hailing+Uber+Bolt","customs+clearing+forwarding","3PL+warehousing+fulfillment","supply+chain+disruption"],
    gdeltQueries: ["supply%20chain%20disruption","shipping%20container%20port","aviation%20airline%20flight","trucking%20freight%20logistics","railway%20rail%20freight"],
    twitterTerms: ["supply chain logistics","shipping container port","aviation airline","trucking freight","rail freight","last mile delivery"],
    youtubeChannels: ["WendoverProductions","RealLifeLore","PracticalEngineering"],
  },
  {
    slug: "health",
    subreddits: ["medicine","pharmacy","nursing","publichealth","healthIT","digitalhealth","biotech","pharma","healthcare","MedicalDevices","Radiology","labrats","psychotherapy","mentalhealth","HealthInsurance","Telemedicine","globalhealth","epidemiology","Nootropics","Supplements"],
    googleQueries: ["pharmaceutical+drug+medicine","hospital+healthcare+clinic","diagnostic+laboratory+testing","medical+equipment+device","digital+health+telemedicine","health+insurance+coverage","mental+health+therapy","biotech+clinical+trial","public+health+epidemic","vaccine+immunization"],
    gdeltQueries: ["pharmaceutical%20drug%20medicine","hospital%20healthcare%20crisis","biotech%20clinical%20trial","public%20health%20epidemic","mental%20health%20awareness","medical%20device%20technology"],
    twitterTerms: ["pharmaceutical drug","healthcare hospital","biotech clinical trial","public health","mental health","medical device","telemedicine digital health"],
    youtubeChannels: ["Medlife","DrEric","MedCram","Healthcare Triage"],
  },
  {
    slug: "education",
    subreddits: ["education","edtech","Teachers","highereducation","college","GradSchool","OnlineLearning","learnprogramming","languagelearning","studyAbroad","scholarships","homeschool","AskAcademia","Professors","MOOCs","datascience","coding"],
    googleQueries: ["education+school+university","edtech+online+learning","vocational+training+skills","corporate+training+L&D","study+abroad+scholarship","education+reform+policy","MOOC+online+course","student+loan+tuition"],
    gdeltQueries: ["education%20school%20reform","edtech%20online%20learning","university%20higher%20education","vocational%20training%20skills","student%20loan%20tuition"],
    twitterTerms: ["education school reform","edtech online learning","university higher education","vocational training","student loan"],
    youtubeChannels: ["TED","TEDEd","CrashCourse","Veritasium"],
  },
  {
    slug: "media-entertainment",
    subreddits: ["entertainment","movies","television","music","gaming","esports","podcasting","streaming","Netflix","DisneyPlus","Twitch","YouTube","TikTok","journalism","advertising","marketing","socialmedia","ContentCreation","podcasts","indiefilm","boxoffice"],
    googleQueries: ["media+entertainment+streaming","music+industry+Spotify","film+production+box+office","gaming+esports+mobile","social+media+influencer","advertising+digital+marketing","event+exhibition+conference","television+broadcast+ratings","podcast+audio+content","OOH+billboard+advertising"],
    gdeltQueries: ["entertainment%20streaming%20Netflix","music%20industry%20streaming","film%20box%20office","gaming%20esports","social%20media%20influencer","advertising%20digital%20marketing"],
    twitterTerms: ["streaming Netflix Disney","music industry Spotify","box office film","gaming esports","social media influencer","digital advertising"],
    youtubeChannels: ["MKBHD","LinusTechTips","PhilipDeFranco","GamersNexus"],
  },
  {
    slug: "hospitality-tourism",
    subreddits: ["travel","hotels","tourism","TravelHacks","solotravel","backpacking","Flights","Airbnb","digitalnomad","restaurateur","KitchenConfidential","Chefs","bartenders","cruise","foodtravel","luxurytravel","budgettravel","TravelNoPics"],
    googleQueries: ["hotel+hospitality+tourism","safari+tour+travel","restaurant+food+service","travel+agency+online+booking","Airbnb+short+term+rental","MICE+conference+tourism","cruise+travel+vacation","airline+flight+booking"],
    gdeltQueries: ["tourism%20hotel%20travel","restaurant%20food%20service","safari%20wildlife%20tourism","airline%20flight%20booking","conference%20MICE%20event"],
    twitterTerms: ["tourism hotel travel","restaurant food service","safari wildlife","airline flight","Airbnb rental","cruise travel"],
    youtubeChannels: ["BestEverFoodReview","MarkWiens","KaraAndNate"],
  },
  {
    slug: "mining",
    subreddits: ["mining","geology","gold","Commodities","silverbugs","copper","lithium","RareEarths","gemstones","MiningStocks","NickelMining","PlatinumGroup","uraniumsqueeze","Gemology"],
    googleQueries: ["mining+gold+copper+lithium","mineral+processing+smelting","artisanal+mining+gemstones","quarrying+construction+minerals","rare+earth+minerals","mining+regulation+policy","mineral+exploration+discovery","coal+mining+transition"],
    gdeltQueries: ["mining%20gold%20copper%20lithium","mineral%20exploration%20discovery","rare%20earth%20minerals","quarrying%20construction%20minerals","mining%20regulation%20environment"],
    twitterTerms: ["mining gold copper","lithium rare earth","mineral exploration","quarrying construction","mining regulation"],
    youtubeChannels: ["MiningInternational","GoldTelegraph"],
  },
  {
    slug: "water-environment",
    subreddits: ["water","environment","ZeroWaste","recycling","sustainability","climatechange","conservation","ecology","WasteManagement","ewaste","irrigation","UrbanPlanning","Green","CleanEnergy"],
    googleQueries: ["water+supply+treatment","waste+management+recycling","irrigation+water+infrastructure","carbon+forestry+reforestation","e-waste+recycling","circular+economy+sustainability","water+scarcity+crisis","plastic+waste+ocean"],
    gdeltQueries: ["water%20supply%20crisis","waste%20management%20recycling","irrigation%20water%20infrastructure","carbon%20forestry%20reforestation","plastic%20waste%20pollution"],
    twitterTerms: ["water supply crisis","waste management recycling","irrigation water","carbon forestry","e-waste recycling","circular economy"],
    youtubeChannels: ["PracticalEngineering","ClimateAdam"],
  },
  {
    slug: "professional-services",
    subreddits: ["consulting","Accounting","LawFirm","humanresources","recruiting","marketing","PublicRelations","architecture","engineering","AskEngineers","BigFour","MBA","Management","freelance","advertising","projectmanagement"],
    googleQueries: ["law+firm+legal+services","accounting+audit+tax","management+consulting+strategy","HR+recruitment+staffing","marketing+PR+advertising","architecture+engineering+consultancy","market+research+intelligence","professional+services+industry"],
    gdeltQueries: ["consulting%20firm%20strategy","law%20firm%20legal","accounting%20audit%20regulation","HR%20recruitment%20talent","marketing%20advertising%20agency"],
    twitterTerms: ["consulting strategy","law firm legal","accounting audit","HR recruitment","marketing advertising","architecture engineering"],
    youtubeChannels: ["FirmLearning","HarvardBusinessReview"],
  },
  {
    slug: "fashion-textiles",
    subreddits: ["fashion","malefashionadvice","femalefashionadvice","streetwear","sewing","textiles","sustainablefashion","ThriftStoreHauls","rawdenim","Sneakers","luxury","frugalmalefashion","womensstreetwear","Leathercraft","knitting"],
    googleQueries: ["fashion+textile+garment","cotton+textile+manufacturing","second+hand+clothing+thrift","fashion+brand+design","shoe+leather+industry","fast+fashion+sustainability","luxury+fashion+market","fashion+week+designer"],
    gdeltQueries: ["fashion%20textile%20manufacturing","cotton%20garment%20industry","fast%20fashion%20sustainability","luxury%20fashion%20brand","second%20hand%20clothing"],
    twitterTerms: ["fashion textile","cotton garment manufacturing","luxury fashion","sustainable fashion","fast fashion"],
    youtubeChannels: ["VogueBusiness","TheFashionArchive"],
  },
  {
    slug: "automotive",
    subreddits: ["cars","Autos","electricvehicles","TeslaMotors","MechanicAdvice","AutoDetailing","CarTalkPodcast","formula1","NASCAR","motorcycles","trucks","cartechnology","SelfDrivingCars","EVConversions","CarBuying","Toyota","BMW","FordMaverickTruck","BYD"],
    googleQueries: ["automotive+car+vehicle+sales","electric+vehicle+EV+charging","used+car+import+market","auto+parts+aftermarket","motor+insurance+leasing","self+driving+autonomous","car+manufacturing+assembly","motorcycle+two+wheeler"],
    gdeltQueries: ["automotive%20car%20sales","electric%20vehicle%20EV%20charging","used%20car%20market","auto%20parts%20aftermarket","self%20driving%20autonomous"],
    twitterTerms: ["automotive car sales","electric vehicle EV","used car market","auto parts","self driving autonomous","motor insurance"],
    youtubeChannels: ["DougDeMuro","carwow","ElectrifiedReviews","Engineering Explained"],
  },
  {
    slug: "aerospace-defence",
    subreddits: ["aerospace","aviation","space","SpaceX","BlueOrigin","defense","MilitaryPorn","drones","AirForce","navy","army","Satellites","spaceflight","aviationmaintenance","dji","UAVs","SecurityClearance"],
    googleQueries: ["aerospace+aviation+aircraft","defence+military+procurement","space+satellite+launch","drone+UAV+unmanned","private+security+surveillance","Boeing+Airbus+aircraft","SpaceX+rocket+launch","military+spending+budget"],
    gdeltQueries: ["aerospace%20aviation%20aircraft","defence%20military%20procurement","space%20satellite%20launch","drone%20UAV%20unmanned","private%20security%20surveillance"],
    twitterTerms: ["aerospace aviation","defence military","space satellite launch","drone UAV","SpaceX rocket","Boeing Airbus"],
    youtubeChannels: ["EverydayAstronaut","ScottManley","Sandboxx"],
  },
  {
    slug: "consumer-electronics",
    subreddits: ["gadgets","hardware","buildapc","homeautomation","smarthome","IoT","wearables","headphones","monitors","Tablets","AmazonEcho","GoogleHome","RepairLounge","smartphones","laptops","MechanicalKeyboards"],
    googleQueries: ["consumer+electronics+smartphone","smart+home+IoT+devices","electronics+retail+repair","wearable+technology+smartwatch","gaming+equipment+console","e-waste+recycling+electronics","TV+display+technology","laptop+computer+tablet"],
    gdeltQueries: ["consumer%20electronics%20smartphone","smart%20home%20IoT","wearable%20technology","gaming%20console%20equipment","e-waste%20recycling"],
    twitterTerms: ["consumer electronics","smart home IoT","wearable technology","gaming console","smartphone tablet"],
    youtubeChannels: ["MKBHD","LinusTechTips","JerryRigEverything","Dave2D"],
  },
  {
    slug: "chemicals",
    subreddits: ["chemistry","ChemicalEngineering","plastics","polymers","Fertilizer","agriculture","oilandgas","MaterialsScience","pharmaceuticals","labrats","industrialchemistry"],
    googleQueries: ["chemicals+petrochemicals+industry","fertiliser+agrochemical+production","plastics+polymer+manufacturing","pharmaceutical+chemicals+API","industrial+chemicals+distribution","chemical+plant+safety","paint+coating+chemicals"],
    gdeltQueries: ["chemicals%20petrochemicals%20industry","fertiliser%20agrochemical%20production","plastics%20polymer%20manufacturing","pharmaceutical%20chemicals%20API","chemical%20plant%20safety"],
    twitterTerms: ["chemicals petrochemicals","fertiliser agrochemical","plastics polymer","pharmaceutical API","chemical industry"],
    youtubeChannels: ["NileRed","Cody'sLab"],
  },
  {
    slug: "politics-government",
    subreddits: ["politics","worldnews","geopolitics","NeutralPolitics","PoliticalDiscussion","Economics","worldpolitics","LateStageCapitalism","Libertarian","PublicPolicy","law","government","Elections","TaxPros","USPS","eupolitics","ukpolitics","CanadaPolitics","AusPol","IndianPolitics","AfricaPolitics"],
    googleQueries: ["election+political+campaign","legislation+regulation+policy","geopolitics+diplomacy+sanctions","government+procurement+spending","lobbying+interest+groups","governance+anti+corruption","tax+policy+revenue","trade+war+tariff","foreign+policy+bilateral"],
    gdeltQueries: ["election%20political%20campaign","legislation%20regulation%20reform","geopolitics%20diplomacy%20sanctions","government%20procurement%20tender","corruption%20governance%20transparency","tax%20policy%20revenue"],
    twitterTerms: ["election political","legislation regulation","geopolitics sanctions","government procurement","corruption governance","tax policy reform"],
    youtubeChannels: ["TLDR News","Vox","VisualPolitik"],
  },
  {
    slug: "climate-sustainability",
    subreddits: ["climate","sustainability","environment","climatechange","RenewableEnergy","ZeroWaste","Futurology","collapse","Green","conservation","vegan","PlantBased","NuclearPower","electricvehicles","ClimateActionPlan","GreenNewDeal"],
    googleQueries: ["climate+change+global+warming","ESG+sustainable+finance","carbon+market+credits","green+bond+climate+finance","disaster+adaptation+resilience","circular+economy+waste","net+zero+emissions","climate+policy+COP"],
    gdeltQueries: ["climate%20change%20global%20warming","ESG%20sustainable%20finance","carbon%20market%20credits","disaster%20adaptation%20resilience","circular%20economy%20waste","net%20zero%20emissions"],
    twitterTerms: ["climate change","ESG sustainable finance","carbon credits market","net zero emissions","circular economy","climate adaptation"],
    youtubeChannels: ["ClimateAdam","OurChangingClimate","SimonClark"],
  },
  {
    slug: "sports-leisure",
    subreddits: ["sports","soccer","nba","nfl","formula1","tennis","golf","cricket","running","fitness","MMA","boxing","olympics","PremierLeague","LaLiga","SerieA","Bundesliga","sportsbook","sportsbetting","FantasyPL","DraftKings","rugbyunion"],
    googleQueries: ["professional+sports+league","sports+betting+gambling","sponsorship+sports+marketing","fitness+wellness+gym","esports+competitive+gaming","sports+media+rights","athlete+transfer+contract","Olympic+Games+athletics"],
    gdeltQueries: ["professional%20sports%20league","sports%20betting%20gambling","sponsorship%20sports%20marketing","fitness%20wellness%20gym","esports%20competitive%20gaming"],
    twitterTerms: ["sports league transfer","sports betting","sponsorship sports","fitness wellness","esports gaming","Olympic Games"],
    youtubeChannels: ["ESPN","SkySportsFootball","DAZN"],
  },
  {
    slug: "non-profit-development",
    subreddits: ["nonprofit","philanthropy","Charity","volunteer","humanitarianism","InternationalDev","NGO","SocialEnterprise","EffectiveAltruism","GlobalDev","aid","refugees","UnitedNations","peacecorps"],
    googleQueries: ["international+aid+development","NGO+civil+society","social+enterprise+impact","humanitarian+emergency+response","philanthropy+charitable+giving","UN+World+Bank+multilateral","SDGs+sustainable+development","refugee+crisis+displacement"],
    gdeltQueries: ["international%20aid%20development","NGO%20civil%20society","humanitarian%20emergency%20crisis","philanthropy%20charitable","refugee%20crisis%20displacement","sustainable%20development%20goals"],
    twitterTerms: ["international aid development","NGO civil society","humanitarian crisis","philanthropy charity","refugee crisis","sustainable development"],
    youtubeChannels: ["UnitedNations","WorldBank","TEDTalks"],
  },
  {
    slug: "shipping-maritime",
    subreddits: ["maritime","shipping","Nautical","Sailing","SupplyChain","logistics","heavyseas","Shipwrecks","MerchantMarine","MarineEngineering","FreightBrokers","containerShipping","ports"],
    googleQueries: ["container+shipping+freight+rate","bulk+tanker+shipping","port+operations+terminal","shipbuilding+shipyard","maritime+insurance+law","shipping+supply+chain","Baltic+Dry+Index","bunkering+fuel+maritime"],
    gdeltQueries: ["container%20shipping%20freight","bulk%20tanker%20shipping","port%20operations%20terminal","shipbuilding%20shipyard","maritime%20insurance%20law"],
    twitterTerms: ["container shipping freight","bulk tanker shipping","port operations","shipbuilding","maritime insurance","Baltic Dry Index"],
    youtubeChannels: ["CasualNavigation","SaltySeadog"],
  },
  {
    slug: "creative-design",
    subreddits: ["graphic_design","Design","ArtBusiness","photography","videography","UI_Design","UXDesign","IndustrialDesign","publishing","writing","selfpublish","printmaking","NFT","DigitalArt","Illustration","AdobeIllustrator","Figma"],
    googleQueries: ["graphic+design+branding","art+market+gallery+auction","publishing+book+print+media","photography+videography+stock","industrial+product+design","UX+UI+design+digital","NFT+digital+art+market","creative+agency+design"],
    gdeltQueries: ["art%20market%20auction%20gallery","publishing%20book%20print","design%20agency%20creative","photography%20stock%20media","NFT%20digital%20art"],
    twitterTerms: ["graphic design branding","art market auction","publishing book","photography stock","UX UI design","NFT digital art"],
    youtubeChannels: ["TheFutur","CharliMarieTV","PeterMcKinnon"],
  },
  {
    slug: "religious-faith",
    subreddits: ["religion","Christianity","islam","Judaism","Hinduism","Buddhism","atheism","spirituality","theology","Church","MuslimLounge","OpenChristian","CatholicMemes","Sikh","Baha'i"],
    googleQueries: ["church+congregation+tithe","religious+media+broadcasting","pilgrimage+Hajj+religious+tourism","faith+based+education+charity","religious+organization+revenue","interfaith+dialogue","missionary+work","gospel+music+worship"],
    gdeltQueries: ["church%20religion%20faith","pilgrimage%20Hajj%20religious","religious%20media%20broadcasting","faith%20education%20charity"],
    twitterTerms: ["church religion faith","pilgrimage religious tourism","religious media","faith education charity"],
    youtubeChannels: ["BibleProject","YaqeenInstitute"],
  },
  {
    slug: "gambling-lottery",
    subreddits: ["gambling","sportsbook","poker","sportsbetting","onlinegambling","casino","lottery","DraftKings","horseracing","blackjack","slots","baccarat","craps","problemgambling","vegaslocals"],
    googleQueries: ["online+sports+betting+gambling","casino+iGaming+slots","state+lottery+jackpot","horse+racing+wagering","gambling+regulation+licensing","responsible+gambling+addiction","poker+tournament+WSOP","betting+odds+bookmaker"],
    gdeltQueries: ["online%20betting%20gambling","casino%20iGaming%20regulation","lottery%20jackpot%20winning","horse%20racing%20wagering","gambling%20addiction%20regulation"],
    twitterTerms: ["online betting gambling","casino iGaming","lottery jackpot","horse racing","gambling regulation","poker tournament"],
    youtubeChannels: ["GamblingGuy","PokerGO"],
  },
  {
    slug: "blockchain-digital-assets",
    subreddits: ["CryptoCurrency","Bitcoin","ethereum","defi","NFT","CryptoMarkets","altcoin","SatoshiStreetBets","web3","solana","cardano","polkadot","CryptoTechnology","cryptomining","stablecoin","CBDC","tokenomics","Chainlink","Avalanche","cosmosnetwork"],
    googleQueries: ["cryptocurrency+exchange+trading","DeFi+lending+protocol","NFT+tokenization+digital+assets","Bitcoin+mining+staking","stablecoin+CBDC+digital+currency","blockchain+technology+Web3","crypto+regulation+policy","smart+contract+Ethereum","crypto+market+volatility"],
    gdeltQueries: ["cryptocurrency%20exchange%20trading","DeFi%20lending%20protocol","NFT%20tokenization","Bitcoin%20mining%20staking","stablecoin%20CBDC%20regulation","blockchain%20technology%20Web3"],
    twitterTerms: ["cryptocurrency exchange","DeFi lending","NFT tokenization","Bitcoin mining","stablecoin CBDC","blockchain Web3","crypto regulation"],
    youtubeChannels: ["CoinBureau","BenjaminCowen","AnthonyPompliano","Bankless"],
  },
  {
    slug: "personal-household",
    subreddits: ["personalfinance","HomeImprovement","CleaningTips","Parenting","beyondthebump","nanny","dogs","cats","Pets","MealPrepSunday","beautytalkph","SkincareAddiction","MakeupAddiction","Mommit","Daddit","AgingParents","eldercare","petcare","doggrooming","HomeDecorating"],
    googleQueries: ["beauty+salon+grooming","domestic+staffing+cleaning","childcare+daycare+nursery","eldercare+senior+care","home+maintenance+repair","pet+care+veterinary","laundry+dry+cleaning","personal+services+industry"],
    gdeltQueries: ["beauty%20salon%20grooming","childcare%20daycare","eldercare%20senior%20care","home%20maintenance%20repair","pet%20care%20veterinary"],
    twitterTerms: ["beauty salon grooming","childcare daycare","eldercare senior care","home maintenance repair","pet care veterinary"],
    youtubeChannels: ["CleanMySpace","DadHow"],
  },
];

// ═══════════════════════════════════════════════════════════════════
// COUNTRY-SPECIFIC NEWS SOURCES REGISTRY
// ═══════════════════════════════════════════════════════════════════

interface CountryCfg {
  code: string;
  lang: string;
  ceid: string;
  outlets: string[];
  yt: string[];
  subs: string[];
}

const COUNTRIES: CountryCfg[] = [
  // ── AFRICA ──
  { code: "KE", lang: "en", ceid: "KE:en", outlets: ["citizen.digital","nation.africa","the-star.co.ke","standardmedia.co.ke","businessdailyafrica.com","capitalfm.co.ke","kbc.co.ke","kenyans.co.ke","tuko.co.ke","pulselive.co.ke","kenyanwallstreet.com","techweez.com","cio.co.ke","k24tv.co.ke","tv47.digital","hapakenya.com","sde.co.ke"], yt: ["citizentvkenya","NTVKenya","K24TV","KTNNewsKE","TV47Kenya","KBCChannel1"], subs: ["Kenya"] },
  { code: "NG", lang: "en", ceid: "NG:en", outlets: ["punchng.com","vanguardngr.com","premiumtimesng.com","thecable.ng","guardian.ng","nairametrics.com","businessday.ng","channelstv.com","legit.ng","dailypost.ng","saharareporters.com","techpoint.africa","techcabal.com"], yt: ["channelstelevision"], subs: ["Nigeria"] },
  { code: "ZA", lang: "en", ceid: "ZA:en", outlets: ["news24.com","timeslive.co.za","businesslive.co.za","dailymaverick.co.za","iol.co.za","ewn.co.za","fin24.com","moneyweb.co.za","techcentral.co.za","itweb.co.za","biznews.com"], yt: [], subs: ["southafrica"] },
  { code: "GH", lang: "en", ceid: "GH:en", outlets: ["graphic.com.gh","myjoyonline.com","citinewsroom.com","ghanaweb.com","3news.com","pulse.com.gh"], yt: ["JoyNewsOnTV"], subs: ["ghana"] },
  { code: "ET", lang: "en", ceid: "ET:en", outlets: ["addisstandard.com","thereporterethiopia.com","capitalethiopia.com"], yt: [], subs: ["Ethiopia"] },
  { code: "TZ", lang: "en", ceid: "TZ:en", outlets: ["thecitizen.co.tz","dailynews.co.tz","ippmedia.com"], yt: [], subs: ["tanzania"] },
  { code: "UG", lang: "en", ceid: "UG:en", outlets: ["monitor.co.ug","newvision.co.ug","independent.co.ug"], yt: [], subs: ["Uganda"] },
  { code: "RW", lang: "en", ceid: "RW:en", outlets: ["newtimes.co.rw","ktpress.rw","igihe.com"], yt: [], subs: [] },
  { code: "EG", lang: "en", ceid: "EG:en", outlets: ["egypttoday.com","dailynewsegypt.com","enterprise.press","ahram.org.eg","madamasr.com"], yt: [], subs: ["Egypt"] },
  { code: "MA", lang: "fr", ceid: "MA:fr", outlets: ["medias24.com","challenge.ma","leseco.ma","le360.ma"], yt: [], subs: [] },
  { code: "SN", lang: "fr", ceid: "SN:fr", outlets: ["seneweb.com","lequotidien.sn","pressafrik.com"], yt: [], subs: [] },
  { code: "CI", lang: "fr", ceid: "CI:fr", outlets: ["abidjan.net","fratmat.info"], yt: [], subs: [] },
  // ── AMERICAS ──
  { code: "US", lang: "en", ceid: "US:en", outlets: ["reuters.com","bloomberg.com","cnbc.com","wsj.com","nytimes.com","techcrunch.com","theverge.com","arstechnica.com","wired.com","fortune.com","inc.com","fastcompany.com","businessinsider.com","marketwatch.com","seekingalpha.com","venturebeat.com","crunchbase.com","axios.com","theinformation.com","protocol.com"], yt: ["Bloomberg","CNBC","YahooFinance"], subs: ["business","investing","stocks","technology","startups","wallstreetbets","CryptoCurrency","finance","economics","RealEstate","Entrepreneur","SupplyChain","fintech","energy"] },
  { code: "GB", lang: "en", ceid: "GB:en", outlets: ["ft.com","bbc.com","theguardian.com","telegraph.co.uk","cityam.com","thisismoney.co.uk","sifted.eu","uktech.news"], yt: ["BBCNews","SkyNews","FinancialTimes"], subs: ["ukbusiness","UKPersonalFinance"] },
  { code: "CA", lang: "en", ceid: "CA:en", outlets: ["bnnbloomberg.ca","financialpost.com","theglobeandmail.com","betakit.com"], yt: ["CBCNews"], subs: ["canada","PersonalFinanceCanada"] },
  { code: "BR", lang: "pt", ceid: "BR:pt-419", outlets: ["valor.globo.com","infomoney.com.br","exame.com","startse.com","neofeed.com.br"], yt: [], subs: ["brasil","investimentos"] },
  { code: "MX", lang: "es", ceid: "MX:es-419", outlets: ["elfinanciero.com.mx","expansion.mx","eleconomista.com.mx","forbes.com.mx"], yt: [], subs: ["mexico"] },
  { code: "CO", lang: "es", ceid: "CO:es-419", outlets: ["portafolio.co","larepublica.co","dinero.com"], yt: [], subs: [] },
  { code: "AR", lang: "es", ceid: "AR:es-419", outlets: ["ambito.com","infobae.com","cronista.com","iproup.com"], yt: [], subs: ["argentina"] },
  { code: "CL", lang: "es", ceid: "CL:es-419", outlets: ["df.cl","emol.com","latercera.com"], yt: [], subs: [] },
  // ── EUROPE ──
  { code: "DE", lang: "de", ceid: "DE:de", outlets: ["handelsblatt.com","manager-magazin.de","wiwo.de","gruenderszene.de","t3n.de"], yt: [], subs: ["de_IAmA","Finanzen"] },
  { code: "FR", lang: "fr", ceid: "FR:fr", outlets: ["lesechos.fr","latribune.fr","bfmtv.com","maddyness.com","frenchweb.fr"], yt: [], subs: ["france","vosfinances"] },
  { code: "NL", lang: "nl", ceid: "NL:nl", outlets: ["fd.nl","rtlnieuws.nl","bnr.nl","sprout.nl"], yt: [], subs: ["thenetherlands"] },
  { code: "CH", lang: "de", ceid: "CH:de", outlets: ["finews.com","handelszeitung.ch","nzz.ch","startupticker.ch"], yt: [], subs: [] },
  { code: "SE", lang: "sv", ceid: "SE:sv", outlets: ["di.se","breakit.se","svd.se"], yt: [], subs: [] },
  { code: "ES", lang: "es", ceid: "ES:es", outlets: ["expansion.com","cincodias.elpais.com","eleconomista.es"], yt: [], subs: [] },
  { code: "IT", lang: "it", ceid: "IT:it", outlets: ["ilsole24ore.com","milanofinanza.it","startupitalia.eu"], yt: [], subs: [] },
  { code: "PL", lang: "pl", ceid: "PL:pl", outlets: ["bankier.pl","money.pl","puls-biznesu.pl"], yt: [], subs: [] },
  { code: "IE", lang: "en", ceid: "IE:en", outlets: ["irishtimes.com","siliconrepublic.com","fora.ie"], yt: [], subs: [] },
  { code: "TR", lang: "tr", ceid: "TR:tr", outlets: ["bloomberght.com","dunya.com","webrazzi.com"], yt: [], subs: [] },
  // ── ASIA-PACIFIC ──
  { code: "IN", lang: "en", ceid: "IN:en", outlets: ["economictimes.indiatimes.com","livemint.com","moneycontrol.com","inc42.com","yourstory.com","entrackr.com","vccircle.com","businesstoday.in","ndtv.com","financialexpress.com"], yt: ["ETNOWlive"], subs: ["india","IndianStreetBets","IndiaTech"] },
  { code: "CN", lang: "zh", ceid: "CN:zh-Hans", outlets: ["scmp.com","caixin.com","36kr.com","technode.com","pandaily.com"], yt: [], subs: ["China"] },
  { code: "JP", lang: "ja", ceid: "JP:ja", outlets: ["nikkei.com","japantimes.co.jp","thebridge.jp"], yt: [], subs: ["japan"] },
  { code: "KR", lang: "ko", ceid: "KR:ko", outlets: ["koreaherald.com","kedglobal.com","koreajoongangdaily.joins.com","platum.kr"], yt: [], subs: [] },
  { code: "SG", lang: "en", ceid: "SG:en", outlets: ["straitstimes.com","businesstimes.com.sg","techinasia.com","e27.co","vulcanpost.com"], yt: [], subs: ["singapore"] },
  { code: "ID", lang: "id", ceid: "ID:id", outlets: ["kontan.co.id","bisnis.com","dailysocial.id","techinasia.com","katadata.co.id"], yt: [], subs: [] },
  { code: "PH", lang: "en", ceid: "PH:en", outlets: ["businessworld.com.ph","rappler.com","philstar.com","inquirer.net"], yt: [], subs: ["Philippines"] },
  { code: "TH", lang: "th", ceid: "TH:th", outlets: ["bangkokpost.com","nationthailand.com"], yt: [], subs: [] },
  { code: "VN", lang: "vi", ceid: "VN:vi", outlets: ["vnexpress.net","vietnamnet.vn","cafef.vn"], yt: [], subs: [] },
  { code: "AU", lang: "en", ceid: "AU:en", outlets: ["afr.com","smartcompany.com.au","startupdaily.net","itnews.com.au"], yt: [], subs: ["AusFinance","australia"] },
  { code: "NZ", lang: "en", ceid: "NZ:en", outlets: ["nzherald.co.nz","interest.co.nz","stuff.co.nz"], yt: [], subs: [] },
  { code: "PK", lang: "en", ceid: "PK:en", outlets: ["brecorder.com","profit.pakistantoday.com.pk","techjuice.pk"], yt: [], subs: [] },
  { code: "BD", lang: "en", ceid: "BD:en", outlets: ["thedailystar.net","tbsnews.net","dhakatribune.com"], yt: [], subs: [] },
  // ── MIDDLE EAST ──
  { code: "AE", lang: "en", ceid: "AE:en", outlets: ["gulfnews.com","khaleejtimes.com","arabianbusiness.com","zawya.com","magnitt.com","wamda.com"], yt: [], subs: ["dubai"] },
  { code: "SA", lang: "en", ceid: "SA:en", outlets: ["arabnews.com","saudigazette.com.sa","argaam.com"], yt: [], subs: [] },
  { code: "IL", lang: "en", ceid: "IL:en", outlets: ["calcalistech.com","geektime.com","globes.co.il","nocamels.com"], yt: [], subs: [] },
  { code: "QA", lang: "en", ceid: "QA:en", outlets: ["thepeninsulaqatar.com","gulf-times.com"], yt: [], subs: [] },
  // ── ADDITIONAL AFRICA ──
  { code: "CM", lang: "fr", ceid: "CM:fr", outlets: ["journalducameroun.com","cameroon-tribune.cm"], yt: [], subs: [] },
  { code: "CD", lang: "fr", ceid: "CD:fr", outlets: ["actualite.cd","radiookapi.net","7sur7.cd"], yt: [], subs: [] },
  { code: "ZW", lang: "en", ceid: "ZW:en", outlets: ["newsday.co.zw","herald.co.zw","techzim.co.zw"], yt: [], subs: ["Zimbabwe"] },
  { code: "ZM", lang: "en", ceid: "ZM:en", outlets: ["diggers.news","lusakatimes.com","znbc.co.zm"], yt: [], subs: [] },
  { code: "MZ", lang: "pt", ceid: "MZ:pt-419", outlets: ["cartamz.com","clubofmozambique.com"], yt: [], subs: [] },
  { code: "AO", lang: "pt", ceid: "AO:pt-419", outlets: ["jornaldeangola.ao","expansao.co.ao"], yt: [], subs: [] },
  { code: "BW", lang: "en", ceid: "BW:en", outlets: ["mmegi.bw","sundaystandard.info"], yt: [], subs: [] },
  { code: "MU", lang: "en", ceid: "MU:en", outlets: ["lexpress.mu","defimedia.info"], yt: [], subs: [] },
  // ── ADDITIONAL ASIA ──
  { code: "MY", lang: "en", ceid: "MY:en", outlets: ["thestar.com.my","theedgemarkets.com","digitalnewsasia.com","freemalaysiatoday.com"], yt: [], subs: ["malaysia"] },
  { code: "LK", lang: "en", ceid: "LK:en", outlets: ["ft.lk","dailymirror.lk","economynext.com"], yt: [], subs: [] },
  { code: "MM", lang: "en", ceid: "MM:en", outlets: ["irrawaddy.com","mizzima.com","mmtimes.com"], yt: [], subs: [] },
  { code: "KH", lang: "en", ceid: "KH:en", outlets: ["phnompenhpost.com","khmertimeskh.com"], yt: [], subs: [] },
  { code: "NP", lang: "en", ceid: "NP:en", outlets: ["kathmandupost.com","onlinekhabar.com","nepalitimes.com"], yt: [], subs: [] },
  { code: "TW", lang: "zh", ceid: "TW:zh-Hant", outlets: ["focustaiwan.tw","taiwannews.com.tw","bnext.com.tw"], yt: [], subs: ["taiwan"] },
  // ── ADDITIONAL MIDDLE EAST ──
  { code: "KW", lang: "en", ceid: "KW:en", outlets: ["arabtimesonline.com","kuwaittimes.com"], yt: [], subs: [] },
  { code: "BH", lang: "en", ceid: "BH:en", outlets: ["gdnonline.com","newsofbahrain.com"], yt: [], subs: [] },
  { code: "OM", lang: "en", ceid: "OM:en", outlets: ["timesofoman.com","muscatdaily.com"], yt: [], subs: [] },
  { code: "JO", lang: "en", ceid: "JO:en", outlets: ["jordantimes.com","jordannews.jo"], yt: [], subs: [] },
  { code: "LB", lang: "en", ceid: "LB:en", outlets: ["dailystar.com.lb","lorientlejour.com","annahar.com"], yt: [], subs: [] },
  { code: "IQ", lang: "en", ceid: "IQ:en", outlets: ["rudaw.net","iraqinews.com","shafaq.com"], yt: [], subs: [] },
  // ── ADDITIONAL AMERICAS ──
  { code: "PE", lang: "es", ceid: "PE:es-419", outlets: ["gestion.pe","elcomercio.pe","rpp.pe"], yt: [], subs: [] },
  { code: "EC", lang: "es", ceid: "EC:es-419", outlets: ["eluniverso.com","elcomercio.com","primicias.ec"], yt: [], subs: [] },
  { code: "UY", lang: "es", ceid: "UY:es-419", outlets: ["elobservador.com.uy","elpais.com.uy"], yt: [], subs: [] },
  { code: "CR", lang: "es", ceid: "CR:es-419", outlets: ["nacion.com","ticotimes.net"], yt: [], subs: [] },
  { code: "PA", lang: "es", ceid: "PA:es-419", outlets: ["prensa.com","laestrella.com.pa"], yt: [], subs: [] },
  { code: "DO", lang: "es", ceid: "DO:es-419", outlets: ["listin.com.do","diariolibre.com"], yt: [], subs: [] },
  { code: "TT", lang: "en", ceid: "TT:en", outlets: ["guardian.co.tt","newsday.co.tt","trinidadexpress.com"], yt: [], subs: [] },
  { code: "JM", lang: "en", ceid: "JM:en", outlets: ["jamaicaobserver.com","jamaicagleaner.com"], yt: [], subs: [] },
  // ── ADDITIONAL EUROPE ──
  { code: "PT", lang: "pt", ceid: "PT:pt-150", outlets: ["jornaldenegocios.pt","dinheirovivo.pt","eco.sapo.pt"], yt: [], subs: [] },
  { code: "NO", lang: "no", ceid: "NO:no", outlets: ["dn.no","e24.no","shifter.no"], yt: [], subs: [] },
  { code: "DK", lang: "da", ceid: "DK:da", outlets: ["borsen.dk","finans.dk","version2.dk"], yt: [], subs: [] },
  { code: "FI", lang: "fi", ceid: "FI:fi", outlets: ["kauppalehti.fi","hs.fi","yle.fi"], yt: [], subs: [] },
  { code: "AT", lang: "de", ceid: "AT:de", outlets: ["diepresse.com","derstandard.at","trending.at"], yt: [], subs: [] },
  { code: "BE", lang: "fr", ceid: "BE:fr", outlets: ["lecho.be","lesoir.be","standaard.be"], yt: [], subs: [] },
  { code: "CZ", lang: "cs", ceid: "CZ:cs", outlets: ["e15.cz","ekonom.cz","lupa.cz"], yt: [], subs: [] },
  { code: "RO", lang: "ro", ceid: "RO:ro", outlets: ["profit.ro","startupcafe.ro","zf.ro"], yt: [], subs: [] },
  { code: "HU", lang: "hu", ceid: "HU:hu", outlets: ["portfolio.hu","hvg.hu","index.hu"], yt: [], subs: [] },
  { code: "GR", lang: "el", ceid: "GR:el", outlets: ["naftemporiki.gr","capital.gr","kathimerini.gr"], yt: [], subs: [] },
  { code: "UA", lang: "uk", ceid: "UA:uk", outlets: ["epravda.com.ua","ain.ua","liga.net"], yt: [], subs: ["ukraine"] },
  { code: "RS", lang: "sr", ceid: "RS:sr", outlets: ["b92.net","blic.rs","startit.rs"], yt: [], subs: [] },
  { code: "HR", lang: "hr", ceid: "HR:hr", outlets: ["jutarnji.hr","poslovni.hr","netokracija.com"], yt: [], subs: [] },
  { code: "BG", lang: "bg", ceid: "BG:bg", outlets: ["capital.bg","dnevnik.bg","economy.bg"], yt: [], subs: [] },
  // ── CENTRAL ASIA ──
  { code: "KZ", lang: "en", ceid: "KZ:en", outlets: ["inform.kz","astanатimes.com","kapital.kz"], yt: [], subs: [] },
  { code: "UZ", lang: "en", ceid: "UZ:en", outlets: ["gazeta.uz","spot.uz"], yt: [], subs: [] },
];

// ═══════════════════════════════════════════════════════════════════
// GLOBAL TIER-1 NEWS RSS FEEDS — Direct from BBC, CNN, Al Jazeera,
// Reuters, AP, Guardian, NYT, DW, France24, NHK, etc.
// These are ALWAYS fetched on every run for maximum freshness.
// ═══════════════════════════════════════════════════════════════════

interface GlobalRSSSource {
  name: string;
  feeds: string[];
  geo: string;
  tags: string[];
}

const GLOBAL_NEWS_RSS: GlobalRSSSource[] = [
  // ── ENGLISH LANGUAGE ──
  { name: "BBC News", feeds: ["https://feeds.bbci.co.uk/news/rss.xml","https://feeds.bbci.co.uk/news/world/rss.xml","https://feeds.bbci.co.uk/news/business/rss.xml","https://feeds.bbci.co.uk/news/technology/rss.xml","https://feeds.bbci.co.uk/news/science_and_environment/rss.xml","https://feeds.bbci.co.uk/news/world/africa/rss.xml","https://feeds.bbci.co.uk/news/world/asia/rss.xml","https://feeds.bbci.co.uk/news/world/europe/rss.xml","https://feeds.bbci.co.uk/news/world/latin_america/rss.xml","https://feeds.bbci.co.uk/news/world/middle_east/rss.xml"], geo: "global", tags: ["bbc","tier1"] },
  { name: "CNN", feeds: ["http://rss.cnn.com/rss/edition.rss","http://rss.cnn.com/rss/edition_world.rss","http://rss.cnn.com/rss/money_news_international.rss","http://rss.cnn.com/rss/edition_technology.rss","http://rss.cnn.com/rss/edition_africa.rss","http://rss.cnn.com/rss/edition_americas.rss","http://rss.cnn.com/rss/edition_asia.rss","http://rss.cnn.com/rss/edition_europe.rss","http://rss.cnn.com/rss/edition_meast.rss"], geo: "global", tags: ["cnn","tier1"] },
  { name: "Al Jazeera", feeds: ["https://www.aljazeera.com/xml/rss/all.xml"], geo: "global", tags: ["aljazeera","tier1"] },
  { name: "Reuters", feeds: ["https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best","https://www.reutersagency.com/feed/?best-topics=tech&post_type=best","https://www.reutersagency.com/feed/?taxonomy=best-regions&post_type=best"], geo: "global", tags: ["reuters","tier1"] },
  { name: "AP News", feeds: ["https://rsshub.app/apnews/topics/apf-topnews","https://rsshub.app/apnews/topics/apf-business","https://rsshub.app/apnews/topics/apf-technology"], geo: "global", tags: ["ap","tier1"] },
  { name: "The Guardian", feeds: ["https://www.theguardian.com/world/rss","https://www.theguardian.com/business/rss","https://www.theguardian.com/technology/rss","https://www.theguardian.com/environment/rss","https://www.theguardian.com/global-development/rss"], geo: "GB", tags: ["guardian","tier1"] },
  { name: "NPR", feeds: ["https://feeds.npr.org/1001/rss.xml","https://feeds.npr.org/1006/rss.xml","https://feeds.npr.org/1019/rss.xml"], geo: "US", tags: ["npr","tier1"] },
  { name: "ABC News AU", feeds: ["https://www.abc.net.au/news/feed/51120/rss.xml"], geo: "AU", tags: ["abc-au","tier1"] },
  { name: "CBC Canada", feeds: ["https://rss.cbc.ca/lineup/topstories.xml","https://rss.cbc.ca/lineup/business.xml","https://rss.cbc.ca/lineup/technology.xml"], geo: "CA", tags: ["cbc","tier1"] },
  { name: "Sky News", feeds: ["https://feeds.skynews.com/feeds/rss/world.xml","https://feeds.skynews.com/feeds/rss/business.xml","https://feeds.skynews.com/feeds/rss/technology.xml"], geo: "GB", tags: ["skynews","tier1"] },
  { name: "India Today", feeds: ["https://www.indiatoday.in/rss/home","https://www.indiatoday.in/rss/1206514"], geo: "IN", tags: ["indiatoday","tier1"] },
  { name: "Times of India", feeds: ["https://timesofindia.indiatimes.com/rssfeedstopstories.cms","https://timesofindia.indiatimes.com/rssfeeds/1898055.cms"], geo: "IN", tags: ["toi","tier1"] },
  { name: "South China Morning Post", feeds: ["https://www.scmp.com/rss/91/feed"], geo: "CN", tags: ["scmp","tier1"] },
  { name: "Japan Times", feeds: ["https://www.japantimes.co.jp/feed/"], geo: "JP", tags: ["japantimes","tier1"] },
  // ── AFRICAN ──
  { name: "Africa News", feeds: ["https://www.africanews.com/feed/"], geo: "AF", tags: ["africanews","africa"] },
  { name: "The East African", feeds: ["https://www.theeastafrican.co.ke/tea/rss"], geo: "EA", tags: ["eastafrican","africa"] },
  { name: "Daily Maverick", feeds: ["https://www.dailymaverick.co.za/rss/"], geo: "ZA", tags: ["dailymaverick","africa"] },
  // ── MIDDLE EAST ──
  { name: "Al Monitor", feeds: ["https://www.al-monitor.com/rss"], geo: "ME", tags: ["almonitor","mideast"] },
  { name: "Middle East Eye", feeds: ["https://www.middleeasteye.net/rss"], geo: "ME", tags: ["mee","mideast"] },
  { name: "Arab News", feeds: ["https://www.arabnews.com/rss.xml"], geo: "SA", tags: ["arabnews","mideast"] },
  { name: "Gulf News", feeds: ["https://gulfnews.com/rss"], geo: "AE", tags: ["gulfnews","mideast"] },
  // ── WIRE SERVICES & SPECIALIZED ──
  { name: "DW (Deutsche Welle)", feeds: ["https://rss.dw.com/rdf/rss-en-all","https://rss.dw.com/rdf/rss-en-bus","https://rss.dw.com/rdf/rss-en-sci"], geo: "DE", tags: ["dw","tier1"] },
  { name: "France24", feeds: ["https://www.france24.com/en/rss","https://www.france24.com/en/africa/rss","https://www.france24.com/en/middle-east/rss"], geo: "FR", tags: ["france24","tier1"] },
  { name: "NHK World", feeds: ["https://www3.nhk.or.jp/nhkworld/en/news/rss/index.xml"], geo: "JP", tags: ["nhk","tier1"] },
  { name: "Xinhua", feeds: ["http://www.news.cn/english/rss/worldrss.xml"], geo: "CN", tags: ["xinhua","tier1"] },
  { name: "TASS", feeds: ["https://tass.com/rss/v2.xml"], geo: "RU", tags: ["tass","tier1"] },
  // ── BUSINESS / MARKETS ──
  { name: "Financial Times", feeds: ["https://www.ft.com/rss/home"], geo: "GB", tags: ["ft","business"] },
  { name: "Bloomberg", feeds: ["https://feeds.bloomberg.com/markets/news.rss","https://feeds.bloomberg.com/technology/news.rss"], geo: "US", tags: ["bloomberg","business"] },
  { name: "CNBC", feeds: ["https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114","https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147","https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=19854910"], geo: "US", tags: ["cnbc","business"] },
  { name: "MarketWatch", feeds: ["http://feeds.marketwatch.com/marketwatch/topstories/","http://feeds.marketwatch.com/marketwatch/marketpulse/"], geo: "US", tags: ["marketwatch","business"] },
  { name: "Wall Street Journal", feeds: ["https://feeds.a.dj.com/rss/RSSWorldNews.xml","https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml","https://feeds.a.dj.com/rss/RSSWSJD.xml"], geo: "US", tags: ["wsj","business"] },
  { name: "The Economist", feeds: ["https://www.economist.com/international/rss.xml","https://www.economist.com/finance-and-economics/rss.xml","https://www.economist.com/business/rss.xml","https://www.economist.com/science-and-technology/rss.xml"], geo: "global", tags: ["economist","business"] },
  // ── TECH ──
  { name: "TechCrunch", feeds: ["https://techcrunch.com/feed/"], geo: "US", tags: ["techcrunch","tech"] },
  { name: "The Verge", feeds: ["https://www.theverge.com/rss/index.xml"], geo: "US", tags: ["verge","tech"] },
  { name: "Ars Technica", feeds: ["https://feeds.arstechnica.com/arstechnica/index"], geo: "US", tags: ["arstechnica","tech"] },
  { name: "Wired", feeds: ["https://www.wired.com/feed/rss"], geo: "US", tags: ["wired","tech"] },
  { name: "VentureBeat", feeds: ["https://venturebeat.com/feed/"], geo: "US", tags: ["venturebeat","tech"] },
  { name: "TechCabal (Africa)", feeds: ["https://techcabal.com/feed/"], geo: "AF", tags: ["techcabal","tech","africa"] },
  { name: "Rest of World", feeds: ["https://restofworld.org/feed/"], geo: "global", tags: ["restofworld","tech"] },
  // ── ENERGY & ENVIRONMENT ──
  { name: "Carbon Brief", feeds: ["https://www.carbonbrief.org/feed/"], geo: "global", tags: ["carbonbrief","climate"] },
  { name: "Climate Home", feeds: ["https://www.climatechangenews.com/feed/"], geo: "global", tags: ["climatehome","climate"] },
  // ── DEVELOPMENT ──
  { name: "Devex", feeds: ["https://www.devex.com/news/rss"], geo: "global", tags: ["devex","development"] },
  { name: "The New Humanitarian", feeds: ["https://www.thenewhumanitarian.org/rss"], geo: "global", tags: ["newhumanitarian","development"] },
];

async function collectGlobalNewsRSS(): Promise<any[]> {
  const rows: any[] = [];
  // Process all feeds in batches of 10
  const allFeeds = GLOBAL_NEWS_RSS.flatMap(src =>
    src.feeds.map(feed => ({ feed, name: src.name, geo: src.geo, tags: src.tags }))
  );
  for (let i = 0; i < allFeeds.length; i += 10) {
    const batch = allFeeds.slice(i, i + 10);
    const promises = batch.map(async ({ feed, name, geo, tags }) => {
      const xml = await safeTextFetch(feed, 8000);
      if (!xml) return [];
      const feedRows: any[] = [];
      const items = xml.split("<item>").slice(1, 8);
      for (const item of items) {
        const title = item.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/)?.[1]?.replace(/(<!\[CDATA\[|\]\]>)/g, "").trim() || "";
        const link = item.match(/<link>(.*?)<\/link>/)?.[1]?.trim() || item.match(/<link[^>]*href="([^"]+)"/)?.[1] || "";
        const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || item.match(/<dc:date>(.*?)<\/dc:date>/)?.[1] || "";
        const description = item.match(/<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/)?.[1]?.replace(/<[^>]+>/g, "").substring(0, 300) || "";
        if (title && title.length > 10) {
          feedRows.push({
            source: `rss-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
            data_type: "global_news",
            geo_scope: geo,
            payload: { title, url: link, date: pubDate, source: name, description },
            tags: ["news", "rss", "global", ...tags],
          });
        }
      }
      return feedRows;
    });
    const results = await Promise.all(promises);
    rows.push(...results.flat());
  }
  return rows;
}

// ═══════════════════════════════════════════════════════════════════
// CORE COLLECTORS (Financial Data)
// ═══════════════════════════════════════════════════════════════════

async function collectCrypto(): Promise<any[]> {
  const data = await safeFetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d");
  if (!Array.isArray(data)) return [];
  return data.map((c: any) => ({
    source: "coingecko", data_type: "crypto_price", geo_scope: "global",
    payload: { id: c.id, symbol: c.symbol, name: c.name, price: c.current_price, market_cap: c.market_cap, volume: c.total_volume, change_24h: c.price_change_percentage_24h, change_7d: c.price_change_percentage_7d_in_currency, high_24h: c.high_24h, low_24h: c.low_24h, rank: c.market_cap_rank },
    tags: ["crypto", "market", c.symbol],
  }));
}

async function collectForex(): Promise<any[]> {
  const data = await safeFetch("https://open.er-api.com/v6/latest/USD");
  if (!data?.rates) return [];
  const important = ["EUR","GBP","JPY","CHF","AUD","CAD","CNY","INR","BRL","MXN","KRW","ZAR","SGD","HKD","NZD","SEK","NOK","TRY","AED","THB","KES","NGN","EGP","IDR","PHP","VND","PKR","BDT","COP","CLP","PEN","ARS","SAR","QAR","KWD","BHD","OMR","JOD","MAD","TZS","UGX","GHS","ETB","RWF"];
  const rows: any[] = [];
  for (const cur of important) {
    if (data.rates[cur]) {
      rows.push({ source: "exchange-rates", data_type: "forex_rate", geo_scope: "global", payload: { base: "USD", currency: cur, rate: data.rates[cur], updated: data.time_last_update_utc }, tags: ["forex", cur.toLowerCase()] });
    }
  }
  return rows;
}

async function collectTwitter(): Promise<any[]> {
  const BEARER = Deno.env.get("TWITTER_BEARER_TOKEN") || Deno.env.get("X_BEARER_TOKEN");
  if (!BEARER) return [];
  const terms = ["stock market","investing","earnings","IPO","Fed","economy","forex","commodities"];
  const query = encodeURIComponent(`(${terms.join(" OR ")}) -is:retweet lang:en`);
  const data = await safeFetchWithHeaders(
    `https://api.x.com/2/tweets/search/recent?query=${query}&max_results=100&tweet.fields=created_at,author_id,public_metrics,lang&expansions=author_id&user.fields=name,username,verified,public_metrics`,
    { Authorization: `Bearer ${BEARER}` }, 18000,
  );
  if (!data?.data?.length) return [];
  const users = new Map<string, any>((data.includes?.users || []).map((u: any) => [u.id, u]));
  return data.data.map((tweet: any) => {
    const author = users.get(tweet.author_id);
    return { source: "twitter", data_type: "social_signal", geo_scope: "global", payload: { text: tweet.text?.slice(0, 500), author: author?.name, username: author?.username, verified: author?.verified ?? false, likes: tweet.public_metrics?.like_count ?? 0, retweets: tweet.public_metrics?.retweet_count ?? 0, url: `https://x.com/${author?.username}/status/${tweet.id}`, date: tweet.created_at, lang: tweet.lang }, tags: ["social", "twitter", "macro", "markets"] };
  });
}

// ═══════════════════════════════════════════════════════════════════
// INDUSTRY-SPECIFIC TWITTER COLLECTOR
// Queries X/Twitter with terms specific to each industry
// ═══════════════════════════════════════════════════════════════════

async function collectIndustryTwitter(): Promise<any[]> {
  const BEARER = Deno.env.get("TWITTER_BEARER_TOKEN") || Deno.env.get("X_BEARER_TOKEN");
  if (!BEARER) return [];
  const rows: any[] = [];

  // Batch 5 industries at a time to stay under rate limits
  for (let i = 0; i < INDUSTRY_SOURCES.length; i += 5) {
    const batch = INDUSTRY_SOURCES.slice(i, i + 5);
    const promises = batch.map(async (ind) => {
      const indRows: any[] = [];
      // Use first 3 twitter terms per industry
      for (const term of ind.twitterTerms.slice(0, 3)) {
        const query = encodeURIComponent(`(${term}) -is:retweet lang:en`);
        const data = await safeFetchWithHeaders(
          `https://api.x.com/2/tweets/search/recent?query=${query}&max_results=20&tweet.fields=created_at,author_id,public_metrics&expansions=author_id&user.fields=name,username`,
          { Authorization: `Bearer ${BEARER}` }, 12000,
        );
        if (!data?.data?.length) continue;
        const users = new Map<string, any>((data.includes?.users || []).map((u: any) => [u.id, u]));
        for (const tweet of data.data.slice(0, 10)) {
          const author = users.get(tweet.author_id);
          indRows.push({
            source: `twitter-${ind.slug}`, data_type: "industry_social", geo_scope: "global",
            industry: ind.slug,
            payload: { text: tweet.text?.slice(0, 500), author: author?.name, username: author?.username, likes: tweet.public_metrics?.like_count ?? 0, retweets: tweet.public_metrics?.retweet_count ?? 0, url: `https://x.com/${author?.username}/status/${tweet.id}`, date: tweet.created_at, search_term: term },
            tags: ["social", "twitter", "industry", ind.slug],
          });
        }
      }
      return indRows;
    });
    const results = await Promise.all(promises);
    rows.push(...results.flat());
  }
  return rows;
}

// ═══════════════════════════════════════════════════════════════════
// INDUSTRY-SPECIFIC REDDIT COLLECTOR
// Queries dedicated subreddits for each industry (5-30 per industry)
// ═══════════════════════════════════════════════════════════════════

async function collectIndustryReddit(): Promise<any[]> {
  const rows: any[] = [];
  for (const ind of INDUSTRY_SOURCES) {
    // Process in batches of 5 subs at a time
    for (let i = 0; i < ind.subreddits.length; i += 5) {
      const batch = ind.subreddits.slice(i, i + 5);
      const promises = batch.map(async (sub) => {
        const data = await safeFetch(`https://www.reddit.com/r/${sub}/hot.json?limit=5`, 8000);
        if (!data?.data?.children) return [];
        return data.data.children
          .filter((p: any) => !p.data.stickied && p.data.score > 3)
          .slice(0, 3)
          .map((post: any) => {
            const d = post.data;
            return {
              source: `reddit-${ind.slug}`, data_type: "industry_social", geo_scope: "global",
              industry: ind.slug,
              payload: { title: d.title, url: `https://reddit.com${d.permalink}`, subreddit: sub, score: d.score, comments: d.num_comments, author: d.author, created: new Date(d.created_utc * 1000).toISOString(), selftext: (d.selftext || "").substring(0, 300) },
              tags: ["social", "reddit", "industry", ind.slug, sub.toLowerCase()],
            };
          });
      });
      const results = await Promise.all(promises);
      rows.push(...results.flat());
    }
  }
  return rows;
}

// ═══════════════════════════════════════════════════════════════════
// INDUSTRY-SPECIFIC GOOGLE NEWS COLLECTOR
// Queries each industry's search terms across ALL 45+ country editions
// This is the biggest source multiplier: 30 industries × 8+ queries × 45+ countries
// ═══════════════════════════════════════════════════════════════════

async function collectIndustryNews(): Promise<any[]> {
  const rows: any[] = [];
  // Select a rotating subset of countries per run to stay within time limits
  // Each run covers 15 countries, rotating through all 45+ over 3 runs
  const runIndex = Math.floor(Date.now() / (5 * 60 * 1000)) % 3;
  const countrySubset = COUNTRIES.filter((_, i) => i % 3 === runIndex);

  for (const ind of INDUSTRY_SOURCES) {
    // Use first 4 google queries per industry
    const queries = ind.googleQueries.slice(0, 4);
    for (const country of countrySubset) {
      // 1 query per country per industry per run (rotates across runs)
      const queryIdx = Math.floor(Date.now() / 60000) % queries.length;
      const q = queries[queryIdx];
      const xml = await safeTextFetch(
        `https://news.google.com/rss/search?q=${q}&hl=${country.lang}&gl=${country.code}&ceid=${country.ceid}`,
        6000,
      );
      if (!xml) continue;
      const items = xml.split("<item>").slice(1, 4); // top 3 per query
      for (const item of items) {
        const title = item.match(/<title>(.*?)<\/title>/)?.[1]?.replace(/(<!\[CDATA\[|\]\]>)/g, "") || "";
        const link = item.match(/<link>(.*?)<\/link>/)?.[1] || item.match(/<link\/>(.*?)(?:<|$)/)?.[1] || "";
        const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
        const source = item.match(/<source.*?>(.*?)<\/source>/)?.[1]?.replace(/(<!\[CDATA\[|\]\]>)/g, "") || "";
        if (title) {
          rows.push({
            source: `gnews-${country.code}-${ind.slug}`, data_type: "industry_news", geo_scope: country.code,
            industry: ind.slug,
            payload: { title, url: link, date: pubDate, source, country: country.code, query: q, industry: ind.slug },
            tags: ["news", "industry", ind.slug, country.code.toLowerCase()],
          });
        }
      }
    }
  }
  return rows;
}

// ═══════════════════════════════════════════════════════════════════
// INDUSTRY-SPECIFIC GDELT COLLECTOR
// Queries GDELT with industry-specific event terms
// ═══════════════════════════════════════════════════════════════════

async function collectIndustryGDELT(): Promise<any[]> {
  const rows: any[] = [];
  for (const ind of INDUSTRY_SOURCES) {
    for (const q of ind.gdeltQueries.slice(0, 4)) {
      const data = await safeFetch(`https://api.gdeltproject.org/api/v2/doc/doc?query=${q}&mode=ArtList&maxrecords=10&format=json&sort=DateDesc&timespan=2h`);
      if (data?.articles) {
        for (const a of data.articles.slice(0, 8)) {
          rows.push({
            source: `gdelt-${ind.slug}`, data_type: "industry_signal", geo_scope: a.sourcecountry || "global",
            industry: ind.slug,
            payload: { title: a.title, url: a.url, domain: a.domain, date: a.seendate, country: a.sourcecountry, language: a.language, tone: a.tone },
            tags: ["news", "gdelt", "industry", ind.slug],
          });
        }
      }
    }
  }
  return rows;
}

// ═══════════════════════════════════════════════════════════════════
// INDUSTRY-SPECIFIC YOUTUBE COLLECTOR
// ═══════════════════════════════════════════════════════════════════

async function collectIndustryYouTube(): Promise<any[]> {
  const rows: any[] = [];
  for (const ind of INDUSTRY_SOURCES) {
    for (const channel of ind.youtubeChannels) {
      const xml = await safeTextFetch(`https://www.youtube.com/feeds/videos.xml?user=${channel}`, 6000);
      if (!xml) continue;
      const entries = xml.split("<entry>").slice(1, 4);
      for (const entry of entries) {
        const title = entry.match(/<title>(.*?)<\/title>/)?.[1] || "";
        const videoId = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1] || "";
        const published = entry.match(/<published>(.*?)<\/published>/)?.[1] || "";
        if (title) {
          rows.push({
            source: `youtube-${ind.slug}`, data_type: "industry_video", geo_scope: "global",
            industry: ind.slug,
            payload: { title, url: `https://youtube.com/watch?v=${videoId}`, channel, published },
            tags: ["social", "youtube", "industry", ind.slug, channel.toLowerCase()],
          });
        }
      }
    }
  }
  return rows;
}

// ═══════════════════════════════════════════════════════════════════
// COUNTRY-SPECIFIC GENERAL COLLECTORS (existing)
// ═══════════════════════════════════════════════════════════════════

async function collectCountryNews(): Promise<any[]> {
  const rows: any[] = [];
  const queries = ["business","technology","finance","startup","investment","economy","market","trade","energy","agriculture"];
  for (let batch = 0; batch < COUNTRIES.length; batch += 8) {
    const countryBatch = COUNTRIES.slice(batch, batch + 8);
    const batchPromises = countryBatch.map(async (country) => {
      const countryRows: any[] = [];
      for (const q of queries.slice(0, 3)) {
        const xml = await safeTextFetch(`https://news.google.com/rss/search?q=${q}&hl=${country.lang}&gl=${country.code}&ceid=${country.ceid}`, 8000);
        if (!xml) continue;
        const items = xml.split("<item>").slice(1, 6);
        for (const item of items) {
          const title = item.match(/<title>(.*?)<\/title>/)?.[1]?.replace(/(<!\[CDATA\[|\]\]>)/g, "") || "";
          const link = item.match(/<link>(.*?)<\/link>/)?.[1] || item.match(/<link\/>(.*?)(?:<|$)/)?.[1] || "";
          const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
          const source = item.match(/<source.*?>(.*?)<\/source>/)?.[1]?.replace(/(<!\[CDATA\[|\]\]>)/g, "") || "";
          if (title) {
            countryRows.push({ source: `gnews-${country.code}`, data_type: "country_news", geo_scope: country.code, payload: { title, url: link, date: pubDate, source, country: country.code, query: q }, tags: ["news", "country", country.code.toLowerCase(), q] });
          }
        }
      }
      return countryRows;
    });
    const results = await Promise.all(batchPromises);
    rows.push(...results.flat());
  }
  return rows;
}

async function collectCountryReddit(): Promise<any[]> {
  const rows: any[] = [];
  const allSubs = COUNTRIES.flatMap(c => c.subs.map(s => ({ sub: s, code: c.code })));
  for (let i = 0; i < allSubs.length; i += 5) {
    const batch = allSubs.slice(i, i + 5);
    const promises = batch.map(async ({ sub, code }) => {
      const data = await safeFetch(`https://www.reddit.com/r/${sub}/hot.json?limit=8`, 8000);
      if (!data?.data?.children) return [];
      return data.data.children.filter((p: any) => !p.data.stickied && p.data.score > 5).slice(0, 5).map((post: any) => {
        const d = post.data;
        return { source: `reddit-${code}`, data_type: "social_signal", geo_scope: code, payload: { title: d.title, url: `https://reddit.com${d.permalink}`, subreddit: sub, score: d.score, comments: d.num_comments, author: d.author, created: new Date(d.created_utc * 1000).toISOString(), selftext: (d.selftext || "").substring(0, 300) }, tags: ["social", "reddit", code.toLowerCase(), sub.toLowerCase()] };
      });
    });
    const results = await Promise.all(promises);
    rows.push(...results.flat());
  }
  return rows;
}

async function collectYouTube(): Promise<any[]> {
  const rows: any[] = [];
  const allChannels = COUNTRIES.flatMap(c => c.yt.map(ch => ({ channel: ch, code: c.code })));
  for (let i = 0; i < allChannels.length; i += 5) {
    const batch = allChannels.slice(i, i + 5);
    const promises = batch.map(async ({ channel, code }) => {
      const xml = await safeTextFetch(`https://www.youtube.com/feeds/videos.xml?user=${channel}`, 8000);
      if (!xml) return [];
      return xml.split("<entry>").slice(1, 6).map(entry => {
        const title = entry.match(/<title>(.*?)<\/title>/)?.[1] || "";
        const videoId = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1] || "";
        const published = entry.match(/<published>(.*?)<\/published>/)?.[1] || "";
        const views = entry.match(/<media:statistics views="(\d+)"/)?.[1] || "0";
        return { source: `youtube-${code}`, data_type: "video_signal", geo_scope: code, payload: { title, url: `https://youtube.com/watch?v=${videoId}`, channel, published, views: parseInt(views), country: code }, tags: ["social", "youtube", code.toLowerCase(), channel.toLowerCase()] };
      }).filter((r: any) => r.payload.title);
    });
    const results = await Promise.all(promises);
    rows.push(...results.flat());
  }
  return rows;
}

async function collectGlobalTopicNews(): Promise<any[]> {
  const topics = [
    "technology+startup+funding","stock+market+IPO","cryptocurrency+bitcoin",
    "real+estate+investment","agriculture+food+prices","energy+oil+gas+renewable",
    "healthcare+pharma+biotech","fintech+mobile+money","supply+chain+logistics",
    "AI+artificial+intelligence","telecom+5G+spectrum","mining+metals+commodities",
    "banking+finance+regulation","e-commerce+retail+marketplace",
    "construction+infrastructure","education+edtech","insurance+insurtech",
    "media+entertainment+streaming","aviation+airline+airports","textile+fashion+manufacturing",
  ];
  const rows: any[] = [];
  for (const topic of topics) {
    const xml = await safeTextFetch(`https://news.google.com/rss/search?q=${topic}&hl=en&gl=US&ceid=US:en`);
    if (!xml) continue;
    const items = xml.split("<item>").slice(1, 8);
    for (const item of items) {
      const title = item.match(/<title>(.*?)<\/title>/)?.[1]?.replace(/(<!\[CDATA\[|\]\]>)/g, "") || "";
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || item.match(/<link\/>(.*?)(?:<|$)/)?.[1] || "";
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
      const source = item.match(/<source.*?>(.*?)<\/source>/)?.[1]?.replace(/(<!\[CDATA\[|\]\]>)/g, "") || "";
      if (title) {
        rows.push({ source: "google-news", data_type: "news_signal", geo_scope: "global", payload: { title, url: link, date: pubDate, source, topic: topic.replace(/\+/g, " ") }, tags: ["news", "google", ...topic.split("+").slice(0, 3)] });
      }
    }
  }
  return rows;
}

async function collectHackerNews(): Promise<any[]> {
  const rows: any[] = [];
  const topStories = await safeFetch("https://hacker-news.firebaseio.com/v0/topstories.json");
  if (!Array.isArray(topStories)) return [];
  const stories = await Promise.all(topStories.slice(0, 30).map((id: number) => safeFetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)));
  for (const s of stories) {
    if (!s?.title) continue;
    rows.push({ source: "hackernews", data_type: "social_signal", geo_scope: "global", payload: { title: s.title, url: s.url || `https://news.ycombinator.com/item?id=${s.id}`, score: s.score, comments: s.descendants || 0, author: s.by, created: new Date(s.time * 1000).toISOString() }, tags: ["social", "hackernews", "tech"] });
  }
  return rows;
}

async function collectDevTo(): Promise<any[]> {
  const data = await safeFetch("https://dev.to/api/articles?top=1&per_page=20");
  if (!Array.isArray(data)) return [];
  return data.map((a: any) => ({ source: "devto", data_type: "social_signal", geo_scope: "global", payload: { title: a.title, url: a.url, reactions: a.positive_reactions_count, comments: a.comments_count, author: a.user?.name, tags: a.tag_list, published: a.published_at }, tags: ["social", "devto", ...(a.tag_list || []).slice(0, 3)] }));
}

async function collectGitHub(): Promise<any[]> {
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const data = await safeFetch(`https://api.github.com/search/repositories?q=created:>${since}&sort=stars&order=desc&per_page=15`);
  if (!data?.items) return [];
  return data.items.map((r: any) => ({ source: "github", data_type: "tech_signal", geo_scope: "global", payload: { name: r.full_name, description: (r.description || "").substring(0, 300), stars: r.stargazers_count, language: r.language, url: r.html_url, topics: r.topics?.slice(0, 5), created: r.created_at }, tags: ["tech", "github", "trending", r.language?.toLowerCase()].filter(Boolean) }));
}

async function collectWorldBank(): Promise<any[]> {
  const indicators = [
    { code: "NY.GDP.MKTP.CD", name: "GDP" },
    { code: "FP.CPI.TOTL.ZG", name: "Inflation" },
    { code: "SL.UEM.TOTL.ZS", name: "Unemployment" },
    { code: "BX.KLT.DINV.CD.WD", name: "FDI" },
  ];
  const rows: any[] = [];
  for (const ind of indicators) {
    const data = await safeFetch(`https://api.worldbank.org/v2/country/all/indicator/${ind.code}?format=json&per_page=50&date=2022:2025&MRV=1`);
    if (Array.isArray(data) && data[1]) {
      for (const entry of data[1]) {
        if (entry.value !== null) {
          rows.push({ source: "worldbank", data_type: "economic_indicator", geo_scope: entry.country?.id || "global", payload: { indicator: ind.name, code: ind.code, country: entry.country?.value, countryCode: entry.country?.id, value: entry.value, year: entry.date }, tags: ["economics", ind.name.toLowerCase(), entry.country?.id?.toLowerCase()].filter(Boolean) });
        }
      }
    }
  }
  return rows;
}

// ═══════════════════════════════════════════════════════════════════
// ADDITIONAL FREE API SOURCES (from industry_data_sources spreadsheet)
// ═══════════════════════════════════════════════════════════════════

/** Alpha Vantage — top movers + sector performance (free tier, 25 calls/day) */
async function collectAlphaVantage(): Promise<any[]> {
  const key = Deno.env.get("ALPHAVANTAGE_API_KEY");
  if (!key) return [];
  const rows: any[] = [];
  const [topGainers, sectorPerf] = await Promise.all([
    safeFetch(`https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${key}`),
    safeFetch(`https://www.alphavantage.co/query?function=SECTOR&apikey=${key}`),
  ]);
  if (topGainers?.top_gainers) {
    for (const s of topGainers.top_gainers.slice(0, 10)) {
      rows.push({ source: "alphavantage", data_type: "stock_mover", geo_scope: "US", payload: { ticker: s.ticker, price: s.price, change_pct: s.change_percentage, volume: s.volume, direction: "gainer" }, tags: ["stocks", "movers", "gainer"] });
    }
    for (const s of (topGainers.top_losers || []).slice(0, 10)) {
      rows.push({ source: "alphavantage", data_type: "stock_mover", geo_scope: "US", payload: { ticker: s.ticker, price: s.price, change_pct: s.change_percentage, volume: s.volume, direction: "loser" }, tags: ["stocks", "movers", "loser"] });
    }
  }
  if (sectorPerf?.["Rank A: Real-Time Performance"]) {
    rows.push({ source: "alphavantage", data_type: "sector_performance", geo_scope: "US", payload: sectorPerf, tags: ["stocks", "sectors"] });
  }
  return rows;
}

/** FRED (Federal Reserve Economic Data) — key US economic indicators (free, no key needed for basic) */
async function collectFRED(): Promise<any[]> {
  const key = Deno.env.get("FRED_API_KEY");
  if (!key) return [];
  const series = [
    { id: "FEDFUNDS", name: "Fed Funds Rate" },
    { id: "UNRATE", name: "US Unemployment" },
    { id: "CPIAUCSL", name: "US CPI" },
    { id: "GDP", name: "US GDP" },
    { id: "DGS10", name: "10Y Treasury Yield" },
    { id: "DEXUSEU", name: "USD/EUR Exchange" },
    { id: "DCOILWTICO", name: "WTI Crude Oil" },
    { id: "BAMLH0A0HYM2", name: "US High Yield Spread" },
  ];
  const rows: any[] = [];
  for (const s of series) {
    const data = await safeFetch(`https://api.stlouisfed.org/fred/series/observations?series_id=${s.id}&api_key=${key}&file_type=json&sort_order=desc&limit=1`);
    if (data?.observations?.[0]) {
      const obs = data.observations[0];
      rows.push({ source: "fred", data_type: "economic_indicator", geo_scope: "US", payload: { series_id: s.id, name: s.name, value: obs.value, date: obs.date }, tags: ["economics", "fred", s.name.toLowerCase().replace(/\s+/g, "-")] });
    }
  }
  return rows;
}

/** UN Comtrade — top traded commodities (free tier) */
async function collectUNComtrade(): Promise<any[]> {
  const rows: any[] = [];
  const data = await safeFetch("https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=404&period=2023&flowCode=M&cmdCode=TOTAL", 15000);
  if (data?.data) {
    for (const item of (data.data as any[]).slice(0, 20)) {
      rows.push({ source: "uncomtrade", data_type: "trade_flow", geo_scope: item.reporterCode || "KE", payload: { reporter: item.reporterDesc, partner: item.partnerDesc, flow: item.flowDesc, commodity: item.cmdDesc, value: item.primaryValue, year: item.period }, tags: ["trade", "imports", "kenya"] });
    }
  }
  return rows;
}

/** Product Hunt — latest launches (free GraphQL API) */
async function collectProductHunt(): Promise<any[]> {
  const rows: any[] = [];
  const data = await safeFetch("https://api.producthunt.com/v2/api/graphql", 8000);
  // PH needs auth, fallback to RSS-like scrape
  const xml = await safeTextFetch("https://www.producthunt.com/feed", 8000);
  if (!xml) return [];
  const items = xml.split("<item>").slice(1, 10);
  for (const item of items) {
    const title = item.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/)?.[1] || "";
    const link = item.match(/<link>(.*?)<\/link>/)?.[1] || "";
    if (title) {
      rows.push({ source: "producthunt", data_type: "product_launch", geo_scope: "global", payload: { title, url: link }, tags: ["tech", "startup", "launch", "producthunt"] });
    }
  }
  return rows;
}

/** GitHub Trending — weekly trending repos by language */
async function collectGitHubTrending(): Promise<any[]> {
  const rows: any[] = [];
  const languages = ["python", "javascript", "typescript", "rust", "go"];
  for (const lang of languages) {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const data = await safeFetch(`https://api.github.com/search/repositories?q=language:${lang}+created:>${since}&sort=stars&order=desc&per_page=5`);
    if (data?.items) {
      for (const r of data.items) {
        rows.push({ source: "github-trending", data_type: "tech_signal", geo_scope: "global", payload: { name: r.full_name, description: (r.description || "").slice(0, 200), stars: r.stargazers_count, language: r.language, url: r.html_url, topics: r.topics?.slice(0, 5) }, tags: ["tech", "github", "trending", lang] });
      }
    }
  }
  return rows;
}

/** OpenWeatherMap — weather for key African agricultural regions */
async function collectWeatherAg(): Promise<any[]> {
  const key = Deno.env.get("OPENWEATHER_API_KEY");
  if (!key) return [];
  const cities = [
    { name: "Nairobi", lat: -1.29, lon: 36.82, code: "KE" },
    { name: "Mombasa", lat: -4.04, lon: 39.67, code: "KE" },
    { name: "Nakuru", lat: -0.30, lon: 36.07, code: "KE" },
    { name: "Eldoret", lat: 0.52, lon: 35.27, code: "KE" },
    { name: "Kisumu", lat: -0.10, lon: 34.75, code: "KE" },
    { name: "Lagos", lat: 6.45, lon: 3.40, code: "NG" },
    { name: "Dar es Salaam", lat: -6.79, lon: 39.28, code: "TZ" },
    { name: "Kampala", lat: 0.35, lon: 32.58, code: "UG" },
  ];
  const rows: any[] = [];
  for (const city of cities) {
    const data = await safeFetch(`https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${key}&units=metric`);
    if (data?.main) {
      rows.push({ source: "openweather", data_type: "weather_ag", geo_scope: city.code, payload: { city: city.name, temp: data.main.temp, humidity: data.main.humidity, pressure: data.main.pressure, weather: data.weather?.[0]?.description, wind_speed: data.wind?.speed, rain_1h: data.rain?.["1h"] || 0 }, tags: ["weather", "agriculture", city.code.toLowerCase()] });
    }
  }
  return rows;
}

/** CoinGecko Trending — trending coins + NFTs */
async function collectCryptoTrending(): Promise<any[]> {
  const data = await safeFetch("https://api.coingecko.com/api/v3/search/trending");
  if (!data?.coins) return [];
  return data.coins.slice(0, 10).map((c: any) => ({
    source: "coingecko-trending", data_type: "crypto_trending", geo_scope: "global",
    payload: { id: c.item?.id, name: c.item?.name, symbol: c.item?.symbol, market_cap_rank: c.item?.market_cap_rank, price_btc: c.item?.price_btc },
    tags: ["crypto", "trending", c.item?.symbol?.toLowerCase()].filter(Boolean),
  }));
}

/** IMF Data — World Economic Outlook indicators */
async function collectIMF(): Promise<any[]> {
  const rows: any[] = [];
  const countries = ["KEN", "NGA", "ZAF", "TZA", "UGA", "GHA", "EGY"];
  for (const cc of countries) {
    const data = await safeFetch(`https://www.imf.org/external/datamapper/api/v1/NGDP_RPCH/${cc}?periods=2024,2025,2026`, 10000);
    if (data?.values?.NGDP_RPCH?.[cc]) {
      const vals = data.values.NGDP_RPCH[cc];
      rows.push({ source: "imf", data_type: "economic_forecast", geo_scope: cc.slice(0, 2), payload: { country: cc, indicator: "GDP Growth %", values: vals }, tags: ["economics", "imf", "gdp", cc.toLowerCase()] });
    }
  }
  return rows;
}

/** Metals API / Gold-API — precious metals prices (free) */
async function collectMetalPrices(): Promise<any[]> {
  const data = await safeFetch("https://api.gold-api.com/price/XAU,XAG,XPT,XPD");
  if (!Array.isArray(data)) return [];
  return data.map((m: any) => ({
    source: "gold-api", data_type: "commodity_price", geo_scope: "global",
    payload: { metal: m.metal || m.symbol, price_usd: m.price, change_pct: m.chp, updated: m.updatedAt },
    tags: ["commodity", "metals", (m.metal || m.symbol || "").toLowerCase()],
  }));
}

/** Open Food Facts — food product data for consumer/FMCG intel */
async function collectFoodTrends(): Promise<any[]> {
  const data = await safeFetch("https://world.openfoodfacts.org/cgi/search.pl?search_terms=kenya&search_simple=1&action=process&json=1&page_size=15", 10000);
  if (!data?.products) return [];
  return data.products.slice(0, 10).map((p: any) => ({
    source: "openfoodfacts", data_type: "food_product", geo_scope: p.countries_tags?.[0] || "global",
    payload: { name: p.product_name, brands: p.brands, categories: p.categories, countries: p.countries, nutriscore: p.nutriscore_grade },
    tags: ["food", "consumer", "fmcg"],
  }));
}

/** EventBrite-like — via Predicthq for event signals */
async function collectEventSignals(): Promise<any[]> {
  const rows: any[] = [];
  // Use Google calendar of public holidays & events via open calendar feeds
  const xml = await safeTextFetch("https://www.officeholidays.com/ics-clean/kenya", 6000);
  if (xml) {
    const events = xml.split("BEGIN:VEVENT").slice(1, 10);
    for (const ev of events) {
      const summary = ev.match(/SUMMARY:(.*?)(?:\r?\n)/)?.[1] || "";
      const dtstart = ev.match(/DTSTART.*?:(.*?)(?:\r?\n)/)?.[1] || "";
      if (summary) {
        rows.push({ source: "public-holidays", data_type: "event_signal", geo_scope: "KE", payload: { event: summary, date: dtstart, country: "Kenya" }, tags: ["events", "holidays", "kenya"] });
      }
    }
  }
  return rows;
}

async function collectSentiment(): Promise<any[]> {
  const rows: any[] = [];
  const [fng, gdeltTone] = await Promise.all([
    safeFetch("https://api.alternative.me/fng/?limit=1"),
    safeFetch("https://api.gdeltproject.org/api/v2/doc/doc?query=business%20OR%20finance%20OR%20technology&mode=ToneChart&format=json&timespan=1h"),
  ]);
  if (fng?.data?.[0]) {
    rows.push({ source: "alternative-me", data_type: "market_sentiment", geo_scope: "global", payload: { value: fng.data[0].value, label: fng.data[0].value_classification, timestamp: fng.data[0].timestamp }, tags: ["sentiment", "fear-greed", "crypto"] });
  }
  if (gdeltTone?.tone_chart) {
    rows.push({ source: "gdelt-tone", data_type: "sentiment_signal", geo_scope: "global", payload: { tone_data: gdeltTone.tone_chart, measured_at: new Date().toISOString() }, tags: ["sentiment", "global", "tone"] });
  }
  return rows;
}

// ═══════════════════════════════════════════════════════════════════
// SOURCE COUNT CALCULATOR — proves 20-100+ per sub-flow
// ═══════════════════════════════════════════════════════════════════

function calculateSourcesPerIndustry(): Record<string, { subreddits: number; googleNewsQueries: number; googleNewsCountries: number; gdeltQueries: number; twitterTerms: number; youtubeChannels: number; totalMinSources: number }> {
  const stats: Record<string, any> = {};
  for (const ind of INDUSTRY_SOURCES) {
    const countriesPerRun = Math.ceil(COUNTRIES.length / 3);
    const gNewsQueries = Math.min(ind.googleQueries.length, 4);
    const totalMin =
      ind.subreddits.length +                          // Reddit subs
      (gNewsQueries * countriesPerRun) +               // Google News (queries × countries)
      Math.min(ind.gdeltQueries.length, 4) +           // GDELT queries
      Math.min(ind.twitterTerms.length, 3) +           // Twitter terms
      ind.youtubeChannels.length;                       // YouTube channels
    stats[ind.slug] = {
      subreddits: ind.subreddits.length,
      googleNewsQueries: gNewsQueries,
      googleNewsCountries: countriesPerRun,
      gdeltQueries: Math.min(ind.gdeltQueries.length, 4),
      twitterTerms: Math.min(ind.twitterTerms.length, 3),
      youtubeChannels: ind.youtubeChannels.length,
      totalMinSources: totalMin,
    };
  }
  return stats;
}

// ═══════════════════════════════════════════════════════════════════
// MAIN HANDLER — orchestrates all collection waves
// ═══════════════════════════════════════════════════════════════════

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    // Wave 0: Global Tier-1 news RSS (BBC, CNN, Al Jazeera, Reuters, etc.)
    const [globalRSS] = await Promise.all([collectGlobalNewsRSS()]);

    // Wave 1: Fast financial data
    const [crypto, forex, sentiment] = await Promise.all([
      collectCrypto(), collectForex(), collectSentiment(),
    ]);

    // Wave 2: Global news + macro signals
    const [globalTopicNews, hackerNews, devTo, github, twitterSignals] = await Promise.all([
      collectGlobalTopicNews(), collectHackerNews(), collectDevTo(), collectGitHub(), collectTwitter(),
    ]);

    // Wave 3: Industry-specific data (THE BIG ONE — 30 industries × multiple platforms)
    const [industryGDELT, industryYT, industryReddit] = await Promise.all([
      collectIndustryGDELT(), collectIndustryYouTube(), collectIndustryReddit(),
    ]);

    // Wave 4: Industry-specific news across countries (massive multiplier)
    const [industryNews] = await Promise.all([collectIndustryNews()]);

    // Wave 5: Industry-specific Twitter
    const [industryTwitter] = await Promise.all([collectIndustryTwitter()]);

    // Wave 6: Country-specific general data
    const [countryNews, countryReddit, youtubeSignals] = await Promise.all([
      collectCountryNews(), collectCountryReddit(), collectYouTube(),
    ]);

    // Wave 7: Economic indicators
    const [worldbank] = await Promise.all([collectWorldBank()]);

    const allRows = [
      ...globalRSS,
      ...crypto, ...forex, ...sentiment,
      ...globalTopicNews, ...hackerNews, ...devTo, ...github, ...twitterSignals,
      ...industryGDELT, ...industryYT, ...industryReddit,
      ...industryNews,
      ...industryTwitter,
      ...countryNews, ...countryReddit, ...youtubeSignals,
      ...worldbank,
    ];

    let inserted = 0;
    for (let i = 0; i < allRows.length; i += 100) {
      const chunk = allRows.slice(i, i + 100);
      const { error } = await sb.from("raw_market_data").insert(chunk);
      if (!error) inserted += chunk.length;
      else console.error("Insert error:", error.message);
    }

    // Clean old data (keep 3 days)
    const cutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    await sb.from("raw_market_data").delete().lt("created_at", cutoff);

    const sourceStats = calculateSourcesPerIndustry();

    const sources = {
      globalRSS: globalRSS.length,
      globalRSS_sources: GLOBAL_NEWS_RSS.length,
      globalRSS_feeds: GLOBAL_NEWS_RSS.reduce((s, r) => s + r.feeds.length, 0),
      crypto: crypto.length, forex: forex.length, sentiment: sentiment.length,
      globalTopicNews: globalTopicNews.length,
      hackerNews: hackerNews.length, devTo: devTo.length, github: github.length,
      twitter_macro: twitterSignals.length,
      industry_gdelt: industryGDELT.length,
      industry_youtube: industryYT.length,
      industry_reddit: industryReddit.length,
      industry_news: industryNews.length,
      industry_twitter: industryTwitter.length,
      countryNews: countryNews.length, countryReddit: countryReddit.length,
      youtube: youtubeSignals.length, worldbank: worldbank.length,
      countries_covered: COUNTRIES.length,
      industries_covered: INDUSTRY_SOURCES.length,
      total_industry_subreddits: INDUSTRY_SOURCES.reduce((s, i) => s + i.subreddits.length, 0),
      total_industry_google_queries: INDUSTRY_SOURCES.reduce((s, i) => s + i.googleQueries.length, 0),
      total_industry_gdelt_queries: INDUSTRY_SOURCES.reduce((s, i) => s + i.gdeltQueries.length, 0),
      total_industry_twitter_terms: INDUSTRY_SOURCES.reduce((s, i) => s + i.twitterTerms.length, 0),
      total_industry_yt_channels: INDUSTRY_SOURCES.reduce((s, i) => s + i.youtubeChannels.length, 0),
      sources_per_industry: sourceStats,
    };

    return new Response(JSON.stringify({
      collected: allRows.length, inserted, sources,
      timestamp: new Date().toISOString(),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Data collector error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
