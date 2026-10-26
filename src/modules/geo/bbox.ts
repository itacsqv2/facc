/**
 * Geographic helpers shared by list and map. Coordinates are ALWAYS
 * [longitude, latitude]; boxes are [west, south, east, north] (GeoJSON bbox order,
 * same as PostGIS ST_MakeEnvelope(xmin, ymin, xmax, ymax)).
 * Boxes crossing the antimeridian are not supported (irrelevant for one catchment).
 */
import type { LngLat } from "@/modules/catalog/types";

export type BBox = readonly [west: number, south: number, east: number, north: number];

export function isValidLngLat(value: unknown): value is LngLat {
  if (!Array.isArray(value) || value.length !== 2) return false;
  const [lng, lat] = value as unknown[];
  return (
    typeof lng === "number" &&
    typeof lat === "number" &&
    Number.isFinite(lng) &&
    Number.isFinite(lat) &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90
  );
}

export function isValidBBox(box: readonly number[]): box is BBox {
  if (box.length !== 4 || !box.every(Number.isFinite)) return false;
  const [w, s, e, n] = box as [number, number, number, number];
  return w >= -180 && e <= 180 && s >= -90 && n <= 90 && w < e && s < n;
}

export function inBBox(point: LngLat, box: BBox): boolean {
  const [lng, lat] = point;
  const [w, s, e, n] = box;
  return lng >= w && lng <= e && lat >= s && lat <= n;
}

/** True when `inner` lies entirely within `outer`. */
export function bboxWithin(inner: BBox, outer: BBox): boolean {
  return inner[0] >= outer[0] && inner[1] >= outer[1] && inner[2] <= outer[2] && inner[3] <= outer[3];
}

const round = (value: number, decimals: number) => Number(value.toFixed(decimals));

/** Rounds to 4 decimals (~10 m): enough for a search area, keeps URLs short. */
export function roundBBox(box: BBox): BBox {
  return [round(box[0], 4), round(box[1], 4), round(box[2], 4), round(box[3], 4)];
}

/** Box of roughly `radiusKm` around a point (used for "Usa la mia posizione"). */
export function bboxAround(point: LngLat, radiusKm: number): BBox {
  const [lng, lat] = point;
  const dLat = radiusKm / 111.32;
  const dLng = radiusKm / (111.32 * Math.max(Math.cos((lat * Math.PI) / 180), 0.01));
  return [lng - dLng, lat - dLat, lng + dLng, lat + dLat];
}

/* URL: `area=west,south,east,north`. Anything malformed is ignored. */
const AREA_PATTERN = /^-?\d{1,3}(?:\.\d{1,6})?(?:,-?\d{1,3}(?:\.\d{1,6})?){3}$/;

export function parseArea(value: string | string[] | undefined, limits: BBox): BBox | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || raw.length > 64 || !AREA_PATTERN.test(raw)) return null;
  const box = raw.split(",").map(Number);
  if (!isValidBBox(box)) return null;
  // A search area must overlap the active territory; otherwise it is meaningless here.
  const [w, s, e, n] = box;
  if (e < limits[0] || w > limits[2] || n < limits[1] || s > limits[3]) return null;
  return roundBBox(box);
}

export function serializeArea(box: BBox): string {
  return roundBBox(box).join(",");
}
