import type { Page } from "@playwright/test";

/** Minimal offline style: background only, no tiles, no glyphs. */
export const BLANK_STYLE = {
  version: 8,
  name: "facc-e2e-blank",
  sources: {},
  layers: [{ id: "background", type: "background", paint: { "background-color": "#e3efea" } }],
};

/** Style whose raster tiles all fail: the style itself is fine. */
const FAILING_TILES_STYLE = {
  version: 8,
  name: "facc-e2e-failing-tiles",
  sources: { base: { type: "raster", tiles: ["https://api.maptiler.com/tiles/e2e/{z}/{x}/{y}.png"], tileSize: 256 } },
  layers: [{ id: "base", type: "raster", source: "base" }],
};

/**
 * Serves the provider style locally; every other provider call fails.
 * - ok: blank style; - down: style fails too; - tiles-down: style ok, tiles fail.
 */
export async function mockMapProvider(page: Page, mode: "ok" | "down" | "tiles-down" = "ok") {
  await page.route("https://api.maptiler.com/**", (route) => {
    const isStyle = route.request().url().includes("/style.json");
    if (isStyle && mode === "ok") return route.fulfill({ json: BLANK_STYLE });
    if (isStyle && mode === "tiles-down") return route.fulfill({ json: FAILING_TILES_STYLE });
    return route.fulfill({ status: 503, body: "provider down" });
  });
}
