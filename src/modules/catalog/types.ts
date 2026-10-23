/**
 * Catalog domain types (see docs/DOMAIN_MODEL.md).
 *
 * `Event` is the persistent identity/content; `Occurrence` is one dated instance
 * with its own status. Unknown facts are explicit states, never `false` or `0`.
 */

export const CATEGORIES = ["laboratori", "natura", "musica", "teatro", "musei", "sport"] as const;
export type Category = (typeof CATEGORIES)[number];

/**
 * Price per person, standard ticket.
 * - FREE: free entry confirmed by the source.
 * - PAID + basis "exact": the amount is the full price.
 * - PAID + basis "from": a starting price ("da 3 €"); the real cost may be higher.
 * - UNKNOWN: not communicated. Never treated as free or as within a budget.
 */
export type PriceInfo =
  | { state: "FREE" }
  | { state: "PAID"; amountCents: number; basis: "exact" | "from"; note?: string }
  | { state: "UNKNOWN" };

/**
 * Age suitability as declared by the organizer, in whole years.
 * - range: recommended from `min` to `max` inclusive; `max: null` = no upper limit ("da 6 anni").
 * - all_ages: explicitly suitable for every age.
 * - not_verified: not declared. Never matches an age filter.
 */
export type AgeSuitability =
  | { state: "range"; min: number; max: number | null }
  | { state: "all_ages" }
  | { state: "not_verified" };

export type Verification = "yes" | "no" | "not_verified";

/** required = obbligatoria; recommended = facoltativa (consigliata); not_required = senza prenotazione. */
export type BookingRequirement = "required" | "recommended" | "not_required" | "not_verified";

/**
 * Lifecycle of ONE dated occurrence (see docs/DOMAIN_MODEL.md):
 * draft -> published -> (needs_confirmation | cancelled | ended).
 * `ended` is also derived from the clock once `endsAt` has passed.
 */
export type OccurrenceStatus = "draft" | "published" | "needs_confirmation" | "cancelled" | "ended";

export type Zone = { id: string; name: string };

export type Venue = {
  id: string;
  name: string;
  address: string;
  zoneId: string;
  /** IANA timezone of the venue. */
  timeZone: string;
};

export type Organizer = {
  id: string;
  name: string;
  contact: string;
  isDemo: boolean;
};

export type Source = {
  id: string;
  kind: "demo_synthetic" | "organizer" | "licensed_feed";
  label: string;
  /** Last time a human confirmed the data; null = never verified. */
  lastConfirmedAt: string | null;
};

export type Event = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: Category;
  organizerId: string;
  sourceId: string;
  age: AgeSuitability;
  accessibility: Verification;
  price: PriceInfo;
  booking: BookingRequirement;
  bookingNote?: string;
  isDemo: boolean;
};

export type Occurrence = {
  id: string;
  eventId: string;
  venueId: string;
  /** UTC instants, ISO 8601. */
  startsAt: string;
  endsAt: string;
  /** IANA timezone used to display and window this occurrence. */
  timeZone: string;
  status: OccurrenceStatus;
};

/** One occurrence joined with what a public listing needs. Serializable (plain JSON). */
export type CatalogEntry = {
  occurrence: Occurrence;
  event: Event;
  venue: Venue;
  organizer: Organizer;
  source: Source;
};

/** An event with all of its publicly visible (non-draft) occurrences. */
export type EventDetail = {
  event: Event;
  organizer: Organizer;
  source: Source;
  occurrences: Array<{ occurrence: Occurrence; venue: Venue }>;
};
