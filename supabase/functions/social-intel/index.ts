import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { temporalIntelRules } from "../_shared/temporalPrompt.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { GDELT_DOMAIN_BATCHES, RSS_FEEDS_BY_COUNTRY } from "./outlet_feeds.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function safeFetch(url: string, headers?: Record<string, string>, timeout = 8000): Promise<any> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, { signal: controller.signal, headers });
    clearTimeout(id);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function safeTextFetch(url: string, timeout = 8000): Promise<string | null> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; }
}

// ═══════════════════════════════════════════════════════
// COUNTRY-SPECIFIC SOURCE REGISTRY
// ═══════════════════════════════════════════════════════
const COUNTRY_SOURCES: Record<string, { ceid: string; lang: string; outlets: string[]; yt: string[]; subs: string[] }> = {
  KE: { ceid: "KE:en", lang: "en", outlets: ["citizen.digital","nation.africa","the-star.co.ke","standardmedia.co.ke","businessdailyafrica.com","capitalfm.co.ke","kenyans.co.ke","tuko.co.ke","kenyanwallstreet.com","techweez.com","k24tv.co.ke","pulselive.co.ke","kbc.co.ke","tv47.digital","cio.co.ke","hapakenya.com","sde.co.ke","theeastafrican.co.ke","peopledaily.ke","medianmax.com","nairobiwire.com","africa-newsroom.com","knn.co.ke","classic105.com","kiss100.co.ke","capitalfm.co.ke/sports"], yt: ["citizentvkenya","NTVKenya","K24TV","KTNNewsKE","TV47Kenya","KBCChannel1","KenyaCitizenTV","EbruTVKenya","BBCNewsAfrica","africanewschannel","DWNews","ReutersWorld","BloombergAfrica","CNBCAfrica","AlJazeeraEnglish"], subs: ["Kenya"] },
  NG: { ceid: "NG:en", lang: "en", outlets: ["punchng.com","vanguardngr.com","premiumtimesng.com","thecable.ng","nairametrics.com","businessday.ng","techpoint.africa","techcabal.com","guardian.ng","channelstv.com","legit.ng","dailypost.ng","saharareporters.com"], yt: ["channelstelevision","TVC_News"], subs: ["Nigeria"] },
  ZA: { ceid: "ZA:en", lang: "en", outlets: ["news24.com","businesslive.co.za","dailymaverick.co.za","moneyweb.co.za","techcentral.co.za","iol.co.za","fin24.com","biznews.com","mg.co.za"], yt: [], subs: ["southafrica"] },
  US: { ceid: "US:en", lang: "en", outlets: ["reuters.com","bloomberg.com","cnbc.com","techcrunch.com","theverge.com","venturebeat.com","wsj.com","nytimes.com","apnews.com"], yt: ["Bloomberg","CNBC"], subs: ["business","investing","stocks","technology","startups","wallstreetbets","economics"] },
  GB: { ceid: "GB:en", lang: "en", outlets: ["ft.com","bbc.com","cityam.com","sifted.eu","theguardian.com","telegraph.co.uk"], yt: ["BBCNews","SkyNews"], subs: ["ukbusiness","UKPersonalFinance"] },
  IN: { ceid: "IN:en", lang: "en", outlets: ["economictimes.indiatimes.com","livemint.com","moneycontrol.com","inc42.com","yourstory.com","ndtv.com","hindustantimes.com"], yt: ["ETNOWlive","NDTVProfit"], subs: ["india","IndianStreetBets","indiainvestments"] },
  AE: { ceid: "AE:en", lang: "en", outlets: ["gulfnews.com","arabianbusiness.com","zawya.com","magnitt.com","khaleejtimes.com"], yt: [], subs: ["dubai","UAE"] },
  SG: { ceid: "SG:en", lang: "en", outlets: ["straitstimes.com","techinasia.com","e27.co","channelnewsasia.com"], yt: [], subs: ["singapore"] },
  DE: { ceid: "DE:de", lang: "de", outlets: ["handelsblatt.com","t3n.de","gruenderszene.de","spiegel.de","faz.net"], yt: [], subs: ["Finanzen","de"] },
  BR: { ceid: "BR:pt-419", lang: "pt", outlets: ["valor.globo.com","infomoney.com.br","startse.com","exame.com"], yt: [], subs: ["brasil","investimentos"] },
  JP: { ceid: "JP:ja", lang: "ja", outlets: ["nikkei.com","japantimes.co.jp","asia.nikkei.com"], yt: [], subs: ["japan","japanfinance"] },
  CN: { ceid: "CN:zh-Hans", lang: "zh", outlets: ["scmp.com","technode.com","pandaily.com","caixin.com"], yt: [], subs: ["China","ChineseLanguage"] },
  AU: { ceid: "AU:en", lang: "en", outlets: ["afr.com","smartcompany.com.au","abc.net.au"], yt: ["ABCNewsAustralia"], subs: ["AusFinance","australia"] },
  FR: { ceid: "FR:fr", lang: "fr", outlets: ["lesechos.fr","maddyness.com","bfmtv.com","lefigaro.fr"], yt: [], subs: ["france","vosfinances"] },
  CA: { ceid: "CA:en", lang: "en", outlets: ["bnnbloomberg.ca","betakit.com","theglobeandmail.com"], yt: [], subs: ["canada","CanadianInvestor"] },
  EG: { ceid: "EG:en", lang: "en", outlets: ["egypttoday.com","enterprise.press","dailynewsegypt.com"], yt: [], subs: ["Egypt"] },
  SA: { ceid: "SA:en", lang: "en", outlets: ["arabnews.com","argaam.com","saudigazette.com.sa"], yt: [], subs: [] },
  GH: { ceid: "GH:en", lang: "en", outlets: ["myjoyonline.com","citinewsroom.com","ghanaweb.com","graphic.com.gh"], yt: ["JoyNewsOnTV"], subs: ["ghana"] },
  RW: { ceid: "RW:en", lang: "en", outlets: ["newtimes.co.rw","ktpress.rw"], yt: [], subs: [] },
  TZ: { ceid: "TZ:en", lang: "en", outlets: ["thecitizen.co.tz","dailynews.co.tz"], yt: [], subs: [] },
  UG: { ceid: "UG:en", lang: "en", outlets: ["monitor.co.ug","newvision.co.ug"], yt: [], subs: [] },
  ET: { ceid: "ET:en", lang: "en", outlets: ["addisfortune.news","thereporterethiopia.com"], yt: [], subs: [] },
  IL: { ceid: "IL:en", lang: "en", outlets: ["timesofisrael.com","calcalistech.com"], yt: [], subs: ["Israel"] },
  KR: { ceid: "KR:ko", lang: "ko", outlets: ["koreaherald.com","koreajoongangdaily.joins.com"], yt: [], subs: ["korea"] },
  MX: { ceid: "MX:es-419", lang: "es", outlets: ["elfinanciero.com.mx","expansion.mx"], yt: [], subs: ["mexico"] },
  CO: { ceid: "CO:es-419", lang: "es", outlets: ["portafolio.co","larepublica.co"], yt: [], subs: ["Colombia"] },
  AR: { ceid: "AR:es-419", lang: "es", outlets: ["infobae.com","lanacion.com.ar"], yt: [], subs: ["argentina"] },
  PH: { ceid: "PH:en", lang: "en", outlets: ["rappler.com","inquirer.net"], yt: [], subs: ["Philippines"] },
  ID: { ceid: "ID:id", lang: "id", outlets: ["jakartaglobe.id","techinasia.com"], yt: [], subs: ["indonesia"] },
  MY: { ceid: "MY:en", lang: "en", outlets: ["thestar.com.my","theedgemarkets.com"], yt: [], subs: ["malaysia"] },
  TH: { ceid: "TH:th", lang: "th", outlets: ["bangkokpost.com","nationthailand.com"], yt: [], subs: ["Thailand"] },
  VN: { ceid: "VN:vi", lang: "vi", outlets: ["vnexpress.net","tuoitrenews.vn"], yt: [], subs: ["VietNam"] },
  PK: { ceid: "PK:en", lang: "en", outlets: ["dawn.com","geo.tv"], yt: [], subs: ["pakistan"] },
  BD: { ceid: "BD:en", lang: "en", outlets: ["thedailystar.net","dhakatribune.com"], yt: [], subs: ["bangladesh"] },
  TR: { ceid: "TR:tr", lang: "tr", outlets: ["dailysabah.com","hurriyetdailynews.com"], yt: [], subs: ["Turkey"] },
  PL: { ceid: "PL:pl", lang: "pl", outlets: ["wyborcza.pl","bankier.pl"], yt: [], subs: ["Polska"] },
  SE: { ceid: "SE:sv", lang: "sv", outlets: ["di.se","svd.se"], yt: [], subs: ["sweden"] },
  NL: { ceid: "NL:nl", lang: "nl", outlets: ["fd.nl","bnr.nl"], yt: [], subs: ["thenetherlands"] },
  CH: { ceid: "CH:de", lang: "de", outlets: ["swissinfo.ch","finews.com"], yt: [], subs: ["Switzerland"] },
  IT: { ceid: "IT:it", lang: "it", outlets: ["ilsole24ore.com","corriere.it"], yt: [], subs: ["italy"] },
  ES: { ceid: "ES:es", lang: "es", outlets: ["elpais.com","expansion.com"], yt: [], subs: ["spain"] },
  PT: { ceid: "PT:pt-150", lang: "pt", outlets: ["jornaldenegocios.pt","eco.sapo.pt"], yt: [], subs: ["portugal"] },
  IE: { ceid: "IE:en", lang: "en", outlets: ["irishtimes.com","siliconrepublic.com"], yt: [], subs: ["ireland"] },
  NZ: { ceid: "NZ:en", lang: "en", outlets: ["nzherald.co.nz","stuff.co.nz"], yt: [], subs: ["newzealand"] },
};

function resolveGeoToCountries(geo: string): string[] {
  if (!geo || geo === "global") return ["US", "GB", "IN", "KE", "NG", "SG", "AE", "ZA", "DE", "BR", "JP", "AU"];
  const upper = geo.toUpperCase();
  if (COUNTRY_SOURCES[upper]) return [upper];
  const parts = geo.split(/[+,]/).map((s) => s.trim().toUpperCase()).filter(Boolean);
  const matched = parts.filter((p) => COUNTRY_SOURCES[p]);
  return matched.length > 0 ? matched : ["US", "GB"];
}

/** Prefer stable ISO codes from the app (geoScopeId e.g. KE or KE+NG). Labels alone do not map to COUNTRY_SOURCES. */
function resolveCountriesFromScope(geo: string, geoScopeId?: string): string[] {
  if (geoScopeId && geoScopeId !== "global") {
    const parts = geoScopeId.split("+").map((s) => s.trim().toUpperCase()).filter((p) => COUNTRY_SOURCES[p]);
    if (parts.length > 0) return parts;
  }
  return resolveGeoToCountries(geo);
}

function buildSignalPreview(signals: any[]) {
  const take = (type: string, n: number) =>
    signals
      .filter((s) => s.type === type)
      .slice(0, n)
      .map((s) => ({ ...s }));
  return {
    reddit_local: take("reddit_local", 5).map((s) => ({
      title: s.title,
      subreddit: s.subreddit,
      country: s.country,
      url: s.url,
    })),
    youtube: take("youtube", 5).map((s) => ({
      title: s.title,
      channel: s.channel,
      url: s.url,
    })),
    country_news: take("country_news", 5).map((s) => ({
      title: s.title,
      country: s.country,
      source: s.source,
    })),
    outlet_rss: take("outlet_rss", 4).map((s) => ({
      title: s.title,
      country: s.country,
      feed_host: typeof s.feed_url === "string" ? s.feed_url.replace(/^https?:\/\//, "").split("/")[0] : "",
    })),
  };
}

/** Parse RSS 2.0 or Atom entries from raw XML. */
function parseRssOrAtom(xml: string, max: number): { title: string; link: string; date: string }[] {
  const out: { title: string; link: string; date: string }[] = [];
  if (xml.includes("<item")) {
    for (const block of xml.split("<item>").slice(1, max + 3)) {
      const t = block.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, "").trim() || "";
      let link = block.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() || "";
      if (!link) link = block.match(/<link[^>]+href=["']([^"']+)["']/)?.[1] || "";
      const pubDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || "";
      if (t) out.push({ title: t, link, date: pubDate });
    }
  } else if (xml.includes("<entry")) {
    for (const block of xml.split("<entry>").slice(1, max + 3)) {
      const t = block.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, "").trim() || "";
      const link = block.match(/<link[^>]+href=["']([^"']+)["']/)?.[1] || "";
      const updated = block.match(/<updated>([\s\S]*?)<\/updated>/)?.[1] || "";
      if (t) out.push({ title: t, link, date: updated });
    }
  }
  return out.slice(0, max);
}

/** Direct outlet RSS — batched (Kenya-first list in outlet_feeds.ts). */
async function scrapeDirectOutletRss(countryCodes: string[]): Promise<any[]> {
  const results: any[] = [];
  const cap = 320;
  const n = Math.max(1, countryCodes.length);
  const perCountry = Math.min(90, Math.max(18, Math.floor(200 / n)));

  outer: for (const code of countryCodes) {
    const feeds = RSS_FEEDS_BY_COUNTRY[code];
    if (!feeds?.length) continue;
    const slice = feeds.slice(0, perCountry);
    for (let i = 0; i < slice.length; i += 8) {
      const batch = slice.slice(i, i + 8);
      const texts = await Promise.all(batch.map((u) => safeTextFetch(u, 7000)));
      for (let j = 0; j < batch.length; j++) {
        const xml = texts[j];
        if (!xml || xml.length < 40) continue;
        const items = parseRssOrAtom(xml, 4);
        for (const it of items) {
          results.push({
            type: "outlet_rss",
            title: it.title,
            url: it.link,
            date: it.date,
            country: code,
            feed_url: batch[j],
          });
          if (results.length >= cap) break outer;
        }
      }
    }
  }
  return results;
}

/** GDELT doc API scoped to major outlet domains per country. */
async function scrapeGdeltOutletDomains(countryCodes: string[], keywords: string[]): Promise<any[]> {
  const results: any[] = [];
  const seenUrl = new Set<string>();
  outer: for (const code of countryCodes) {
    const batches = GDELT_DOMAIN_BATCHES[code];
    if (!batches) continue;
    for (const domains of batches) {
      const domainOr = domains.map((d) => `domain:${d}`).join(" OR ");
      const kw = keywords.length ? keywords.slice(0, 3).join(" OR ") : "business OR economy OR market";
      const q = encodeURIComponent(`(${domainOr}) (${kw})`);
      let data = await safeFetch(
        `https://api.gdeltproject.org/api/v2/doc/doc?query=${q}&mode=ArtList&maxrecords=30&format=json&sort=DateDesc`,
      );
      if (!data?.articles?.length) {
        const q2 = encodeURIComponent(`(${domainOr})`);
        data = await safeFetch(
          `https://api.gdeltproject.org/api/v2/doc/doc?query=${q2}&mode=ArtList&maxrecords=25&format=json&sort=DateDesc`,
        );
      }
      if (data?.articles) {
        for (const a of data.articles.slice(0, 25)) {
          const u = a.url || "";
          if (u && seenUrl.has(u)) continue;
          if (u) seenUrl.add(u);
          results.push({
            type: "gdelt_outlet",
            title: a.title,
            url: a.url,
            source: a.domain,
            date: a.seendate,
            country: code,
          });
          if (results.length >= 180) break outer;
        }
      }
    }
  }
  return results;
}

// ── X/TWITTER SEARCH (v2 Recent Search, app-only Bearer auth) ──
// Set Supabase secret: TWITTER_BEARER_TOKEN (or X_BEARER_TOKEN). OAuth consumer key/secret are not used here.
async function scrapeTwitter(keywords: string[], countryCodes: string[]): Promise<any[]> {
  const BEARER = Deno.env.get("TWITTER_BEARER_TOKEN") || Deno.env.get("X_BEARER_TOKEN");
  if (!BEARER) {
    console.warn("No TWITTER_BEARER_TOKEN or X_BEARER_TOKEN — X search skipped");
    return [];
  }

  const results: any[] = [];
  const query = keywords.slice(0, 5).join(" OR ");
  // Add language filters for targeted countries
  const langFilters = countryCodes.slice(0, 3).map(c => COUNTRY_SOURCES[c]?.lang).filter(Boolean);
  const langQuery = langFilters.length > 0 ? ` (${langFilters.map(l => `lang:${l}`).join(" OR ")})` : "";
  const fullQuery = encodeURIComponent(`(${query})${langQuery} -is:retweet`);

  const data = await safeFetch(
    `https://api.x.com/2/tweets/search/recent?query=${fullQuery}&max_results=50&tweet.fields=created_at,author_id,public_metrics,entities,lang,geo&expansions=author_id&user.fields=name,username,verified,public_metrics`,
    { Authorization: `Bearer ${BEARER}` },
    12000
  );

  if (data?.data) {
    const users = new Map<string, any>((data.includes?.users || []).map((u: any) => [u.id, u]));
    for (const tweet of data.data) {
      const author = users.get(tweet.author_id);
      results.push({
        type: "twitter",
        text: tweet.text?.slice(0, 400),
        author: author?.name || "Unknown",
        username: author?.username || "",
        verified: author?.verified || false,
        followers: author?.public_metrics?.followers_count || 0,
        likes: tweet.public_metrics?.like_count || 0,
        retweets: tweet.public_metrics?.retweet_count || 0,
        replies: tweet.public_metrics?.reply_count || 0,
        date: tweet.created_at,
        lang: tweet.lang,
        url: `https://x.com/${author?.username}/status/${tweet.id}`,
      });
    }
  }

  // Also search for key players/companies specific to industries
  for (const code of countryCodes.slice(0, 3)) {
    const countryQuery = encodeURIComponent(`(${keywords.slice(0, 3).join(" OR ")}) place_country:${code} -is:retweet`);
    const countryData = await safeFetch(
      `https://api.x.com/2/tweets/search/recent?query=${countryQuery}&max_results=20&tweet.fields=created_at,author_id,public_metrics&expansions=author_id&user.fields=name,username,verified,public_metrics`,
      { Authorization: `Bearer ${BEARER}` },
      10000
    );
    if (countryData?.data) {
      const users = new Map((countryData.includes?.users || []).map((u: any) => [u.id, u]));
      for (const tweet of countryData.data) {
        const author = users.get(tweet.author_id);
        results.push({
          type: "twitter_local",
          text: tweet.text?.slice(0, 400),
          author: author?.name || "Unknown",
          username: author?.username || "",
          followers: author?.public_metrics?.followers_count || 0,
          likes: tweet.public_metrics?.like_count || 0,
          retweets: tweet.public_metrics?.retweet_count || 0,
          date: tweet.created_at,
          country: code,
          url: `https://x.com/${author?.username}/status/${tweet.id}`,
        });
      }
    }
  }
  return results;
}

// ── GDELT ──
async function scrapeGDELT(keywords: string[], limit = 25): Promise<any[]> {
  const results: any[] = [];
  const query = encodeURIComponent(keywords.slice(0, 5).join(" OR "));
  const docData = await safeFetch(`https://api.gdeltproject.org/api/v2/doc/doc?query=${query}&mode=ArtList&maxrecords=${limit}&format=json&sort=DateDesc`);
  if (docData?.articles) {
    for (const a of docData.articles) {
      results.push({ type: "news", title: a.title, url: a.url, source: a.domain, date: a.seendate, country: a.sourcecountry, tone: a.tone });
    }
  }
  return results;
}

// ── REDDIT (global + country-specific) ──
async function scrapeReddit(keywords: string[], countryCodes: string[]): Promise<any[]> {
  const results: any[] = [];
  const query = encodeURIComponent(keywords.slice(0, 3).join("+"));
  const data = await safeFetch(`https://www.reddit.com/search.json?q=${query}&sort=new&limit=10&t=week`);
  if (data?.data?.children) {
    for (const post of data.data.children.slice(0, 8)) {
      const d = post.data;
      results.push({ type: "reddit", title: d.title, text: (d.selftext || "").slice(0, 300), subreddit: d.subreddit, score: d.score, comments: d.num_comments, url: `https://reddit.com${d.permalink}`, date: new Date(d.created_utc * 1000).toISOString() });
    }
  }
  const subToCountry = new Map<string, string>();
  for (const code of countryCodes) {
    for (const sub of COUNTRY_SOURCES[code]?.subs || []) {
      if (!subToCountry.has(sub)) subToCountry.set(sub, code);
    }
  }
  const countrySubs = [...subToCountry.keys()].slice(0, 14);
  for (const sub of countrySubs) {
    const subData = await safeFetch(`https://www.reddit.com/r/${sub}/new.json?limit=5`);
    if (subData?.data?.children) {
      for (const post of subData.data.children) {
        const d = post.data;
        if (d.stickied) continue;
        results.push({
          type: "reddit_local",
          title: d.title,
          subreddit: sub,
          country: subToCountry.get(sub),
          score: d.score,
          comments: d.num_comments,
          url: `https://reddit.com${d.permalink}`,
          date: new Date(d.created_utc * 1000).toISOString(),
        });
      }
    }
  }
  return results;
}

// ── HACKER NEWS ──
async function scrapeHackerNews(keywords: string[]): Promise<any[]> {
  const query = encodeURIComponent(keywords.slice(0, 3).join(" "));
  const data = await safeFetch(`https://hn.algolia.com/api/v1/search_by_date?query=${query}&tags=story&hitsPerPage=10`);
  if (!data?.hits) return [];
  return data.hits.map((hit: any) => ({
    type: "hackernews", title: hit.title, url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`, points: hit.points, comments: hit.num_comments, date: hit.created_at,
  }));
}

// ── COUNTRY-SPECIFIC GOOGLE NEWS — multiple query lenses per country (breadth). ──
async function scrapeCountryNews(keywords: string[], countryCodes: string[]): Promise<any[]> {
  const results: any[] = [];
  const seen = new Set<string>();
  const queryBases = [
    keywords.slice(0, 4).join("+"),
    "business+economy+market",
    "technology+startup+funding",
    "government+policy+regulation",
    "agriculture+trade+commodity",
  ];
  for (const code of countryCodes.slice(0, 14)) {
    const cfg = COUNTRY_SOURCES[code];
    if (!cfg) continue;
    for (const qb of queryBases) {
      if (!qb.replace(/\+/g, "").trim()) continue;
      const query = encodeURIComponent(qb);
      const xml = await safeTextFetch(`https://news.google.com/rss/search?q=${query}&hl=${cfg.lang}&gl=${code}&ceid=${cfg.ceid}`, 8000);
      if (!xml) continue;
      const items = xml.split("<item>").slice(1, 10);
      for (const item of items) {
        const title = item.match(/<title>(.*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "") || "";
        const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
        const source = item.match(/<source.*?>(.*?)<\/source>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "") || "";
        const key = `${code}|${title.slice(0, 100)}`;
        if (title && !seen.has(key)) {
          seen.add(key);
          results.push({ type: "country_news", title, source, date: pubDate, country: code });
        }
      }
    }
  }
  return results;
}

// ── YOUTUBE RSS (country channels — expanded lists e.g. Kenya). ──
async function scrapeYouTube(keywords: string[], countryCodes: string[]): Promise<any[]> {
  const results: any[] = [];
  const maxCh = countryCodes.includes("KE") ? 28 : 18;
  const channels = countryCodes.flatMap(c => COUNTRY_SOURCES[c]?.yt || []).slice(0, maxCh);
  for (const ch of channels) {
    const xml = await safeTextFetch(`https://www.youtube.com/feeds/videos.xml?user=${ch}`, 6000);
    if (!xml) continue;
    const entries = xml.split("<entry>").slice(1, 5);
    for (const entry of entries) {
      const title = entry.match(/<title>(.*?)<\/title>/)?.[1] || "";
      const videoId = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1] || "";
      const published = entry.match(/<published>(.*?)<\/published>/)?.[1] || "";
      if (title) results.push({ type: "youtube", title, url: `https://youtube.com/watch?v=${videoId}`, channel: ch, date: published });
    }
  }
  return results;
}

// ── AI SYNTHESIS ──
async function synthesize(signals: any[], industry: string, subFlow: string | null, keywords: string[], geoContext: string, LOVABLE_API_KEY: string): Promise<any> {
  const signalSummary = signals.slice(0, 110).map(s => {
    if (s.type === "twitter") return `[X @${s.username} ${s.verified ? "✓" : ""} ${s.followers}fol ♥${s.likes} RT${s.retweets}] ${s.text?.slice(0, 200)}`;
    if (s.type === "twitter_local") return `[X-LOCAL ${s.country} @${s.username} ♥${s.likes}] ${s.text?.slice(0, 200)}`;
    if (s.type === "news") return `[NEWS ${s.date}] ${s.title} (${s.source}, ${s.country})`;
    if (s.type === "country_news") return `[${s.country} GNEWS] ${s.title} (${s.source})`;
    if (s.type === "outlet_rss") return `[RSS ${s.country}] ${s.title} (${s.feed_url?.split("/")[2] || "outlet"})`;
    if (s.type === "gdelt_outlet") return `[GDELT ${s.country} ${s.source}] ${s.title}`;
    if (s.type === "reddit" || s.type === "reddit_local") return `[REDDIT r/${s.subreddit} ↑${s.score}] ${s.title}`;
    if (s.type === "hackernews") return `[HN ↑${s.points}] ${s.title}`;
    if (s.type === "youtube") return `[YT @${s.channel}] ${s.title}`;
    return `[${s.type}] ${JSON.stringify(s).slice(0, 120)}`;
  }).join("\n");

  const scope = subFlow ? `"${subFlow}" sub-flow in ${industry}` : industry;
  const isGlobal = !geoContext || geoContext === "global";

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `You are a real-time social media & market intelligence analyst. Signals may include: X/Twitter, Google News (many countries & query lenses), direct outlet RSS feeds (national newspapers & broadcasters — includes mixed content: politics, culture, sport; still extract material intelligence), GDELT outlet-scoped news, Reddit, HN, YouTube. Noise (comedy, obituaries, sport) may appear — down-rank it unless it affects markets, policy, or brands. Focus on the last 24–72h. Extract WHO is doing WHAT: deals, regulation, funding, supply chain, macro, security. Weight verified/high-reach sources. Prioritize implications for what happens NEXT (policy, markets, competitive moves), not rehashed "upcoming" old election narratives. ${!isGlobal ? `Contextualize to ${geoContext}.` : ""} ${temporalIntelRules()} Return valid JSON only.`
        },
        {
          role: "user",
          content: `Analyze these LIVE signals for ${scope}${!isGlobal ? ` (focused on ${geoContext})` : ""}:\n\n${signalSummary}\n\nKeywords: ${keywords.join(", ")}\n\nReturn JSON:\n{"breaking":[{"headline":"...","detail":"50-word analysis","source":"X/Reddit/News/etc","timestamp":"...","players_involved":["..."],"impact":"high|medium|low","confidence":"HIGH|MEDIUM|LOW","action":"buy|sell|watch|act_now|monitor"}],"player_activity":[{"player":"company/person","activity":"...","source":"...","implications":"...","x_mentions":0}],"social_sentiment":{"overall":"bullish|bearish|mixed|neutral","hot_topics":["..."],"controversies":["..."],"emerging_terms":["..."],"x_pulse":{"trending_hashtags":["..."],"influential_voices":["..."],"sentiment_shift":"..."}},"opportunities_from_signals":[{"title":"...","detail":"...","urgency":"act_now|this_week|this_month","source_signal":"...","estimated_roi":"...","confidence":"HIGH|MEDIUM|LOW"}],"freshness_score":0-100,"x_coverage":{"tweets_analyzed":0,"top_voices":["..."],"viral_content":[]}}`
        }
      ],
    }),
  });
  if (!response.ok) return null;
  const aiData = await response.json();
  const content = aiData.choices?.[0]?.message?.content || "{}";
  try { return JSON.parse(content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()); } catch { return null; }
}

// ═══════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { industry, subFlow, keywords, geoContext, geoScopeId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const countryCodes = resolveCountriesFromScope(geoContext || "global", geoScopeId);

    const [twitterSignals, gdeltSignals, redditSignals, hnSignals, countryNewsSignals, ytSignals] = await Promise.all([
      scrapeTwitter(keywords || [], countryCodes),
      scrapeGDELT(keywords || [], 25),
      scrapeReddit(keywords || [], countryCodes),
      scrapeHackerNews(keywords || []),
      scrapeCountryNews(keywords || [], countryCodes),
      scrapeYouTube(keywords || [], countryCodes),
    ]);

    const [outletRssSignals, gdeltOutletSignals] = await Promise.all([
      scrapeDirectOutletRss(countryCodes),
      scrapeGdeltOutletDomains(countryCodes, keywords || []),
    ]);

    const allSignals = [
      ...twitterSignals, ...gdeltSignals, ...redditSignals, ...hnSignals, ...countryNewsSignals, ...ytSignals,
      ...outletRssSignals, ...gdeltOutletSignals,
    ];

    // Store raw signals
    try {
      const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const rows = allSignals.slice(0, 200).map(s => ({
        source: `social_${s.type}`, data_type: "social_signal", geo_scope: s.country || geoContext || "global",
        industry: industry || null, payload: s, tags: ["social", s.type, ...(keywords || []).slice(0, 3)],
      }));
      if (rows.length > 0) await sb.from("raw_market_data").insert(rows);
    } catch (e) { console.error("DB store error:", e); }

    // AI Synthesis
    const synthesis = await synthesize(allSignals, industry || "general", subFlow || null, keywords || [], geoContext || "global", LOVABLE_API_KEY);

    // Store insights
    if (synthesis) {
      try {
        const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
        const geoArray =
          geoScopeId && geoScopeId !== "global"
            ? geoScopeId.split("+").map((g: string) => g.trim())
            : geoContext && geoContext !== "global"
              ? geoContext.split(",").map((g: string) => g.trim())
              : [];
        const insights: any[] = [];
        for (const b of (synthesis.breaking || [])) {
          insights.push({ insight_type: "breaking", title: b.headline, detail: b.detail, source_industry: industry, source_subflow: subFlow || null, geo_context: geoArray, urgency: b.impact === "high" ? "critical" : b.impact, tags: ["social", "breaking", b.source || "", ...(b.players_involved || [])], raw_data: b });
        }
        for (const p of (synthesis.player_activity || [])) {
          insights.push({ insight_type: "player_activity", title: p.player, detail: `${p.activity}. Implications: ${p.implications}`, source_industry: industry, source_subflow: subFlow || null, geo_context: geoArray, tags: ["social", "player", "x_mentions:" + (p.x_mentions || 0), p.player], raw_data: p });
        }
        if (insights.length > 0) await sb.from("intel_insights").insert(insights);
      } catch (e) { console.error("Insight store error:", e); }
    }

    return new Response(JSON.stringify({
      signals_collected: allSignals.length,
      sources: {
        twitter: twitterSignals.length,
        gdelt: gdeltSignals.length,
        reddit: redditSignals.length,
        hackernews: hnSignals.length,
        country_news: countryNewsSignals.length,
        youtube: ytSignals.length,
        outlet_rss: outletRssSignals.length,
        gdelt_outlet: gdeltOutletSignals.length,
      },
      countries_scraped: countryCodes,
      signal_preview: buildSignalPreview(allSignals),
      synthesis,
      timestamp: new Date().toISOString(),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("social-intel error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
