import { describe, expect, it } from "vitest";
import {
  isSaved,
  LEGACY_SAVED_STORAGE_KEYS,
  migrateLegacySaved,
  parseSaved,
  readSaved,
  SAVED_STORAGE_KEY,
  serializeSaved,
  toggleSaved,
  writeSaved,
} from "@/modules/saved/saved-items";

const NOW = new Date("2026-10-23T08:00:00Z");
const target = { slug: "burattini-in-piazza", occurrenceId: "occ-burattini-1" };

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
    data,
  };
}

describe("saved items", () => {
  it("toggles add and remove, newest first", () => {
    const added = toggleSaved([], target, NOW);
    expect(added).toEqual([{ ...target, savedAt: NOW.toISOString() }]);
    expect(isSaved(added, target)).toBe(true);
    const two = toggleSaved(added, { slug: "festa-della-castagna", occurrenceId: "occ-castagne-1" }, NOW);
    expect(two[0]?.slug).toBe("festa-della-castagna");
    expect(isSaved(toggleSaved(two, target, NOW), target)).toBe(false);
  });

  it("serializes and parses back", () => {
    const items = toggleSaved([], target, NOW);
    expect(parseSaved(serializeSaved(items))).toEqual(items);
  });

  it("tolerates corrupt, foreign or duplicated data", () => {
    expect(parseSaved(null)).toEqual([]);
    expect(parseSaved("{not json")).toEqual([]);
    expect(parseSaved(JSON.stringify({ slug: "x" }))).toEqual([]);
    const item = { ...target, savedAt: NOW.toISOString() };
    const raw = JSON.stringify([item, item, { slug: "../evil", occurrenceId: "x", savedAt: "" }, 42]);
    expect(parseSaved(raw)).toEqual([item]);
  });

  it("reads and writes through a working storage", () => {
    const storage = memoryStorage();
    expect(readSaved(storage)).toEqual({ ok: true, items: [] });
    expect(writeSaved(storage, toggleSaved([], target, NOW))).toBe(true);
    expect(storage.data.has(SAVED_STORAGE_KEY)).toBe(true);
    expect(readSaved(storage).items).toHaveLength(1);
  });

  it("reports unavailable storage instead of throwing", () => {
    const blocked = {
      getItem: (): string | null => {
        throw new DOMException("denied", "SecurityError");
      },
      setItem: () => {
        throw new DOMException("quota", "QuotaExceededError");
      },
    };
    expect(readSaved(null)).toEqual({ ok: false, items: [] });
    expect(readSaved(blocked)).toEqual({ ok: false, items: [] });
    expect(writeSaved(blocked, [])).toBe(false);
    expect(writeSaved(undefined, [])).toBe(false);
  });

  it("migrates bookmarks saved under previous names once, without overwriting current data", () => {
    expect(LEGACY_SAVED_STORAGE_KEYS).toEqual(["facc:saved:v1", "attorno:saved:v1"]);
    expect(SAVED_STORAGE_KEY).toBe("kesifa:saved:v1");
    for (const legacyKey of LEGACY_SAVED_STORAGE_KEYS) {
      const storage = memoryStorage();
      storage.setItem(legacyKey, serializeSaved(toggleSaved([], target, NOW)));
      migrateLegacySaved(storage);
      expect(readSaved(storage).items, legacyKey).toEqual([{ ...target, savedAt: NOW.toISOString() }]);
      expect(storage.data.has(legacyKey)).toBe(false);
    }

    // Both legacy keys present: the newer (attorno) wins, both are removed.
    const older = toggleSaved([], { slug: "demo-festa-della-castagna", occurrenceId: "occ-castagne-1" }, NOW);
    const newer = toggleSaved([], target, NOW);
    const two = memoryStorage();
    two.setItem("facc:saved:v1", serializeSaved(older));
    two.setItem("attorno:saved:v1", serializeSaved(newer));
    migrateLegacySaved(two);
    expect(readSaved(two).items).toEqual(newer);
    expect([...two.data.keys()]).toEqual(["kesifa:saved:v1"]);

    const both = memoryStorage();
    both.setItem(SAVED_STORAGE_KEY, "[]");
    both.setItem("attorno:saved:v1", serializeSaved(newer));
    migrateLegacySaved(both);
    expect(readSaved(both).items).toEqual([]);
    expect(both.data.has("attorno:saved:v1")).toBe(false);

    expect(() => migrateLegacySaved(null)).not.toThrow();
  });
});
