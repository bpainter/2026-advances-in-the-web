import "server-only";
import { fixtureBare } from "./fixture-bare";
import { orderQueue } from "./order-queue";
import { portalDashboard } from "./portal-dashboard";
import { storefrontMerch } from "./storefront-merch";
import { supportCase } from "./support-case";
import { productPage } from "./product-page";
import { productEditor } from "./product-editor";
import { advisoryFeed } from "./advisory-feed";
import { terminalWindow } from "./terminal-window";
import { ciReport } from "./ci-report";
import { storefrontProduct } from "./storefront-product";
import { helpCenter } from "./help-center";
import { lookbook } from "./lookbook";
import { editorPricing } from "./editor-pricing";
import { productPhotos } from "./product-photos";
import { storefrontCatalog } from "./storefront-catalog";
import type { WrapperDef, WrapperId } from "./types";

export type { WrapperDef, WrapperId, WrapperRender, WrapperContext } from "./types";

/** The wrapper registry (PRD v5, 4.4). */
export const WRAPPERS: Partial<Record<WrapperId, WrapperDef>> = {
  "order-queue": orderQueue,
  "portal-dashboard": portalDashboard,
  "storefront-merch": storefrontMerch,
  "support-case": supportCase,
  "product-page": productPage,
  "product-editor": productEditor,
  "storefront-product": storefrontProduct,
  "advisory-feed": advisoryFeed,
  "terminal-window": terminalWindow,
  "ci-report": ciReport,
  "help-center": helpCenter,
  lookbook,
  "editor-pricing": editorPricing,
  "product-photos": productPhotos,
  "storefront-catalog": storefrontCatalog,
  "fixture-bare": fixtureBare,
};

export function wrapperDef(id: WrapperId): WrapperDef {
  const def = WRAPPERS[id];
  if (!def) throw new Error(`Unknown wrapper "${id}"`);
  return def;
}
