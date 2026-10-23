import { activeTerritory } from "@/config/territory";
import { catalogRepository } from "@/modules/catalog";
import { requestNow } from "@/modules/catalog/clock";
import { isActiveListing, parseFilters } from "@/modules/catalog/filters";
import { CatalogExplorer } from "./catalog-explorer";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** Request-time part of the home page: reads filters from the URL and the demo clock. */
export async function CatalogSection({ searchParams }: Props) {
  const params = await searchParams;
  const now = requestNow();
  const zoneIds = activeTerritory.zones.map((zone) => zone.id);
  // Only currently available occurrences reach the browser: no cancelled, ended or draft data.
  const entries = (await catalogRepository.listEntries(now)).filter((entry) => isActiveListing(entry.occurrence, now));

  return (
    <CatalogExplorer
      entries={entries}
      nowIso={now.toISOString()}
      initialFilters={parseFilters(params, zoneIds)}
      zones={activeTerritory.zones}
      territoryName={activeTerritory.name}
      timeZone={activeTerritory.timeZone}
    />
  );
}

export function CatalogSkeleton() {
  return (
    <div className="container-page" aria-busy="true">
      <div className="relative z-10 -mt-6 h-40 animate-pulse rounded-lg border border-border bg-surface sm:-mt-8" />
      <p className="pt-8 text-sm text-muted">Caricamento delle attività…</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-56 animate-pulse rounded-lg bg-surface-sunken" />
        ))}
      </div>
    </div>
  );
}
