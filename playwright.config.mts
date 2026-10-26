import { defineConfig, devices } from "@playwright/test";

const PORT = 3200;

/**
 * E2E against a production build with the DEMO clock pinned to
 * Friday 23 October 2026, 10:00 Europe/Rome (weekend crosses the DST change).
 * Locally it uses the installed Google Chrome (channel "chrome"): no browser download.
 * CI sets PLAYWRIGHT_CHANNEL=chromium after `npx playwright install chromium`.
 */
const channel = process.env.PLAYWRIGHT_CHANNEL ?? "chrome";
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chrome", use: { ...devices["Desktop Chrome"], channel } }],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
    // Fake public key: tests intercept api.maptiler.com, so no request leaves the machine.
    env: { KESIFA_DEMO_NOW: "2026-10-23T08:00:00.000Z", MAPTILER_PUBLIC_KEY: "e2eFakePublicKey" },
  },
});
