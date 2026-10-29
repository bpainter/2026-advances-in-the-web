import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";

/** Shared wrapper markup (docs/design/demo-wrappers-spec.md 3.6): text, chips and icons only. */

export const esc = (v: string | number) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const ROOT = process.cwd();
export function readJson<T>(rel: string): T {
  return JSON.parse(readFileSync(path.join(/*turbopackIgnore: true*/ ROOT, rel), "utf8")) as T;
}

export interface PortalContext {
  talkDate: string;
  store: { name: string; returnsDays: number; product: string; price: number; rating: string; reviews: number; search: string };
  queue: { after: number; count: number };
  pickup: { carrier: string; time: string };
  caseHeader: { order: number; state: string; priority: string; canceled: string };
  editor: { area: string; title: string; price: number; sku: string; state: string; colors: string[]; sizes: [number, number] };
  advisories: { title: string; updated: string; filters: { label: string; value: string }[]; sources: string[] };
  benchmarks: { area: string; runs: string };
  review: { area: string; title: string; state: string };
  /** M1 lookbook (still-in-motion-demos.md 4). */
  lookbook: { area: string; season: string; blurb: string; nav: string[]; cart: number; looks: { title: string; photo: string }[] };
  /** M4 help-center (still-in-motion-demos.md 7). */
  help: { title: string; search: string; crumbs: string[]; hours: string; channels: string[]; updated: string };
  /** M3 editor-pricing (still-in-motion-demos.md 6). */
  pricing: { channels: { name: string; state: string }[]; tabs: string[]; current: string };
}
export const context = () => readJson<PortalContext>("fixtures/portal-context.json");

export interface Order {
  id: number;
  customer: string;
  placed: string;
  status: "Open" | "Shipped";
  items: { name: string; qty: number; price: number }[];
  total: number;
}
export const orders = () => readJson<{ orders: Order[] }>("demos/04-navigation-api/fixtures/orders.json").orders;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "28 Oct 2026": no numeric dates (CX fixture copy). */
export function day(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
export const dollars = (n: number) => (Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`);

/** Lucide outline icons (stroke 1.75), drawn at 20 px with currentColor. */
export const ICONS = {
  truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  shieldAlert: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  package: '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"/><path d="m7.5 4.27 9 5.15"/>',
  shirt: '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>',
  lifeBuoy: '<circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/><circle cx="12" cy="12" r="4"/>',
  fileText: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  gitPull: '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" x2="6" y1="9" y2="21"/>',
} as const;

export function icon(name: keyof typeof ICONS, cls = "wrap-icon"): string {
  return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
}

/** The store's wordmark: a navy "R" mark and the full name (CX: never "Ridgeline" alone). */
export function brand(name: string): string {
  return `<span class="wrap-brand"><span class="wrap-brand__mark" aria-hidden="true">R</span><span class="wrap-brand__name">${esc(name)}</span></span>`;
}

export const avatar = () => '<span class="wrap-avatar" aria-hidden="true">BP</span>';
export const chip = (text: string) => `<span class="wrap-chip">${esc(text)}</span>`;

/**
 * A header bar: brand, divider, area, then the end group. `tag` is `div` where the shown markup
 * has its own `header` (one header per frame, spec 3.6).
 */
export function bar(opts: { name: string; area: string; meta?: string; end?: string[]; tag?: "header" | "div"; label?: string }): string {
  const tag = opts.tag ?? "header";
  const label = opts.tag === "div" ? ` role="presentation"` : "";
  return [
    `<${tag} class="wrap-bar"${label}>`,
    brand(opts.name),
    '<span class="wrap-bar__divider" aria-hidden="true"></span>',
    `<span class="wrap-bar__area">${esc(opts.area)}</span>`,
    opts.meta ? `<span class="wrap-bar__meta">${esc(opts.meta)}</span>` : "",
    `<span class="wrap-bar__end">${(opts.end ?? []).join("")}</span>`,
    `</${tag}>`,
  ].join("");
}

export const BASE_CSS = "/wrappers/base.css";
