import type { CatalogEntry, EventDetail } from "./types";

/**
 * Read-only catalog access. Implementations must never return draft occurrences:
 * drafts stay inside the data layer. Availability rules (cancelled, ended,
 * windows) are applied by the pure functions in `filters.ts`.
 */
export interface CatalogRepository {
  /** Every publicly visible (non-draft) occurrence, joined for listing. */
  listEntries(now: Date): Promise<CatalogEntry[]>;
  /** Event with its non-draft occurrences, or null if unknown / not publishable. */
  getEventBySlug(slug: string, now: Date): Promise<EventDetail | null>;
  /** Slugs that have at least one non-draft occurrence. Independent of the clock. */
  listPublishableSlugs(): Promise<string[]>;
  /**
   * Ids of the non-draft occurrences of an event, or null if the slug is not public.
   * Independent of the clock: this is the single eligibility check for public URLs.
   */
  getPublicOccurrenceIds(slug: string): Promise<string[] | null>;
}
