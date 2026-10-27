import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Server rendering for D4 (PRD Part B, D4 "Notes for the builder"): every address is a full
 * document rendered from one template, the shown index.html (native) or the today build's
 * index.html. The template's `<title>`, the status select and the whole `main#content` are
 * replaced; everything else is served as written.
 */

export interface Order {
  id: number;
  customer: string;
  placed: string;
  status: "Open" | "Shipped";
  items: { name: string; qty: number; price: number }[];
  total: number;
}

const FIXTURE = path.join(process.cwd(), "demos", "04-navigation-api", "fixtures", "orders.json");
let cache: Order[] | null = null;

export function orders(): Order[] {
  if (!cache) cache = (JSON.parse(readFileSync(FIXTURE, "utf8")) as { orders: Order[] }).orders;
  return cache;
}

export type Status = "Open" | "Shipped";

export function statusOf(value: string | null): Status {
  return value === "Shipped" ? "Shipped" : "Open";
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function money(n: number): string {
  return `$${n.toFixed(2)}`;
}

export interface Rendered {
  title: string;
  /** Inner HTML of main#content. */
  main: string;
  status: Status;
  found: boolean;
}

export function listPage(status: Status): Rendered {
  const rows = orders()
    .filter((o) => o.status === status)
    .map(
      (o) =>
        `    <li><a href="/orders/${o.id}">Order ${o.id}</a> ${esc(o.customer)}, ${o.items.length} item${o.items.length === 1 ? "" : "s"}, ${money(o.total)}</li>`,
    )
    .join("\n");
  const title = `${status} orders`;
  return {
    title,
    status,
    found: true,
    main: `  <h1>${title}</h1>\n  <ol class="order-list">\n${rows}\n  </ol>\n`,
  };
}

export function orderPage(id: string): Rendered {
  const order = orders().find((o) => String(o.id) === id);
  if (!order) {
    return {
      title: "Order not found",
      status: "Open",
      found: false,
      main: `  <h1>Order not found</h1>\n  <p>There is no order ${esc(id)}. <a href="/orders">Back to orders</a></p>\n`,
    };
  }
  const items = order.items
    .map((i) => `    <li>${esc(i.name)} × ${i.qty}, ${money(i.qty * i.price)}</li>`)
    .join("\n");
  const title = `Order ${order.id}`;
  return {
    title,
    status: order.status,
    found: true,
    main:
      `  <h1>${title}</h1>\n  <dl class="order-detail">\n    <dt>Customer</dt><dd>${esc(order.customer)}</dd>\n` +
      `    <dt>Placed</dt><dd>${order.placed}</dd>\n    <dt>Status</dt><dd>${order.status}</dd>\n` +
      `    <dt>Total</dt><dd>${money(order.total)}</dd>\n  </dl>\n  <h2>Items</h2>\n  <ul class="order-items">\n${items}\n  </ul>\n` +
      `  <p><a href="/orders">Back to orders</a></p>\n`,
  };
}

/** The template with its title, select state and main content replaced. */
export function fillTemplate(template: string, page: Rendered): string {
  let html = template.replace(/<title>[^<]*<\/title>/, `<title>${esc(page.title)}</title>`);
  html = html.replace(
    /<main id="content" tabindex="-1">[\s\S]*?<\/main>/,
    `<main id="content" tabindex="-1">\n${page.main}</main>`,
  );
  if (page.status === "Shipped")
    html = html.replace("<option>Shipped</option>", "<option selected>Shipped</option>");
  return html;
}
