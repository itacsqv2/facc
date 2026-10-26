/**
 * Bookmarks kept only in this browser (no account, no server, no cookies).
 * Stores just event slug + occurrence id: no location, no profile, no child data.
 */

export type SavedItem = { slug: string; occurrenceId: string; savedAt: string };

export const SAVED_STORAGE_KEY = "attorno:saved:v1";
const MAX_ITEMS = 100;
const ID_PATTERN = /^[a-z0-9-]{1,120}$/;

function isSavedItem(value: unknown): value is SavedItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.slug === "string" &&
    ID_PATTERN.test(item.slug) &&
    typeof item.occurrenceId === "string" &&
    ID_PATTERN.test(item.occurrenceId) &&
    typeof item.savedAt === "string"
  );
}

/** Tolerant parser: corrupt or foreign data yields an empty / filtered list, never a throw. */
export function parseSaved(raw: string | null): SavedItem[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    const seen = new Set<string>();
    return data.filter(isSavedItem).filter((item) => {
      const key = savedKey(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch {
    return [];
  }
}

export function serializeSaved(items: readonly SavedItem[]): string {
  return JSON.stringify(items.slice(0, MAX_ITEMS));
}

export function savedKey(item: Pick<SavedItem, "slug" | "occurrenceId">): string {
  return `${item.slug}#${item.occurrenceId}`;
}

export function isSaved(items: readonly SavedItem[], target: Pick<SavedItem, "slug" | "occurrenceId">): boolean {
  const key = savedKey(target);
  return items.some((item) => savedKey(item) === key);
}

/** Adds (newest first) or removes the target. */
export function toggleSaved(
  items: readonly SavedItem[],
  target: Pick<SavedItem, "slug" | "occurrenceId">,
  now: Date,
): SavedItem[] {
  if (isSaved(items, target)) {
    const key = savedKey(target);
    return items.filter((item) => savedKey(item) !== key);
  }
  return [{ ...target, savedAt: now.toISOString() }, ...items].slice(0, MAX_ITEMS);
}

type StorageLike = Pick<Storage, "getItem" | "setItem">;

/** Key used before the rename to Attorno (2026-10-26); migrated once, then removed. */
export const LEGACY_SAVED_STORAGE_KEY = ["facc", "saved", "v1"].join(":");

/**
 * Moves bookmarks saved under the legacy key to the current key, without overwriting
 * existing current data. Never throws (storage may be blocked).
 */
export function migrateLegacySaved(storage: (StorageLike & Pick<Storage, "removeItem">) | null | undefined): void {
  if (!storage) return;
  try {
    const legacy = storage.getItem(LEGACY_SAVED_STORAGE_KEY);
    if (legacy === null) return;
    if (storage.getItem(SAVED_STORAGE_KEY) === null) {
      storage.setItem(SAVED_STORAGE_KEY, serializeSaved(parseSaved(legacy)));
    }
    storage.removeItem(LEGACY_SAVED_STORAGE_KEY);
  } catch {
    // Storage unavailable: nothing to migrate.
  }
}

export type ReadResult = { ok: true; items: SavedItem[] } | { ok: false; items: [] };

/** Reads safely: storage may be missing, blocked (private mode) or throw. */
export function readSaved(storage: StorageLike | null | undefined): ReadResult {
  if (!storage) return { ok: false, items: [] };
  try {
    return { ok: true, items: parseSaved(storage.getItem(SAVED_STORAGE_KEY)) };
  } catch {
    return { ok: false, items: [] };
  }
}

export function writeSaved(storage: StorageLike | null | undefined, items: readonly SavedItem[]): boolean {
  if (!storage) return false;
  try {
    storage.setItem(SAVED_STORAGE_KEY, serializeSaved(items));
    return true;
  } catch {
    return false;
  }
}
