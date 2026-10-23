import type { CatalogRepository } from "../repository";
import type { CatalogEntry, EventDetail } from "../types";
import { buildDemoDataset, type DemoDataset } from "./fixtures";

function joinEntries(data: DemoDataset): CatalogEntry[] {
  const entries: CatalogEntry[] = [];
  for (const occurrence of data.occurrences) {
    if (occurrence.status === "draft") continue;
    const event = data.events.find((e) => e.id === occurrence.eventId);
    const venue = data.venues.find((v) => v.id === occurrence.venueId);
    const organizer = data.organizers.find((o) => o.id === event?.organizerId);
    if (!event || !venue || !organizer) continue;
    entries.push({ occurrence, event, venue, organizer, source: data.source });
  }
  return entries;
}

// Identity and stored status do not depend on the reference date, so any fixed instant works.
const STATUS_REFERENCE = new Date(0);

/** In-memory provider over the synthetic DEMO dataset. Replaced by Postgres in Phase 02. */
export function createDemoRepository(): CatalogRepository {
  return {
    async listEntries(now) {
      return joinEntries(buildDemoDataset(now));
    },
    async getEventBySlug(slug, now) {
      const entries = joinEntries(buildDemoDataset(now)).filter((entry) => entry.event.slug === slug);
      const head = entries[0];
      if (!head) return null;
      const detail: EventDetail = {
        event: head.event,
        organizer: head.organizer,
        source: head.source,
        occurrences: entries
          .map(({ occurrence, venue }) => ({ occurrence, venue }))
          .sort((a, b) => a.occurrence.startsAt.localeCompare(b.occurrence.startsAt)),
      };
      return detail;
    },
    async listPublishableSlugs() {
      const slugs = joinEntries(buildDemoDataset(STATUS_REFERENCE)).map((entry) => entry.event.slug);
      return [...new Set(slugs)].sort();
    },
    async getPublicOccurrenceIds(slug) {
      const ids = joinEntries(buildDemoDataset(STATUS_REFERENCE))
        .filter((entry) => entry.event.slug === slug)
        .map((entry) => entry.occurrence.id);
      return ids.length > 0 ? ids : null;
    },
  };
}
