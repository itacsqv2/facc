import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Server clock is pinned (playwright.config.mts) to Friday 23 Oct 2026, 10:00 Europe/Rome.

// Direct children only: cards contain their own nested badge lists.
const results = (page: Page) => page.getByRole("list", { name: "Risultati" }).locator(":scope > li");

async function openMoreFiltersIfCollapsed(page: Page) {
  // The catalog streams in after the page shell: wait for it before deciding anything.
  await expect(page.getByRole("form", { name: "Filtra le attività" })).toBeVisible();
  const toggle = page.getByRole("button", { name: /Altri filtri|Nascondi filtri/ });
  if (!(await toggle.isVisible())) return; // desktop: filters always shown
  // Wait until React has hydrated the button (it then carries React props), then click once.
  // Retrying clicks is wrong: React replays a pre-hydration click, so a retry would close it again.
  await toggle.evaluate((el) =>
    new Promise<void>((resolve) => {
      const ready = () => Object.keys(el).some((key) => key.startsWith("__reactProps"));
      const tick = () => (ready() ? resolve() : requestAnimationFrame(tick));
      tick();
    }),
  );
  if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
}

test.describe("mobile discovery flow (390px)", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("home -> weekend -> filters -> detail -> save -> reload -> saved list -> remove", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Modalità DEMO").first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "In programma oggi" })).toBeVisible();
    await expect(results(page)).toHaveCount(4);

    const weekend = page.getByRole("button", { name: /Questo weekend/ });
    await weekend.click();
    await expect(weekend).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("heading", { level: 2, name: "In programma questo weekend" })).toBeVisible();
    await expect(results(page)).toHaveCount(6);
    await expect(page.locator('[aria-live="polite"]')).toHaveText("6 attività questo weekend");

    await openMoreFiltersIfCollapsed(page);
    await page.getByLabel("Categoria").selectOption("natura");
    await page.getByLabel("Costo").selectOption("free");
    await expect(results(page)).toHaveCount(3);
    await expect(page).toHaveURL(/quando=weekend/);
    await expect(page).toHaveURL(/categoria=natura/);

    // Every card is marked DEMO.
    await expect(results(page).getByText("DEMO", { exact: true })).toHaveCount(3);

    await page.getByRole("link", { name: "Notte delle lanterne sul lungolago" }).click();
    await expect(page).toHaveURL(/\/eventi\/demo-notte-delle-lanterne-sul-lungolago\?data=occ-lanterne-1$/);
    await expect(page.getByRole("heading", { level: 1, name: "Notte delle lanterne sul lungolago" })).toBeVisible();
    await expect(page.getByText("Evento dimostrativo – dati fittizi")).toBeVisible();
    await expect(page.getByText("sabato 24 ottobre, 23:30–00:30 (domenica 25)")).toBeVisible();
    await expect(page.getByText("Prenotazione non disponibile nella demo")).toBeVisible();
    await expect(page.getByText("Dato DEMO non verificato")).toBeVisible();

    await page.getByRole("button", { name: /Salva «Notte delle lanterne/ }).click();
    await expect(page.getByRole("button", { name: /Rimuovi «Notte delle lanterne/ })).toHaveAttribute("aria-pressed", "true");

    await page.reload();
    await expect(page.getByRole("button", { name: /Rimuovi «Notte delle lanterne/ })).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("navigation", { name: "Principale" }).getByRole("link", { name: "Salvati" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Salvati" })).toBeVisible();
    const saved = page.getByRole("list", { name: "Attività salvate" }).locator(":scope > li");
    await expect(saved).toHaveCount(1);
    await page.getByRole("button", { name: /Rimuovi «Notte delle lanterne sul lungolago» dai salvati/ }).click();
    await expect(page.getByText("Non hai ancora salvato nulla")).toBeVisible();
  });

  test("exact child age: weekend for a 4-year-old shows only declared-compatible activities", async ({ page }) => {
    await page.goto("/?quando=weekend");
    await openMoreFiltersIfCollapsed(page);
    await page.getByLabel("Età del bambino").selectOption("4");
    await expect(results(page)).toHaveCount(2);
    await expect(results(page).getByRole("link")).toHaveText(["Sentiero delle luci nel parco", "Concerto per famiglie: strumenti in gioco"]);
    await expect(page).toHaveURL(/eta=4/);
  });

  test("empty combination shows explanation and «Rimuovi filtri» restores results", async ({ page }) => {
    await page.goto("/?quando=weekend&categoria=musei");
    await expect(page.getByRole("heading", { name: "Nessuna attività con questi filtri" })).toBeVisible();
    await page.getByRole("button", { name: "Rimuovi filtri" }).last().click();
    await expect(results(page)).toHaveCount(6);
    await expect(page).toHaveURL(/\/\?quando=weekend$/);
  });

  test("copied search link rebuilds the same state; invalid parameters are normalized away", async ({ page }) => {
    await page.goto("/?quando=weekend&zona=citta-alta-colli&categoria=natura&prezzo=gratis&eta=4");
    await expect(results(page)).toHaveCount(1);
    await expect(page.getByLabel("Zona DEMO")).toHaveValue("citta-alta-colli");

    await page.goto("/?quando=weekend&eta=04&max=7&zona=%3Cscript%3E&categoria=x");
    await expect(results(page)).toHaveCount(6);
    await expect(page).toHaveURL(/\/\?quando=weekend$/);
  });

  test("share falls back to copying the real page URL", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.addInitScript(() => {
      // Force the clipboard fallback even where the Web Share API exists.
      Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    });
    await page.goto("/eventi/demo-burattini-in-piazza?data=occ-burattini-1");
    await page.getByRole("button", { name: "Condividi" }).click();
    await expect(page.getByText("Link copiato negli appunti.")).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toMatch(/\/eventi\/demo-burattini-in-piazza\?data=occ-burattini-1$/);
  });
});

test.describe("deep links and status pages", () => {
  test("direct link to a DEMO detail works and lists other dates with their status", async ({ page }) => {
    const response = await page.goto("/eventi/demo-storie-a-merenda-in-biblioteca");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: "Storie a merenda in biblioteca" })).toBeVisible();
    await expect(page.getByText("Altre date di questa attività")).toBeVisible();
    await expect(page.getByText("Evento terminato").first()).toBeVisible();
  });

  test("cancelled date shows the cancellation and no participation CTA; saved list flags it", async ({ page }) => {
    await page.goto("/eventi/demo-piccoli-vasai-laboratorio-ceramica?data=occ-ceramica-2");
    await expect(page.getByText("Evento annullato").first()).toBeVisible();
    await expect(page.getByText("Questa data è stata annullata dall'organizzatore.")).toBeVisible();
    await expect(page.getByText("Prenotazione non disponibile nella demo")).toHaveCount(0);
    await expect(page.getByRole("link", { name: /sabato 31 ottobre/ })).toBeVisible();

    await page.getByRole("button", { name: /Salva «Piccoli vasai/ }).click();
    await expect(page.getByRole("button", { name: /Rimuovi «Piccoli vasai/ })).toBeVisible();
    await page.goto("/salvati");
    const card = page.getByRole("list", { name: "Attività salvate" }).locator(":scope > li").first();
    await expect(card.getByText("Evento annullato")).toBeVisible();
  });

  test("bookmark of an id that no longer exists is shown as unavailable and removable", async ({ page }) => {
    await page.goto("/salvati");
    await page.evaluate(() =>
      localStorage.setItem(
        "facc:saved:v1",
        JSON.stringify([{ slug: "burattini-in-piazza", occurrenceId: "occ-burattini-1", savedAt: "2026-10-22T08:00:00.000Z" }]),
      ),
    );
    await page.reload();
    await expect(page.getByText("Attività non più disponibile")).toBeVisible();
    await page.getByRole("button", { name: "Rimuovi dai salvati" }).click();
    await expect(page.getByText("Non hai ancora salvato nulla")).toBeVisible();
  });

  test("DEMO pages are noindex and carry no event structured data", async ({ page }) => {
    await page.goto("/eventi/demo-burattini-in-piazza");
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
  });

  test("404 page is rendered for an unknown event", async ({ page }) => {
    const response = await page.goto("/eventi/non-esiste");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Questa pagina non esiste" })).toBeVisible();
  });
});

test.describe("HTTP status matrix (real requests, no browser)", () => {
  const cases: Array<[string, number]> = [
    ["/", 200],
    ["/?quando=weekend&categoria=natura&eta=4", 200],
    ["/?quando=%3Cscript%3E&eta=abc", 200],
    ["/salvati", 200],
    ["/eventi/demo-burattini-in-piazza", 200],
    ["/eventi/demo-burattini-in-piazza?data=occ-burattini-1", 200],
    ["/eventi/demo-piccoli-vasai-laboratorio-ceramica?data=occ-ceramica-2", 200], // cancelled, still viewable
    ["/eventi/demo-festa-della-castagna", 200], // ended, still viewable
    ["/eventi/non-esiste", 404],
    ["/eventi/burattini-in-piazza", 404], // pre-01C slug without demo- prefix
    ["/eventi/demo-caccia-al-tesoro-nel-borgo", 404], // draft only
    ["/eventi/demo-caccia-al-tesoro-nel-borgo?data=occ-tesoro-1", 404],
    ["/eventi/demo-burattini-in-piazza?data=occ-inesistente", 404],
    ["/eventi/demo-burattini-in-piazza?data=occ-storie-1", 404], // occurrence of another event
    ["/eventi/demo-burattini-in-piazza?data=", 404],
    ["/eventi/demo-burattini-in-piazza?data=occ-burattini-1&data=occ-storie-1", 404],
    ["/pagina-a-caso", 404],
  ];
  for (const [path, status] of cases) {
    test(`${status} ${path}`, async ({ request }) => {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status()).toBe(status);
      if (status === 404) expect(await response.text()).toContain("noindex");
    });
  }
});

test.describe("layout and accessibility", () => {
  const pages = [
    "/",
    "/?quando=weekend",
    "/?quando=weekend&categoria=musei",
    "/eventi/demo-sentiero-delle-luci-nel-parco",
    "/eventi/demo-piccoli-vasai-laboratorio-ceramica?data=occ-ceramica-2",
    "/salvati",
  ];

  for (const width of [320, 390, 768, 1280]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of pages) {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `${path} at ${width}px`).toBeLessThanOrEqual(0);
      }
    });
  }

  test("results list starts within the first mobile screen", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const top = await results(page).first().evaluate((el) => el.getBoundingClientRect().top);
    expect(top).toBeLessThan(844);
  });

  test("keyboard: skip link first, visible focus, day toggle and card link operable", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Vai al contenuto" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();

    const weekend = page.getByRole("button", { name: /Questo weekend/ });
    for (let i = 0; i < 15 && !(await weekend.evaluate((el) => el === document.activeElement)); i++) {
      await page.keyboard.press("Tab");
    }
    await expect(weekend).toBeFocused();
    expect(await weekend.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe("none");
    await page.keyboard.press("Enter");
    await expect(weekend).toHaveAttribute("aria-pressed", "true");

    const firstCard = results(page).first().getByRole("link");
    for (let i = 0; i < 25 && !(await firstCard.evaluate((el) => el === document.activeElement)); i++) {
      await page.keyboard.press("Tab");
    }
    await expect(firstCard).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sentiero delle luci nel parco");
  });

  for (const path of [
    "/",
    "/?quando=weekend&categoria=musei",
    "/eventi/demo-concerto-per-famiglie-strumenti-in-gioco",
    "/eventi/demo-piccoli-vasai-laboratorio-ceramica?data=occ-ceramica-2",
    "/salvati",
  ]) {
    test(`axe: no WCAG A/AA violations on ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      expect(scan.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    });
  }
});
