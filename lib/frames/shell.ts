import "server-only";
import { parseHTML } from "linkedom";

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

/** Wraps `body` (the build's markup) in the shell; scripts and the `outside` ids follow the shell. */
export function wrapInShell(body: string, opts: ShellOptions): string {
  const { document } = parseHTML(`<!doctype html><html><body>${body}</body></html>`);
  const outside = new Set(opts.outside ?? []);
  const inner: string[] = [];
  const after: string[] = [];
  for (const node of [...document.body.childNodes]) {
    const el = node as unknown as { nodeType: number; tagName?: string; id?: string; outerHTML?: string; textContent?: string };
    const html = el.nodeType === 1 ? el.outerHTML! : el.nodeType === 3 ? el.textContent!.replace(/&/g, "&amp;").replace(/</g, "&lt;") : el.nodeType === 8 ? `<!--${el.textContent}-->` : "";
    if (el.nodeType === 1 && (el.tagName === "SCRIPT" || (el.id && outside.has(el.id)))) after.push(html);
    else inner.push(html);
  }
  const shell = shellHtml(opts);
  return `${shell.before}${inner.join("")}${shell.after}\n${after.join("\n")}`;
}
