import { describe, expect, it } from "vitest";
import { activeTerritory } from "@/config/territory";
import { createDemoRepository } from "@/modules/catalog/demo/demo-repository";
import { buildDemoDataset } from "@/modules/catalog/demo/fixtures";
import { DEFAULT_FILTERS, filterCatalog } from "@/modules/catalog/filters";
import type { CatalogEntry } from "@/modules/catalog/types";
import { bboxAround, bboxWithin, inBBox, isValidBBox, isValidLngLat, parseArea, serializeArea, type BBox } from "@/modules/geo/bbox";
import { toEventFeatureCollection } from "@/modules/map/geojson";
import { MAPTILER_ATTRIBUTION, resolveMapProvider } from "@/modules/map/provider";

const FRIDAY = new Date("2026-10-23T08:00:00Z");
const TZ = "Europe/Rome";
const TERRITORY = activeTerritory.map.bounds;

describe("demo venues on the real demo geography", () => {
  it("every venue has valid [lng, lat] inside the territory, except the one deliberately without position", () => {
    const { venues } = buildDemoDataset(FRIDAY);
    const withoutPosition = venues.filter((v) => v.coordinates === null).map((v) => v.id);
    expect(withoutPosition).toEqual(["v-palestra"]);
    for (const venue of venues) {
      if (!venue.coordinates) continue;
      expect(isValidLngLat(venue.coordinates), venue.id).toBe(true);
      // Longitude first: Bergamo is ~9.6°E, ~45.7°N. A swapped pair would fail here.
      expect(venue.coordinates[0], venue.id).toBeLessThan(venue.coordinates[1]);
      expect(inBBox(venue.coordinates, TERRITORY), venue.id).toBe(true);
    }
  });

  it("every mapped venue lies inside the map frame of its own zone", () => {
    for (const venue of buildDemoDataset(FRIDAY).venues) {
      if (!venue.coordinates) continue;
      const frame = activeTerritory.zoneBounds[venue.zoneId];
      expect(frame, venue.zoneId).toBeDefined();
      expect(inBBox(venue.coordinates, frame!), venue.id).toBe(true);
      expect(bboxWithin(frame!, TERRITORY), venue.zoneId).toBe(true);
    }
  });

  it("the territory box contains its own center", () => {
    expect(isValidBBox(TERRITORY)).toBe(true);
    expect(inBBox(activeTerritory.map.center, TERRITORY)).toBe(true);
  });
});

describe("toEventFeatureCollection", () => {
  it("maps exactly the given entries, in [lng, lat], and reports those without a position", async () => {
    const entries = await createDemoRepository().listEntries(FRIDAY);
    const weekend = filterCatalog(entries, { ...DEFAULT_FILTERS, window: "weekend" }, FRIDAY, TZ);
    const { collection, withoutLocation } = toEventFeatureCollection(weekend);

    expect(collection.type).toBe("FeatureCollection");
    expect(collection.features.map((f) => f.id).sort()).toEqual(
      weekend.filter((e) => e.venue.coordinates).map((e) => e.occurrence.id).sort(),
    );
    expect(withoutLocation.map((e) => e.occurrence.id)).toEqual(["occ-minivolley-1"]);
    const lanterns = collection.features.find((f) => f.id === "occ-lanterne-1");
    expect(lanterns?.geometry).toEqual({ type: "Point", coordinates: [9.9625, 45.6695] });
    expect(lanterns?.properties).toMatchObject({ slug: "demo-notte-delle-lanterne-sul-lungolago", isDemo: true, category: "natura" });
  });

  it("overlapping venues produce distinct features at identical coordinates (clustered on the map)", async () => {
    const entries = await createDemoRepository().listEntries(FRIDAY);
    const weekend = filterCatalog(entries, { ...DEFAULT_FILTERS, window: "weekend" }, FRIDAY, TZ);
    const atPark = toEventFeatureCollection(weekend).collection.features.filter(
      (f) => f.geometry.coordinates[0] === 9.652 && f.geometry.coordinates[1] === 45.706,
    );
    expect(atPark.map((f) => f.id).sort()).toEqual(["occ-erbe-1", "occ-luci-1"]);
  });

  it("drops invalid coordinates instead of placing them at 0,0", async () => {
    const [entry] = await createDemoRepository().listEntries(FRIDAY);
    const broken = (coordinates: unknown): CatalogEntry => ({
      ...entry!,
      venue: { ...entry!.venue, coordinates: coordinates as CatalogEntry["venue"]["coordinates"] },
    });
    const result = toEventFeatureCollection([broken([200, 45]), broken([9.6, Number.NaN]), broken([9.6]), broken(null)]);
    expect(result.collection.features).toEqual([]);
    expect(result.withoutLocation).toHaveLength(4);
  });

  it("empty input gives an empty collection", () => {
    expect(toEventFeatureCollection([])).toEqual({ collection: { type: "FeatureCollection", features: [] }, withoutLocation: [] });
  });
});

describe("bbox helpers", () => {
  const box: BBox = [9.6, 45.69, 9.7, 45.71];

  it("inBBox includes edges and uses [lng, lat]", () => {
    expect(inBBox([9.6, 45.69], box)).toBe(true);
    expect(inBBox([9.65, 45.7], box)).toBe(true);
    expect(inBBox([45.7, 9.65], box)).toBe(false);
    expect(inBBox([9.71, 45.7], box)).toBe(false);
  });

  it("bboxAround builds a box containing the point, ~2 km each side", () => {
    const around = bboxAround([9.67, 45.7], 2);
    expect(inBBox([9.67, 45.7], around)).toBe(true);
    expect(around[3] - around[1]).toBeCloseTo((2 * 2) / 111.32, 5);
    expect(bboxWithin(around, TERRITORY)).toBe(true);
  });

  it("area URL parameter round-trips and rejects malformed or out-of-territory values", () => {
    expect(parseArea(serializeArea(box), TERRITORY)).toEqual(box);
    expect(serializeArea([9.123456, 45.1, 9.2, 45.2])).toBe("9.1235,45.1,9.2,45.2");
    for (const bad of [
      "",
      "9.6,45.69,9.7",
      "9.7,45.69,9.6,45.71", // west > east
      "9.6,45.71,9.7,45.69", // south > north
      "abc,1,2,3",
      "9.6,45.69,9.7,45.71;drop",
      "200,45,201,46",
      "12.4,41.8,12.6,42.0", // Rome: outside the demo territory
      `9.6,45.69,9.7,45.71${"0".repeat(80)}`,
    ]) {
      expect(parseArea(bad, TERRITORY), bad).toBeNull();
    }
    expect(parseArea(["9.6,45.69,9.7,45.71", "x"], TERRITORY)).toEqual(box);
  });
});

describe("resolveMapProvider", () => {
  it("returns null without a key or when disabled", () => {
    expect(resolveMapProvider({})).toBeNull();
    expect(resolveMapProvider({ MAP_PROVIDER: "none", MAPTILER_PUBLIC_KEY: "abcdefgh1234" })).toBeNull();
    expect(resolveMapProvider({ MAP_PROVIDER: "google", MAPTILER_PUBLIC_KEY: "abcdefgh1234" })).toBeNull();
  });

  it("builds the MapTiler style URL with attribution", () => {
    const config = resolveMapProvider({ MAPTILER_PUBLIC_KEY: "abcdefgh1234" });
    expect(config).toEqual({
      id: "maptiler",
      styleUrl: "https://api.maptiler.com/maps/streets-v2/style.json?key=abcdefgh1234",
      attribution: [MAPTILER_ATTRIBUTION],
    });
    expect(MAPTILER_ATTRIBUTION).toContain("https://www.openstreetmap.org/copyright");
    expect(resolveMapProvider({ MAPTILER_PUBLIC_KEY: "abcdefgh1234", MAPTILER_MAP_ID: "basic-v2" })?.styleUrl).toContain("/maps/basic-v2/");
  });

  it("rejects keys or map ids that could alter the URL", () => {
    expect(resolveMapProvider({ MAPTILER_PUBLIC_KEY: "abc&callback=x" })).toBeNull();
    expect(resolveMapProvider({ MAPTILER_PUBLIC_KEY: "short" })).toBeNull();
    expect(resolveMapProvider({ MAPTILER_PUBLIC_KEY: "abcdefgh1234", MAPTILER_MAP_ID: "../evil" })).toBeNull();
  });
});
