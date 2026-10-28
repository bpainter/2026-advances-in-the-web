import "server-only";
import { fixtureBare } from "./fixture-bare";
import { orderQueue } from "./order-queue";
import { portalDashboard } from "./portal-dashboard";
import type { WrapperDef, WrapperId } from "./types";

export type { WrapperDef, WrapperId, WrapperRender, WrapperContext } from "./types";

/** The wrapper registry (PRD v5, 4.4). */
export const WRAPPERS: Partial<Record<WrapperId, WrapperDef>> = {
  "order-queue": orderQueue,
  "portal-dashboard": portalDashboard,
  "fixture-bare": fixtureBare,
};

export function wrapperDef(id: WrapperId): WrapperDef {
  const def = WRAPPERS[id];
  if (!def) throw new Error(`Unknown wrapper "${id}"`);
  return def;
}
