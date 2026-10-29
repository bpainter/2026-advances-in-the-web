/** Contextual demo wrappers (PRD v5, 2; docs/design/demo-wrappers-spec.md 3 and 4). */
export type WrapperId =
  | "order-queue"
  | "storefront-merch"
  | "support-case"
  | "portal-dashboard"
  | "product-page"
  | "product-editor"
  | "storefront-product"
  | "advisory-feed"
  | "terminal-window"
  | "ci-report"
  | "lookbook"
  | "editor-pricing"
  | "help-center"
  | "product-photos"
  | "storefront-catalog"
  | "fixture-bare";

export interface WrapperRender {
  /** Markup before the shown block. */
  before: string;
  /** Markup after the shown block. */
  after: string;
  /** Classes on the `[data-shown]` slot besides `wrap-shown` (e.g. `wrap-shown--bare`). */
  shownClass?: string;
  /** Root-relative stylesheets, base.css first. */
  styles: string[];
  /** Root-relative scripts, loaded as instrumentation (never removed by enhance-js off). */
  scripts: string[];
}

export interface WrapperContext {
  build: "today" | "native" | "static" | "terminal";
  demo: string;
}

export interface WrapperDef {
  id: WrapperId;
  /** What this wrapper must never use (PRD 2.2), checked in its CSS, markup and scripts. */
  banned: { name: string; pattern: RegExp }[];
  render(ctx: WrapperContext): WrapperRender;
}
