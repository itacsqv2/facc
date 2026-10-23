/**
 * Launch catchment configuration (D001).
 *
 * No real launch area has been selected. The active territory is a FICTIONAL
 * demo area: every name below is invented and must never be presented as a
 * real place. No coordinates, distances or travel times are defined on purpose.
 * Replace `activeTerritory` once a catchment is approved.
 */
import type { Zone } from "@/modules/catalog/types";

export type Territory = {
  id: string;
  name: string;
  isDemo: boolean;
  /** IANA timezone used for "today" / "weekend" calendar windows. */
  timeZone: string;
  zones: readonly Zone[];
};

export const demoTerritory: Territory = {
  id: "demo-valfittizia",
  name: "Valfittizia",
  isDemo: true,
  timeZone: "Europe/Rome",
  zones: [
    { id: "valfittizia-centro", name: "Valfittizia Centro" },
    { id: "borgo-esempio", name: "Borgo Esempio" },
    { id: "riva-campione", name: "Riva Campione" },
  ],
};

export const activeTerritory: Territory = demoTerritory;

export function zoneName(zoneId: string): string {
  return activeTerritory.zones.find((zone) => zone.id === zoneId)?.name ?? "Zona non indicata";
}
