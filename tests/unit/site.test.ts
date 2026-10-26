import { describe, expect, it } from "vitest";
import { DEFAULT_APP_NAME, resolveAppName } from "@/config/site";

describe("resolveAppName (NEXT_PUBLIC_APP_NAME)", () => {
  it("uses the configured name, trimmed", () => {
    expect(resolveAppName("kesifa")).toBe("kesifa");
    expect(resolveAppName("  Kesifa  ")).toBe("Kesifa");
    expect(resolveAppName("Città Viva")).toBe("Città Viva");
  });

  it("falls back to the default when missing, empty or unsafe", () => {
    expect(DEFAULT_APP_NAME).toBe("Kesifa");
    for (const value of [undefined, "", "   ", "<script>", "a".repeat(41), "-dash-first", 'quote"name']) {
      expect(resolveAppName(value), String(value)).toBe(DEFAULT_APP_NAME);
    }
  });
});
