import "server-only";
import { BASE_CSS, avatar, bar, chip, context, dollars, esc } from "./common";
import type { WrapperDef } from "./types";

/**
 * D6 `product-editor` (spec 4.6): the admin product editor. The shown Color field sits in a
 * Variants card; the right column holds read-only details, three color tiles and the sizes as
 * plain text. Never a select, appearance, ::picker(), selectedcontent or a listbox.
 */
export const productEditor: WrapperDef = {
  id: "product-editor",
  banned: [
    { name: "select", pattern: /<select\b|\bselect\s*[{,]/i },
    { name: "appearance", pattern: /appearance/ },
    { name: "::picker()", pattern: /::picker/ },
    { name: "selectedcontent", pattern: /selectedcontent/ },
    { name: "a listbox", pattern: /listbox/ },
  ],
  render: () => {
    const ctx = context();
    const e = ctx.editor;
    const before = [
      '<div class="wrap wrap--editor"><div class="wrap-sheet">',
      bar({ name: ctx.store.name, area: e.area, meta: e.title, end: [chip(e.state), avatar()] }),
      '<div class="wrap-body wrap-editor">',
      '<p class="wrap-caption wrap-editor__caption">Variants</p>',
    ].join("");
    const tiles = e.colors.map((c) => `<li class="wrap-editor__tile"><span class="wrap-editor__swatch wrap-editor__swatch--${c.toLowerCase()}" aria-hidden="true"></span><span class="wrap-editor__name">${esc(c)}</span></li>`).join("");
    const after = [
      '<div class="wrap-editor__side">',
      `<section class="wrap-card wrap-editor__details" aria-label="Details"><dl class="wrap-dl"><dt class="wrap-dl__key">Title</dt><dd class="wrap-dl__value">${esc(e.title)}</dd><dt class="wrap-dl__key">Price</dt><dd class="wrap-dl__value">${dollars(e.price)}</dd><dt class="wrap-dl__key">SKU</dt><dd class="wrap-dl__value">${esc(e.sku)}</dd></dl></section>`,
      `<section class="wrap-card wrap-editor__colors" aria-label="Colors"><p class="wrap-card__title">Colors</p><ul class="wrap-editor__tiles">${tiles}</ul></section>`,
      `<p class="wrap-meta">Sizes ${e.sizes[0]} to ${e.sizes[1]}</p>`,
      "</div>",
      "</div></div></div>",
    ].join("");
    return { before, after, styles: [BASE_CSS, "/wrappers/product-editor.css"], scripts: [] };
  },
};
