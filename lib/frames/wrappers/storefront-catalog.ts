import "server-only";
import { BASE_CSS, context, dollars, esc, icon, readJson } from "./common";
import type { WrapperDef } from "./types";

interface Catalog {
  nav: string[];
  cart: number;
  freeShippingOver: number;
}

/**
 * M5 `storefront-catalog` (still-in-motion-demos.md 8): a store header strip (name, static nav
 * words, cart count) and a footer strip with the free shipping note. The same markup on the
 * category page and the product page, so the root crossfade never shows it. Never a view
 * transition name, the @view-transition rule, startViewTransition, pageswap, pagereveal or an href.
 */
export const storefrontCatalog: WrapperDef = {
  id: "storefront-catalog",
  banned: [
    { name: "view-transition-name", pattern: /view-transition-name/ },
    { name: "@view-transition", pattern: /@view-transition/ },
    { name: "startViewTransition", pattern: /startViewTransition/ },
    { name: "pageswap", pattern: /pageswap/ },
    { name: "pagereveal", pattern: /pagereveal/ },
  ],
  render: () => {
    const ctx = context();
    const catalog = readJson<Catalog>("fixtures/storefront-catalog.json");
    const nav = catalog.nav.map((n) => `<span class="wrap-cat-nav__item">${esc(n)}</span>`).join("");
    const before = [
      '<div class="wrap wrap--store wrap--catalog">',
      '<header class="wrap-site">',
      `<span class="wrap-brand"><span class="wrap-brand__mark" aria-hidden="true">R</span><span class="wrap-brand__name">${esc(ctx.store.name)}</span></span>`,
      `<span class="wrap-cat-nav" aria-hidden="true">${nav}</span>`,
      `<span class="wrap-site__end wrap-cat-cart" aria-hidden="true">${icon("cart")}<span class="wrap-cat-cart__count">${esc(catalog.cart)}</span></span>`,
      "</header>",
      '<div class="wrap-store-body">',
    ].join("");
    const after = ["</div>", `<p class="wrap-site-foot">Free shipping on orders over ${dollars(catalog.freeShippingOver)}</p>`, "</div>"].join("");
    return { before, after, styles: [BASE_CSS, "/wrappers/storefront-catalog.css"], scripts: [] };
  },
};
