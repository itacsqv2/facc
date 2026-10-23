import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { zoneName } from "@/config/territory";
import { ageLabel, bookingLabel, CATEGORY_LABELS, dateBadge, priceLabel, timeRangeLabel } from "@/modules/catalog/format";
import type { CatalogEntry } from "@/modules/catalog/types";
import { CATEGORY_SURFACE, CategoryIcon } from "./category-visual";

export function eventHref(entry: Pick<CatalogEntry, "event" | "occurrence">): string {
  return `/eventi/${entry.event.slug}?data=${entry.occurrence.id}`;
}

type EventCardProps = {
  entry: CatalogEntry;
  /** Extra status shown on the card (e.g. cancelled, in saved list). */
  statusText?: string | null;
  headingLevel?: "h2" | "h3";
};

export function EventCard({ entry, statusText, headingLevel: Heading = "h3" }: EventCardProps) {
  const { event, occurrence, venue } = entry;
  const badge = dateBadge(occurrence.startsAt, occurrence.timeZone);
  const price = event.price;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-card transition-shadow has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-accent hover:border-accent/50">
      <div className={`flex items-center gap-3 px-4 py-3 text-ink ${CATEGORY_SURFACE[event.category]}`}>
        <span className="flex w-12 shrink-0 flex-col items-center rounded-md bg-surface py-1 leading-none shadow-sm">
          <span className="text-[0.7rem] font-semibold uppercase">{badge.weekday}</span>
          <span className="font-display text-xl font-bold">{badge.day}</span>
          <span className="text-[0.7rem] uppercase">{badge.month}</span>
        </span>
        <span className="flex min-w-0 flex-1 items-center gap-1.5 text-sm font-semibold">
          <CategoryIcon category={event.category} className="size-5 shrink-0" />
          <span className="truncate">{CATEGORY_LABELS[event.category]}</span>
        </span>
        {event.isDemo && <Badge tone="demo">DEMO</Badge>}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {statusText && (
          <p className="w-fit rounded-sm bg-warning-soft px-2 py-0.5 text-sm font-bold text-warning">{statusText}</p>
        )}
        <Heading className="text-lg leading-snug font-bold">
          <Link href={eventHref(entry)} className="after:absolute after:inset-0 focus-visible:outline-none group-hover:text-accent-strong">
            {event.title}
          </Link>
        </Heading>
        <p className="text-sm text-ink">
          <span className="font-semibold">{timeRangeLabel(occurrence)}</span>
          <span className="text-muted"> · {venue.name}, {zoneName(venue.zoneId)}</span>
        </p>
        <ul className="mt-auto flex flex-wrap gap-1.5 pt-2" aria-label="Informazioni pratiche">
          <li>
            <Badge tone={price.state === "FREE" ? "accent" : price.state === "UNKNOWN" ? "warning" : "neutral"}>
              {priceLabel(price)}
            </Badge>
          </li>
          <li>
            <Badge tone={event.age.state === "not_verified" ? "warning" : "neutral"}>{ageLabel(event.age)}</Badge>
          </li>
          <li>
            <Badge tone={event.booking === "not_verified" ? "warning" : "neutral"}>{bookingLabel(event.booking)}</Badge>
          </li>
        </ul>
      </div>
    </article>
  );
}
