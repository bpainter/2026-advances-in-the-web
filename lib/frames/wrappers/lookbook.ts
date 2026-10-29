import "server-only";
import { BASE_CSS, context, esc, icon } from "./common";
import type { WrapperDef } from "./types";

/**
 * M1 `lookbook` (still-in-motion-demos.md 4): the storefront home page. A store header with static
 * nav words and the cart count, a season column with three "More looks" thumbnails, and the shown
 * look on the right. Never anchor positioning, popover, invoker commands or a positioning script.
 */
export const lookbook: WrapperDef = {
  id: "lookbook",
  banned: [
    { name: "anchor positioning", pattern: /anchor-name|position-anchor|position-area|position-try|anchor\(/ },
    { name: "popover", pattern: /popover/ },
    { name: "invoker commands", pattern: /\bcommand(for)?\s*=/ },
    { name: "a script", pattern: /<script\b/i },
  ],
  render: () => {
    const ctx = context();
    const l = ctx.lookbook;
    const nav = l.nav.map((n) => `<span class="wrap-look__nav-item">${esc(n)}</span>`).join("");
    const header = [
      '<header class="wrap-site">',
      `<span class="wrap-brand"><span class="wrap-brand__mark" aria-hidden="true">R</span><span class="wrap-brand__name">${esc(ctx.store.name)}</span></span>`,
      `<span class="wrap-look__nav" aria-hidden="true">${nav}</span>`,
      `<span class="wrap-site__end wrap-look__cart">${icon("cart")}<span class="wrap-look__count">${esc(l.cart)}</span><span class="wrap-look__sr">items in cart</span></span>`,
      "</header>",
    ].join("");
    const looks = l.looks.map((k) => `<li class="wrap-look__thumb"><img class="wrap-look__img" src="${esc(k.photo)}" alt="" width="1000" height="750"><span class="wrap-look__label">${esc(k.title)}</span></li>`).join("");
    const before = [
      '<div class="wrap wrap--store wrap--look">',
      header,
      '<div class="wrap-look">',
      '<div class="wrap-look__side">',
      `<p class="wrap-look__eyebrow">${esc(l.area)}</p>`,
      `<p class="wrap-look__season">${esc(l.season)}</p>`,
      `<p class="wrap-meta">${esc(l.blurb)}</p>`,
      '<p class="wrap-card__title wrap-look__more">More looks</p>',
      `<ul class="wrap-look__thumbs">${looks}</ul>`,
      "</div>",
    ].join("");
    const after = ["</div>", `<p class="wrap-site-foot">Free returns within ${esc(ctx.store.returnsDays)} days</p>`, "</div>"].join("");
    return { before, after, shownClass: "wrap-shown--bare wrap-look__stage", styles: [BASE_CSS, "/wrappers/lookbook.css"], scripts: [] };
  },
};
