import "server-only";
import { BASE_CSS, context, esc } from "./common";
import { siteHeader } from "./storefront";
import type { WrapperDef } from "./types";

/**
 * D2 `storefront-merch` (spec 4.2): a storefront landing page. The site header, a context label
 * that names where the slot is at its current width (now page only, set by the wrapper's own
 * script from the slot's measured width), the shelf the card sits on, and a footer line. Never a
 * container query, cq unit, @scope or :has().
 */
export const storefrontMerch: WrapperDef = {
  id: "storefront-merch",
  banned: [
    { name: "container-type", pattern: /container-type|container-name|\bcontainer\s*:/ },
    { name: "@container", pattern: /@container/ },
    { name: "container query units", pattern: /\d(cqw|cqh|cqi|cqb|cqmin|cqmax)\b/ },
    { name: "@scope", pattern: /@scope/ },
    { name: ":has()", pattern: /:has\(/ },
  ],
  render: (w) => {
    const ctx = context();
    const label = w.build === "native" ? '<p class="wrap-context" aria-live="off"></p>' : "";
    const before = [`<div class="wrap wrap--store wrap--merch">`, siteHeader(ctx.store.name, ctx.store.search), `<div class="wrap-store-body">`, label].join("");
    // The same footer on both pages (review v5 L4).
    const foot = `<p class="wrap-site-foot">Free returns within ${esc(ctx.store.returnsDays)} days</p>`;
    const after = ["</div>", foot, "</div>"].join("");
    return {
      before,
      after,
      shownClass: "wrap-shelf",
      styles: [BASE_CSS, "/wrappers/storefront-merch.css"],
      scripts: w.build === "native" ? ["/wrappers/storefront-merch.js"] : [],
    };
  },
};
