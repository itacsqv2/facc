import { describe, expect, it } from "vitest";
import { createDemoRepository } from "@/modules/catalog/demo/demo-repository";
import { buildDemoDataset } from "@/modules/catalog/demo/fixtures";
import {
  compareEntries,
  DEFAULT_FILTERS,
  filterCatalog,
  inWindow,
  isActiveListing,
  matchesAge,
  matchesPrice,
  parseFilters,
  resolveWindow,
  serializeFilters,
  type CatalogFilters,
} from "@/modules/catalog/filters";
import { ageLabel, bookingLabel, priceLabel, scheduleLabel, timeRangeLabel } from "@/modules/catalog/format";
import type { CatalogEntry, Occurrence } from "@/modules/catalog/types";

const TZ = "Europe/Rome";
// Friday 23 October 2026, 10:00 in Rome; the weekend contains the DST switch.
const FRIDAY = new Date("2026-10-23T08:00:00Z");
const repo = createDemoRepository();
const filters = (patch: Partial<CatalogFilters> = {}): CatalogFilters => ({ ...DEFAULT_FILTERS, ...patch });
const ids = (entries: CatalogEntry[]) => entries.map((entry) => entry.occurrence.id);
function byId(entries: CatalogEntry[], id: string): CatalogEntry {
  const entry = entries.find((e) => e.occurrence.id === id);
  if (!entry) throw new Error(`missing ${id}`);
  return entry;
}
const occ = (startsAt: string, endsAt: string, status: Occurrence["status"] = "published"): Occurrence => ({
  id: "occ-test",
  eventId: "ev-test",
  venueId: "v-test",
  startsAt,
  endsAt,
  timeZone: TZ,
  status,
});

describe("demo dataset", () => {
  it("is deterministic for the same reference instant and moves with it", () => {
    expect(buildDemoDataset(FRIDAY)).toEqual(buildDemoDataset(new Date(FRIDAY.getTime())));
    const later = buildDemoDataset(new Date("2027-05-14T08:00:00Z"));
    expect(later.occurrences.find((o) => o.id === "occ-storie-1")?.startsAt).toBe("2027-05-14T14:30:00.000Z");
  });

  it("keeps event slugs, occurrence ids and statuses stable across days (bookmarks survive)", () => {
    const identity = (d: Date) =>
      buildDemoDataset(d).occurrences.map((o) => `${o.id}:${o.eventId}:${o.status}`).sort();
    expect(identity(FRIDAY)).toEqual(identity(new Date("2026-11-03T08:00:00Z")));
    const slugs = (d: Date) => buildDemoDataset(d).events.map((e) => e.slug).sort();
    expect(slugs(FRIDAY)).toEqual(slugs(new Date("2027-03-29T08:00:00Z")));
  });

  it("has 12-20 synthetic occurrences, demo slugs, non-routable contacts and no verification", () => {
    const data = buildDemoDataset(FRIDAY);
    expect(data.occurrences.length).toBeGreaterThanOrEqual(12);
    expect(data.occurrences.length).toBeLessThanOrEqual(20);
    expect(data.events.every((e) => e.isDemo && e.slug.startsWith("demo-"))).toBe(true);
    expect(data.organizers.every((o) => o.isDemo && o.contact.endsWith(".invalid"))).toBe(true);
    expect(data.source.lastConfirmedAt).toBeNull();
  });

  it("never exposes drafts through the repository", async () => {
    const entries = await repo.listEntries(FRIDAY);
    expect(entries.some((e) => e.occurrence.status === "draft")).toBe(false);
    expect(await repo.getEventBySlug("demo-caccia-al-tesoro-nel-borgo", FRIDAY)).toBeNull();
    expect(await repo.getPublicOccurrenceIds("demo-caccia-al-tesoro-nel-borgo")).toBeNull();
    expect(await repo.listPublishableSlugs()).not.toContain("demo-caccia-al-tesoro-nel-borgo");
  });

  it("public occurrence ids belong to their own event only", async () => {
    expect(await repo.getPublicOccurrenceIds("demo-piccoli-vasai-laboratorio-ceramica")).toEqual([
      "occ-ceramica-1",
      "occ-ceramica-2",
      "occ-ceramica-3",
    ]);
    expect(await repo.getPublicOccurrenceIds("demo-burattini-in-piazza")).not.toContain("occ-ceramica-1");
    expect(await repo.getPublicOccurrenceIds("non-esiste")).toBeNull();
  });
});

describe("window rule: overlap with the part of the window still ahead", () => {
  it("today on Friday 10:00 includes in-progress and later-today occurrences, in start order", async () => {
    const entries = await repo.listEntries(FRIDAY);
    expect(ids(filterCatalog(entries, filters(), FRIDAY, TZ))).toEqual([
      "occ-luci-1", // multi-day, started Thursday, still running
      "occ-giocattoli-1", // starts exactly now
      "occ-storie-1",
      "occ-burattini-1",
    ]);
  });

  it("today excludes what already ended earlier today", async () => {
    const entries = await repo.listEntries(FRIDAY);
    const evening = new Date("2026-10-23T17:00:00Z"); // 19:00
    expect(ids(filterCatalog(entries, filters(), evening, TZ))).toEqual(["occ-luci-1", "occ-giocattoli-1"]);
  });

  it("weekend on Friday excludes cancelled, unconfirmed, draft and later dates", async () => {
    const entries = await repo.listEntries(FRIDAY);
    expect(ids(filterCatalog(entries, filters({ window: "weekend" }), FRIDAY, TZ))).toEqual([
      "occ-luci-1",
      "occ-ceramica-1",
      "occ-concerto-1",
      "occ-lanterne-1",
      "occ-erbe-1",
      "occ-minivolley-1",
    ]);
  });

  it("23:30-00:30 occurrence: labelled across midnight, listed while running, gone after", async () => {
    const entries = await repo.listEntries(FRIDAY);
    const lanterns = byId(entries, "occ-lanterne-1");
    expect(lanterns.occurrence.startsAt).toBe("2026-10-24T21:30:00.000Z");
    expect(lanterns.occurrence.endsAt).toBe("2026-10-24T22:30:00.000Z");
    expect(timeRangeLabel(lanterns.occurrence)).toBe("23:30–00:30 (domenica 25)");

    const saturdayLate = new Date("2026-10-24T21:45:00Z"); // Sat 23:45
    expect(ids(filterCatalog(entries, filters(), saturdayLate, TZ))).toContain("occ-lanterne-1");
    const sundayAfterMidnight = new Date("2026-10-24T22:10:00Z"); // Sun 00:10, still running
    expect(ids(filterCatalog(entries, filters(), sundayAfterMidnight, TZ))).toContain("occ-lanterne-1");
    const sundayMorning = new Date("2026-10-25T09:00:00Z");
    expect(ids(filterCatalog(entries, filters({ window: "weekend" }), sundayMorning, TZ))).not.toContain("occ-lanterne-1");
  });

  it("Friday 23:30 -> Saturday 00:30 overlaps the weekend by 30 minutes and is listed there", () => {
    const window = resolveWindow("weekend", FRIDAY, TZ);
    expect(inWindow(occ("2026-10-23T21:30:00Z", "2026-10-23T22:30:00Z"), window, FRIDAY)).toBe(true);
    // Ending exactly at Saturday 00:00 does not overlap.
    expect(inWindow(occ("2026-10-23T21:30:00Z", "2026-10-23T22:00:00Z"), window, FRIDAY)).toBe(false);
  });

  it("multi-day occurrence is listed on each covered window and labelled with both days", async () => {
    const entries = await repo.listEntries(FRIDAY);
    const lights = byId(entries, "occ-luci-1");
    expect(timeRangeLabel(lights.occurrence)).toBe("da giovedì 22, 18:00 a domenica 25, 23:00");
    expect(scheduleLabel(lights.occurrence)).toBe("da giovedì 22 ottobre, 18:00 a domenica 25 ottobre, 23:00");
  });

  it("Monday: next weekend is Saturday 31 Oct / Sunday 1 Nov; this week's multi-day event is not 'today'", async () => {
    const monday = new Date("2026-10-26T09:00:00Z"); // 10:00 CET, after the DST switch
    const entries = await repo.listEntries(monday);
    expect(resolveWindow("weekend", monday, TZ).days).toEqual(["2026-10-31", "2026-11-01"]);
    expect(ids(filterCatalog(entries, filters(), monday, TZ))).not.toContain("occ-luci-1");
    expect(ids(filterCatalog(entries, filters({ window: "weekend" }), monday, TZ))).toContain("occ-luci-1");
    expect(byId(entries, "occ-ceramica-1").occurrence.startsAt).toBe("2026-10-31T09:00:00.000Z"); // 10:00 CET
  });

  it("Sunday: weekend and today are the same window, so results match", async () => {
    const sunday = new Date("2026-10-25T09:00:00Z"); // 10:00 CET
    const entries = await repo.listEntries(sunday);
    expect(resolveWindow("weekend", sunday, TZ).days).toEqual(resolveWindow("today", sunday, TZ).days);
    expect(ids(filterCatalog(entries, filters({ window: "weekend" }), sunday, TZ))).toEqual(
      ids(filterCatalog(entries, filters(), sunday, TZ)),
    );
  });

  it("leap day and month end are generated as real calendar dates", () => {
    const leap = buildDemoDataset(new Date("2028-02-29T09:00:00Z")); // Tuesday
    const storie = leap.occurrences.find((o) => o.id === "occ-storie-1");
    expect(storie?.startsAt).toBe("2028-02-29T15:30:00.000Z");
    const monthEnd = buildDemoDataset(new Date("2026-10-30T09:00:00Z")); // Friday 30 Oct
    expect(monthEnd.occurrences.find((o) => o.id === "occ-erbe-1")?.startsAt).toBe("2026-11-01T08:30:00.000Z");
  });
});

describe("series and statuses", () => {
  it("cancelling one date keeps the other dates of the same event", async () => {
    const entries = await repo.listEntries(FRIDAY);
    const series = entries.filter((e) => e.event.id === "ev-ceramica");
    expect(series.map((e) => e.occurrence.status)).toEqual(["published", "cancelled", "published"]);

    const firstCancelled = entries.map((e) =>
      e.occurrence.id === "occ-ceramica-1" ? { ...e, occurrence: { ...e.occurrence, status: "cancelled" as const } } : e,
    );
    expect(ids(filterCatalog(firstCancelled, filters({ window: "weekend" }), FRIDAY, TZ))).not.toContain("occ-ceramica-1");
    expect(isActiveListing(byId(firstCancelled, "occ-ceramica-3").occurrence, FRIDAY)).toBe(true);
  });

  it("draft, ended (stored or elapsed), cancelled and unconfirmed are never active", () => {
    const data = buildDemoDataset(FRIDAY);
    const find = (id: string) => {
      const found = data.occurrences.find((o) => o.id === id);
      if (!found) throw new Error(id);
      return found;
    };
    expect(isActiveListing(find("occ-tesoro-1"), FRIDAY)).toBe(false);
    expect(isActiveListing(find("occ-storie-0"), FRIDAY)).toBe(false);
    expect(isActiveListing(find("occ-castagne-1"), FRIDAY)).toBe(false);
    expect(isActiveListing(find("occ-ceramica-2"), FRIDAY)).toBe(false);
    expect(isActiveListing(find("occ-orto-1"), FRIDAY)).toBe(false);
    // A published occurrence becomes ended exactly at its end instant.
    const o = occ("2026-10-23T07:00:00Z", "2026-10-23T08:00:00Z");
    expect(isActiveListing(o, FRIDAY)).toBe(false);
    expect(isActiveListing(o, new Date("2026-10-23T07:59:59Z"))).toBe(true);
  });

  it("orders ties deterministically by occurrence id", async () => {
    const entries = await repo.listEntries(FRIDAY);
    const base = byId(entries, "occ-storie-1");
    const twin = { ...base, occurrence: { ...base.occurrence, id: "occ-a-twin" } };
    expect([base, twin].sort(compareEntries).map((e) => e.occurrence.id)).toEqual(["occ-a-twin", "occ-storie-1"]);
    expect([twin, base].sort(compareEntries).map((e) => e.occurrence.id)).toEqual(["occ-a-twin", "occ-storie-1"]);
  });
});

describe("price rules", () => {
  it("UNKNOWN price is neither free, nor paid, nor within any budget", async () => {
    const concert = byId(await repo.listEntries(FRIDAY), "occ-concerto-1");
    expect(concert.event.price.state).toBe("UNKNOWN");
    expect(priceLabel(concert.event.price)).toBe("Prezzo da verificare");
    expect(matchesPrice(concert, { price: "free", maxPrice: null })).toBe(false);
    expect(matchesPrice(concert, { price: "paid", maxPrice: null })).toBe(false);
    expect(matchesPrice(concert, { price: "all", maxPrice: 20 })).toBe(false);
    expect(matchesPrice(concert, { price: "all", maxPrice: null })).toBe(true);
  });

  it("budget ceiling uses exact known amounts only; 'da X €' is not a guaranteed total", async () => {
    const entries = await repo.listEntries(FRIDAY);
    const workshop = byId(entries, "occ-ceramica-1"); // 8 € exact
    const free = byId(entries, "occ-erbe-1");
    const volley = byId(entries, "occ-minivolley-1"); // da 3 €
    expect(matchesPrice(workshop, { price: "all", maxPrice: 5 })).toBe(false);
    expect(matchesPrice(workshop, { price: "all", maxPrice: 10 })).toBe(true);
    expect(matchesPrice(free, { price: "all", maxPrice: 5 })).toBe(true);
    expect(priceLabel(workshop.event.price)).toMatch(/^8\s€$/u);
    expect(priceLabel(volley.event.price)).toMatch(/^da 3\s€$/u);
    expect(matchesPrice(volley, { price: "all", maxPrice: 20 })).toBe(false);
    expect(matchesPrice(volley, { price: "paid", maxPrice: null })).toBe(true);
    expect(matchesPrice(volley, { price: "free", maxPrice: null })).toBe(false);
  });
});

describe("age rule: exact child age", () => {
  it("matches only declared ranges that include the age, or all ages", async () => {
    const entries = await repo.listEntries(FRIDAY);
    const age = (id: string, years: number) => matchesAge(byId(entries, id), years);
    expect(age("occ-storie-1", 4)).toBe(true); // 3-6
    expect(age("occ-storie-1", 3)).toBe(true); // lower bound inclusive
    expect(age("occ-storie-1", 6)).toBe(true); // upper bound inclusive
    expect(age("occ-storie-1", 7)).toBe(false);
    expect(age("occ-ceramica-1", 4)).toBe(false); // 5-10
    expect(age("occ-giocattoli-1", 0)).toBe(true); // all ages
    expect(age("occ-lanterne-1", 5)).toBe(false); // from 6
    expect(age("occ-lanterne-1", 17)).toBe(true); // from 6, no upper limit
    expect(age("occ-erbe-1", 4)).toBe(false); // not declared
    expect(matchesAge(byId(entries, "occ-erbe-1"), null)).toBe(true);
  });

  it("labels each age state explicitly", async () => {
    const entries = await repo.listEntries(FRIDAY);
    expect(ageLabel(byId(entries, "occ-erbe-1").event.age)).toBe("Età non indicata");
    expect(ageLabel(byId(entries, "occ-giocattoli-1").event.age)).toBe("Per tutte le età");
    expect(ageLabel(byId(entries, "occ-lanterne-1").event.age)).toBe("Da 6 anni");
    expect(ageLabel(byId(entries, "occ-storie-1").event.age)).toBe("3–6 anni");
  });

  it("booking labels keep the four states distinct", () => {
    expect(new Set(["required", "recommended", "not_required", "not_verified"].map((b) => bookingLabel(b as never))).size).toBe(4);
    expect(bookingLabel("recommended")).toBe("Prenotazione facoltativa");
  });
});

describe("composite filters", () => {
  it("weekend + 4-year-old: only declared-compatible activities", async () => {
    const entries = await repo.listEntries(FRIDAY);
    expect(ids(filterCatalog(entries, filters({ window: "weekend", age: 4 }), FRIDAY, TZ))).toEqual(["occ-luci-1", "occ-concerto-1"]);
  });

  it("weekend + zone + category + free + age + budget stay consistent", async () => {
    const entries = await repo.listEntries(FRIDAY);
    const base = { window: "weekend", zone: "borgo-esempio", category: "natura", price: "free" } as const;
    expect(ids(filterCatalog(entries, filters(base), FRIDAY, TZ))).toEqual(["occ-luci-1", "occ-erbe-1"]);
    expect(ids(filterCatalog(entries, filters({ ...base, age: 4 }), FRIDAY, TZ))).toEqual(["occ-luci-1"]);
    expect(ids(filterCatalog(entries, filters({ ...base, age: 4, maxPrice: 5 }), FRIDAY, TZ))).toEqual(["occ-luci-1"]);
    expect(filterCatalog(entries, filters({ ...base, zone: "riva-campione", age: 4 }), FRIDAY, TZ)).toEqual([]);
  });

  it("combined filters can produce an empty result", async () => {
    const entries = await repo.listEntries(FRIDAY);
    expect(filterCatalog(entries, filters({ window: "weekend", category: "musei" }), FRIDAY, TZ)).toEqual([]);
    expect(filterCatalog(entries, filters({ window: "weekend", price: "paid", maxPrice: 5 }), FRIDAY, TZ)).toEqual([]);
  });
});

describe("URL filters", () => {
  const zones = ["valfittizia-centro", "borgo-esempio", "riva-campione"];

  it("round-trips valid values", () => {
    const value = filters({ window: "weekend", zone: "riva-campione", category: "natura", price: "free", maxPrice: 10, age: 4 });
    const parsed = parseFilters(Object.fromEntries(new URLSearchParams(serializeFilters(value))), zones);
    expect(parsed).toEqual(value);
    expect(serializeFilters(value)).toBe("quando=weekend&zona=riva-campione&categoria=natura&prezzo=gratis&max=10&eta=4");
  });

  it("age 0 survives the round trip", () => {
    const value = filters({ age: 0 });
    expect(parseFilters(Object.fromEntries(new URLSearchParams(serializeFilters(value))), zones).age).toBe(0);
  });

  it("falls back to defaults for unknown, malformed or malicious values", () => {
    expect(
      parseFilters({ quando: "domani", zona: "<script>", categoria: "x", prezzo: "1", max: "7", eta: "99" }, zones),
    ).toEqual(DEFAULT_FILTERS);
    expect(parseFilters({ max: "05", eta: "04" }, zones)).toEqual(DEFAULT_FILTERS);
    expect(parseFilters({ max: "5.0", eta: "4.5" }, zones)).toEqual(DEFAULT_FILTERS);
    expect(parseFilters({ eta: "-1" }, zones).age).toBeNull();
    expect(parseFilters({ eta: "18" }, zones).age).toBeNull();
    expect(parseFilters({ eta: "17" }, zones).age).toBe(17);
    expect(parseFilters({ zona: "Riva-Campione" }, zones).zone).toBe("all");
    expect(serializeFilters(DEFAULT_FILTERS)).toBe("");
  });

  it("uses the first value of repeated parameters", () => {
    expect(parseFilters({ quando: ["weekend", "today"], eta: ["5", "9"] }, zones)).toMatchObject({ window: "weekend", age: 5 });
  });
});
