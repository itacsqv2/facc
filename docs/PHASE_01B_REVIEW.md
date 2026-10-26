# Fase 01B - Discovery experience (solo DEMO): review

Data: 2026-10-23. Nessun commit, push o deploy.

## Differenze rispetto al prompt
- Il prompt `prompts/01B_discovery_experience.md` non esiste nella repo: è stato letto da `~/Downloads/kesifa_prompt_01B_discovery_experience.md`.
- Prima di iniziare `package.json` dichiarava `eslint-config-next@^14.2.35` (downgrade fatto dopo la 01A, presumibilmente con `npm audit fix --force`, non da questa sessione). Con la v14 `npm run lint` falliva (exit 2). Ripristinata `eslint-config-next@16.4.2`, allineata a `next@16.4.2`.
- `dynamicParams = false` non è compatibile con `cacheComponents`: per avere 404 reali sugli slug non pubblicabili si usa `src/proxy.ts`.
- Vitest 5 esclude Node 25 dai motori supportati: usata Vitest 4.1.12 (supporta Node 24 e 25).

## Cosa è stato costruito
- Catalogo DEMO subito visibile: hero ridotto, filtri Quando (Oggi / Questo weekend), zona DEMO (3 zone fittizie), categoria, costo, spesa massima, età; conteggio con annuncio `aria-live`, evidenza visiva al cambio, `Rimuovi filtri`, stato vuoto. Filtri sincronizzati nell'URL (`?quando=weekend&categoria=natura...`), validati lato server.
- Scheda `/eventi/[slug]?data=<occorrenza>`: quando (Europe/Rome), dove, per chi, costo, prenotazione, accessibilità, organizzatore e contatto fittizi, fonte sintetica, "Ultima conferma: Dato DEMO non verificato", altre date della serie con il loro stato. CTA: "Prenotazione non disponibile nella demo"; annullato: "Evento annullato", senza CTA.
- Preferiti in `localStorage` (`kesifa:saved:v1`, solo slug + id occorrenza), vista `/salvati` con stato aggiornato (annullato/terminato/non più disponibile) e messaggio se lo storage è bloccato.
- Condivisione: Web Share API se presente, altrimenti copia del link reale; messaggi di esito.
- 404 reale (HTTP 404) per slug inesistenti o con sole bozze. Tutte le pagine `noindex`, nessun JSON-LD.

## Regole di dominio (identiche in UI e test)
- **Oggi**: giorno di calendario corrente a Europe/Rome.
- **Questo weekend**: lun-ven → sabato e domenica successivi; sabato → sabato e domenica; domenica → solo domenica.
- **Appartenenza alla finestra**: l'occorrenza inizia in uno dei giorni della finestra, oppure è in corso adesso e oggi appartiene alla finestra (es. 23:30-00:30 vista alle 00:10).
- **Disponibile in catalogo**: solo `published` e non terminata (`endsAt > now`). Esclusi `draft` (mai fuori dal repository), `needs_confirmation`, `cancelled`, `ended`.
- **Ora legale**: ora ambigua → istante precedente; ora inesistente → spostata in avanti (come Temporal "compatible").
- **Prezzo `UNKNOWN`** non soddisfa "gratis", "a pagamento" né una spesa massima. **Età non indicata** non soddisfa una fascia d'età.
- Ordinamento: inizio, poi id occorrenza.

## Demo / reale
| Elemento | Stato |
|---|---|
| Eventi, luoghi, organizzatori, contatti (`.invalid`), zone | Fittizi, marcati DEMO su banner, card e scheda |
| Date | Generate in modo deterministico da un istante di riferimento (`KESIFA_DEMO_NOW` nei test, ora del server altrimenti) |
| Prenotazione, mappa, GPS, login, organizer | Non presenti / esplicitamente non disponibili |
| Preferiti e condivisione | Reali, solo nel browser |

## File
- Nuovi: `src/modules/catalog/{types,time,filters,format,repository,clock,index}.ts`, `src/modules/catalog/demo/{fixtures,demo-repository}.ts`, `src/modules/saved/{saved-items,use-saved}.ts`, `src/features/catalog/{catalog-explorer,catalog-section,event-card,category-visual}.tsx`, `src/features/event-detail/{event-detail-view,save-button,share-button}.tsx`, `src/features/saved/saved-list.tsx`, `src/app/eventi/[slug]/page.tsx`, `src/app/salvati/page.tsx`, `src/proxy.ts`, `vitest.config.mts`, `playwright.config.mts`, `tests/unit/{time,catalog,saved}.test.ts`, `tests/e2e/discovery.spec.ts`.
- Modificati: `src/app/page.tsx`, `src/app/globals.css`, `src/config/territory.ts`, `src/components/ui/badge.tsx`, `src/components/layout/{site-header,demo-banner}.tsx`, `src/features/discovery/{hero,demo-notice,how-it-works}.tsx`, `package.json`, `package-lock.json`, `.env.example`, `.gitignore`, `docs/BACKLOG.md`.
- Rimossi: `src/lib/dates.ts`, `src/features/discovery/{discovery-panel,event-card-anatomy}.tsx` (sostituiti dal catalogo reale).
- Riutilizzati dalla 01A: token, `Button`/`ButtonLink`, `Select`, `Card`, `Badge`, header/footer/banner/wordmark, 404, metadata.

## Test eseguiti (esiti reali)
| Comando | Esito |
|---|---|
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0 |
| `npm run build` | exit 0 |
| `npm test` (Vitest 4.1.12) | exit 0, 34/34 |
| `npm run test:e2e` (build + Playwright 1.64.1, Chrome locale `channel: "chrome"`) | exit 0, 14/14 |

E2E: percorso 390px home → weekend → categoria/costo → dettaglio → salva → ricarica → salvati → rimuovi; stato vuoto + `Rimuovi filtri`; condivisione con fallback copia; deep link; data annullata; 404 per slug inesistente e solo-bozza; `noindex` e assenza JSON-LD; nessun overflow a 320/390/1280 su 4 pagine; tastiera (skip link, focus visibile, toggle con Invio); axe WCAG 2.1 A/AA senza violazioni su home, scheda, salvati.

Difetti trovati dai test e corretti: `muted #65736B` sotto 4.5:1 su superfici sunken/soft (presente già in 01A) → `#5A685F`; card larghe 328px a 320px (badge `nowrap`); occorrenza fixture che cadeva nel weekend di venerdì.

## Riscontri visivi
Screenshot full-page catturati via Playwright a 320, 390, 1280 px (home con eventi, filtri applicati, stato vuoto, dettaglio, data annullata, salvati) e ispezionati: home 390/1280, annullato/salvati/vuoto 320. Non sono versionati nella repo. Limiti noti: a 320px la categoria lunga viene troncata nella card ("Natura e all'a…"); conteggio e `Rimuovi filtri` vanno a capo nello stato vuoto.

## Dipendenze vulnerabili
- `npm audit --omit=dev`: **0 vulnerabilità** (runtime pulito).
- `npm audit`: 5 "high", **solo sviluppo**: `eslint-config-next@16.4.2 > @next/eslint-plugin-next@16.4.2 > fast-glob@3.3.1 > micromatch@4.0.8 > braces@3.0.3` (GHSA-vfj7-8cjw-p6xm, DoS su pattern glob). Non esiste una versione corretta di `braces` (3.0.3 è l'ultima); l'unico fix proposto da npm è il downgrade incompatibile a v14, non applicato. Rischio: solo lint locale su pattern controllati dal progetto.
- `unrs-resolver` postinstall non approvato (npm 11 `allowScripts`): lint funziona comunque.

## Debito tecnico
- Lo stato di un parametro `?data=` inesistente su slug valido rende la 404 dentro lo streaming (HTTP 200 + `noindex`).
- Next 16 conserva la pagina precedente nascosta nel DOM: i test devono usare selettori precisi.
- `muted` modificato rispetto a `docs/UX.md`: da ratificare in D008 dal proprietario.
- La regola di sovrapposizione età (fascia richiesta ∩ fascia dichiarata) è permissiva: 6+ compare per 11-14 anni.
- Nessun test di carico/performance; Web Share nativo non testato (solo fallback copia); niente modalità scura.
- Repository DEMO rigenera il dataset a ogni chiamata (trascurabile ora, da sostituire con Postgres in Fase 02).
