import "server-only";
import { BASE_CSS, avatar, bar, chip, context, dollars, esc } from "./common";
import type { WrapperDef } from "./types";

/**
 * M3 `editor-pricing` (still-in-motion-demos.md 6): the D6 product editor on its Pricing tab. The
 * editor header (Trail Runner 2, Draft, SKU), a static tab strip, the shown Pricing card and a
 * side column with Sales channels and the product's details. Never a custom element registry,
 * attachShadow, an iframe or a wrapper script.
 */
export const editorPricing: WrapperDef = {
  id: "editor-pricing",
  banned: [
    { name: "customElements", pattern: /customElements/ },
    { name: "CustomElementRegistry", pattern: /CustomElementRegistry/ },
    { name: "attachShadow", pattern: /attachShadow/ },
    { name: "an iframe", pattern: /<iframe\b/i },
    { name: "a script", pattern: /<script\b/i },
  ],
  render: () => {
    const ctx = context();
    const e = ctx.editor;
    const p = ctx.pricing;
    const tabs = p.tabs.map((t) => `<li class="wrap-tabs__tab${t === p.current ? " wrap-tabs__tab--current" : ""}">${esc(t)}</li>`).join("");
    const before = [
      '<div class="wrap wrap--pricing"><div class="wrap-sheet">',
      bar({ name: ctx.store.name, area: e.area, meta: e.title, end: [`<span class="wrap-bar__meta">SKU ${esc(e.sku)}</span>`, chip(e.state), avatar()] }),
      `<ul class="wrap-tabs" aria-label="Editor sections">${tabs}</ul>`,
      '<div class="wrap-body wrap-pricing">',
    ].join("");
    const channels = p.channels.map((c) => `<li class="wrap-pricing__channel"><span>${esc(c.name)}</span>${chip(c.state)}</li>`).join("");
    const after = [
      '<div class="wrap-pricing__side">',
      `<section class="wrap-card wrap-pricing__card" aria-label="Sales channels"><p class="wrap-card__title">Sales channels</p><ul class="wrap-pricing__channels">${channels}</ul></section>`,
      `<section class="wrap-card wrap-pricing__card" aria-label="Product"><p class="wrap-card__title">${esc(e.title)}</p><p class="wrap-meta">List price ${dollars(e.price)}</p><p class="wrap-meta">Sizes ${e.sizes[0]} to ${e.sizes[1]}</p><p class="wrap-meta">${e.colors.length} colors</p></section>`,
      "</div>",
      "</div></div></div>",
    ].join("");
    return { before, after, styles: [BASE_CSS, "/wrappers/editor-pricing.css"], scripts: [] };
  },
};
