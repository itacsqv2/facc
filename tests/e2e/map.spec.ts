import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { mockMapProvider } from "./support/map";

// Server clock pinned to Friday 23 Oct 2026, 10:00 Europe/Rome; MapTiler is mocked (no network).

const mapRegion = (page: Page) => page.getByRole("region", { name: "Mappa delle attività DEMO" });
const markers = (page: Page) => mapRegion(page).locator(".attorno-marker");
const mapCount = (page: Page) => page.getByText(/\d+ attività sulla mappa/);
const listItems = (page: Page) => page.getByRole("list", { name: "Risultati" }).locator(":scope > li");

async function openMap(page: Page, query = "") {
  await page.goto(`/?vista=mappa${query ? `&${query}` : ""}`);
  await expect(markers(page).first()).toBeVisible({ timeout: 15_000 });
}

test.beforeEach(async ({ page }) => {
  await mockMapProvider(page);
});

test.describe("list / map modes share one result set", () => {
  test("map loads lazily: list mode makes no provider or map worker request", async ({ page }) => {
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));
    await page.goto("/");
    await expect(listItems(page)).toHaveCount(4);
    expect(requests.filter((url) => url.includes("maptiler") || url.includes("maplibre"))).toEqual([]);

    await page.getByRole("button", { name: "Mappa", exact: true }).click();
    await expect(markers(page).first()).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(/vista=mappa/);
    expect(requests.some((url) => url.includes("api.maptiler.com"))).toBe(true);
  });

  test("filters update list and map together, including entries without coordinates", async ({ page }) => {
    await openMap(page);
    await expect(mapCount(page)).toHaveText("4 attività sulla mappa");

    await page.getByRole("button", { name: /Questo weekend/ }).click();
    await expect(mapCount(page)).toContainText("5 attività sulla mappa");
    await expect(page.getByText("1 senza posizione, visibili solo nella")).toBeVisible();

    await page.getByLabel("Categoria").selectOption("natura");
    await expect(mapCount(page)).toHaveText("3 attività sulla mappa");

    await page.getByRole("button", { name: "Lista", exact: true }).click();
    await expect(listItems(page)).toHaveCount(3);
    await expect(page).toHaveURL(/quando=weekend/);
    await expect(page).toHaveURL(/categoria=natura/);
  });

  test("attribution and DEMO label are always visible on the map", async ({ page }) => {
    await openMap(page);
    await expect(mapRegion(page).getByText("© MapTiler")).toBeVisible();
    await expect(mapRegion(page).getByText("© OpenStreetMap contributors")).toBeVisible();
    await expect(mapRegion(page).getByText("Mappa DEMO · eventi fittizi")).toBeVisible();
  });
});

test.describe("markers, clusters and preview", () => {
  test("marker click opens a preview with title, date, time, price and a link to the detail page", async ({ page }) => {
    await openMap(page, "quando=weekend&area=9.655,45.698,9.667,45.708");
    const marker = mapRegion(page).getByRole("button", { name: /^Piccoli vasai: laboratorio di ceramica \(DEMO\)/ });
    await marker.click();
    const preview = page.getByRole("dialog", { name: "Anteprima attività" });
    await expect(preview).toBeVisible();
    await expect(preview.getByText("Piccoli vasai: laboratorio di ceramica", { exact: true })).toBeVisible();
    await expect(preview.getByText("sabato 24 ottobre, 10:00–11:30")).toBeVisible();
    await expect(preview.getByText(/8\s€/)).toBeVisible();
    await expect(marker).toHaveAttribute("aria-pressed", "true");

    await preview.getByRole("link", { name: /Apri la scheda/ }).click();
    await expect(page).toHaveURL(/\/eventi\/demo-piccoli-vasai-laboratorio-ceramica\?data=occ-ceramica-1$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Piccoli vasai: laboratorio di ceramica");
  });

  test("overlapping venues stay clustered and open a list of both activities", async ({ page }) => {
    // Park venue hosts two weekend activities at identical coordinates.
    await openMap(page, "quando=weekend&area=9.648,45.703,9.656,45.709");
    const cluster = mapRegion(page).getByRole("button", { name: /^2 attività in questa zona/ });
    await cluster.click();
    const preview = page.getByRole("dialog", { name: "2 attività in questo luogo" });
    await expect(preview).toBeVisible({ timeout: 10_000 });
    await expect(preview.getByText("Sentiero delle luci nel parco", { exact: true })).toBeVisible();
    await expect(preview.getByText("Passeggiata delle erbe spontanee", { exact: true })).toBeVisible();
    await expect(preview.getByRole("link", { name: /Apri la scheda/ })).toHaveCount(2);
  });

  test("keyboard: Tab reaches markers, Enter opens the preview, focus moves into it, Escape closes", async ({ page }) => {
    await openMap(page, "quando=weekend&area=9.655,45.698,9.667,45.708");
    const marker = mapRegion(page).getByRole("button", { name: /^Piccoli vasai/ });
    for (let i = 0; i < 40 && !(await marker.evaluate((el) => el === document.activeElement)); i++) {
      await page.keyboard.press("Tab");
    }
    await expect(marker).toBeFocused();
    expect(await marker.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe("none");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "Anteprima attività" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("text alternative lists the same activities with links", async ({ page }) => {
    await openMap(page, "quando=weekend");
    await page.getByText("Elenco testuale delle attività sulla mappa").click();
    const items = page.locator("details ul > li");
    await expect(items).toHaveCount(6);
    await expect(items.filter({ hasText: "posizione non disponibile" })).toHaveCount(1);
  });
});

test.describe("search in this area", () => {
  test("area from URL limits list and map; moving shows «Cerca in questa zona» only after a user gesture", async ({ page }) => {
    // Bergamo city only: excludes the Sarnico activities.
    await openMap(page, "area=9.63,45.68,9.69,45.715");
    await expect(mapCount(page)).toHaveText("2 attività sulla mappa");
    await expect(page.getByText("Zona scelta sulla mappa")).toBeVisible();
    await expect(page.getByRole("button", { name: "Cerca in questa zona" })).toHaveCount(0);

    await page.getByRole("button", { name: "Rimuovi zona" }).click();
    await expect(mapCount(page)).toHaveText("4 attività sulla mappa");
    await expect(page).not.toHaveURL(/area=/);

    // Mouse coordinates are viewport-relative: bring the map on screen first.
    await mapRegion(page).scrollIntoViewIfNeeded();
    const box = await page.getByTestId("event-map-canvas").boundingBox();
    if (!box) throw new Error("map not rendered");
    const start = { x: box.x + 30, y: box.y + Math.min(box.height, 300) - 30 }; // empty corner, away from markers
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(start.x + 150, start.y - 40, { steps: 10 });
    await page.mouse.up();
    const search = page.getByRole("button", { name: "Cerca in questa zona" });
    await expect(search).toBeVisible();
    await search.click();
    // URLSearchParams encodes the commas; the server decodes them back.
    await expect(page).toHaveURL(/area=-?\d+\.\d+(%2C|,)-?\d+/);
    await expect(page.getByText("Zona scelta sulla mappa")).toBeVisible();
    await expect(search).toHaveCount(0);
  });

  test("«Rimuovi filtri» also clears the map area", async ({ page }) => {
    await openMap(page, "quando=weekend&area=9.63,45.68,9.69,45.715");
    await page.getByRole("button", { name: "Rimuovi filtri" }).click();
    await expect(page.getByText("Zona scelta sulla mappa")).toHaveCount(0);
    await expect(mapCount(page)).toContainText("5 attività sulla mappa");
  });
});

test.describe("geolocation (only on click, never stored)", () => {
  test("granted inside the demo area: nearby results, no coordinates in URL or storage", async ({ page, context }) => {
    await context.grantPermissions(["geolocation"]);
    await context.setGeolocation({ latitude: 45.6961, longitude: 9.6682 });
    const geoCalls: string[] = [];
    await page.exposeFunction("__geoCalled", (name: string) => geoCalls.push(name));
    await page.addInitScript(() => {
      const original = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
      navigator.geolocation.getCurrentPosition = (...args) => {
        (window as unknown as { __geoCalled: (n: string) => void }).__geoCalled("getCurrentPosition");
        return original(...args);
      };
    });
    await openMap(page);
    expect(geoCalls).toEqual([]); // not requested on page load

    await page.getByRole("button", { name: "Usa la mia posizione" }).click();
    await expect(page.getByText("Mostriamo le attività entro circa 2 km da te.")).toBeVisible();
    await expect(page.getByText("Vicino alla tua posizione")).toBeVisible();
    await expect(mapCount(page)).toHaveText("2 attività sulla mappa");
    expect(geoCalls).toEqual(["getCurrentPosition"]);
    await expect(page).not.toHaveURL(/area=|45\.69|9\.66/);
    const stored = await page.evaluate(() => JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }) + document.cookie);
    expect(stored).not.toMatch(/45\.6|9\.66/);
  });

  test("outside the demo area: explained, results unchanged", async ({ page, context }) => {
    await context.grantPermissions(["geolocation"]);
    await context.setGeolocation({ latitude: 41.9028, longitude: 12.4964 });
    await openMap(page);
    await page.getByRole("button", { name: "Usa la mia posizione" }).click();
    await expect(page.getByText("Sei fuori dall'area DEMO di Bergamo")).toBeVisible();
    await expect(mapCount(page)).toHaveText("4 attività sulla mappa");
  });

  test("denied: explained, manual zone still available", async ({ page }) => {
    await openMap(page);
    await page.getByRole("button", { name: "Usa la mia posizione" }).click();
    await expect(page.getByText(/Permesso di posizione negato/)).toBeVisible();
    await page.getByLabel("Zona DEMO").selectOption("sarnico-iseo");
    await expect(mapCount(page)).toHaveText("2 attività sulla mappa");
  });
});

test.describe("fallbacks", () => {
  test("WebGL disabled: honest message and a working list", async ({ page }) => {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
        if (type.startsWith("webgl")) return null;
        return (original as (...a: unknown[]) => RenderingContext | null).call(this, type, ...rest);
      } as typeof HTMLCanvasElement.prototype.getContext;
    });
    await page.goto("/?vista=mappa");
    await expect(page.getByText(/WebGL disattivato/)).toBeVisible();
    await page.getByRole("button", { name: "Mostra la lista" }).click();
    await expect(listItems(page)).toHaveCount(4);
  });

  test("failing tiles alone do not hide a working map", async ({ page }) => {
    await page.unrouteAll();
    await mockMapProvider(page, "tiles-down");
    await openMap(page);
    await page.waitForTimeout(2000);
    await expect(page.getByText("Il servizio della mappa non risponde")).toHaveCount(0);
    await expect(markers(page).first()).toBeVisible();
  });

  test("provider down: honest message and a working list", async ({ page }) => {
    await page.unrouteAll();
    await mockMapProvider(page, "down");
    await page.goto("/?vista=mappa");
    await expect(page.getByText("Il servizio della mappa non risponde in questo momento.")).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: "Mostra la lista" }).click();
    await expect(listItems(page)).toHaveCount(4);
  });
});

test.describe("responsive and accessibility", () => {
  for (const width of [320, 390, 1280]) {
    test(`map mode without horizontal overflow at ${width}px, preview fits`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await openMap(page, "quando=weekend&area=9.655,45.698,9.667,45.708");
      await mapRegion(page).getByRole("button", { name: /^Piccoli vasai/ }).click();
      const preview = page.getByRole("dialog", { name: "Anteprima attività" });
      await expect(preview).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      const map = await mapRegion(page).boundingBox();
      const sheet = await preview.boundingBox();
      if (!map || !sheet) throw new Error("missing boxes");
      expect(sheet.x).toBeGreaterThanOrEqual(map.x - 1);
      expect(sheet.x + sheet.width).toBeLessThanOrEqual(map.x + map.width + 1);
      if (width < 640) {
        // Mobile: full-width map and a bottom sheet.
        expect(map.width).toBeGreaterThanOrEqual(width - 1);
        expect(map.y + map.height - (sheet.y + sheet.height)).toBeLessThanOrEqual(40); // docked at the bottom
      }
      // Attribution stays visible and uncovered while the preview is open.
      const attribution = mapRegion(page).getByText("© OpenStreetMap contributors");
      await expect(attribution).toBeInViewport();
      const attr = await attribution.boundingBox();
      if (!attr) throw new Error("attribution missing");
      const overlaps = attr.y < sheet.y + sheet.height && attr.y + attr.height > sheet.y && attr.x < sheet.x + sheet.width && attr.x + attr.width > sheet.x;
      expect(overlaps).toBe(false);
    });
  }

  test("axe: no WCAG A/AA violations in map mode", async ({ page }) => {
    await openMap(page, "quando=weekend");
    const scan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(scan.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
  });
});
