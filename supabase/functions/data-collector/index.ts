import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function safeFetch(url: string, timeout = 12000): Promise<any> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function safeTextFetch(url: string, timeout = 12000): Promise<string | null> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; }
}

// ── CRYPTO ──
async function collectCrypto(): Promise<any[]> {
  const data = await safeFetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d");
  if (!Array.isArray(data)) return [];
  return data.map((c: any) => ({
    source: "coingecko", data_type: "crypto_price", geo_scope: "global",
    payload: { id: c.id, symbol: c.symbol, name: c.name, price: c.current_price, market_cap: c.market_cap, volume: c.total_volume, change_24h: c.price_change_percentage_24h, change_7d: c.price_change_percentage_7d_in_currency, high_24h: c.high_24h, low_24h: c.low_24h, rank: c.market_cap_rank },
    tags: ["crypto", "market", c.symbol],
  }));
}

// ── FOREX ──
async function collectForex(): Promise<any[]> {
  const data = await safeFetch("https://open.er-api.com/v6/latest/USD");
  if (!data?.rates) return [];
  const important = ["EUR","GBP","JPY","CHF","AUD","CAD","CNY","INR","BRL","MXN","KRW","ZAR","SGD","HKD","NZD","SEK","NOK","TRY","AED","THB","KES","NGN","EGP","IDR","PHP","VND","PKR","BDT","COP","CLP","PEN","ARS","SAR","QAR","KWD","BHD","OMR","JOD","MAD","TZS","UGX","GHS","ETB","RWF"];
  const rows: any[] = [];
  for (const cur of important) {
    if (data.rates[cur]) {
      rows.push({
        source: "exchange-rates", data_type: "forex_rate", geo_scope: "global",
        payload: { base: "USD", currency: cur, rate: data.rates[cur], updated: data.time_last_update_utc },
        tags: ["forex", cur.toLowerCase()],
      });
    }
  }
  return rows;
}

// ── GDELT NEWS ──
async function collectGDELT(): Promise<any[]> {
  const queries = [
    "startup%20funding%20investment",
    "market%20gap%20opportunity%20business",
    "supply%20chain%20disruption",
    "regulatory%20change%20policy",
    "technology%20adoption%20innovation",
    "economic%20growth%20GDP",
    "merger%20acquisition%20deal",
    "IPO%20listing%20stock%20exchange",
    "central%20bank%20interest%20rate",
    "trade%20agreement%20tariff",
    "cryptocurrency%20blockchain%20DeFi",
    "real%20estate%20property%20market",
    "energy%20transition%20renewable",
    "healthcare%20pharma%20biotech",
    "agriculture%20food%20supply",
    "fintech%20mobile%20money%20payments",
  ];
  const rows: any[] = [];
  for (const q of queries) {
    const data = await safeFetch(`https://api.gdeltproject.org/api/v2/doc/doc?query=${q}&mode=ArtList&maxrecords=15&format=json&sort=DateDesc&timespan=1h`);
    if (data?.articles) {
      for (const a of data.articles.slice(0, 12)) {
        rows.push({
          source: "gdelt", data_type: "news_signal",
          geo_scope: a.sourcecountry || "global",
          payload: { title: a.title, url: a.url, domain: a.domain, date: a.seendate, country: a.sourcecountry, language: a.language, tone: a.tone },
          tags: ["news", "signal", q.split("%20")[0]],
        });
      }
    }
  }
  return rows;
}

// ── WORLD BANK INDICATORS ──
async function collectWorldBank(): Promise<any[]> {
  const indicators = [
    { code: "NY.GDP.MKTP.CD", name: "GDP" },
    { code: "FP.CPI.TOTL.ZG", name: "Inflation" },
    { code: "SL.UEM.TOTL.ZS", name: "Unemployment" },
    { code: "BX.KLT.DINV.CD.WD", name: "FDI" },
    { code: "NE.EXP.GNFS.ZS", name: "Exports" },
  ];
  const rows: any[] = [];
  for (const ind of indicators) {
    const data = await safeFetch(`https://api.worldbank.org/v2/country/all/indicator/${ind.code}?format=json&per_page=50&date=2022:2025&MRV=1`);
    if (Array.isArray(data) && data[1]) {
      for (const entry of data[1]) {
        if (entry.value !== null) {
          rows.push({
            source: "worldbank", data_type: "economic_indicator",
            geo_scope: entry.country?.id || "global",
            payload: { indicator: ind.name, code: ind.code, country: entry.country?.value, countryCode: entry.country?.id, value: entry.value, year: entry.date },
            tags: ["economics", ind.name.toLowerCase(), entry.country?.id?.toLowerCase()].filter(Boolean),
          });
        }
      }
    }
  }
  return rows;
}

// ── GOOGLE NEWS RSS ──
async function collectGoogleNews(): Promise<any[]> {
  const topics = [
    "technology+startup+funding",
    "stock+market+IPO",
    "cryptocurrency+bitcoin",
    "real+estate+investment",
    "agriculture+food+prices",
    "energy+oil+gas+renewable",
    "healthcare+pharma+biotech",
    "fintech+mobile+money",
    "supply+chain+logistics",
    "AI+artificial+intelligence",
    "telecom+5G+spectrum",
    "mining+metals+commodities",
    "banking+finance+regulation",
    "e-commerce+retail+marketplace",
    "construction+infrastructure",
    "education+edtech",
    "insurance+insurtech",
    "media+entertainment+streaming",
    "aviation+airline+airports",
    "textile+fashion+manufacturing",
  ];
  const rows: any[] = [];
  for (const topic of topics) {
    const xml = await safeTextFetch(`https://news.google.com/rss/search?q=${topic}&hl=en&gl=US&ceid=US:en`);
    if (!xml) continue;
    // Simple XML parsing for RSS items
    const items = xml.split("<item>").slice(1, 8);
    for (const item of items) {
      const title = item.match(/<title>(.*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "") || "";
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || item.match(/<link\/>(.*?)(?:<|$)/)?.[1] || "";
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
      const source = item.match(/<source.*?>(.*?)<\/source>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "") || "";
      if (title) {
        rows.push({
          source: "google-news", data_type: "news_signal", geo_scope: "global",
          payload: { title, url: link, date: pubDate, source: source, topic: topic.replace(/\+/g, " ") },
          tags: ["news", "google", ...topic.split("+").slice(0, 3)],
        });
      }
    }
  }
  return rows;
}

// ── REDDIT ──
async function collectReddit(): Promise<any[]> {
  const subs = [
    "business", "investing", "stocks", "CryptoCurrency", "startups",
    "Entrepreneur", "technology", "finance", "economics", "RealEstate",
    "PersonalFinance", "wallstreetbets", "fintech", "energy", "SupplyChain",
  ];
  const rows: any[] = [];
  for (const sub of subs) {
    const data = await safeFetch(`https://www.reddit.com/r/${sub}/hot.json?limit=10`);
    if (!data?.data?.children) continue;
    for (const post of data.data.children) {
      const d = post.data;
      if (d.stickied || d.score < 10) continue;
      rows.push({
        source: "reddit", data_type: "social_signal", geo_scope: "global",
        payload: {
          title: d.title,
          url: `https://reddit.com${d.permalink}`,
          subreddit: sub,
          score: d.score,
          comments: d.num_comments,
          author: d.author,
          created: new Date(d.created_utc * 1000).toISOString(),
          selftext: (d.selftext || "").substring(0, 500),
        },
        tags: ["social", "reddit", sub.toLowerCase()],
      });
    }
  }
  return rows;
}

// ── HACKER NEWS ──
async function collectHackerNews(): Promise<any[]> {
  const rows: any[] = [];
  const topStories = await safeFetch("https://hacker-news.firebaseio.com/v0/topstories.json");
  if (!Array.isArray(topStories)) return [];
  const ids = topStories.slice(0, 30);
  const stories = await Promise.all(ids.map((id: number) => safeFetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)));
  for (const s of stories) {
    if (!s || !s.title) continue;
    rows.push({
      source: "hackernews", data_type: "social_signal", geo_scope: "global",
      payload: {
        title: s.title,
        url: s.url || `https://news.ycombinator.com/item?id=${s.id}`,
        score: s.score,
        comments: s.descendants || 0,
        author: s.by,
        created: new Date(s.time * 1000).toISOString(),
      },
      tags: ["social", "hackernews", "tech"],
    });
  }
  return rows;
}

// ── DEV.TO (Tech/Startup content) ──
async function collectDevTo(): Promise<any[]> {
  const rows: any[] = [];
  const data = await safeFetch("https://dev.to/api/articles?top=1&per_page=20");
  if (!Array.isArray(data)) return [];
  for (const a of data) {
    rows.push({
      source: "devto", data_type: "social_signal", geo_scope: "global",
      payload: {
        title: a.title,
        url: a.url,
        reactions: a.positive_reactions_count,
        comments: a.comments_count,
        author: a.user?.name,
        tags: a.tag_list,
        published: a.published_at,
      },
      tags: ["social", "devto", ...(a.tag_list || []).slice(0, 3)],
    });
  }
  return rows;
}

// ── GITHUB TRENDING ──
async function collectGitHubTrending(): Promise<any[]> {
  const rows: any[] = [];
  const data = await safeFetch("https://api.github.com/search/repositories?q=created:>2026-03-18&sort=stars&order=desc&per_page=15");
  if (!data?.items) return [];
  for (const r of data.items) {
    rows.push({
      source: "github", data_type: "tech_signal", geo_scope: "global",
      payload: {
        name: r.full_name,
        description: (r.description || "").substring(0, 300),
        stars: r.stargazers_count,
        language: r.language,
        url: r.html_url,
        topics: r.topics?.slice(0, 5),
        created: r.created_at,
      },
      tags: ["tech", "github", "trending", r.language?.toLowerCase()].filter(Boolean),
    });
  }
  return rows;
}

// ── EVENTREGISTRY (Global news aggregator) ──
async function collectEventRegistry(): Promise<any[]> {
  const rows: any[] = [];
  // Use free GDELT-based trending topics
  const data = await safeFetch("https://api.gdeltproject.org/api/v2/doc/doc?query=business%20OR%20finance%20OR%20technology&mode=ToneChart&format=json&timespan=1h");
  if (data?.tone_chart) {
    rows.push({
      source: "gdelt-tone", data_type: "sentiment_signal", geo_scope: "global",
      payload: { tone_data: data.tone_chart, measured_at: new Date().toISOString() },
      tags: ["sentiment", "global", "tone"],
    });
  }
  return rows;
}

// ── STOCK INDICES (via free APIs) ──
async function collectStockIndices(): Promise<any[]> {
  const rows: any[] = [];
  // Use fear & greed as a proxy
  const fng = await safeFetch("https://api.alternative.me/fng/?limit=1");
  if (fng?.data?.[0]) {
    rows.push({
      source: "alternative-me", data_type: "market_sentiment", geo_scope: "global",
      payload: { value: fng.data[0].value, label: fng.data[0].value_classification, timestamp: fng.data[0].timestamp },
      tags: ["sentiment", "fear-greed", "crypto"],
    });
  }
  return rows;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    // Collect from ALL sources in parallel waves
    const [crypto, forex, worldbank, stockIndices] = await Promise.all([
      collectCrypto(),
      collectForex(),
      collectWorldBank(),
      collectStockIndices(),
    ]);

    const [gdelt, googleNews] = await Promise.all([
      collectGDELT(),
      collectGoogleNews(),
    ]);

    const [reddit, hackerNews, devTo, github, eventRegistry] = await Promise.all([
      collectReddit(),
      collectHackerNews(),
      collectDevTo(),
      collectGitHubTrending(),
      collectEventRegistry(),
    ]);

    const allRows = [
      ...crypto, ...forex, ...worldbank, ...stockIndices,
      ...gdelt, ...googleNews,
      ...reddit, ...hackerNews, ...devTo, ...github, ...eventRegistry,
    ];

    let inserted = 0;

    // Batch insert in chunks of 100
    for (let i = 0; i < allRows.length; i += 100) {
      const chunk = allRows.slice(i, i + 100);
      const { error } = await sb.from("raw_market_data").insert(chunk);
      if (!error) inserted += chunk.length;
      else console.error("Insert error:", error.message);
    }

    // Clean old data (keep last 3 days for freshness)
    const cutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    await sb.from("raw_market_data").delete().lt("created_at", cutoff);

    const sources = {
      crypto: crypto.length, forex: forex.length, gdelt: gdelt.length,
      worldbank: worldbank.length, googleNews: googleNews.length,
      reddit: reddit.length, hackerNews: hackerNews.length,
      devTo: devTo.length, github: github.length,
      eventRegistry: eventRegistry.length, stockIndices: stockIndices.length,
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
