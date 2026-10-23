/**
 * Pure catalog filtering and ordering. No I/O, no clock: `now` is always injected.
 */
import { addDays, localDateKey, weekendDays, zonedTimeToUtc, type DateKey } from "./time";
import { CATEGORIES, type CatalogEntry, type Category, type Occurrence } from "./types";

export type DayWindowKey = "today" | "weekend";

/** Selectable child ages, whole years. */
export const CHILD_AGES = Array.from({ length: 18 }, (_, age) => age);

export const MAX_PRICE_OPTIONS = [5, 10, 20] as const;

export type CatalogFilters = {
  window: DayWindowKey;
  zone: string | "all";
  category: Category | "all";
  price: "all" | "free" | "paid";
  /** Euro ceiling; applies only to known amounts. */
  maxPrice: (typeof MAX_PRICE_OPTIONS)[number] | null;
  /** Exact age of one child in whole years, or null for no age filter. */
  age: number | null;
};

export const DEFAULT_FILTERS: CatalogFilters = {
  window: "today",
  zone: "all",
  category: "all",
  price: "all",
  maxPrice: null,
  age: null,
};

export type ResolvedWindow = { key: DayWindowKey; days: DateKey[]; startsAt: Date; endsAt: Date };

export function resolveWindow(key: DayWindowKey, now: Date, timeZone: string): ResolvedWindow {
  const today = localDateKey(now, timeZone);
  const days = key === "today" ? [today] : weekendDays(today);
  const first = days[0] ?? today;
  const last = days[days.length - 1] ?? today;
  return {
    key,
    days,
    startsAt: zonedTimeToUtc(first, "00:00", timeZone),
    endsAt: zonedTimeToUtc(addDays(last, 1), "00:00", timeZone),
  };
}

/** An occurrence is ended once its end instant has passed, whatever its stored status. */
export function isEnded(occurrence: Occurrence, now: Date): boolean {
  return occurrence.status === "ended" || new Date(occurrence.endsAt).getTime() <= now.getTime();
}

/** Only published, not-yet-ended occurrences are listed as available. */
export function isActiveListing(occurrence: Occurrence, now: Date): boolean {
  return occurrence.status === "published" && !isEnded(occurrence, now);
}

/**
 * Window membership (single rule for "Oggi" and "Questo weekend"): the occurrence
 * overlaps the part of the window that is still ahead, i.e.
 * [max(window start, now), window end). So it is listed if it is in progress now
 * or starts later within the window; multi-day and past-midnight occurrences are
 * listed on every window day they cover.
 */
export function inWindow(occurrence: Occurrence, window: ResolvedWindow, now: Date): boolean {
  const start = new Date(occurrence.startsAt).getTime();
  const end = new Date(occurrence.endsAt).getTime();
  const from = Math.max(window.startsAt.getTime(), now.getTime());
  return start < window.endsAt.getTime() && end > from;
}

export function matchesPrice(entry: CatalogEntry, filters: Pick<CatalogFilters, "price" | "maxPrice">): boolean {
  const { price } = entry.event;
  if (filters.price === "free" && price.state !== "FREE") return false;
  if (filters.price === "paid" && price.state !== "PAID") return false;
  if (filters.maxPrice !== null) {
    // Only a guaranteed cost fits a budget: UNKNOWN and "da X €" prices are excluded.
    if (price.state === "UNKNOWN") return false;
    if (price.state === "PAID" && (price.basis !== "exact" || price.amountCents > filters.maxPrice * 100)) return false;
  }
  return true;
}

/**
 * Compatible only if the organizer's declared range explicitly includes the exact
 * age, or the event is declared for all ages. Undeclared age never matches.
 */
export function matchesAge(entry: CatalogEntry, age: CatalogFilters["age"]): boolean {
  if (age === null) return true;
  const suitability = entry.event.age;
  if (suitability.state === "all_ages") return true;
  if (suitability.state !== "range") return false;
  return suitability.min <= age && (suitability.max === null || age <= suitability.max);
}

export function compareEntries(a: CatalogEntry, b: CatalogEntry): number {
  const byStart = new Date(a.occurrence.startsAt).getTime() - new Date(b.occurrence.startsAt).getTime();
  if (byStart !== 0) return byStart;
  return a.occurrence.id < b.occurrence.id ? -1 : a.occurrence.id > b.occurrence.id ? 1 : 0;
}

/** Active entries matching every filter, ordered by start time then occurrence id. */
export function filterCatalog(
  entries: readonly CatalogEntry[],
  filters: CatalogFilters,
  now: Date,
  timeZone: string,
): CatalogEntry[] {
  const window = resolveWindow(filters.window, now, timeZone);
  return entries
    .filter(
      (entry) =>
        isActiveListing(entry.occurrence, now) &&
        inWindow(entry.occurrence, window, now) &&
        (filters.zone === "all" || entry.venue.zoneId === filters.zone) &&
        (filters.category === "all" || entry.event.category === filters.category) &&
        matchesPrice(entry, filters) &&
        matchesAge(entry, filters.age),
    )
    .sort(compareEntries);
}

export function hasRefinements(filters: CatalogFilters): boolean {
  return (
    filters.zone !== DEFAULT_FILTERS.zone ||
    filters.category !== DEFAULT_FILTERS.category ||
    filters.price !== DEFAULT_FILTERS.price ||
    filters.maxPrice !== DEFAULT_FILTERS.maxPrice ||
    filters.age !== DEFAULT_FILTERS.age
  );
}

/* URL <-> filters. Unknown values fall back to defaults (never trusted). */

type ParamSource = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export function parseFilters(params: ParamSource, zoneIds: readonly string[]): CatalogFilters {
  const when = first(params.quando);
  const zone = first(params.zona);
  const category = first(params.categoria);
  const price = first(params.prezzo);
  const max = first(params.max);
  const age = first(params.eta);
  return {
    window: when === "weekend" ? "weekend" : "today",
    zone: zone && zoneIds.includes(zone) ? zone : "all",
    category: category && (CATEGORIES as readonly string[]).includes(category) ? (category as Category) : "all",
    price: price === "gratis" ? "free" : price === "pagamento" ? "paid" : "all",
    // Exact canonical spellings only ("5", not "05" or "5.0"), so copied links stay normalized.
    maxPrice: MAX_PRICE_OPTIONS.find((option) => String(option) === max) ?? null,
    age: age && /^(?:[0-9]|1[0-7])$/.test(age) ? Number(age) : null,
  };
}

export function serializeFilters(filters: CatalogFilters): string {
  const params = new URLSearchParams();
  if (filters.window === "weekend") params.set("quando", "weekend");
  if (filters.zone !== "all") params.set("zona", filters.zone);
  if (filters.category !== "all") params.set("categoria", filters.category);
  if (filters.price !== "all") params.set("prezzo", filters.price === "free" ? "gratis" : "pagamento");
  if (filters.maxPrice !== null) params.set("max", String(filters.maxPrice));
  if (filters.age !== null) params.set("eta", String(filters.age));
  return params.toString();
}
