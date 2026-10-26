import { describe, expect, it } from "vitest";
import { parseDemoNow } from "@/modules/catalog/demo-clock";

describe("ATTORNO_DEMO_NOW parsing", () => {
  it("accepts a strict UTC ISO instant in demo mode", () => {
    expect(parseDemoNow("2026-10-23T08:00:00.000Z", true)?.toISOString()).toBe("2026-10-23T08:00:00.000Z");
    expect(parseDemoNow("2026-10-23T08:00Z", true)?.toISOString()).toBe("2026-10-23T08:00:00.000Z");
  });

  it("is ignored outside demo mode", () => {
    expect(parseDemoNow("2026-10-23T08:00:00.000Z", false)).toBeNull();
  });

  it("rejects empty, local-time, offset, malformed and overflowing values", () => {
    for (const value of [
      undefined,
      "",
      "2026-10-23",
      "2026-10-23T08:00:00", // no zone: would depend on the machine timezone
      "2026-10-23T10:00:00+02:00",
      "23/10/2026",
      "tomorrow",
      "2026-02-31T08:00:00Z", // calendar overflow
      "2026-13-01T08:00:00Z",
      "1999-10-23T08:00:00Z",
      "2026-10-23T08:00:00.000Z ",
      `2026-10-23T08:00:00.000Z${"0".repeat(40)}`,
    ]) {
      expect(parseDemoNow(value, true), String(value)).toBeNull();
    }
  });
});
