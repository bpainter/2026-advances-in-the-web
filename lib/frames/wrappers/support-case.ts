import "server-only";
import { BASE_CSS, avatar, bar, chip, context, day, dollars, esc, orders } from "./common";
import type { WrapperDef } from "./types";

/**
 * D3 `support-case` (spec 4.3): a help desk "New case" page. The case head names order 418, the
 * form takes the wide first column, and one side card holds the order. No form control and nothing
 * that grows: never field-sizing or an auto-grow script.
 */
export const supportCase: WrapperDef = {
  id: "support-case",
  banned: [
    { name: "field-sizing", pattern: /field-sizing/ },
    { name: "a form control", pattern: /<(input|textarea|select)\b/i },
    { name: "an auto-grow script", pattern: /scrollHeight|\.style\.height/ },
  ],
  render: () => {
    const ctx = context();
    const order = orders().find((o) => o.id === ctx.caseHeader.order)!;
    const item = order.items[0];
    const before = [
      '<div class="wrap wrap--support"><div class="wrap-sheet">',
      bar({ name: ctx.store.name, area: "Support", end: [avatar()] }),
      '<div class="wrap-body">',
      `<div class="wrap-case-head"><p class="wrap-title">New case</p>${chip(`Order ${order.id}, ${ctx.caseHeader.state}`)}${chip(`${ctx.caseHeader.priority} priority`)}</div>`,
      '<div class="wrap-cols">',
    ].join("");
    const after = [
      `<section class="wrap-card wrap-side" aria-label="Order ${order.id}">`,
      `<p class="wrap-card__title">Order ${order.id}</p>`,
      `<p class="wrap-side__item">${esc(item.name)}, ${esc(item.qty)}</p>`,
      `<p class="wrap-side__total">${dollars(order.total)}</p>`,
      '<span class="wrap-side__rule" aria-hidden="true"></span>',
      `<p class="wrap-meta">Placed ${day(order.placed)}</p>`,
      `<p class="wrap-meta">Canceled ${day(ctx.caseHeader.canceled)}</p>`,
      "</section>",
      "</div></div></div></div>",
    ].join("");
    return { before, after, styles: [BASE_CSS, "/wrappers/support-case.css"], scripts: [] };
  },
};
