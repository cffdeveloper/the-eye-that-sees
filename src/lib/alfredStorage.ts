const TRAINING_KEY = "alfred_training_v1";
const INSIGHTS_KEY = "alfred_insights_cache_v1";

export type AlfredTrainingEntry = {
  id: string;
  text: string;
  createdAt: number;
};

export type AlfredInsight = {
  id: string;
  priority: number;
  title: string;
  summary: string;
  category: string;
  timing: string;
  actions: string[];
  caveats: string[];
};

/** Stable per deck row: same generatedAt + index + title => same id (deep-dive URLs survive reload). */
export function deterministicInsightId(generatedAt: number, index: number, title: string): string {
  const s = `${generatedAt}|${index}|${title}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `ins_${(h >>> 0).toString(16)}_${index}`;
}

/** Ensures every insight has a stable id (for deep-dive URLs and cache migration). */
export function normalizeInsight(
  raw: Record<string, unknown>,
  idContext?: { generatedAt: number; index: number },
): AlfredInsight {
  const actions = Array.isArray(raw.actions) ? raw.actions.map((a) => String(a).slice(0, 400)).slice(0, 8) : [];
  const caveats = Array.isArray(raw.caveats) ? raw.caveats.map((c) => String(c).slice(0, 400)).slice(0, 6) : [];
  const title = String(raw.title || "Opportunity").slice(0, 200);
  let id = typeof raw.id === "string" && raw.id.length > 0 ? raw.id : "";
  if (!id && idContext) id = deterministicInsightId(idContext.generatedAt, idContext.index, title);
  if (!id) id = deterministicInsightId(Date.now(), 0, title);
  return {
    id,
    priority: Math.min(100, Math.max(1, Number(raw.priority) || 50)),
    title,
    summary: String(raw.summary || "").slice(0, 1200),
    category: String(raw.category || "other").slice(0, 80),
    timing: String(raw.timing || "watchlist").slice(0, 80),
    actions,
    caveats,
  };
}

export function normalizeInsightsList(insights: unknown[], generatedAt: number): AlfredInsight[] {
  if (!Array.isArray(insights)) return [];
  return insights.map((x, index) =>
    normalizeInsight(x && typeof x === "object" ? (x as Record<string, unknown>) : {}, { generatedAt, index }),
  );
}

export function findInsightById(bundle: AlfredInsightsBundle | null, insightId: string): AlfredInsight | null {
  if (!bundle?.insights?.length) return null;
  return bundle.insights.find((i) => i.id === insightId) ?? null;
}

export type AlfredInsightsBundle = {
  generatedAt: number;
  executiveSummary: string;
  insights: AlfredInsight[];
  disclaimer?: string;
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadTrainingEntries(): AlfredTrainingEntry[] {
  if (typeof localStorage === "undefined") return [];
  const list = safeParse<AlfredTrainingEntry[]>(localStorage.getItem(TRAINING_KEY), []);
  return Array.isArray(list) ? list : [];
}

export function appendTrainingEntry(text: string): AlfredTrainingEntry {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Empty training text");
  const entry: AlfredTrainingEntry = {
    id: crypto.randomUUID(),
    text: trimmed,
    createdAt: Date.now(),
  };
  const next = [...loadTrainingEntries(), entry];
  localStorage.setItem(TRAINING_KEY, JSON.stringify(next));
  return entry;
}

export function getTrainingCorpus(): string {
  const entries = loadTrainingEntries();
  if (!entries.length) return "";
  return entries
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((e, i) => `--- Training note ${i + 1} (${new Date(e.createdAt).toISOString().slice(0, 10)}) ---\n${e.text}`)
    .join("\n\n");
}

export function loadInsightsCache(): AlfredInsightsBundle | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(INSIGHTS_KEY);
  if (!raw) return null;
  const parsed = safeParse<AlfredInsightsBundle | null>(raw, null);
  if (!parsed || typeof parsed.generatedAt !== "number" || !Array.isArray(parsed.insights)) return null;
  const insights = normalizeInsightsList(parsed.insights, parsed.generatedAt);
  const migrated: AlfredInsightsBundle = { ...parsed, insights };
  const prevIds = parsed.insights.map((x) => (x && typeof x === "object" ? (x as { id?: string }).id : undefined));
  if (insights.some((i, idx) => i.id !== prevIds[idx])) {
    localStorage.setItem(INSIGHTS_KEY, JSON.stringify(migrated));
  }
  return migrated;
}

export function saveInsightsCache(
  bundle: Omit<AlfredInsightsBundle, "generatedAt"> & { generatedAt?: number },
): AlfredInsightsBundle {
  const generatedAt = bundle.generatedAt ?? Date.now();
  const insights = normalizeInsightsList(bundle.insights as unknown[], generatedAt);
  const full: AlfredInsightsBundle = {
    generatedAt,
    executiveSummary: bundle.executiveSummary,
    insights,
    disclaimer: bundle.disclaimer,
  };
  localStorage.setItem(INSIGHTS_KEY, JSON.stringify(full));
  return full;
}

/** Autonomous opportunity refresh cadence (client + background runs). */
export const ALFRED_REFRESH_MS = 2 * 60 * 60 * 1000;

export function insightsNeedRefresh(cache: AlfredInsightsBundle | null): boolean {
  if (!cache) return true;
  return Date.now() - cache.generatedAt >= ALFRED_REFRESH_MS;
}

export function msUntilNextRefresh(cache: AlfredInsightsBundle | null): number {
  if (!cache) return 0;
  const elapsed = Date.now() - cache.generatedAt;
  return Math.max(0, ALFRED_REFRESH_MS - elapsed);
}

function insightDedupeKey(i: AlfredInsight): string {
  return `${i.title.trim().toLowerCase()}|${i.category.trim().toLowerCase()}`;
}

/**
 * Merges a freshly generated deck into the existing cache: new titles are appended,
 * overlapping titles keep the higher priority score, list is sorted by priority desc.
 */
export function mergeInsightsCache(
  incomingExec: string,
  incomingInsightsRaw: unknown[],
  incomingDisclaimer: string | undefined,
  previous: AlfredInsightsBundle | null,
): AlfredInsightsBundle {
  const generatedAt = Date.now();
  const normalizedNew = normalizeInsightsList(incomingInsightsRaw, generatedAt);
  const map = new Map<string, AlfredInsight>();

  for (const x of previous?.insights ?? []) {
    map.set(insightDedupeKey(x), x);
  }
  for (const x of normalizedNew) {
    const k = insightDedupeKey(x);
    const prevRow = map.get(k);
    if (!prevRow || x.priority > prevRow.priority) {
      map.set(k, x);
    }
  }

  const insights = [...map.values()].sort((a, b) => b.priority - a.priority);

  return {
    generatedAt,
    executiveSummary: incomingExec || previous?.executiveSummary || "",
    insights,
    disclaimer: incomingDisclaimer ?? previous?.disclaimer,
  };
}
