import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { zoneName } from "@/config/territory";
import { CATEGORY_SURFACE, CategoryIcon } from "@/features/catalog/category-visual";
import { isActiveListing, isEnded } from "@/modules/catalog/filters";
import {
  accessibilityLabel,
  ageLabel,
  bookingLabel,
  CATEGORY_LABELS,
  priceLabel,
  scheduleLabel,
  statusLabel,
} from "@/modules/catalog/format";
import type { EventDetail, Occurrence } from "@/modules/catalog/types";
import { SaveButton } from "./save-button";
import { ShareButton } from "./share-button";

type Props = { detail: EventDetail; requestedOccurrenceId: string | undefined; nowIso: string };

/** Requested date if it exists; otherwise the next available one, then the next not ended, then the latest. */
function pickOccurrence(detail: EventDetail, requested: string | undefined, now: Date) {
  const list = detail.occurrences;
  if (requested) return list.find((item) => item.occurrence.id === requested);
  return (
    list.find((item) => isActiveListing(item.occurrence, now)) ??
    list.find((item) => !isEnded(item.occurrence, now)) ??
    list[list.length - 1]
  );
}

function Fact({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="grid gap-0.5 border-b border-border py-3 last:border-b-0 sm:grid-cols-[11rem_1fr] sm:gap-4">
      <dt className="text-sm font-semibold text-muted">{term}</dt>
      <dd className="text-ink">{children}</dd>
    </div>
  );
}

function StatusBanner({ occurrence, ended }: { occurrence: Occurrence; ended: boolean }) {
  const label = statusLabel(occurrence.status, ended);
  if (!label) return null;
  const text =
    occurrence.status === "cancelled"
      ? "Questa data è stata annullata dall'organizzatore. Non è possibile partecipare."
      : ended
        ? "Questa data è già passata."
        : "L'organizzatore non ha ancora confermato questa data: non è mostrata nel catalogo.";
  return (
    <div role="status" className="mt-4 rounded-md border border-warning/30 bg-warning-soft px-4 py-3 text-warning">
      <p className="font-bold">{label}</p>
      <p className="text-sm">{text}</p>
    </div>
  );
}

export function EventDetailView({ detail, requestedOccurrenceId, nowIso }: Props) {
  const now = new Date(nowIso);
  const selected = pickOccurrence(detail, requestedOccurrenceId, now);
  if (!selected) notFound();

  const { event, organizer, source } = detail;
  const { occurrence, venue } = selected;
  const ended = isEnded(occurrence, now);
  const cancelled = occurrence.status === "cancelled";
  const bookable = isActiveListing(occurrence, now);
  const otherDates = detail.occurrences.filter((item) => item.occurrence.id !== occurrence.id);

  return (
    <article className="mt-2 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <div className="min-w-0">
        <div className={`flex flex-wrap items-center gap-2 rounded-lg px-4 py-3 text-ink ${CATEGORY_SURFACE[event.category]}`}>
          <CategoryIcon category={event.category} className="size-6" />
          <span className="font-semibold">{CATEGORY_LABELS[event.category]}</span>
          {event.isDemo && (
            <Badge tone="demo" className="ml-auto">
              Evento dimostrativo – dati fittizi
            </Badge>
          )}
        </div>

        <h1 className="mt-4 text-title font-bold">{event.title}</h1>
        <p className="mt-2 text-lg text-muted">{event.summary}</p>
        <StatusBanner occurrence={occurrence} ended={ended} />

        <dl className="mt-4">
          <Fact term="Quando">
            <span className={cancelled ? "line-through" : undefined}>{scheduleLabel(occurrence)}</span>
            <span className="block text-sm text-muted">Orario di {occurrence.timeZone === "Europe/Rome" ? "Roma (ora italiana)" : occurrence.timeZone}</span>
          </Fact>
          <Fact term="Dove">
            {venue.name}
            <span className="block text-sm text-muted">
              {venue.address} · zona DEMO {zoneName(venue.zoneId)}
            </span>
          </Fact>
          <Fact term="Per chi">
            {ageLabel(event.age)}
            {event.age.state === "not_verified" && (
              <span className="block text-sm text-muted">L&apos;organizzatore non ha indicato un&apos;età consigliata.</span>
            )}
          </Fact>
          <Fact term="Costo">
            {priceLabel(event.price)}
            {event.price.state === "PAID" && event.price.basis === "from" && (
              <span className="block text-sm text-muted">Prezzo di partenza: il costo finale può essere più alto.</span>
            )}
            {event.price.state === "PAID" && event.price.note && <span className="block text-sm text-muted">{event.price.note}</span>}
            {event.price.state === "UNKNOWN" && (
              <span className="block text-sm text-muted">L&apos;organizzatore non ha indicato il prezzo: non è detto che sia gratis.</span>
            )}
          </Fact>
          <Fact term="Prenotazione">
            {bookingLabel(event.booking)}
            {event.bookingNote && <span className="block text-sm text-muted">{event.bookingNote}</span>}
          </Fact>
          <Fact term="Accessibilità">{accessibilityLabel(event.accessibility)}</Fact>
          <Fact term="Organizzatore">
            {organizer.name}
            <span className="block text-sm text-muted">Contatto fittizio: {organizer.contact}</span>
          </Fact>
          <Fact term="Fonte">{source.label}</Fact>
          <Fact term="Ultima conferma">
            {source.lastConfirmedAt ? source.lastConfirmedAt : "Dato DEMO non verificato"}
          </Fact>
        </dl>

        <section aria-labelledby="descrizione-title" className="mt-6">
          <h2 id="descrizione-title" className="text-xl font-bold">
            Descrizione
          </h2>
          <p className="mt-2 text-ink">{event.description}</p>
        </section>

        {otherDates.length > 0 && (
          <section aria-labelledby="date-title" className="mt-8">
            <h2 id="date-title" className="text-xl font-bold">
              Altre date di questa attività
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {otherDates.map((item) => {
                const label = statusLabel(item.occurrence.status, isEnded(item.occurrence, now));
                return (
                  <li key={item.occurrence.id}>
                    <Link
                      href={`/eventi/${event.slug}?data=${item.occurrence.id}`}
                      className="flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-border bg-surface px-4 py-2 hover:border-accent"
                    >
                      <span className="font-semibold">{scheduleLabel(item.occurrence)}</span>
                      {label && <Badge tone="warning">{label}</Badge>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>

      <Card className="flex flex-col gap-4 lg:sticky lg:top-4">
        {cancelled ? (
          <p className="rounded-md bg-warning-soft px-4 py-3 text-center font-bold text-warning">Evento annullato</p>
        ) : ended ? (
          <p className="rounded-md bg-surface-sunken px-4 py-3 text-center font-bold text-ink">Evento terminato</p>
        ) : (
          <div className="rounded-md bg-surface-sunken px-4 py-3 text-center">
            <p className="font-bold text-ink">Prenotazione non disponibile nella demo</p>
            <p className="text-sm text-muted">
              {bookable ? "Nella versione reale ti porteremo al sito o al contatto dell'organizzatore." : "Data in attesa di conferma."}
            </p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <SaveButton slug={event.slug} occurrenceId={occurrence.id} title={event.title} />
          <ShareButton title={event.title} />
        </div>
        <p className="text-xs text-muted">
          FACC non vende biglietti e non raccoglie pagamenti. I preferiti restano solo su questo dispositivo.
        </p>
      </Card>
    </article>
  );
}

export function EventDetailSkeleton() {
  return (
    <div aria-busy="true" className="mt-2">
      <p className="text-sm text-muted">Caricamento della scheda…</p>
      <div className="mt-3 h-12 animate-pulse rounded-lg bg-surface-sunken" />
      <div className="mt-4 h-8 w-2/3 animate-pulse rounded bg-surface-sunken" />
      <div className="mt-6 h-64 animate-pulse rounded-lg bg-surface-sunken" />
    </div>
  );
}
