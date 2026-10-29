import "server-only";
import { BASE_CSS, context, dollars, esc, readJson } from "./common";
import { siteHeader } from "./storefront";
import type { WrapperDef } from "./types";

interface Catalog {
  products: { id: string; name: string; price: number; rating: string }[];
}

/**
 * M2 `product-photos` (still-in-motion-demos.md 5): the top of the Ridgeline Trail product page.
 * The site header, a product bar (photo, name, price, rating and the photo count, a static "Add to
 * cart" look-alike with no control), then the "From the trail" heading over the shown wall. Name,
 * price and rating come from fixtures/storefront-catalog.json, the count from
 * fixtures/trail-photos.json. Never Grid Lanes, masonry, multi-column layout or any script.
 */
export const productPhotos: WrapperDef = {
  id: "product-photos",
  banned: [
    { name: "grid-lanes", pattern: /grid-lanes/ },
    { name: "masonry", pattern: /masonry/i },
    { name: "multi-column layout", pattern: /\bcolumns\s*:|column-(count|width|fill|span)/ },
    { name: "a script", pattern: /<script\b/i },
  ],
  render: () => {
    const ctx = context();
    const catalog = readJson<Catalog>("fixtures/storefront-catalog.json");
    const product = catalog.products.find((p) => p.name === ctx.store.product) ?? catalog.products[0];
    const photos = readJson<{ photos: unknown[] }>("fixtures/trail-photos.json").photos.length;
    const before = [
      '<div class="wrap wrap--store wrap--photos">',
      siteHeader(ctx.store.name, ctx.store.search),
      '<div class="wrap-store-body">',
      '<div class="wrap-pp-bar">',
      '<span class="wrap-pp-thumb" aria-hidden="true"></span>',
      `<span class="wrap-pp-name">${esc(product.name)}</span>`,
      `<span class="wrap-pp-price">${dollars(product.price)}</span>`,
      `<span class="wrap-meta">${esc(product.rating)} out of 5, ${esc(photos)} trail photos</span>`,
      '<span class="wrap-pp-cart" aria-hidden="true">Add to cart</span>',
      "</div>",
      '<h2 class="wrap-pp-heading">From the trail</h2>',
    ].join("");
    const after = ["</div>", "</div>"].join("");
    return { before, after, styles: [BASE_CSS, "/wrappers/product-photos.css"], scripts: [] };
  },
};
