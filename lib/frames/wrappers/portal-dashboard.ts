import "server-only";
import { BASE_CSS, ICONS, avatar, brand, context, icon } from "./common";
import type { WrapperDef } from "./types";

/**
 * D4 `portal-dashboard` (spec 4.4): the one wrapper with app chrome, because moving inside an app
 * is the feature. A rail with Orders current (spans, never links: D4 intercepts navigations), a
 * top bar with the store name and the avatar, and the shown toolbar, list and evidence panel.
 */
const RAIL: { key: keyof typeof ICONS; label: string; current?: boolean }[] = [
  { key: "package", label: "Orders", current: true },
  { key: "shirt", label: "Products" },
  { key: "lifeBuoy", label: "Support" },
  { key: "fileText", label: "Content" },
  { key: "chart", label: "Reports" },
];

export const portalDashboard: WrapperDef = {
  id: "portal-dashboard",
  banned: [
    { name: "Navigation API", pattern: /\bnavigation\.|navigate\b/ },
    { name: "History API", pattern: /\bhistory\.|pushState|replaceState/ },
    { name: "href", pattern: /\bhref\s*=/i },
    { name: "fetch", pattern: /\bfetch\(/ },
  ],
  render: () => {
    const ctx = context();
    const rail = RAIL.map((r) => `<span class="wrap-rail__item"${r.current ? ' aria-current="page"' : ""} title="${r.label}">${icon(r.key)}<span class="wrap-rail__label">${r.label}</span></span>`).join("");
    const before = [
      '<div class="wrap wrap--app"><div class="wrap-sheet wrap-app">',
      `<div class="wrap-rail" role="presentation"><span class="wrap-brand__mark" aria-hidden="true">R</span>${rail}</div>`,
      `<div class="wrap-top" role="presentation">${brand(ctx.store.name)}<span class="wrap-bar__end">${avatar()}</span></div>`,
      '<div class="wrap-main">',
    ].join("");
    // The frame padding stays clear while the document scrolls: two fixed strips repaint the
    // frame background over the content that passes under them.
    const after = '</div></div></div><div class="wrap-mask wrap-mask--top" aria-hidden="true"></div><div class="wrap-mask wrap-mask--bottom" aria-hidden="true"></div>';
    return { before, after, shownClass: "wrap-shown--bare", styles: [BASE_CSS, "/wrappers/portal-dashboard.css"], scripts: [] };
  },
};
