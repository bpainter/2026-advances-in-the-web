import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";

/** One product of fixtures/storefront-catalog.json (still-in-motion-demos.md 3.6 and 8). */
export interface CatalogProduct {
  id: string;
  name: string;
  price: number;
  rating: string;
  photo: string;
  alt: string;
  blurb: string;
  sizes: string[];
}
interface Catalog {
  category: string;
  dir: string;
  products: CatalogProduct[];
}

export const catalog = (): Catalog => JSON.parse(readFileSync(path.join(process.cwd(), "fixtures", "storefront-catalog.json"), "utf8")) as Catalog;

const esc = (v: string | number) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const dollars = (n: number) => (Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`);

/** A product as the templates and the used-to build's API see it: the photo as a full path, the price formatted. */
export function view(p: CatalogProduct, dir = catalog().dir): Record<string, string> {
  return { id: p.id, name: p.name, price: dollars(p.price), rating: p.rating, photo: dir + p.photo, alt: p.alt, blurb: p.blurb };
}

/**
 * A minimal Mustache subset for the shown templates: `{{#list}}...{{/list}}` repeats its block for
 * each record, `{{key}}` inserts an escaped value. The shown files stay as written; the frame gets
 * the filled page.
 */
export function fill(template: string, data: Record<string, string | Record<string, string>[]>): string {
  const sections = template.replace(/^([ \t]*)\{\{#(\w+)\}\}\n([\s\S]*?)^[ \t]*\{\{\/\2\}\}\n/gm, (_m, _indent, key: string, block: string) => {
    const list = data[key];
    if (!Array.isArray(list)) throw new Error(`template list "${key}" is missing`);
    return list.map((record) => fillValues(block, record)).join("");
  });
  return fillValues(sections, data as Record<string, string>);
}

function fillValues(block: string, record: Record<string, unknown>): string {
  return block.replace(/\{\{(\w+)\}\}/g, (_m, key: string) => {
    const v = record[key];
    if (typeof v !== "string") throw new Error(`template value "${key}" is missing`);
    return esc(v);
  });
}

/**
 * The rest of a store product page (review r6 motion M10): the rating, a static size row and an
 * "Add to cart" button, after the blurb. Unshown in both builds, so the shown templates stay about
 * the transition; the same markup in both, from the fixture.
 */
export function buyBlock(p: CatalogProduct, attrs = ""): string {
  const sizes = p.sizes.map((s) => `<span class="size">${esc(s)}</span>`).join("");
  return `<div class="buy"${attrs}><p class="rating">Rated ${esc(p.rating)} out of 5</p><p class="sizes"><span class="sizes-label">Size</span>${sizes}</p><button type="button" class="add-to-cart">Add to cart</button></div>`;
}

/** The native build's pages: the category grid, or one product by `?id=` (unknown ids throw). */
export function renderNative(file: string, html: string, url: URL): string {
  const data = catalog();
  if (file === "product.html") {
    const id = url.searchParams.get("id") ?? data.products[0].id;
    const product = data.products.find((p) => p.id === id);
    if (!product) throw new Error(`no product "${id}"`);
    const page = fill(html, view(product, data.dir));
    const blurb = `<p>${esc(product.blurb)}</p>`;
    if (!page.includes(blurb)) throw new Error("no blurb paragraph in product.html");
    return page.replace(blurb, `${blurb}\n    ${buyBlock(product)}`);
  }
  return fill(html, { products: data.products.map((p) => view(p, data.dir)) });
}

/** The used-to build's cards, server-rendered into its placeholder like the native grid. */
export const CARD_SLOT = "<!-- product cards from the server -->";
export function renderToday(_file: string, html: string): string {
  const data = catalog();
  if (!html.includes(CARD_SLOT)) throw new Error(`no ${CARD_SLOT} in the used-to index.html`);
  const cards = data.products.map((p) => {
    const v = view(p, data.dir);
    return `<li><a id="t-card-${esc(v.id)}" class="card" href="?product=${esc(v.id)}" data-route><img src="${esc(v.photo)}" alt=""><span class="card-name">${esc(v.name)}</span><span>${esc(v.price)}</span></a></li>`;
  });
  // Every product's buy block, hidden; the portal CSS shows the one whose photo is in the hero.
  const BLURB = '<p id="t-blurb"></p>';
  if (!html.includes(BLURB)) throw new Error(`no ${BLURB} in the used-to index.html`);
  const buy = data.products.map((p) => buyBlock(p, ` data-product="${esc(p.id)}"`)).join("\n      ");
  return html.replace(CARD_SLOT, cards.join("\n        ")).replace(BLURB, `${BLURB}\n      ${buy}`);
}
