import type { EbdProgressEntry, EbdProgressStore } from '../../types/ebd.js';

export const EBD_PROGRESS_STORAGE_KEY = 'ebd:progress:v1';

export interface EbdStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const clampPercent = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
};

const now = () => new Date().toISOString();

export function readProgressStore(storage: EbdStorageLike): EbdProgressStore {
  try {
    const raw = storage.getItem(EBD_PROGRESS_STORAGE_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};

    const store: EbdProgressStore = {};
    for (const [slug, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (!slug || slug.length > 200) continue;
      if (typeof value !== 'object' || value === null || Array.isArray(value)) continue;

      const entry = value as Record<string, unknown>;
      store[slug] = {
        read: entry.read === true,
        scrollPercent: typeof entry.scrollPercent === 'number' ? clampPercent(entry.scrollPercent) : 0,
        updatedAt: typeof entry.updatedAt === 'string' && entry.updatedAt ? entry.updatedAt : now(),
      };
    }
    return store;
  } catch {
    return {};
  }
}

export function writeProgressStore(store: EbdProgressStore, storage: EbdStorageLike): void {
  try {
    storage.setItem(EBD_PROGRESS_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Armazenamento indisponível ou cheio: o leitor continua funcionando sem persistir.
  }
}

export function setLessonRead(store: EbdProgressStore, slug: string, read: boolean): EbdProgressStore {
  const current: EbdProgressEntry = store[slug] ?? { read: false, scrollPercent: 0, updatedAt: now() };
  return {
    ...store,
    [slug]: { ...current, read, updatedAt: now() },
  };
}

export function setLessonScroll(store: EbdProgressStore, slug: string, scrollPercent: number): EbdProgressStore {
  const current: EbdProgressEntry = store[slug] ?? { read: false, scrollPercent: 0, updatedAt: now() };
  return {
    ...store,
    [slug]: { ...current, scrollPercent: clampPercent(scrollPercent), updatedAt: now() },
  };
}

export function clearLessonProgress(store: EbdProgressStore, slug: string): EbdProgressStore {
  if (!(slug in store)) return store;
  const next = { ...store };
  delete next[slug];
  return next;
}

export function clearAllProgress(): EbdProgressStore {
  return {};
}

export function hasProgressEntries(store: EbdProgressStore): boolean {
  return Object.keys(store).length > 0;
}
