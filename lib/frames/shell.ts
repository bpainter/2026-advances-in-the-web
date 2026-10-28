import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * The Ridgeline Outfitters portal shell (docs/design/demo-glass-spec.md, section 8), wrapped around
 * a portal build's markup when the frame is composed. It is never shown as code: the shown files
 * stay about the feature, as the theme does (PRD v4, 6.2). Overlay roots, toasts and anything a
 * build positions with `position: fixed` stay direct children of `body`, outside `.portal`.
 */

export interface ShellOptions {
  /** Top bar title, e.g. "Orders". */
  title: string;
  /** Current nav item. */
  nav: NavId;
  /** Ids of elements that must stay outside `.portal` (overlay roots, toasts, fixed layers). */
  outside?: string[];
  /**
   * Unshown context content after the shown markup, so the pane reads as a working portal
   * (design review M6). Plain tables and chips only: it never uses a feature a demo shows.
   */
  context?: "orders" | "cases" | "products";
}

export type NavId = "orders" | "products" | "support" | "content" | "reports";

/** Lucide outline icons (package, shirt, life-buoy, file-text, chart-column), 20 px, stroke 1.75. */
const NAV: { id: NavId; label: string; paths: string }[] = [
  { id: "orders", label: "Orders", paths: '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"/><path d="m7.5 4.27 9 5.15"/>' },
  { id: "products", label: "Products", paths: '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>' },
  { id: "support", label: "Support", paths: '<circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/><circle cx="12" cy="12" r="4"/>' },
  { id: "content", label: "Content", paths: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>' },
  { id: "reports", label: "Reports", paths: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>' },
];

const icon = (paths: string) => `<svg class="portal__nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

function shellHtml(opts: ShellOptions): { before: string; after: string } {
  const links = NAV.map(
    (n) =>
      `<a class="portal__nav-link" href="#${n.id}"${n.id === opts.nav ? ' aria-current="page"' : ""} tabindex="-1">${icon(n.paths)}<span class="portal__nav-label">${n.label}</span></a>`,
  ).join("");
  const before = [
    '<div class="portal">',
    '<nav class="portal__nav" aria-label="Portal">',
    '<p class="portal__brand"><span class="portal__brand-mark" aria-hidden="true">R</span><span class="portal__brand-name">Ridgeline</span></p>',
    '<p class="portal__nav-heading">Operations</p>',
    links,
    "</nav>",
    `<header class="portal__top"><p class="portal__title">${opts.title}</p><div class="portal__actions"><span class="portal__avatar" aria-hidden="true">BP</span></div></header>`,
    '<div class="portal__main">',
  ].join("");
  return { before, after: "</div></div>" };
}

const esc = (v: string | number) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const CHIP: Record<string, string> = { Open: "info", Shipped: "success", Pending: "pending", Resolved: "success" };
const chip = (status: string) => `<span class="glass-chip glass-chip--${CHIP[status] ?? "neutral"}">${esc(status)}</span>`;

function table(title: string, head: string[], rows: string[][]): string {
  const th = head.map((h, i) => `<th scope="col"${i === head.length - 1 ? ' class="glass-table__num"' : ""}>${esc(h)}</th>`).join("");
  const tr = rows.map((r) => `<tr>${r.map((c, i) => `<td${i === r.length - 1 ? ' class="glass-table__num"' : ""}>${c}</td>`).join("")}</tr>`).join("");
  return `<section class="glass-card portal-context" aria-label="${esc(title)}"><h2 class="glass-card__title">${esc(title)}</h2><table class="glass-table"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></section>`;
}

function contextHtml(kind: NonNullable<ShellOptions["context"]>): string {
  const root = process.cwd();
  if (kind === "orders") {
    const orders = (JSON.parse(readFileSync(path.join(root, "demos", "04-navigation-api", "fixtures", "orders.json"), "utf8")) as { orders: { id: number; customer: string; status: string; total: number }[] }).orders;
    const rows = orders.filter((o) => o.id !== 418).slice(0, 4).map((o) => [`Order ${o.id}`, esc(o.customer), chip(o.status), `$${o.total.toFixed(2)}`]);
    return table("Recent orders", ["Order", "Customer", "Status", "Total"], rows);
  }
  const data = JSON.parse(readFileSync(path.join(root, "fixtures", "portal-context.json"), "utf8")) as { cases: { id: string; subject: string; status: string }[]; products: { sku: string; name: string; stock: number; price: string }[] };
  if (kind === "cases") return table("Recent cases", ["Case", "Subject", "Status"], data.cases.map((c) => [esc(c.id), esc(c.subject), chip(c.status)]));
  return table("Catalog", ["Product", "Stock", "Price"], data.products.map((p) => [esc(p.name), esc(p.stock), esc(p.price)]));
}

/**
 * Wraps `body` (the build's markup) in the shell. The markup is never reparsed: an HTML library's
 * parser can restructure new syntax (a customizable select's button and option content), so the
 * string is wrapped as written. Elements named in `outside` (simple elements such as an empty
 * overlay root) are lifted out of the shell to follow it.
 */
export function wrapInShell(body: string, opts: ShellOptions): string {
  let inner = body;
  const after: string[] = [];
  for (const id of opts.outside ?? []) {
    const re = new RegExp(`<([a-z][\\w-]*)\\b[^>]*\\bid="${id}"[^>]*>[\\s\\S]*?</\\1>\\s*`, "i");
    const m = re.exec(inner);
    if (!m) throw new Error(`shell: no element with id "${id}" to place outside the portal`);
    after.push(m[0].trim());
    inner = inner.slice(0, m.index) + inner.slice(m.index + m[0].length);
  }
  const shell = shellHtml(opts);
  const context = opts.context ? `\n${contextHtml(opts.context)}` : "";
  return `${shell.before}\n${inner}${context}\n${shell.after}\n${after.join("\n")}`;
}
