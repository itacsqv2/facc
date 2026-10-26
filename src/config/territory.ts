/**
 * Launch catchment configuration (D001 still OPEN).
 *
 * The active territory is a DEMO one (D018): the GEOGRAPHY is real (Bergamo,
 * its hills, Sarnico on Lake Iseo and the Lago d'Orta in Piedmont) so that a real basemap can be shown, but
 * every event, venue name, address, organizer and contact in the catalog is
 * invented. This is not the selection of a launch area.
 */
import type { LngLat, Zone } from "@/modules/catalog/types";

export type Territory = {
  id: string;
  name: string;
  isDemo: boolean;
  /** IANA timezone used for "today" / "weekend" calendar windows. */
  timeZone: string;
  zones: readonly Zone[];
  /** Map frame per zone, [west, south, east, north]; the map fits it when the zone is chosen. */
  zoneBounds: Readonly<Record<string, readonly [number, number, number, number]>>;
  map: {
    /** [west, south, east, north] used for the initial view and to validate positions. */
    bounds: readonly [number, number, number, number];
    center: LngLat;
  };
};

export const demoTerritory: Territory = {
  id: "demo-bergamo",
  name: "Bergamo e Lago d'Orta",
  isDemo: true,
  timeZone: "Europe/Rome",
  zones: [
    { id: "bergamo-bassa", name: "Bergamo bassa" },
    { id: "citta-alta-colli", name: "Città Alta e Colli" },
    { id: "sarnico-iseo", name: "Sarnico e Lago d'Iseo" },
    { id: "lago-orta", name: "Lago d'Orta" },
  ],
  zoneBounds: {
    "bergamo-bassa": [9.64, 45.68, 9.7, 45.71],
    "citta-alta-colli": [9.63, 45.695, 9.675, 45.715],
    "sarnico-iseo": [9.94, 45.66, 9.98, 45.678],
    "lago-orta": [8.37, 45.74, 8.45, 45.885],
  },
  map: {
    bounds: [8.3, 45.6, 10.05, 45.9],
    center: [9.2, 45.75],
  },
};

export const activeTerritory: Territory = demoTerritory;

export function zoneName(zoneId: string): string {
  return activeTerritory.zones.find((zone) => zone.id === zoneId)?.name ?? "Zona non indicata";
}
