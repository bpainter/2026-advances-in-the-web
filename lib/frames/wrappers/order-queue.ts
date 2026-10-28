import "server-only";
import { BASE_CSS, avatar, bar, chip, context, dollars, esc, icon, orders } from "./common";
import type { WrapperDef } from "./types";

/**
 * D1 `order-queue` (spec 4.1): the fulfillment queue of a store admin. The shown 418 row comes
 * first; the next open orders follow as static rows with a muted "Actions" label, then the
 * carrier pickup line. No popover, dialog, invoker command, inert or focus script.
 */
export const orderQueue: WrapperDef = {
  id: "order-queue",
  banned: [
    { name: "popover", pattern: /popover/i },
    { name: "dialog", pattern: /<dialog\b|\bdialog\b\s*[{,:[]|showModal/i },
    { name: "invoker commands", pattern: /\bcommand(for)?\s*=/i },
    { name: "inert", pattern: /\binert\b/i },
    { name: "focus script", pattern: /\.focus\(/ },
  ],
  render: () => {
    const ctx = context();
    const siblings = orders()
      .filter((o) => o.status === "Open" && o.id > ctx.queue.after)
      .slice(0, ctx.queue.count);
    const rows = siblings
      .map((o) => `<li class="wrap-row"><span class="wrap-row__key">Order ${o.id}</span><span class="wrap-row__item">${esc(o.items[0].name)}</span><span class="wrap-num">${dollars(o.total)}</span>${chip("Awaiting shipment")}<span class="wrap-muted-label">Actions</span></li>`)
      .join("");
    const before = [
      '<div class="wrap wrap--order-queue"><div class="wrap-sheet">',
      bar({ name: ctx.store.name, area: "Orders", end: [`<span class="wrap-bar__meta">${siblings.length + 1} awaiting shipment</span>`, avatar()] }),
      '<div class="wrap-body">',
    ].join("");
    const after = [
      `<section class="wrap-card wrap-queue" aria-label="More orders awaiting shipment"><ul class="wrap-rows">${rows}</ul></section>`,
      `<section class="wrap-card wrap-pickup" aria-label="Pickup">${icon("truck")}<span class="wrap-pickup__text">${esc(ctx.pickup.carrier)} pickup at ${esc(ctx.pickup.time)}</span></section>`,
      "</div></div></div>",
    ].join("");
    return { before, after, shownClass: "wrap-shown--bare", styles: [BASE_CSS, "/wrappers/order-queue.css"], scripts: [] };
  },
};
