"use client";

import { useCallback, useSyncExternalStore } from "react";
import { migrateLegacySaved, readSaved, SAVED_STORAGE_KEY, toggleSaved, writeSaved, type SavedItem } from "./saved-items";

type Snapshot = { status: "loading" | "ready" | "unavailable"; items: SavedItem[] };

const LOADING: Snapshot = { status: "loading", items: [] };
const CHANGE_EVENT = "kesifa:saved-change";

let cachedRaw: string | null | undefined;
let cachedSnapshot: Snapshot = LOADING;

let migrated = false;

function getStorage(): Storage | null {
  try {
    const storage = window.localStorage;
    if (!migrated) {
      migrated = true;
      migrateLegacySaved(storage);
    }
    return storage;
  } catch {
    return null;
  }
}

function rawValue(): string | null | undefined {
  try {
    return getStorage()?.getItem(SAVED_STORAGE_KEY) ?? null;
  } catch {
    return undefined;
  }
}

/** Memoized on the raw string so useSyncExternalStore gets a stable reference. */
function getSnapshot(): Snapshot {
  const raw = rawValue();
  if (raw === cachedRaw && cachedSnapshot !== LOADING) return cachedSnapshot;
  cachedRaw = raw;
  const result = readSaved(getStorage());
  cachedSnapshot = result.ok ? { status: "ready", items: result.items } : { status: "unavailable", items: [] };
  return cachedSnapshot;
}

function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === SAVED_STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, listener);
  };
}

/**
 * Local bookmarks. Server render and hydration see `loading`, so markup matches;
 * the real list appears right after hydration.
 */
export function useSaved() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => LOADING);

  const toggle = useCallback((target: Pick<SavedItem, "slug" | "occurrenceId">): boolean => {
    const storage = getStorage();
    const current = readSaved(storage);
    if (!current.ok) return false;
    const ok = writeSaved(storage, toggleSaved(current.items, target, new Date()));
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return ok;
  }, []);

  return { ...snapshot, toggle };
}
