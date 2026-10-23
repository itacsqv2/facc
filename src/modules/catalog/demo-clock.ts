/**
 * Pinned demo clock (`FACC_DEMO_NOW`), pure and testable.
 *
 * Accepted only when the active territory is a DEMO one and the value is a strict
 * UTC ISO 8601 instant (e.g. 2026-10-23T08:00:00.000Z) between 2020 and 2099.
 * Anything else is ignored and the real server time is used, so a stray variable
 * can never shift dates of a real (non-demo) catalog.
 */
const STRICT_UTC_ISO = /^(20[2-9]\d)-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?Z$/;

export function parseDemoNow(value: string | undefined, demoMode: boolean): Date | null {
  if (!demoMode || !value || value.length > 30 || !STRICT_UTC_ISO.test(value)) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  // Reject calendar overflow such as 2026-02-31 (Date would roll it into March).
  if (date.toISOString().slice(0, 10) !== value.slice(0, 10)) return null;
  return date;
}
