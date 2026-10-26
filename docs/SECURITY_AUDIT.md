# FACC - security audit notes

## Exception E-001: GHSA-vfj7-8cjw-p6xm (braces), dev-only

| Field | Value |
|---|---|
| Advisory | [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), CVE-2026-93687, "braces vulnerable to stack-exhaustion denial of service through deeply nested patterns", severity high |
| Affected range / patch | `braces <= 3.0.3`; `first_patched_version: null`. Latest published `braces` is 3.0.3 (2024-05-21): no patched release exists |
| Advisory status | GitHub Advisory API (read 2026-10-23): **withdrawn** at 2026-10-23T12:53:02Z. `npm audit` still reports it on 2026-10-23 (registry not yet updated) |
| Installed path | `eslint-config-next@16.4.2 > @next/eslint-plugin-next@16.4.2 > fast-glob@3.3.1 > micromatch@4.0.8 > braces@3.0.3` (`npm ls braces`) |
| Runtime exposure | None: `npm audit --omit=dev` -> 0 vulnerabilities. Used only by ESLint to expand the project's own file globs |
| Risk surface | Local/CI lint on patterns written by the team. Exploitation needs attacker-controlled glob patterns |
| Rejected fixes | `npm audit fix --force` (downgrades `eslint-config-next` to 14.2.35: incompatible with Next 16, `npm run lint` exits 2); `overrides` to a non-existent version |
| Decision | Time-boxed exception, no generic audit silencing. CI gates `npm audit --omit=dev` only |
| Owner | Project owner |
| Review by | **2026-11-15**: remove the exception when `npm audit` stops reporting the withdrawn advisory or a patched `braces` / `fast-glob` lands upstream |

**Update 2026-10-23 (Phase 01D):** `npm audit` now reports **0 vulnerabilities** (exit 0) with `braces@3.0.3` still installed: the registry has applied the withdrawal. Exception E-001 can be closed by the owner at the 2026-11-15 review; no code change was needed.

## Install scripts
`npm install-scripts ls`: `unrs-resolver@1.12.2 (postinstall: node postinstall.js)` is not approved under npm 11 `allowScripts`. It has **not** been approved; `npm run lint` passes without it (exit 0, verified 2026-10-23). The script was not inspected or executed. Revisit only if lint resolution fails.

## Phase 01C threat model (DEMO discovery, no backend)

| Surface | Threat | Mitigation | Negative test | Residual risk | Owner |
|---|---|---|---|---|---|
| Home query string (`quando`, `zona`, `categoria`, `prezzo`, `max`, `eta`) | Injection, inconsistent state, unbounded values | Whitelist parsing to canonical values; unknown values -> defaults; client rewrites the URL to the canonical form; React escaping | Unit "malformed or malicious values"; e2e "invalid parameters are normalized away"; HTTP 200 on `?quando=%3Cscript%3E` | None known | Eng |
| `/eventi/[slug]?data=` | Enumeration of drafts, cross-event ids, soft-404 indexing | Single repository eligibility check before streaming; drafts never leave the repository; noindex everywhere | HTTP matrix: unknown, draft, foreign, empty, repeated `data` -> 404 | Phase 02 must keep the same check against the DB | Eng |
| `localStorage` bookmarks | Tampered/corrupt data, storage blocked, personal data | Strict id pattern, dedupe, 100-item cap, try/catch; stores only slug + occurrence id + timestamp (no location, no child data) | Unit corrupt/blocked storage; e2e unavailable bookmark | Shared device can see bookmarks (local by design) | Eng |
| Share | Leaking data to third parties | Web Share / clipboard of the page URL only; no external service | e2e clipboard fallback | Native share sheet untested | Eng |
| `FACC_DEMO_NOW` | Shifting dates of a real catalog | Honoured only for DEMO territory and strict UTC ISO | Unit `demo-clock.test.ts` | Misconfiguration in a demo deploy | Owner |
| Outbound links / booking | Fake purchase, phishing | No outbound booking links in DEMO; contacts use `.invalid` | e2e "Prenotazione non disponibile nella demo", no CTA on cancelled | Real links in Phase 02 need URL allow-listing | Eng |
| Map provider key (real key in .env.local, git-ignored, verified 2026-10-26) | Key abuse/quota theft | Public key only, resolved server-side, format-validated; must be restricted to site origins in MapTiler; no secret keys | Unit `resolveMapProvider` rejects malformed keys/ids | Quota cost if the restriction is not configured | Owner |
| Map tiles (third party) | Viewed area + IP disclosed to MapTiler | Map loads only in "Mappa" mode; disclosure under the map; no map requests in list mode | e2e "map loads lazily" | Needs privacy notice/processor review (D012) | Owner |
| Device position | Location history, leakage via URL/storage | Only on click, coarse, rounded, in memory; area from position never written to URL/storage | e2e geolocation granted/denied/outside, URL and storage checked | Browser permission UI is out of our control | Eng |
| `area=` URL param | Malformed/huge input | Strict pattern, length cap, valid ranges, must overlap territory, rounded | Unit `parseArea` negative cases | None known | Eng |
| Tracking / privacy | Analytics without legal basis | No analytics, cookies or trackers; no geolocation | Manual review (no network calls besides the app) | Privacy notice / legal review still open (D012) | Owner |
