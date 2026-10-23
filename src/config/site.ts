/**
 * Site-wide configuration. FACC is a provisional working name (D008).
 */
export const siteConfig = {
  name: "FACC",
  tagline: "Attività vicine, verificate, per oggi e per il weekend",
  description:
    "FACC ti aiuta a scegliere attività per famiglie e cultura vicino a te, con data, luogo, prezzo e prenotazione chiari. Versione dimostrativa con dati fittizi.",
  locale: "it_IT",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;
