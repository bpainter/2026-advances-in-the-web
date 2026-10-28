import "server-only";
import { BASE_CSS, context, day, esc, icon } from "./common";
import type { WrapperDef } from "./types";

/**
 * F3 used-to `advisory-feed` (spec 4.9): a public security advisories page, so no store brand.
 * Plain-text filters, the shown incident timeline on the focus surface and a source line.
 */
export const advisoryFeed: WrapperDef = {
  id: "advisory-feed",
  banned: [{ name: "a live session", pattern: /\bLive\b/ }],
  render: () => {
    const ctx = context();
    const a = ctx.advisories;
    const filters = a.filters.map((f) => `<span class="wrap-filter"><span class="wrap-filter__key">${esc(f.label)}</span> ${esc(f.value)}</span>`).join("");
    const before = [
      '<div class="wrap wrap--report wrap--advisory"><div class="wrap-sheet">',
      `<header class="wrap-bar"><span class="wrap-advisory__mark" aria-hidden="true">${icon("shieldAlert")}</span><span class="wrap-bar__area">${esc(a.title)}</span><span class="wrap-bar__end"><span class="wrap-bar__meta">Updated ${esc(day(a.updated))}</span></span></header>`,
      '<div class="wrap-body wrap-report">',
      `<p class="wrap-filters">${filters}</p>`,
    ].join("");
    const after = [`<p class="wrap-meta wrap-report__source">Sources: ${esc(a.sources.join(", "))}</p>`, "</div></div></div>"].join("");
    return { before, after, styles: [BASE_CSS, "/wrappers/report.css"], scripts: [] };
  },
};
