import "server-only";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { PRESENTER_ORIGIN } from "./origins";
import type { BuildDef } from "./types";
import { wrapInShell } from "./shell";
import { isBackgroundId, type BackgroundId } from "@/content/backgrounds";

/** The shared portal theme (PRD v4, 6.2), copied from styles/glass-tokens.css by pnpm theme:sync. */
export const THEME_HREF = "/theme/portal-glass.css";
/** Per-section frame images (PRD v5, 4.2), written from content/backgrounds.ts by pnpm theme:sync. */
export const BACKGROUNDS_HREF = "/theme/backgrounds.css";

/** The section background of each demo folder's frames (PRD v5, 1.3); `pnpm check` keeps it in step with content. */
export const BACKGROUND_BY_DEMO: Record<string, BackgroundId> = {
  "01-layered-ui": "d1",
  "02-container-card": "d2",
  "03-content-sized-form": "d3",
  "04-navigation-api": "d4",
  "05-trusted-types": "d5",
  "11-customizable-select": "d6",
  "08-fast-follows": "f1",
  "07-package-workflow": "f3",
  "09-vite-8": "f4",
  "10-delete": "f5",
};

/** Base CSP for frame documents (PRD Part A, 14.1); `ORIGIN` and `PRESENTER` are substituted. */
export const BASE_CSP =
  "default-src 'none'; script-src ORIGIN; style-src ORIGIN 'unsafe-inline'; img-src ORIGIN data:; font-src ORIGIN; connect-src ORIGIN; form-action ORIGIN; base-uri 'none'; object-src 'none'; frame-ancestors PRESENTER";

function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

export interface ComposeOptions {
  /** Flags in effect for this document (from `?flags=`). */
  flags: Record<string, boolean>;
  /** Origin the document is served from, for the CSP. */
  origin: string;
  /** Body HTML; defaults to the build's index.html. */
  body?: string;
  title?: string;
  /** The section background id from `?bg=`; ignored unless it is a registry id (PRD v5, 4.2). */
  bg?: string | null;
}

/**
 * Wraps a build's index.html (inserted byte for byte) in the frame shell: charset, viewport, the
 * presenter origin, the runtime, flag metadata. Enhancement stylesheets are tagged so the runtime
 * can disable them in place; enhancement scripts are left out when `enhance-js` is off (8.4, 9).
 */
export function composeFrame(def: BuildDef, opts: ComposeOptions): string {
  const { manifest } = def;
  let body = opts.body ?? readFileSync(path.join(def.dir, "index.html"), "utf8");
  const cssMode = manifest.enhancement.css;
  const cssFiles = typeof cssMode === "object" ? cssMode.files : null;
  // Tag enhancement stylesheets (mode "all" tags every author stylesheet; "files" the named ones).
  if (cssMode !== "supports-blocks") {
    body = body.replace(/<link([^>]*rel="stylesheet"[^>]*)>/g, (m, attrs: string) => {
      const href = /href="([^"]+)"/.exec(attrs)?.[1] ?? "";
      const base = href.split("/").pop() ?? href;
      const enhancement = cssFiles ? cssFiles.includes(base) : true;
      if (!enhancement || attrs.includes("data-flag")) return m;
      const disabled = opts.flags["enhance-css"] === false ? " disabled" : "";
      return `<link${attrs} data-flag="enhance-css"${disabled}>`;
    });
  }
  // Enhancement scripts are removed when enhance-js is off; instrumentation stays.
  if (opts.flags["enhance-js"] === false && manifest.enhancement.js.length) {
    body = body.replace(/<script\b[^>]*src="([^"]+)"[^>]*>\s*<\/script>\s*/g, (m, src: string) => {
      const base = src.split("/").pop() ?? src;
      return manifest.enhancement.js.includes(base) ? "" : m;
    });
  }
  // The portal shell wraps portal builds' markup; it is never part of the shown code.
  if (manifest.shell) body = wrapInShell(body, manifest.shell);
  // Instrumentation and hooks the manifest lists are injected after the shown markup; they are
  // never part of the code on screen (Part A, 8.4).
  const instrumentation = manifest.instrumentation.map((f) => `<script type="module" src="${escapeAttr(f)}"></script>`).join("\n");
  const flagsAttr = Object.entries(opts.flags)
    .map(([k, v]) => `${k}:${v ? 1 : 0}`)
    .join(",");
  const mode = typeof cssMode === "string" ? cssMode : "files";
  // `?bg=` names the section; documents the frame loads itself (D4's script-off links, F3's
  // timeline) carry none, so the demo folder's section is the default.
  const bg = opts.bg && isBackgroundId(opts.bg) ? opts.bg : (BACKGROUND_BY_DEMO[manifest.demo] ?? null);
  return [
    "<!doctype html>",
    `<html lang="en" data-demo="${escapeAttr(manifest.demo)}" data-build="${manifest.build}" data-flags="${escapeAttr(flagsAttr)}" data-enhance-css-mode="${mode}"${bg ? ` data-section-bg="${bg}"` : ""}>`,
    "<head>",
    // The theme comes first, so every build's own CSS (shown CSS is unlayered) wins over it. The
    // enhance-css flag never touches it: it is not tagged.
    `<link rel="stylesheet" href="${THEME_HREF}">`,
    `<link rel="stylesheet" href="${BACKGROUNDS_HREF}">`,
    ...(manifest.styles ?? []).map((href) => `<link rel="stylesheet" href="${escapeAttr(href)}">`),
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta name="color-scheme" content="light">',
    `<meta name="presenter-origin" content="${escapeAttr(PRESENTER_ORIGIN)}">`,
    `<title>${escapeAttr(opts.title ?? def.title)}</title>`,
    '<script src="/runtime/demo-runtime.js"></script>',
    "</head>",
    "<body>",
    body.replace(/\n$/, ""),
    instrumentation,
    "</body>",
    "</html>",
    "",
  ].join("\n");
}

export function cspFor(def: BuildDef, origin: string, flags: Record<string, boolean>): { header: string; value: string } {
  const template = def.manifest.csp ?? BASE_CSP;
  const value = template.replace(/ORIGIN/g, origin).replace(/PRESENTER/g, PRESENTER_ORIGIN);
  // D5: the Trusted Types directives are enforced only when csp-enforce is on (Part A, 9).
  const reportOnly = def.manifest.flags["csp-enforce"] && flags["csp-enforce"] === false;
  return { header: reportOnly ? "Content-Security-Policy-Report-Only" : "Content-Security-Policy", value };
}

export function frameResponse(html: string, def: BuildDef, origin: string, flags: Record<string, boolean>): Response {
  const csp = cspFor(def, origin, flags);
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      [csp.header]: csp.value,
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Cache-Control": "no-store",
    },
  });
}

const TYPES: Record<string, string> = {
  css: "text/css; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  mjs: "text/javascript; charset=utf-8",
  json: "application/json; charset=utf-8",
  html: "text/html; charset=utf-8",
  txt: "text/plain; charset=utf-8",
  http: "text/plain; charset=utf-8",
  yaml: "text/plain; charset=utf-8",
  yml: "text/plain; charset=utf-8",
  svg: "image/svg+xml",
  png: "image/png",
  avif: "image/avif",
  webp: "image/webp",
  woff2: "font/woff2",
};

/** A file of a build, served from its directory; null when it is not there or escapes the directory. */
export function buildFile(def: BuildDef, file: string): Response | null {
  const dirs = [def.dir, ...(def.extraDir ? [def.extraDir] : [])];
  let abs: string | null = null;
  for (const dir of dirs) {
    const candidate = path.resolve(dir, file);
    if (candidate.startsWith(path.resolve(dir) + path.sep) && existsSync(candidate)) {
      abs = candidate;
      break;
    }
  }
  if (!abs) return null;
  if (def.files && !def.files.includes(file)) return null;
  const ext = abs.split(".").pop() ?? "";
  return new Response(readFileSync(abs), {
    status: 200,
    headers: { "Content-Type": TYPES[ext] ?? "application/octet-stream", "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" },
  });
}
