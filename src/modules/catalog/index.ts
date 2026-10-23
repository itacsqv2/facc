import "server-only";
import { createDemoRepository } from "./demo/demo-repository";
import type { CatalogRepository } from "./repository";

/** Single wiring point: the only active source in this phase is the DEMO dataset (D009). */
export const catalogRepository: CatalogRepository = createDemoRepository();
