import "server-only";
import { BASE_CSS, context, dollars, esc } from "./common";
import { siteHeader } from "./storefront";
import type { WrapperDef } from "./types";

/**
 * D5 `product-page` (spec 4.5): a storefront product page around the shown article. A product
 * bar (thumbnail, price, rating, returns) and a developer tools drawer on dark glass, open on the
 * now page (the shown #console docks over it) and collapsed to its tabs on the used-to page. No
 * script, no inline style, no HTML sink and no alarm styling: D5's CSP and its banner stay honest.
 */
export const productPage: WrapperDef = {
  id: "product-page",
  banned: [
    { name: "an HTML sink", pattern: /innerHTML|outerHTML|insertAdjacentHTML|document\.write|setHTML/ },
    { name: "trustedTypes", pattern: /trustedTypes/ },
    { name: "an inline style", pattern: /\sstyle\s*=/i },
    { name: "a script", pattern: /<script\b/i },
  ],
  render: (w) => {
    const ctx = context();
    const open = w.build === "native";
    const before = [
      `<div class="wrap wrap--store wrap--pdp${open ? " wrap--pdp-open" : ""}">`,
      siteHeader(ctx.store.name, ctx.store.search),
      '<div class="wrap-store-body">',
      '<div class="wrap-pdp-bar">',
      '<span class="wrap-pdp-thumb" aria-hidden="true"></span>',
      `<span class="wrap-pdp-price">${dollars(ctx.store.price)}</span>`,
      `<span class="wrap-meta">${esc(ctx.store.rating)} out of 5, ${esc(ctx.store.reviews)} reviews</span>`,
      `<span class="wrap-pdp-returns">Free returns within ${esc(ctx.store.returnsDays)} days</span>`,
      "</div>",
    ].join("");
    const tabs = ["Console", "Elements", "Network"].map((t, i) => `<li class="wrap-drawer__tab${i === 0 ? " wrap-drawer__tab--current" : ""}">${t}</li>`).join("");
    const after = ["</div>", `<section class="wrap-drawer wrap-console" aria-label="Developer tools"><ul class="wrap-drawer__tabs">${tabs}</ul></section>`, "</div>"].join("");
    return { before, after, styles: [BASE_CSS, "/wrappers/product-page.css"], scripts: [] };
  },
};
