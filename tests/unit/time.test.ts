import { describe, expect, it } from "vitest";
import { resolveWindow } from "@/modules/catalog/filters";
import { addDays, localDateKey, weekdayOf, weekendDays, zonedTimeToUtc } from "@/modules/catalog/time";

const TZ = "Europe/Rome";
const iso = (key: string, time: string) => zonedTimeToUtc(key, time, TZ).toISOString();

describe("zonedTimeToUtc (Europe/Rome)", () => {
  it("converts summer (CEST, +2) and winter (CET, +1) wall times", () => {
    expect(iso("2026-07-01", "10:00")).toBe("2026-07-01T08:00:00.000Z");
    expect(iso("2026-12-01", "10:00")).toBe("2026-12-01T09:00:00.000Z");
  });

  it("autumn fall-back 25 Oct 2026: ambiguous 02:30 resolves to the earlier instant", () => {
    expect(iso("2026-10-25", "01:59")).toBe("2026-10-24T23:59:00.000Z");
    expect(iso("2026-10-25", "02:30")).toBe("2026-10-25T00:30:00.000Z");
    expect(iso("2026-10-25", "03:00")).toBe("2026-10-25T02:00:00.000Z");
  });

  it("spring gap 29 Mar 2026: non-existent 02:30 is shifted forward to 03:30 CEST", () => {
    expect(iso("2026-03-29", "01:30")).toBe("2026-03-29T00:30:00.000Z");
    expect(iso("2026-03-29", "02:30")).toBe("2026-03-29T01:30:00.000Z");
    expect(iso("2026-03-29", "03:30")).toBe("2026-03-29T01:30:00.000Z");
  });

  it("rejects malformed date keys and times", () => {
    expect(() => zonedTimeToUtc("26-10-01", "10:00", TZ)).toThrow(RangeError);
    expect(() => zonedTimeToUtc("2026-10-01", "24:00", TZ)).toThrow(RangeError);
    expect(() => zonedTimeToUtc("2026-10-01", "9:00", TZ)).toThrow(RangeError);
  });
});

describe("calendar helpers", () => {
  it("rolls over month, year and leap day", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2027-01-01", -1)).toBe("2026-12-31");
  });

  it("reads the Rome calendar date of an instant near midnight", () => {
    // 22:30Z on 24 Oct = 00:30 CEST on 25 Oct in Rome.
    expect(localDateKey(new Date("2026-10-24T22:30:00Z"), TZ)).toBe("2026-10-25");
    expect(localDateKey(new Date("2026-10-24T21:59:00Z"), TZ)).toBe("2026-10-24");
    expect(weekdayOf("2026-10-23")).toBe(5);
  });
});

describe("weekend rule", () => {
  it("Friday -> coming Saturday and Sunday", () => {
    expect(weekendDays("2026-10-23")).toEqual(["2026-10-24", "2026-10-25"]);
  });
  it("Saturday -> today and tomorrow", () => {
    expect(weekendDays("2026-10-24")).toEqual(["2026-10-24", "2026-10-25"]);
  });
  it("Sunday -> today only", () => {
    expect(weekendDays("2026-10-25")).toEqual(["2026-10-25"]);
  });
  it("Monday -> next weekend, across month end", () => {
    expect(weekendDays("2026-10-26")).toEqual(["2026-10-31", "2026-11-01"]);
  });
  it("across year end", () => {
    expect(weekendDays("2026-12-31")).toEqual(["2027-01-02", "2027-01-03"]);
  });
});

describe("resolveWindow", () => {
  it("weekend containing the autumn DST switch lasts 49 hours", () => {
    const window = resolveWindow("weekend", new Date("2026-10-23T08:00:00Z"), TZ);
    expect(window.days).toEqual(["2026-10-24", "2026-10-25"]);
    expect(window.startsAt.toISOString()).toBe("2026-10-23T22:00:00.000Z");
    expect(window.endsAt.toISOString()).toBe("2026-10-25T23:00:00.000Z");
    expect((window.endsAt.getTime() - window.startsAt.getTime()) / 3_600_000).toBe(49);
  });

  it("today on the spring DST Sunday lasts 23 hours", () => {
    const window = resolveWindow("today", new Date("2026-03-29T10:00:00Z"), TZ);
    expect(window.days).toEqual(["2026-03-29"]);
    expect((window.endsAt.getTime() - window.startsAt.getTime()) / 3_600_000).toBe(23);
  });

  it("uses the Rome calendar day, not the UTC one (year end)", () => {
    // 23:30Z on 31 Dec = 00:30 on 1 Jan in Rome.
    expect(resolveWindow("today", new Date("2026-12-31T23:30:00Z"), TZ).days).toEqual(["2027-01-01"]);
  });
});
