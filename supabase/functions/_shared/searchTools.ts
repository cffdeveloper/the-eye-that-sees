import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

export type SearchSnippet = { source: string; title: string; snippet: string; url?: string };

// deno-lint-ignore no-explicit-any
type AnySupabaseClient = ReturnType<typeof createClient<any>>;

function hashKey(parts: string[]): string {
  const s = parts.join("|");
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `pc_${(h >>> 0).toString(16)}`;
}

async function cacheGet(
  sb: AnySupabaseClient,
  key: string,
): Promise<string | null> {
  const { data } = await sb.from("proactive_search_cache").select("payload, expires_at").eq("cache_key", key).maybeSingle();
  if (!data) return null;
  // deno-lint-ignore no-explicit-any
  const row = data as any;
  if (new Date(row.expires_at as string) < new Date()) return null;
  const payload = row.payload as { text?: string } | null;
  const t = payload?.text;
  return typeof t === "string" ? t : null;
}

async function cacheSet(sb: AnySupabaseClient, key: string, text: string, ttlMs: number) {
  const expires = new Date(Date.now() + ttlMs).toISOString();
  await (sb.from("proactive_search_cache") as any).upsert({
    cache_key: key,
    payload: { text },
    expires_at: expires,
  });
}

export async function tavilySearch(query: string, apiKey: string): Promise<string> {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "advanced",
      max_results: 6,
      include_answer: true,
    }),
  });
  if (!res.ok) return `[tavily error ${res.status}]`;
  const j = await res.json();
  const answer = typeof j.answer === "string" ? j.answer : "";
  const results = Array.isArray(j.results)
    ? j.results.map((r: { title?: string; content?: string; url?: string }) =>
      `- ${r.title || ""}: ${(r.content || "").slice(0, 400)} (${r.url || ""})`
    ).join("\n")
    : "";
  return `${answer}\n${results}`.slice(0, 8000);
}

export async function fetchUrlSnippet(url: string): Promise<string> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    const text = await res.text();
    return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 4000);
  } catch {
    return "";
  }
}

export async function xSearch(query: string, bearer: string): Promise<string> {
  const enc = encodeURIComponent(query);
  const url =
    `https://api.twitter.com/2/tweets/search/recent?query=${enc}&max_results=10&tweet.fields=created_at,author_id`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${bearer}` } });
  if (!res.ok) return `[x api ${res.status}]`;
  const j = await res.json();
  const data = Array.isArray(j.data) ? j.data : [];
  return data.map((t: { text?: string }) => t.text || "").join("\n---\n").slice(0, 6000);
}

/** Grok (xAI) search — optional LLM-augmented web search. */
export async function grokSearch(query: string, apiKey: string): Promise<string> {
  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-3-mini",
        messages: [
          { role: "system", content: "You are a market research assistant. Provide concise factual intel about the query topic with sources, data points, and actionable insights. Focus on Kenya, Africa, and online/remote opportunities." },
          { role: "user", content: query },
        ],
        temperature: 0.3,
        search_mode: "auto",
      }),
    });
    if (!res.ok) return `[grok error ${res.status}]`;
    const j = await res.json();
    return (j.choices?.[0]?.message?.content || "").slice(0, 6000);
  } catch {
    return "[grok unavailable]";
  }
}

export type ParallelSearchOptions = {
  supabaseUrl: string;
  serviceKey: string;
  queries: string[];
  tavilyApiKey?: string;
  xBearer?: string;
  grokApiKey?: string;
  browseUrls?: string[];
};

/** Batched parallel search with DB-backed dedupe cache (1h TTL). */
export async function runParallelSearches(opts: ParallelSearchOptions): Promise<string> {
  const sb = createClient(opts.supabaseUrl, opts.serviceKey);
  const ttl = 60 * 60 * 1000;
  const chunks: string[] = [];

  const tasks: Promise<void>[] = [];

  for (const q of opts.queries) {
    tasks.push((async () => {
      const key = hashKey(["tavily", q]);
      const cached = await cacheGet(sb, key);
      if (cached) {
        chunks.push(`QUERY: ${q}\n${cached}\n`);
        return;
      }
      if (!opts.tavilyApiKey) {
        chunks.push(`QUERY: ${q}\n[no TAVILY_API_KEY — configure secret for web search]\n`);
        return;
      }
      const text = await tavilySearch(q, opts.tavilyApiKey);
      await cacheSet(sb, key, text, ttl);
      chunks.push(`QUERY: ${q}\n${text}\n`);
    })());
  }

  if (opts.xBearer) {
    for (const q of opts.queries.slice(0, 5)) {
      tasks.push((async () => {
        const key = hashKey(["x", q]);
        const cached = await cacheGet(sb, key);
        if (cached) {
          chunks.push(`X SEARCH: ${q}\n${cached}\n`);
          return;
        }
        const text = await xSearch(`${q} (Kenya OR Africa OR startup)`, opts.xBearer!);
        await cacheSet(sb, key, text, ttl);
        chunks.push(`X SEARCH: ${q}\n${text}\n`);
      })());
    }
  }

  // Grok xAI search — uses first 4 queries for LLM-augmented research
  if (opts.grokApiKey) {
    for (const q of opts.queries.slice(0, 4)) {
      tasks.push((async () => {
        const key = hashKey(["grok", q]);
        const cached = await cacheGet(sb, key);
        if (cached) {
          chunks.push(`GROK RESEARCH: ${q}\n${cached}\n`);
          return;
        }
        const text = await grokSearch(q, opts.grokApiKey!);
        await cacheSet(sb, key, text, ttl);
        chunks.push(`GROK RESEARCH: ${q}\n${text}\n`);
      })());
    }
  }

  if (opts.browseUrls?.length) {
    for (const u of opts.browseUrls.slice(0, 3)) {
      tasks.push((async () => {
        const key = hashKey(["browse", u]);
        const cached = await cacheGet(sb, key);
        if (cached) {
          chunks.push(`PAGE: ${u}\n${cached}\n`);
          return;
        }
        const text = await fetchUrlSnippet(u);
        await cacheSet(sb, key, text, ttl);
        chunks.push(`PAGE: ${u}\n${text}\n`);
      })());
    }
  }

  await Promise.all(tasks);
  return chunks.join("\n---\n");
}
