import "server-only";
import { activeTerritory } from "@/config/territory";
import { parseDemoNow } from "./demo-clock";

/**
 * Reference instant for one server response: the pinned demo clock when valid
 * (see `parseDemoNow`), otherwise the current server time.
 */
export function requestNow(): Date {
  return parseDemoNow(process.env.KESIFA_DEMO_NOW, activeTerritory.isDemo) ?? new Date();
}
