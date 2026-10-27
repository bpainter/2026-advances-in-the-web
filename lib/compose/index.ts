import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Demo } from "@/content/schema";

/** CSP for a composed demo document (PRD Part A, section 7.2). */
export const DEMO_CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "media-src 'self'",
  "connect-src 'none'",
  "frame-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'self'",
].join("; ");

const BRIDGE = readFileSync(path.join(process.cwd(), "lib", "demo-bridge.js"), "utf8");

const FONT_FACES = `
@font-face { font-family: "Slalom Sans"; src: url("/fonts/SlalomSans-Regular.woff2") format("woff2"); font-weight: 400; font-display: swap; }
@font-face { font-family: "Slalom Sans"; src: url("/fonts/SlalomSans-Bold.woff2") format("woff2"); font-weight: 700; font-display: swap; }
@font-face { font-family: "Lora"; src: url("/fonts/Lora-Italic.woff2") format("woff2"); font-style: italic; font-display: swap; }
`.trim();

/** Spotlight for the element a code step targets (bridge `demo:highlight`); outline plus a short pulse, transform and opacity only. */
const SPOTLIGHT_STYLE = `
[data-spotlight] { outline: 3px solid #0C62FB; outline-offset: 4px; animation: demo-spotlight 240ms cubic-bezier(0.22, 1, 0.36, 1); }
@keyframes demo-spotlight { from { opacity: 0.6; scale: 0.98; } to { opacity: 1; scale: 1; } }
@media (prefers-reduced-motion: reduce) { [data-spotlight] { animation: none; } }
html[data-reduced-motion="true"] [data-spotlight] { animation: none; }
`.trim();

function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function humanise(id: string): string {
  return id.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

/** Strips `<link rel="stylesheet" href="X">` and `<script src="X"></script>` for files the composer inlines. */
function stripLocalRefs(html: string, files: string[]): string {
  let out = html;
  for (const file of files) {
    const f = file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(`<link[^>]*href=["']${f}["'][^>]*>\\s*`, "gi"), "");
    out = out.replace(new RegExp(`<script[^>]*src=["']${f}["'][^>]*>\\s*</script>\\s*`, "gi"), "");
  }
  return out;
}

/** The html files a demo serves as pages; route-kind demos may have several. */
export function demoPages(demo: Demo): string[] {
  return demo.code.filter((f) => f.lang === "html").map((f) => f.file);
}

/**
 * Assembles a demo's `code` files into one standalone HTML document; `page` picks which html file
 * is the body when a demo has several. Deterministic. (PRD Part A, section 7.2)
 */
export function composeDemo(demo: Demo, page?: string): string {
  const htmlFiles = demo.code.filter((f) => f.lang === "html" && (!page || f.file === page)).slice(0, 1);
  const cssFiles = demo.code.filter((f) => f.lang === "css");
  const jsFiles = demo.code.filter((f) => f.lang === "js" || f.lang === "ts");
  const inlined = [...cssFiles, ...jsFiles].map((f) => f.file);

  let body = stripLocalRefs(htmlFiles.map((f) => f.source).join("\n"), inlined);
  // A page written as `<!doctype html>` + `<title>` + body (no <html>/<head>) is treated as a fragment.
  let title = humanise(demo.id);
  if (/^\s*<!doctype/i.test(body) && !/<html[\s>]/i.test(body)) {
    body = body.replace(/^\s*<!doctype[^>]*>\s*/i, "");
    const t = /<title>([^<]*)<\/title>\s*/i.exec(body);
    if (t) {
      title = t[1];
      body = body.replace(t[0], "");
    }
  }

  const requires = JSON.stringify(demo.requires ?? []);
  const injectedHead = [
    `<meta charset="utf-8">`,
    `<meta name="viewport" content="width=device-width, initial-scale=1">`,
    `<meta name="color-scheme" content="light">`,
    `<title>${escapeAttr(title)}</title>`,
    `<style data-file="fonts">${FONT_FACES}</style>`,
    `<script>window.__DEMO_REQUIRES__ = ${requires};</script>`,
    `<script data-file="demo-bridge.js">${BRIDGE}</script>`,
    `<style data-file="spotlight">${SPOTLIGHT_STYLE}</style>`,
    ...cssFiles.map((f) => `<style data-file="${escapeAttr(f.file)}">\n${f.source}\n</style>`),
  ].join("\n");

  const scripts = jsFiles
    .map((f) => `<script type="module" data-file="${escapeAttr(f.file)}">\n${f.source}\n</script>`)
    .join("\n");

  if (/^\s*<!doctype/i.test(body)) {
    // Full document authored by the demo: inject our head content right after <head>.
    return body
      .replace(/<html(\s[^>]*)?>/i, (m) => (m.includes("data-demo-id") ? m : m.replace(">", ` data-demo-id="${escapeAttr(demo.id)}">`)))
      .replace(/<head(\s[^>]*)?>/i, (m) => `${m}\n${injectedHead}`)
      .replace(/<\/body>/i, `${scripts}\n</body>`);
  }

  return [
    `<!doctype html>`,
    `<html lang="en-CA" data-demo-id="${escapeAttr(demo.id)}">`,
    `<head>`,
    injectedHead,
    `</head>`,
    `<body>`,
    body,
    scripts,
    `</body>`,
    `</html>`,
    ``,
  ].join("\n");
}
