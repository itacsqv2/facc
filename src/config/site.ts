/**
 * Site-wide configuration. The product name is a provisional working name (D008)
 * and is configurable: NEXT_PUBLIC_APP_NAME (inlined at build time, so changing it
 * needs a rebuild/redeploy). Invalid or empty values fall back to the default.
 */
export const DEFAULT_APP_NAME = "Kesifa";

const APP_NAME_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} .'’&-]{0,39}$/u;

export function resolveAppName(value: string | undefined): string {
  const name = value?.trim();
  return name && APP_NAME_PATTERN.test(name) ? name : DEFAULT_APP_NAME;
}

// Must be read as a literal `process.env.NEXT_PUBLIC_*` so Next.js inlines it in client bundles.
const name = resolveAppName(process.env.NEXT_PUBLIC_APP_NAME);

export const siteConfig = {
  name,
  tagline: "Attività vicine, verificate, per oggi e per il weekend",
  description: `${name} ti aiuta a scegliere attività per famiglie e cultura vicino a te, con data, luogo, prezzo e prenotazione chiari. Versione dimostrativa con dati fittizi.`,
  locale: "it_IT",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;
