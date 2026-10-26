/**
 * Map provider resolution (server side, at request time). Swappable: the client
 * only receives a style URL and the attribution to display.
 *
 * Environment (see .env.example):
 * - MAP_PROVIDER: "maptiler" (default when a key is set) | "none"
 * - MAPTILER_PUBLIC_KEY: PUBLIC browser key; restrict it to the site's domains in
 *   the MapTiler dashboard. Never a privileged/secret credential.
 * - MAPTILER_MAP_ID: style id, default "streets-v2".
 */

export type MapProviderConfig = {
  id: "maptiler";
  styleUrl: string;
  /** Required attribution, always shown on the map. */
  attribution: string[];
};

type Env = Record<string, string | undefined>;

/**
 * Identical to the attribution declared by MapTiler styles (checked 2026-10-26), so MapLibre
 * shows it once; still guaranteed if a style ever omits it. Links are required by MapTiler/OSM.
 */
export const MAPTILER_ATTRIBUTION =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

const KEY_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;
const MAP_ID_PATTERN = /^[a-z0-9-]{2,40}$/;

export function resolveMapProvider(env: Env): MapProviderConfig | null {
  const provider = (env.MAP_PROVIDER ?? "maptiler").trim().toLowerCase();
  if (provider !== "maptiler") return null;
  const key = env.MAPTILER_PUBLIC_KEY?.trim();
  if (!key || !KEY_PATTERN.test(key)) return null;
  const mapId = env.MAPTILER_MAP_ID?.trim() || "streets-v2";
  if (!MAP_ID_PATTERN.test(mapId)) return null;
  return {
    id: "maptiler",
    styleUrl: `https://api.maptiler.com/maps/${mapId}/style.json?key=${encodeURIComponent(key)}`,
    attribution: [MAPTILER_ATTRIBUTION],
  };
}
