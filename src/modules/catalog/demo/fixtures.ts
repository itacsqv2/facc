/**
 * SYNTHETIC DEMO catalog (D009). Every organizer, venue, address, contact and
 * event below is invented; only the map geography is real (D018). Contacts use the reserved `.invalid` TLD so they can
 * never reach a real mailbox.
 *
 * Dates are generated deterministically from an injected reference instant, so
 * the demo never goes stale and server/client always agree for one response.
 */
import { activeTerritory } from "@/config/territory";
import { addDays, localDateKey, weekendDays, zonedTimeToUtc, type DateKey } from "../time";
import type { Event, Occurrence, OccurrenceStatus, Organizer, Source, Venue } from "../types";
import { siteConfig } from "@/config/site";

const TZ = activeTerritory.timeZone;

export const demoSource: Source = {
  id: "demo-synthetic",
  kind: "demo_synthetic",
  label: `Dati sintetici ${siteConfig.name} (DEMO)`,
  lastConfirmedAt: null,
};

export const demoOrganizers: Organizer[] = [
  { id: "org-famiglie", name: "Associazione Famiglie Esempio (DEMO)", contact: "info@famiglie-esempio.invalid", isDemo: true },
  { id: "org-biblioteca", name: "Sala lettura Esempio (DEMO)", contact: "letture@sala-esempio.invalid", isDemo: true },
  { id: "org-natura", name: "Cooperativa Prova Natura (DEMO)", contact: "natura@prova.invalid", isDemo: true },
  { id: "org-musica", name: "Scuola di musica Fittizia (DEMO)", contact: "segreteria@musica-fittizia.invalid", isDemo: true },
  { id: "org-lago", name: "Circolo Lago Esempio (DEMO)", contact: "info@circolo-lago-esempio.invalid", isDemo: true },
];

/**
 * Venue names and addresses are invented. Coordinates are only INDICATIVE points
 * inside the real demo geography (Bergamo area and Lago d'Orta, see D018), chosen to look plausible
 * on a map; they do not identify any real business, school or institution.
 * One venue deliberately has no coordinates, to exercise the "not on the map" path.
 */
const fictionalAddress = (street: string, zone: string) => `${street} (indirizzo fittizio, posizione indicativa: ${zone})`;

export const demoVenues: Venue[] = [
  { id: "v-bottega", name: "Bottega Esempio", address: fictionalAddress("Via delle Prove 12", "Città Alta"), zoneId: "citta-alta-colli", timeZone: TZ, coordinates: [9.661, 45.7032] },
  { id: "v-orto", name: "Orto didattico Esempio", address: fictionalAddress("Strada dei Campi Finti 3", "Colli di Bergamo"), zoneId: "citta-alta-colli", timeZone: TZ, coordinates: [9.645, 45.7085] },
  { id: "v-parco", name: "Parco dei Castagni Finti", address: fictionalAddress("Ingresso di Via del Bosco 1", "Colli di Bergamo"), zoneId: "citta-alta-colli", timeZone: TZ, coordinates: [9.652, 45.706] },
  { id: "v-biblioteca", name: "Sala lettura Esempio", address: fictionalAddress("Piazza Immaginaria 1", "Bergamo bassa"), zoneId: "bergamo-bassa", timeZone: TZ, coordinates: [9.668, 45.696] },
  { id: "v-auditorium", name: "Sala Prova Musica", address: fictionalAddress("Via dei Suoni 8", "Bergamo bassa"), zoneId: "bergamo-bassa", timeZone: TZ, coordinates: [9.6735, 45.6925] },
  { id: "v-palestra", name: "Palestra Esempio", address: "Viale dello Sport 20 (indirizzo fittizio, posizione non disponibile)", zoneId: "bergamo-bassa", timeZone: TZ, coordinates: null },
  { id: "v-lungolago", name: "Lungolago Esempio", address: fictionalAddress("Passeggiata a lago", "Sarnico"), zoneId: "sarnico-iseo", timeZone: TZ, coordinates: [9.9625, 45.6695] },
  { id: "v-museo", name: "Museo del Gioco Esempio", address: fictionalAddress("Via dei Balocchi 5", "Sarnico"), zoneId: "sarnico-iseo", timeZone: TZ, coordinates: [9.958, 45.6672] },
  { id: "v-piazza", name: "Piazzetta Esempio", address: fictionalAddress("Piazzetta Esempio", "Sarnico"), zoneId: "sarnico-iseo", timeZone: TZ, coordinates: [9.9605, 45.6685] },
  // Lago d'Orta (Piedmont): invented names, indicative points around the lake.
  { id: "v-orta-piazza", name: "Piazzetta del Lago Esempio", address: fictionalAddress("Piazzetta del Lago", "Orta San Giulio"), zoneId: "lago-orta", timeZone: TZ, coordinates: [8.4062, 45.7972] },
  { id: "v-orta-vicoli", name: "Corte dei Vicoli Esempio", address: fictionalAddress("Vicolo delle Prove 4", "Orta San Giulio"), zoneId: "lago-orta", timeZone: TZ, coordinates: [8.4078, 45.7990] },
  { id: "v-orta-bosco", name: "Bosco sopra il Lago Esempio", address: fictionalAddress("Sentiero del Bosco", "colline di Orta"), zoneId: "lago-orta", timeZone: TZ, coordinates: [8.4115, 45.8045] },
  { id: "v-omegna-lungolago", name: "Lungolago Nord Esempio", address: fictionalAddress("Passeggiata a lago", "Omegna"), zoneId: "lago-orta", timeZone: TZ, coordinates: [8.4072, 45.8752] },
  { id: "v-omegna-piazza", name: "Piazza del Mercatino Esempio", address: fictionalAddress("Piazza del Baratto 1", "Omegna"), zoneId: "lago-orta", timeZone: TZ, coordinates: [8.4045, 45.8790] },
  { id: "v-pettenasco-pontile", name: "Pontile Esempio", address: fictionalAddress("Pontile dei Kayak", "Pettenasco"), zoneId: "lago-orta", timeZone: TZ, coordinates: [8.4105, 45.8185] },
  { id: "v-pella-riva", name: "Riva Ovest Esempio", address: fictionalAddress("Riva del Tramonto", "Pella"), zoneId: "lago-orta", timeZone: TZ, coordinates: [8.3852, 45.7978] },
  { id: "v-gozzano-sala", name: "Sala Mostre Esempio", address: fictionalAddress("Via delle Barchette 7", "Gozzano"), zoneId: "lago-orta", timeZone: TZ, coordinates: [8.4342, 45.7468] },
  { id: "v-ameno-prato", name: "Prato delle Lucciole Esempio", address: fictionalAddress("Prato Grande", "Ameno"), zoneId: "lago-orta", timeZone: TZ, coordinates: [8.4405, 45.7885] },
  { id: "v-sanmaurizio-sala", name: "Saletta Musica Esempio", address: fictionalAddress("Via dei Rubinetti 2", "San Maurizio d'Opaglio"), zoneId: "lago-orta", timeZone: TZ, coordinates: [8.3958, 45.7722] },
];

type EventSeed = Omit<Event, "id" | "sourceId" | "isDemo"> & { id: string };

const events: EventSeed[] = [
  {
    id: "ev-ceramica",
    slug: "demo-piccoli-vasai-laboratorio-ceramica",
    title: "Piccoli vasai: laboratorio di ceramica",
    summary: "Modellare l'argilla e decorare una ciotola da portare a casa.",
    description:
      "Un'ora e mezza al tornio e al tavolo da decoro, in gruppi piccoli. Grembiuli forniti; le ciotole si ritirano cotte la settimana successiva.",
    category: "laboratori",
    organizerId: "org-famiglie",
    age: { state: "range", min: 5, max: 10 },
    accessibility: "yes",
    price: { state: "PAID", amountCents: 800, basis: "exact", note: "Materiali inclusi" },
    booking: "required",
    bookingNote: "Massimo 12 bambini per turno.",
  },
  {
    id: "ev-storie",
    slug: "demo-storie-a-merenda-in-biblioteca",
    title: "Storie a merenda in biblioteca",
    summary: "Letture ad alta voce per i più piccoli, con merenda condivisa.",
    description: "Due lettrici volontarie leggono albi illustrati scelti per età prescolare. Ogni famiglia porta qualcosa da condividere.",
    category: "teatro",
    organizerId: "org-biblioteca",
    age: { state: "range", min: 3, max: 6 },
    accessibility: "yes",
    price: { state: "FREE" },
    booking: "not_required",
  },
  {
    id: "ev-erbe",
    slug: "demo-passeggiata-delle-erbe-spontanee",
    title: "Passeggiata delle erbe spontanee",
    summary: "Riconoscere foglie e profumi lungo un sentiero facile.",
    description:
      "Percorso ad anello di circa due ore con soste. L'organizzatore non ha indicato un'età consigliata né le condizioni del sentiero per passeggini e carrozzine.",
    category: "natura",
    organizerId: "org-natura",
    age: { state: "not_verified" },
    accessibility: "not_verified",
    price: { state: "FREE" },
    booking: "recommended",
  },
  {
    id: "ev-concerto",
    slug: "demo-concerto-per-famiglie-strumenti-in-gioco",
    title: "Concerto per famiglie: strumenti in gioco",
    summary: "Un quartetto presenta gli strumenti e fa suonare il pubblico.",
    description: "Concerto interattivo di un'ora. Il costo del biglietto non è stato comunicato dall'organizzatore.",
    category: "musica",
    organizerId: "org-musica",
    age: { state: "range", min: 4, max: 12 },
    accessibility: "yes",
    price: { state: "UNKNOWN" },
    booking: "not_verified",
  },
  {
    id: "ev-lanterne",
    slug: "demo-notte-delle-lanterne-sul-lungolago",
    title: "Notte delle lanterne sul lungolago",
    summary: "Passeggiata serale con lanterne di carta, fino a dopo mezzanotte.",
    description: "Ritrovo sul lungolago, accensione delle lanterne e breve racconto delle stelle. L'evento termina dopo la mezzanotte.",
    category: "natura",
    organizerId: "org-famiglie",
    age: { state: "range", min: 6, max: null },
    accessibility: "not_verified",
    price: { state: "FREE" },
    booking: "not_required",
  },
  {
    id: "ev-giocattoli",
    slug: "demo-mostra-dei-giocattoli-di-latta",
    title: "Mostra dei giocattoli di latta",
    summary: "Trottole, treni e automobiline di un secolo fa, alcune da provare.",
    description: "Esposizione aperta tutto il giorno con un angolo gioco per i più piccoli.",
    category: "musei",
    organizerId: "org-famiglie",
    age: { state: "all_ages" },
    accessibility: "yes",
    price: { state: "PAID", amountCents: 400, basis: "exact", note: "Intero 4 €, ridotto bambini 2 €" },
    booking: "not_required",
  },
  {
    id: "ev-burattini",
    slug: "demo-burattini-in-piazza",
    title: "Burattini in piazza",
    summary: "Spettacolo all'aperto di una compagnia di burattinai.",
    description: "Quaranta minuti di spettacolo. Pavimentazione in ciottoli, senza percorso dedicato per carrozzine.",
    category: "teatro",
    organizerId: "org-famiglie",
    age: { state: "range", min: 3, max: 8 },
    accessibility: "no",
    price: { state: "FREE" },
    booking: "not_required",
  },
  {
    id: "ev-minivolley",
    slug: "demo-mini-volley-aperto-a-tutti",
    title: "Mini volley aperto a tutti",
    summary: "Allenamento di prova con istruttori, palloni forniti.",
    description: "Portare scarpe da ginnastica pulite. Contributo per l'uso della palestra, che varia con la durata scelta.",
    category: "sport",
    organizerId: "org-famiglie",
    age: { state: "range", min: 8, max: 14 },
    accessibility: "yes",
    price: { state: "PAID", amountCents: 300, basis: "from", note: "Contributo variabile secondo la durata" },
    booking: "required",
  },
  {
    id: "ev-orto",
    slug: "demo-semina-d-autunno-nell-orto-didattico",
    title: "Semina d'autunno nell'orto didattico",
    summary: "Preparare le aiuole e seminare fave e piselli.",
    description: "Data in attesa di conferma da parte dell'organizzatore.",
    category: "natura",
    organizerId: "org-natura",
    age: { state: "range", min: 4, max: 10 },
    accessibility: "not_verified",
    price: { state: "PAID", amountCents: 600, basis: "exact" },
    booking: "required",
  },
  {
    id: "ev-castagne",
    slug: "demo-festa-della-castagna",
    title: "Festa della castagna",
    summary: "Caldarroste e giochi tradizionali al parco.",
    description: "Edizione già conclusa, mantenuta per mostrare lo stato «terminato».",
    category: "natura",
    organizerId: "org-natura",
    age: { state: "all_ages" },
    accessibility: "not_verified",
    price: { state: "FREE" },
    booking: "not_required",
  },
  {
    id: "ev-coro",
    slug: "demo-prove-aperte-del-coro-dei-ragazzi",
    title: "Prove aperte del coro dei ragazzi",
    summary: "Assistere a una prova e provare qualche esercizio di voce.",
    description: "Prova aperta alle famiglie interessate a iscrivere i figli.",
    category: "musica",
    organizerId: "org-musica",
    age: { state: "range", min: 10, max: 14 },
    accessibility: "yes",
    price: { state: "FREE" },
    booking: "required",
  },
  {
    id: "ev-luci",
    slug: "demo-sentiero-delle-luci-nel-parco",
    title: "Sentiero delle luci nel parco",
    summary: "Installazione luminosa all'aperto, visitabile senza interruzioni per più giorni.",
    description: "Percorso libero tra lanterne e proiezioni, aperto anche di notte dal giovedì alla domenica sera.",
    category: "natura",
    organizerId: "org-natura",
    age: { state: "all_ages" },
    accessibility: "not_verified",
    price: { state: "FREE" },
    booking: "not_required",
  },
  // --- Lago d'Orta (DEMO) ---
  {
    id: "ev-orta-storie",
    slug: "demo-storie-sul-lungolago",
    title: "Storie sul lungolago",
    summary: "Letture ad alta voce in riva al lago, sedute sul prato.",
    description: "Due lettori volontari leggono albi illustrati per i più piccoli. Portare un telo per sedersi.",
    category: "teatro",
    organizerId: "org-lago",
    age: { state: "range", min: 3, max: 7 },
    accessibility: "yes",
    price: { state: "FREE" },
    booking: "not_required",
  },
  {
    id: "ev-orta-acquerello",
    slug: "demo-acquerello-en-plein-air",
    title: "Acquerello en plein air",
    summary: "Dipingere il lago dal vero, con colori e fogli forniti.",
    description: "Laboratorio a ingresso libero durante la giornata: ci si ferma il tempo che si vuole. Materiali inclusi.",
    category: "laboratori",
    organizerId: "org-lago",
    age: { state: "range", min: 6, max: 12 },
    accessibility: "yes",
    price: { state: "PAID", amountCents: 1000, basis: "exact", note: "Materiali inclusi" },
    booking: "recommended",
  },
  {
    id: "ev-orta-mostra",
    slug: "demo-mostra-di-barche-in-miniatura",
    title: "Mostra di barche in miniatura",
    summary: "Modellini di barche del lago, alcuni da far galleggiare in vasca.",
    description: "Esposizione con un angolo gioco per i più piccoli.",
    category: "musei",
    organizerId: "org-lago",
    age: { state: "all_ages" },
    accessibility: "yes",
    price: { state: "PAID", amountCents: 300, basis: "exact", note: "Gratis sotto i 6 anni" },
    booking: "not_required",
  },
  {
    id: "ev-orta-merenda",
    slug: "demo-merenda-musicale-per-piccolissimi",
    title: "Merenda musicale per piccolissimi",
    summary: "Canzoni, strumenti a percussione e una merenda insieme.",
    description: "Incontro breve pensato per bambini sotto i 3 anni con un adulto.",
    category: "musica",
    organizerId: "org-musica",
    age: { state: "range", min: 0, max: 3 },
    accessibility: "yes",
    price: { state: "FREE" },
    booking: "required",
    bookingNote: "Massimo 10 coppie adulto-bambino.",
  },
  {
    id: "ev-orta-tesoro",
    slug: "demo-caccia-al-tesoro-tra-i-vicoli",
    title: "Caccia al tesoro tra i vicoli",
    summary: "Indizi da risolvere a squadre tra corti e scalinate.",
    description: "Squadre di famiglie, durata circa due ore. Scarpe comode consigliate.",
    category: "sport",
    organizerId: "org-lago",
    age: { state: "range", min: 6, max: 11 },
    accessibility: "no",
    price: { state: "FREE" },
    booking: "required",
  },
  {
    id: "ev-orta-concerto",
    slug: "demo-concerto-al-tramonto-sul-lago",
    title: "Concerto al tramonto sul lago",
    summary: "Musica acustica sulla riva ovest mentre il sole cala.",
    description: "Il costo del biglietto non è stato comunicato dall'organizzatore.",
    category: "musica",
    organizerId: "org-musica",
    age: { state: "all_ages" },
    accessibility: "not_verified",
    price: { state: "UNKNOWN" },
    booking: "not_verified",
  },
  {
    id: "ev-orta-lucciole",
    slug: "demo-notte-delle-lucciole",
    title: "Notte delle lucciole",
    summary: "Passeggiata serale guidata per osservare le lucciole nei prati.",
    description: "Si cammina al buio con torce a luce rossa. Portare una giacca.",
    category: "natura",
    organizerId: "org-natura",
    age: { state: "range", min: 5, max: null },
    accessibility: "not_verified",
    price: { state: "FREE" },
    booking: "required",
  },
  {
    id: "ev-orta-bosco",
    slug: "demo-passeggiata-nel-bosco-sopra-il-lago",
    title: "Passeggiata nel bosco sopra il lago",
    summary: "Sentiero facile con vista sull'isola e soste per giocare.",
    description: "Circa due ore e mezza. L'organizzatore non ha indicato un'età consigliata.",
    category: "natura",
    organizerId: "org-natura",
    age: { state: "not_verified" },
    accessibility: "not_verified",
    price: { state: "FREE" },
    booking: "recommended",
  },
  {
    id: "ev-orta-kayak",
    slug: "demo-kayak-per-famiglie",
    title: "Kayak per famiglie: prima prova",
    summary: "Mezz'ora in acqua con istruttore, giubbotti forniti.",
    description: "Prova in kayak doppio adulto-bambino. Il prezzo varia con la durata scelta.",
    category: "sport",
    organizerId: "org-lago",
    age: { state: "range", min: 8, max: 14 },
    accessibility: "no",
    price: { state: "PAID", amountCents: 1500, basis: "from", note: "Prezzo variabile secondo la durata" },
    booking: "required",
  },
  {
    id: "ev-orta-baratto",
    slug: "demo-mercatino-del-baratto-dei-giochi",
    title: "Mercatino del baratto dei giochi",
    summary: "I bambini scambiano giochi e libri che non usano più.",
    description: "Ogni bambino porta fino a cinque oggetti da scambiare.",
    category: "laboratori",
    organizerId: "org-lago",
    age: { state: "all_ages" },
    accessibility: "yes",
    price: { state: "FREE" },
    booking: "not_required",
  },
  {
    id: "ev-tesoro",
    slug: "demo-caccia-al-tesoro-nel-borgo",
    title: "Caccia al tesoro nel borgo",
    summary: "Bozza non pubblicata.",
    description: "Bozza: non deve mai comparire nelle pagine pubbliche.",
    category: "sport",
    organizerId: "org-famiglie",
    age: { state: "not_verified" },
    accessibility: "not_verified",
    price: { state: "UNKNOWN" },
    booking: "not_verified",
  },
];

/** Day anchors relative to the reference instant. */
type Anchor = "today" | "sat" | "sun" | { from: "today" | "sat"; days: number };

type OccurrenceSeed = {
  id: string;
  eventId: string;
  venueId: string;
  anchor: Anchor;
  start: string;
  end: string;
  /** End falls on the following calendar day (crosses midnight). */
  endsNextDay?: boolean;
  /** End day for multi-day occurrences. */
  endsOn?: Anchor;
  status: OccurrenceStatus;
};

const occurrences: OccurrenceSeed[] = [
  // Series: three dates of the same workshop, the Sunday one cancelled.
  { id: "occ-ceramica-1", eventId: "ev-ceramica", venueId: "v-bottega", anchor: "sat", start: "10:00", end: "11:30", status: "published" },
  { id: "occ-ceramica-2", eventId: "ev-ceramica", venueId: "v-bottega", anchor: "sun", start: "10:00", end: "11:30", status: "cancelled" },
  { id: "occ-ceramica-3", eventId: "ev-ceramica", venueId: "v-bottega", anchor: { from: "sat", days: 7 }, start: "10:00", end: "11:30", status: "published" },
  { id: "occ-storie-1", eventId: "ev-storie", venueId: "v-biblioteca", anchor: "today", start: "16:30", end: "17:30", status: "published" },
  { id: "occ-storie-2", eventId: "ev-storie", venueId: "v-biblioteca", anchor: { from: "today", days: 7 }, start: "16:30", end: "17:30", status: "published" },
  { id: "occ-storie-0", eventId: "ev-storie", venueId: "v-biblioteca", anchor: { from: "today", days: -7 }, start: "16:30", end: "17:30", status: "ended" },
  { id: "occ-erbe-1", eventId: "ev-erbe", venueId: "v-parco", anchor: "sun", start: "09:30", end: "11:30", status: "published" },
  { id: "occ-concerto-1", eventId: "ev-concerto", venueId: "v-auditorium", anchor: "sat", start: "17:00", end: "18:00", status: "published" },
  { id: "occ-lanterne-1", eventId: "ev-lanterne", venueId: "v-lungolago", anchor: "sat", start: "23:30", end: "00:30", endsNextDay: true, status: "published" },
  { id: "occ-giocattoli-1", eventId: "ev-giocattoli", venueId: "v-museo", anchor: "today", start: "10:00", end: "23:00", status: "published" },
  { id: "occ-giocattoli-2", eventId: "ev-giocattoli", venueId: "v-museo", anchor: { from: "today", days: 3 }, start: "10:00", end: "19:00", status: "published" },
  { id: "occ-burattini-1", eventId: "ev-burattini", venueId: "v-piazza", anchor: "today", start: "18:00", end: "18:40", status: "published" },
  { id: "occ-minivolley-1", eventId: "ev-minivolley", venueId: "v-palestra", anchor: "sun", start: "15:00", end: "16:30", status: "published" },
  { id: "occ-minivolley-2", eventId: "ev-minivolley", venueId: "v-palestra", anchor: { from: "sat", days: 3 }, start: "17:00", end: "18:30", status: "published" },
  { id: "occ-orto-1", eventId: "ev-orto", venueId: "v-orto", anchor: "sat", start: "15:00", end: "16:30", status: "needs_confirmation" },
  { id: "occ-castagne-1", eventId: "ev-castagne", venueId: "v-parco", anchor: { from: "today", days: -1 }, start: "15:00", end: "18:00", status: "published" },
  { id: "occ-coro-1", eventId: "ev-coro", venueId: "v-auditorium", anchor: { from: "today", days: 12 }, start: "18:00", end: "19:00", status: "published" },
  // Multi-day: from the Thursday before the weekend to Sunday evening, continuously.
  { id: "occ-luci-1", eventId: "ev-luci", venueId: "v-parco", anchor: { from: "sat", days: -2 }, start: "18:00", end: "23:00", endsOn: { from: "sat", days: 1 }, status: "published" },
  // Lago d'Orta: mostly today and this weekend, so they are easy to find.
  { id: "occ-orta-acquerello-1", eventId: "ev-orta-acquerello", venueId: "v-orta-piazza", anchor: "today", start: "10:00", end: "22:00", status: "published" },
  { id: "occ-orta-mostra-1", eventId: "ev-orta-mostra", venueId: "v-gozzano-sala", anchor: "today", start: "10:00", end: "19:00", status: "published" },
  { id: "occ-orta-storie-1", eventId: "ev-orta-storie", venueId: "v-omegna-lungolago", anchor: "today", start: "16:00", end: "17:00", status: "published" },
  { id: "occ-orta-merenda-1", eventId: "ev-orta-merenda", venueId: "v-sanmaurizio-sala", anchor: "today", start: "17:30", end: "18:15", status: "published" },
  { id: "occ-orta-mostra-2", eventId: "ev-orta-mostra", venueId: "v-gozzano-sala", anchor: "sat", start: "10:00", end: "19:00", status: "published" },
  { id: "occ-orta-tesoro-1", eventId: "ev-orta-tesoro", venueId: "v-orta-vicoli", anchor: "sat", start: "15:00", end: "17:00", status: "published" },
  { id: "occ-orta-concerto-1", eventId: "ev-orta-concerto", venueId: "v-pella-riva", anchor: "sat", start: "18:30", end: "19:45", status: "published" },
  { id: "occ-orta-lucciole-1", eventId: "ev-orta-lucciole", venueId: "v-ameno-prato", anchor: "sat", start: "21:00", end: "22:30", status: "published" },
  { id: "occ-orta-bosco-1", eventId: "ev-orta-bosco", venueId: "v-orta-bosco", anchor: "sun", start: "09:30", end: "12:00", status: "published" },
  { id: "occ-orta-kayak-1", eventId: "ev-orta-kayak", venueId: "v-pettenasco-pontile", anchor: "sun", start: "10:00", end: "12:00", status: "published" },
  { id: "occ-orta-baratto-1", eventId: "ev-orta-baratto", venueId: "v-omegna-piazza", anchor: "sun", start: "14:00", end: "18:00", status: "published" },
  { id: "occ-tesoro-1", eventId: "ev-tesoro", venueId: "v-parco", anchor: "sun", start: "11:00", end: "12:30", status: "draft" },
];

export type DemoDataset = {
  events: Event[];
  occurrences: Occurrence[];
  venues: Venue[];
  organizers: Organizer[];
  source: Source;
};

/** Builds the full synthetic dataset (drafts included) for a reference instant. */
export function buildDemoDataset(reference: Date): DemoDataset {
  const today = localDateKey(reference, TZ);
  const weekend = weekendDays(today);
  const sat = weekend[0] ?? today;
  const sun = weekend[weekend.length - 1] ?? today;

  const resolve = (anchor: Anchor): DateKey => {
    if (anchor === "today") return today;
    if (anchor === "sat") return sat;
    if (anchor === "sun") return sun;
    return addDays(anchor.from === "today" ? today : sat, anchor.days);
  };

  return {
    events: events.map((seed) => ({ ...seed, sourceId: demoSource.id, isDemo: true })),
    occurrences: occurrences.map((seed) => {
      const day = resolve(seed.anchor);
      return {
        id: seed.id,
        eventId: seed.eventId,
        venueId: seed.venueId,
        startsAt: zonedTimeToUtc(day, seed.start, TZ).toISOString(),
        endsAt: zonedTimeToUtc(seed.endsOn ? resolve(seed.endsOn) : seed.endsNextDay ? addDays(day, 1) : day, seed.end, TZ).toISOString(),
        timeZone: TZ,
        status: seed.status,
      };
    }),
    venues: demoVenues,
    organizers: demoOrganizers,
    source: demoSource,
  };
}
