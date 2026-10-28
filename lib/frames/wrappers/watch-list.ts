import "server-only";
import { BASE_CSS, bar, chip, context, day, esc, readJson } from "./common";
import type { WrapperDef } from "./types";

/**
 * F1 `watch-list` (spec 4.7): a team's platform watch list. The bar carries the legend ("Try
 * now", "Wait for", the labels each tile uses; review v5 M14) and the date; a source line names the web-features version. Never anchor
 * positioning, Grid Lanes, view transitions, scroll-driven animation or scoped registries.
 */
export const watchList: WrapperDef = {
  id: "watch-list",
  banned: [
    { name: "anchor positioning", pattern: /anchor-name|position-anchor|position-area|anchor\(/ },
    { name: "Grid Lanes", pattern: /grid-lanes|masonry/ },
    { name: "view transitions", pattern: /view-transition|startViewTransition/ },
    { name: "scroll-driven animation", pattern: /animation-timeline|scroll-timeline|view-timeline/ },
    { name: "scoped registries", pattern: /CustomElementRegistry|customElements/ },
  ],
  render: () => {
    const ctx = context();
    const wf = readJson<{ webFeaturesVersion?: string; version?: string }>("content/.generated/support.json");
    const version = wf.webFeaturesVersion ?? wf.version ?? "";
    const before = [
      '<div class="wrap wrap--report wrap--watch"><div class="wrap-sheet">',
      bar({ name: ctx.store.name, area: "Platform watch list", end: [chip("Try now"), '<span class="wrap-chip wrap-chip--wait">Wait for</span>', `<span class="wrap-bar__meta">${esc(day(ctx.talkDate))}</span>`] }),
      '<div class="wrap-body wrap-report">',
    ].join("");
    const after = [`<p class="wrap-meta wrap-report__source">Support data: web-features ${esc(version)}</p>`, "</div></div></div>"].join("");
    return { before, after, shownClass: "wrap-shown--bare", styles: [BASE_CSS, "/wrappers/report.css"], scripts: [] };
  },
};
