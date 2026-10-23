/**
 * Italian display labels. Every unknown state gets an explicit wording.
 */
import { localDateKey } from "./time";
import type { AgeSuitability, BookingRequirement, Category, Occurrence, OccurrenceStatus, PriceInfo, Verification } from "./types";

export const CATEGORY_LABELS: Record<Category, string> = {
  laboratori: "Laboratori",
  natura: "Natura e all'aperto",
  musica: "Musica",
  teatro: "Teatro e racconti",
  musei: "Musei e mostre",
  sport: "Sport e movimento",
};

const euro = (cents: number) =>
  new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);

export function priceLabel(price: PriceInfo): string {
  switch (price.state) {
    case "FREE":
      return "Gratis";
    case "PAID":
      return price.basis === "from" ? `da ${euro(price.amountCents)}` : euro(price.amountCents);
    case "UNKNOWN":
      return "Prezzo da verificare";
  }
}

export function ageLabel(age: AgeSuitability): string {
  if (age.state === "not_verified") return "Età non indicata";
  if (age.state === "all_ages") return "Per tutte le età";
  if (age.max === null) return `Da ${age.min} anni`;
  return `${age.min}–${age.max} anni`;
}

export function accessibilityLabel(value: Verification): string {
  if (value === "yes") return "Accessibile senza barriere (dichiarato)";
  if (value === "no") return "Accesso con barriere architettoniche";
  return "Accessibilità non verificata";
}

export function bookingLabel(value: BookingRequirement): string {
  switch (value) {
    case "required":
      return "Prenotazione obbligatoria";
    case "recommended":
      return "Prenotazione facoltativa";
    case "not_required":
      return "Senza prenotazione";
    case "not_verified":
      return "Modalità di prenotazione non verificata";
  }
}

export function statusLabel(status: OccurrenceStatus, ended: boolean): string | null {
  if (status === "cancelled") return "Evento annullato";
  if (ended) return "Evento terminato";
  if (status === "needs_confirmation") return "In attesa di conferma";
  return null;
}

function formatter(timeZone: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("it-IT", { timeZone, ...options });
}

/** e.g. "sabato 24 ottobre" */
export function dayLabel(iso: string, timeZone: string): string {
  return formatter(timeZone, { weekday: "long", day: "numeric", month: "long" }).format(new Date(iso));
}

/** e.g. { weekday: "sab", day: "24", month: "ott" } for date badges. */
export function dateBadge(iso: string, timeZone: string) {
  const parts = formatter(timeZone, { weekday: "short", day: "numeric", month: "short" }).formatToParts(new Date(iso));
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return { weekday: get("weekday"), day: get("day"), month: get("month") };
}

const time = (iso: string, timeZone: string) =>
  formatter(timeZone, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(iso));

const DAY_MS = 86_400_000;

/**
 * e.g. "10:00–11:30"; "23:30–00:30 (domenica 25)" when it ends the next day in under 24h;
 * "da giovedì 22, 18:00 a domenica 25, 23:00" for multi-day occurrences.
 */
export function timeRangeLabel(occurrence: Occurrence): string {
  const { startsAt, endsAt, timeZone } = occurrence;
  const range = `${time(startsAt, timeZone)}–${time(endsAt, timeZone)}`;
  if (localDateKey(new Date(startsAt), timeZone) === localDateKey(new Date(endsAt), timeZone)) return range;
  const day = (iso: string) => formatter(timeZone, { weekday: "long", day: "numeric" }).format(new Date(iso));
  if (new Date(endsAt).getTime() - new Date(startsAt).getTime() < DAY_MS) return `${range} (${day(endsAt)})`;
  return `da ${day(startsAt)}, ${time(startsAt, timeZone)} a ${day(endsAt)}, ${time(endsAt, timeZone)}`;
}

export function isMultiDay(occurrence: Occurrence): boolean {
  return new Date(occurrence.endsAt).getTime() - new Date(occurrence.startsAt).getTime() >= DAY_MS;
}

/** Full schedule line for detail pages. */
export function scheduleLabel(occurrence: Occurrence): string {
  if (isMultiDay(occurrence)) {
    const { startsAt, endsAt, timeZone } = occurrence;
    return `da ${dayLabel(startsAt, timeZone)}, ${time(startsAt, timeZone)} a ${dayLabel(endsAt, timeZone)}, ${time(endsAt, timeZone)}`;
  }
  return `${dayLabel(occurrence.startsAt, occurrence.timeZone)}, ${timeRangeLabel(occurrence)}`;
}
