/**
 * Calendar and timezone helpers for venue-local dates (IANA zones, e.g. Europe/Rome).
 *
 * Calendar days are plain `YYYY-MM-DD` keys; instants are `Date`/ISO strings in UTC.
 * No external date library: Intl provides the zone rules, including DST.
 */

export type DateKey = string; // "YYYY-MM-DD"

type LocalParts = { year: number; month: number; day: number; hour: number; minute: number; weekday: number };

const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const formatters = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      weekday: "short",
    });
    formatters.set(timeZone, formatter);
  }
  return formatter;
}

/** Wall-clock fields of `instant` as seen in `timeZone` (weekday: 0 = Sunday). */
export function localParts(instant: Date, timeZone: string): LocalParts {
  const parts = partsFormatter(timeZone).formatToParts(instant);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    weekday: WEEKDAY_INDEX[get("weekday")] ?? 0,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function toDateKey(year: number, month: number, day: number): DateKey {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function parseDateKey(key: DateKey): [number, number, number] {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) throw new RangeError(`Invalid date key: ${key}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/** Calendar date of `instant` in `timeZone`. */
export function localDateKey(instant: Date, timeZone: string): DateKey {
  const p = localParts(instant, timeZone);
  return toDateKey(p.year, p.month, p.day);
}

/** Pure calendar arithmetic (month/year rollover handled by Date.UTC). */
export function addDays(key: DateKey, days: number): DateKey {
  const [y, m, d] = parseDateKey(key);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return toDateKey(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

/** Weekday of a calendar date, 0 = Sunday. */
export function weekdayOf(key: DateKey): number {
  const [y, m, d] = parseDateKey(key);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Offset (local - UTC) in ms of `timeZone` at `instant`, minute precision. */
function offsetAt(instant: Date, timeZone: string): number {
  const p = localParts(instant, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  const truncated = Math.floor(instant.getTime() / 60_000) * 60_000;
  return asUtc - truncated;
}

/**
 * UTC instant for a venue-local wall time.
 * DST policy (same as Temporal "compatible"):
 * - ambiguous time (autumn fall-back, e.g. 02:30 twice) -> the EARLIER instant;
 * - non-existent time (spring gap, e.g. 02:30) -> shifted FORWARD by the gap length (03:30).
 */
export function zonedTimeToUtc(key: DateKey, time: string, timeZone: string): Date {
  const [y, m, d] = parseDateKey(key);
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  if (!match) throw new RangeError(`Invalid time: ${time}`);
  const wallAsUtc = Date.UTC(y, m - 1, d, Number(match[1]), Number(match[2]));

  const offsetBefore = offsetAt(new Date(wallAsUtc - 14 * 3_600_000), timeZone);
  const offsetAfter = offsetAt(new Date(wallAsUtc + 14 * 3_600_000), timeZone);
  const candidates = [...new Set([offsetBefore, offsetAfter])]
    .map((offset) => wallAsUtc - offset)
    .filter((ms) => {
      const p = localParts(new Date(ms), timeZone);
      return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) === wallAsUtc;
    })
    .sort((a, b) => a - b);

  return new Date(candidates[0] ?? wallAsUtc - offsetBefore);
}

/**
 * "Questo weekend" rule (shared by UI and tests):
 * - Monday-Friday -> the coming Saturday and Sunday;
 * - Saturday -> today (Saturday) and tomorrow (Sunday);
 * - Sunday -> today only (Saturday is over).
 */
export function weekendDays(today: DateKey): DateKey[] {
  const weekday = weekdayOf(today);
  if (weekday === 6) return [today, addDays(today, 1)];
  if (weekday === 0) return [today];
  return [addDays(today, 6 - weekday), addDays(today, 7 - weekday)];
}
