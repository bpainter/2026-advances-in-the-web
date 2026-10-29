import "server-only";
import { BASE_CSS, bar, chip, context, day, esc, icon } from "./common";
import type { WrapperDef } from "./types";

/**
 * M4 `help-center` (still-in-motion-demos.md 7): the customer help center. Header with the
 * search look-alike, a plain breadcrumb, the shown article pane, a "Related articles" card under
 * it and a "Still need help?" column with support hours and the return window. No script, and
 * nothing tied to scrolling: never animation-timeline, scroll-timeline, view-timeline,
 * animation-range, a scroll listener or IntersectionObserver.
 */
export const helpCenter: WrapperDef = {
  id: "help-center",
  banned: [
    { name: "animation-timeline", pattern: /animation-timeline/ },
    { name: "scroll-timeline", pattern: /scroll-timeline/ },
    { name: "view-timeline", pattern: /view-timeline/ },
    { name: "animation-range", pattern: /animation-range/ },
    { name: "a scroll listener", pattern: /["']scroll["']|onscroll/ },
    { name: "IntersectionObserver", pattern: /IntersectionObserver/ },
    { name: "a script", pattern: /<script\b/i },
  ],
  render: () => {
    const ctx = context();
    const h = ctx.help;
    const search = `<span class="wrap-search wrap-help__search" aria-hidden="true">${icon("search")}<span class="wrap-search__text">${esc(h.search)}</span></span>`;
    const crumbs = h.crumbs.map((c) => `<span class="wrap-help__crumb">${esc(c)}</span>`).join('<span class="wrap-help__sep" aria-hidden="true">/</span>');
    const before = [
      '<div class="wrap wrap--help"><div class="wrap-sheet">',
      bar({ name: ctx.store.name, area: "Help", end: [search] }),
      '<div class="wrap-body wrap-help">',
      `<p class="wrap-meta wrap-help__crumbs">${crumbs}</p>`,
      '<div class="wrap-help__cols">',
    ].join("");
    const related = ["Refund timing", "Exchange a size", "Damaged on arrival", "Return a gift"].map((t) => `<li class="wrap-help__link">${icon("fileText")}<span>${esc(t)}</span></li>`).join("");
    const channels = h.channels.map((c) => chip(c)).join("");
    const after = [
      `<section class="wrap-card wrap-help__related" aria-label="Related articles"><p class="wrap-card__title">Related articles</p><ul class="wrap-help__links">${related}</ul></section>`,
      '<div class="wrap-help__side">',
      `<section class="wrap-card wrap-help__card" aria-label="Still need help?"><p class="wrap-card__title">Still need help?</p><p class="wrap-meta">${esc(h.hours)}</p><p class="wrap-help__chips">${channels}</p></section>`,
      `<section class="wrap-card wrap-help__card" aria-label="Return window"><p class="wrap-card__title">Return window</p><p class="wrap-help__big">${esc(ctx.store.returnsDays)} days</p><p class="wrap-meta">From the delivery date</p></section>`,
      `<p class="wrap-meta wrap-help__updated">Updated ${esc(day(h.updated))}</p>`,
      "</div>",
      "</div></div></div></div>",
    ].join("");
    return { before, after, styles: [BASE_CSS, "/wrappers/help-center.css"], scripts: [] };
  },
};
