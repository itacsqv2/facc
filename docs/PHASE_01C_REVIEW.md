# Fase 01C - Quality gate e product hardening: review

Data: 2026-10-23. Nessun commit, push o deploy. Validazione locale su **Node 25.8.1** (Node 24 non installato: compatibilità Node 24 **non verificata**, delegata alla CI non ancora eseguita).

## Note di contesto
- Il prompt `prompts/01C_quality_gate.md` non esiste nella repo: letto (senza estrarre) da `Downloads/facc_claude_starter_kit (3).zip` -> `prompts/facc_prompt_01C_quality_gate.md`. Anche `prompts/01B_discovery_experience.md` non è presente nella repo.
- Skill: `facc-ux` e `facc-security-privacy` applicate. `facc-review` ha `disable-model-invocation`: non invocabile dall'assistente; va lanciata dall'owner con `/facc-review`.

## Risultati P0 / P1
| # | Area | Pri | Esito | Correzione |
|---|---|---|---|---|
| A1 | Event/Occurrence, ciclo di vita | P0 | OK | Ciclo di vita documentato in `types.ts` e `DOMAIN_MODEL.md` (tabella stati x catalogo/URL/CTA/salvati) |
| A2 | Prezzo "da X €" | P0 | Corretto | `PAID.basis: "exact" | "from"`; etichetta "da 3 €" + nota in scheda; escluso dal budget |
| A3 | Prenotazione | P0 | Corretto | "consigliata" -> "Prenotazione facoltativa"; 4 stati distinti testati |
| A4 | DEMO in URL | P0 | Corretto | Slug `demo-*` (D015) |
| A5 | "Tutte le età" esplicito | P0 | Corretto | Stato `all_ages` (prima `range 0..null`); badge non più arancione come "non indicata" |
| B1 | Filtro età | P0 | Corretto | Da fasce con sovrapposizione (falsi positivi) a **età esatta del bambino** 0-17 (D013) |
| B2 | Budget | P0 | Corretto | Solo prezzi esatti; UNKNOWN e "da" esclusi; etichetta e spiegazione in UI |
| B3 | URL | P0 | Corretto | Parsing canonico (`05`, `4.5`, `-1`, `18` rifiutati); primo valore dei parametri ripetuti; URL riscritto in forma canonica |
| C1 | Finestre temporali | P0 | Corretto | Regola unica a sovrapposizione: in corso o futuri, multi-giorno inclusi (prima un evento multi-giorno spariva dal weekend) |
| C2 | `FACC_DEMO_NOW` | P0 | Corretto | Parser stretto, solo territorio DEMO (D016) |
| C3 | Stabilità identità/bookmark | P0 | OK | Test: id/slug/stati identici tra date diverse |
| D1 | HTTP 404 | P0 | Corretto | Rimosso `src/proxy.ts` (duplicava il catalogo); `cacheComponents`/`partialPrefetching` disattivati; un solo controllo in pagina (D014) |
| E1 | Layout 768px | P1 | Corretto | Filtri 2x2 a 768, 4 colonne da 1024 |
| E2 | Hero/DEMO/catalogo | P1 | OK | Primo risultato entro il primo schermo a 390x844 (test) |
| F1 | Test | P0 | Ampliati | Unit 34 -> 51; E2E 14 -> 38 |
| F2 | CI | P0 | Preparata | `.github/workflows/ci.yml` (Node 24, npm ci, typecheck, lint, unit, build, e2e Chromium, audit runtime). **Non eseguita** |
| G1 | Supply chain | P0 | Eccezione | `docs/SECURITY_AUDIT.md` E-001, riesame 2026-11-15 |

## Test eseguiti (esiti reali, ultima esecuzione)
| Comando | Exit | Esito |
|---|---|---|
| `npm run typecheck` | 0 | |
| `npm run lint` | 0 | |
| `npm run build` | 0 | tutte le route `ƒ` dinamiche tranne `/_not-found`, `/icon.svg` |
| `npm test` | 0 | 4 file, 51/51 |
| `npm run test:e2e` | 0 | 38/38 (Chrome locale, `PLAYWRIGHT_CHANNEL` default `chrome`) |
| `npm audit` | 1 | 5 high, tutti nella catena dev di `braces` |
| `npm audit --omit=dev` | 0 | 0 vulnerabilità |

## Matrice HTTP (curl su `next start`, build di produzione)
| URL | Status |
|---|---|
| `/` | 200 |
| `/?quando=weekend&categoria=natura` | 200 |
| `/?quando=<script>&eta=abc` | 200 (parametri ignorati) |
| `/salvati` | 200 |
| `/eventi/demo-burattini-in-piazza` | 200 |
| `/eventi/demo-burattini-in-piazza?data=occ-burattini-1` | 200 |
| `/eventi/demo-piccoli-vasai-laboratorio-ceramica?data=occ-ceramica-2` (annullato) | 200 |
| `/eventi/demo-festa-della-castagna` (terminato) | 200 |
| `/eventi/non-esiste` | 404 |
| `/eventi/burattini-in-piazza` (slug pre-01C) | 404 (test E2E con richiesta HTTP) |
| `/eventi/demo-caccia-al-tesoro-nel-borgo` (solo bozza) | 404 |
| `/eventi/demo-caccia-al-tesoro-nel-borgo?data=occ-tesoro-1` | 404 |
| `/eventi/demo-burattini-in-piazza?data=occ-inesistente` | 404 |
| `/eventi/demo-burattini-in-piazza?data=occ-storie-1` (occorrenza di altro evento) | 404 |
| `/eventi/demo-burattini-in-piazza?data=` | 404 |
| `/eventi/demo-burattini-in-piazza?data=occ-burattini-1&data=occ-storie-1` | 404 |
| `/pagina-a-caso` | 404 |

Tutte le risposte hanno `noindex`. Prima della correzione, con `cacheComponents` attivo, i casi 404 rispondevano **200** con `x-nextjs-postponed: 1` e corpo vuoto (404 solo lato client).

## Verifiche visive e accessibilità
- Screenshot full-page catturati via Playwright a 320, 390, 768, 1280 px per 8 viste (home, weekend + età 4, stato vuoto, dettaglio multi-giorno, dettaglio prezzo "da", data annullata, salvati con annullato, 404). Ispezionati manualmente: home 768 (prima e dopo correzione), weekend età 4 a 320, prezzo "da" a 390, weekend 768 dopo correzione. Gli altri sono stati catturati ma non tutti guardati uno per uno. Non versionati nella repo.
- Automatico: nessun overflow orizzontale a 320/390/768/1280 su 6 pagine; axe WCAG 2.1 A/AA senza violazioni su home, stato vuoto, dettaglio, dettaglio annullato, salvati; tastiera (skip link, focus visibile, toggle, card -> scheda con Invio); `aria-live` con il conteggio.
- Non verificato: screen reader reale (NVDA/VoiceOver), zoom 200%, Safari/Firefox, dispositivi fisici, modalità scura.

## Rischi residui
- I filtri e "Altri filtri" richiedono JavaScript (prima dell'idratazione i click non hanno effetto; il test lo gestisce con un retry).
- Nella lista weekend un evento multi-giorno mostra la data di inizio (es. "gio 22") nel badge; l'orario completo spiega "da giovedì 22 a domenica 25".
- Disattivare `cacheComponents` rinuncia alla static shell: impatto prestazioni non misurato.
- CI mai eseguita; Node 24 non verificato.

## Decisioni richieste all'owner
D013 (semantica finestre/età/budget/prenotazione), D014 (404 reali disattivando `cacheComponents`), D015 (slug `demo-`), D016 (orologio DEMO), D017 (eccezione advisory dev-only). D008 aggiornata con `#5A685F` come richiesto dal prompt 01C.

## Checklist test manuali con genitori reali (da svolgere; nessun risultato disponibile)
Condizioni: smartphone del partecipante, link alla demo, nessun aiuto durante il compito; annotare tempo, errori, frasi testuali. **Non sono state svolte interviste: nessun esito è riportato.**
1. "Trova un'attività per questo weekend adatta a un bambino di 4 anni." Successo: apre una scheda compatibile (es. età dichiarata che include 4 o "tutte le età").
2. "Trova un evento gratuito." Successo: usa "Solo gratis" o riconosce il badge "Gratis" senza confonderlo con "Prezzo da verificare".
3. "Quanto costa il concerto per famiglie?" Successo: spiega con parole sue che il prezzo non è noto e non è gratis.
4. "Il laboratorio di ceramica di domenica si può ancora fare?" Successo: riconosce "Evento annullato" e trova un'altra data.
5. "Salva un'attività, chiudi il browser e ritrovala." Successo: la ritrova in "Salvati" sullo stesso dispositivo e capisce che non è sincronizzata altrove.
