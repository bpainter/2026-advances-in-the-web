import "server-only";
import { esc, icon } from "./common";

/** The storefront site header (spec 3.6 `.wrap-site`), shared by D2, D5 and F2's markup. */
export function siteHeader(name: string, search: string): string {
  return [
    '<header class="wrap-site">',
    `<span class="wrap-brand"><span class="wrap-brand__mark" aria-hidden="true">R</span><span class="wrap-brand__name">${esc(name)}</span></span>`,
    `<span class="wrap-search" aria-hidden="true">${icon("search")}<span class="wrap-search__text">${esc(search)}</span></span>`,
    `<span class="wrap-site__end" aria-hidden="true">${icon("cart")}</span>`,
    "</header>",
  ].join("");
}
