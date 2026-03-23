/**
 * Pro library: persisted intel snapshots in IndexedDB (works offline after save).
 */

const DB_NAME = "infinitygap_saved_intel_v1";
const STORE = "items";
const DB_VERSION = 1;

export type SavedContentSource = "trial_showcase" | "region_analytics" | "custom_intel" | "other";

export interface SavedContentRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  title: string;
  subtitle?: string;
  source: SavedContentSource;
  /** e.g. region name, page context */
  sourceDetail?: string;
  /** Raw intel (markdown + ::: block markers) */
  body: string;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed"));
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (ev) => {
      const db = (ev.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
  });
}

export async function saveIntelItem(
  input: Omit<SavedContentRecord, "id" | "createdAt" | "updatedAt"> & { id?: string },
): Promise<SavedContentRecord> {
  const db = await openDb();
  const id = input.id ?? crypto.randomUUID();
  const now = Date.now();

  let createdAt = now;
  if (input.id) {
    const existing = await getIntelItem(input.id);
    if (existing) createdAt = existing.createdAt;
  }

  const record: SavedContentRecord = {
    ...input,
    id,
    createdAt,
    updatedAt: now,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.oncomplete = () => resolve(record);
    tx.onerror = () => reject(tx.error ?? new Error("save failed"));
    tx.objectStore(STORE).put(record);
  });
}

export async function getIntelItem(id: string): Promise<SavedContentRecord | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result as SavedContentRecord | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function listIntelItems(): Promise<SavedContentRecord[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => {
      const rows = (req.result as SavedContentRecord[]) ?? [];
      rows.sort((a, b) => b.createdAt - a.createdAt);
      resolve(rows);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteIntelItem(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE).delete(id);
  });
}
