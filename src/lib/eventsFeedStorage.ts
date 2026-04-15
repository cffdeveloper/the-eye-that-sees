import type { NetworkEventRow } from "@/lib/networkEventTypes";

const STORAGE_KEY = "infinitygap_events_feed_v1";

export type StoredNetworkEvent = NetworkEventRow & {
  key: string;
  archived?: boolean;
  addedAt: number;
};

export function eventStableKey(ev: NetworkEventRow): string {
  const u = (ev.url || "").trim().toLowerCase();
  const t = (ev.title || "").trim().toLowerCase();
  const d = ev.start_date || "";
  return `${u}|${t}|${d}`;
}

type FeedPayload = {
  events: StoredNetworkEvent[];
};

function safeParse(raw: string | null): FeedPayload {
  if (!raw) return { events: [] };
  try {
    const v = JSON.parse(raw) as FeedPayload;
    return v && Array.isArray(v.events) ? v : { events: [] };
  } catch {
    return { events: [] };
  }
}

export function loadEventsFeed(): StoredNetworkEvent[] {
  if (typeof localStorage === "undefined") return [];
  const { events } = safeParse(localStorage.getItem(STORAGE_KEY));
  return events;
}

export function saveEventsFeed(events: StoredNetworkEvent[]): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ events }));
}

/** Merge server batch into stored feed; never drops existing rows unless deduped by key. */
export function mergeServerEvents(incoming: NetworkEventRow[]): StoredNetworkEvent[] {
  const prev = loadEventsFeed();
  const byKey = new Map<string, StoredNetworkEvent>();
  for (const e of prev) {
    byKey.set(e.key, e);
  }
  const now = Date.now();
  for (const raw of incoming) {
    const key = eventStableKey(raw);
    const existing = byKey.get(key);
    if (existing) {
      byKey.set(key, {
        ...raw,
        key,
        archived: existing.archived,
        addedAt: existing.addedAt,
      });
    } else {
      byKey.set(key, { ...raw, key, addedAt: now });
    }
  }
  const merged = [...byKey.values()];
  merged.sort((a, b) => {
    const ta = a.start_date ? Date.parse(a.start_date) : Number.POSITIVE_INFINITY;
    const tb = b.start_date ? Date.parse(b.start_date) : Number.POSITIVE_INFINITY;
    return ta - tb;
  });
  saveEventsFeed(merged);
  return merged;
}

export function setEventArchived(key: string, archived: boolean): void {
  const events = loadEventsFeed().map((e) => (e.key === key ? { ...e, archived } : e));
  saveEventsFeed(events);
}
