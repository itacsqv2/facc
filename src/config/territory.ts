/**
 * Launch catchment configuration (D001 still OPEN).
 *
 * The active territory is a DEMO one (D018): the GEOGRAPHY is real (Bergamo,
 * its hills and Sarnico on Lake Iseo) so that a real basemap can be shown, but
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
  map: {
    /** [west, south, east, north] used for the initial view and to validate positions. */
    bounds: readonly [number, number, number, number];
    center: LngLat;
  };
};

export const demoTerritory: Territory = {
  id: "demo-bergamo",
  name: "Bergamo e dintorni",
  isDemo: true,
  timeZone: "Europe/Rome",
  zones: [
    { id: "bergamo-bassa", name: "Bergamo bassa" },
    { id: "citta-alta-colli", name: "Città Alta e Colli" },
    { id: "sarnico-iseo", name: "Sarnico e Lago d'Iseo" },
  ],
  map: {
    bounds: [9.6, 45.64, 10.0, 45.73],
    center: [9.8, 45.69],
  },
};

export const activeTerritory: Territory = demoTerritory;

export function zoneName(zoneId: string): string {
  return activeTerritory.zones.find((zone) => zone.id === zoneId)?.name ?? "Zona non indicata";
}
