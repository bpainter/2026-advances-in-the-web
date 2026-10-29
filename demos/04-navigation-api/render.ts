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
interface Fixture {
  orders: Order[];
  /** Shipping address per customer: street, then city, region and postal code. */
  customers: Record<string, [string, string]>;
}
let cache: Fixture | null = null;

function fixture(): Fixture {
  if (!cache) cache = JSON.parse(readFileSync(FIXTURE, "utf8")) as Fixture;
  return cache;
}

export function orders(): Order[] {
  return fixture().orders;
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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "19 Oct 2026": no numeric dates on screen (CX fixture copy). */
function day(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

function money(n: number): string {
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
}

/** "18 Oct": the list and the timeline drop the year the header already gives. */
function shortDay(iso: string, plus = 0): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + plus));
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
}

/** A stable time of day per order, so every render of an order reads the same. */
function clock(id: number, plusMinutes = 0): string {
  const minutes = (8 + ((id * 5) % 9)) * 60 + ((id * 17) % 60) + plusMinutes;
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

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
        `    <li><a href="/orders/${o.id}">Order ${o.id}</a>` +
        `<span class="order-list__customer">${esc(o.customer)}</span>` +
        `<span class="order-list__meta">${shortDay(o.placed)}, ${plural(o.items.reduce((n, i) => n + i.qty, 0), "item")}</span>` +
        `<span class="order-list__total">${money(o.total)}</span></li>`,
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
  const fx = fixture();
  const [street, city] = fx.customers[order.customer] ?? ["", ""];
  const count = fx.orders.filter((o) => o.customer === order.customer).length;
  const units = order.items.reduce((n, i) => n + i.qty, 0);
  const shipped = order.status === "Shipped";
  // The fixture can list a product twice; an order shows one line per product.
  const lines = order.items.reduce<Order["items"]>((acc, i) => {
    const same = acc.find((l) => l.name === i.name && l.price === i.price);
    if (same) same.qty += i.qty;
    else acc.push({ ...i });
    return acc;
  }, []);
  const rows = lines
    .map(
      (i) =>
        `        <tr><td>${esc(i.name)}</td><td class="num">${i.qty}</td>` +
        `<td class="num">${money(i.price)}</td><td class="num">${money(i.qty * i.price)}</td></tr>`,
    )
    .join("\n");
  // Placed and paid on the order's day; shipped orders were packed and handed over two days later.
  const steps: [string, string | null][] = [
    ["Placed", `${shortDay(order.placed)}, ${clock(order.id)}`],
    ["Paid", `${shortDay(order.placed)}, ${clock(order.id, 1)}`],
    shipped ? ["Shipped", `${shortDay(order.placed, 2)}, ${clock(order.id, 30)}`] : ["Packing", null],
  ];
  const timeline = steps
    .map(([label, when]) =>
      when
        ? `        <li><span>${label}</span><span class="order-timeline__when">${when}</span></li>`
        : `        <li aria-current="step"><span>${label}</span><span class="order-timeline__when">In progress</span></li>`,
    )
    .join("\n");
  const title = `Order ${order.id}`;
  return {
    title,
    status: order.status,
    found: true,
    main:
      `  <header class="order-head">\n    <h1>${title}</h1>\n` +
      `    <span class="glass-chip glass-chip--${shipped ? "success" : "info"}">${order.status}</span>\n` +
      `    <p class="order-head__meta">Placed ${day(order.placed)}, ${plural(units, "item")}</p>\n  </header>\n` +
      `  <div class="order-detail">\n` +
      `    <section class="order-card order-items" aria-label="Items">\n` +
      `      <table>\n        <thead><tr><th scope="col">Item</th><th scope="col" class="num">Qty</th>` +
      `<th scope="col" class="num">Price</th><th scope="col" class="num">Total</th></tr></thead>\n` +
      `        <tbody>\n${rows}\n        </tbody>\n        <tfoot>\n` +
      `          <tr><th scope="row" colspan="3">Subtotal</th><td class="num">${money(order.total)}</td></tr>\n` +
      `          <tr><th scope="row" colspan="3">Shipping</th><td class="num">Free</td></tr>\n` +
      `          <tr class="order-items__total"><th scope="row" colspan="3">Total</th><td class="num">${money(order.total)}</td></tr>\n` +
      `        </tfoot>\n      </table>\n    </section>\n` +
      `    <div class="order-card order-side">\n` +
      `      <section aria-labelledby="order-customer">\n        <h2 id="order-customer">Customer</h2>\n` +
      `        <p>${esc(order.customer)}</p>\n        <p class="order-side__soft">${plural(count, "order")}</p>\n      </section>\n` +
      `      <section aria-labelledby="order-ship">\n        <h2 id="order-ship">Ship to</h2>\n` +
      `        <address>${esc(street)}<br>${esc(city)}</address>\n      </section>\n` +
      `      <section aria-labelledby="order-timeline">\n        <h2 id="order-timeline">Timeline</h2>\n` +
      `        <ol class="order-timeline">\n${timeline}\n        </ol>\n      </section>\n    </div>\n  </div>\n`,
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
