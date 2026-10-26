/**
 * The ONE transformation from catalog entries (Occurrence + Venue) to GeoJSON.
 * Input must already be the filtered result list, so list and map always show the
 * same occurrences. Coordinates stay [longitude, latitude] (RFC 7946); a future
 * PostGIS query can return the same shape via ST_AsGeoJSON(venue.location).
 */
import { isValidLngLat } from "@/modules/geo/bbox";
import type { CatalogEntry, Category } from "@/modules/catalog/types";

export type EventFeatureProperties = {
  occurrenceId: string;
  slug: string;
  title: string;
  category: Category;
  startsAt: string;
  isDemo: boolean;
};

export type EventFeature = {
  type: "Feature";
  id: string;
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: EventFeatureProperties;
};

export type EventFeatureCollection = { type: "FeatureCollection"; features: EventFeature[] };

export type GeoJsonResult = {
  collection: EventFeatureCollection;
  /** Entries listed but not mappable (missing or invalid coordinates). */
  withoutLocation: CatalogEntry[];
};

export function toEventFeatureCollection(entries: readonly CatalogEntry[]): GeoJsonResult {
  const features: EventFeature[] = [];
  const withoutLocation: CatalogEntry[] = [];
  for (const entry of entries) {
    const coordinates = entry.venue.coordinates;
    if (!isValidLngLat(coordinates)) {
      withoutLocation.push(entry);
      continue;
    }
    features.push({
      type: "Feature",
      id: entry.occurrence.id,
      geometry: { type: "Point", coordinates: [coordinates[0], coordinates[1]] },
      properties: {
        occurrenceId: entry.occurrence.id,
        slug: entry.event.slug,
        title: entry.event.title,
        category: entry.event.category,
        startsAt: entry.occurrence.startsAt,
        isDemo: entry.event.isDemo,
      },
    });
  }
  return { collection: { type: "FeatureCollection", features }, withoutLocation };
}
