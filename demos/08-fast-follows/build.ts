import { readFileSync } from "node:fs";
import path from "node:path";
import type { DemoFolder } from "@/lib/frames/types";
import { folderBuild, manifestDefaults } from "@/lib/frames/build-helpers";

const DEMO = "08-fast-follows";
const SECTION_FILES = path.join(
  process.cwd(),
  "content",
  "sections",
  "f1-still-in-motion",
  "files",
);

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

/**
 * The teaser on its own, for a browser without customizable select (the F1 s6 keyboard note):
 * the section's shown form and stylesheet, unchanged, so Firefox shows the plain select live.
 * Submitting the form posts the color back to this page.
 */
function selectPage(url: URL): Response {
  const form = readFileSync(path.join(SECTION_FILES, "index.html"), "utf8");
  const css = readFileSync(path.join(SECTION_FILES, "styles.css"), "utf8");
  const color = url.searchParams.get("color");
  const posted = color ? `<p class="posted">Posted: color=${escapeHtml(color)}</p>` : "";
  const html = [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    "<title>Still in motion: the select, on its own</title>",
    "<style>",
    "body { margin: 3rem; color: #0f1c41; font: 1.5rem/1.5 system-ui, sans-serif; }",
    "label { display: block; margin-block-end: 0.5rem; }",
    ".posted { margin-block-start: 2rem; font-family: ui-monospace, monospace; }",
    css,
    "</style>",
    "</head>",
    "<body>",
    form,
    posted,
    "</body>",
    "</html>",
    "",
  ].join("\n");
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy":
        "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; object-src 'none'",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Cache-Control": "no-store",
    },
  });
}

/** F1 Still in motion: one static frame of six tiles, the live select teaser, the Firefox poster and the rule. */
export const folder: DemoFolder = {
  demo: DEMO,
  builds: {
    static: folderBuild(
      DEMO,
      "static",
      "Still in motion",
      manifestDefaults({
        // The select's open picker, and the replica that stands in when showPicker() is refused, are
        // in the document from the start; nothing is created at runtime.
        sideEffects: [],
      }),
    ),
  },
  routes: [
    {
      method: "GET",
      path: `/demos/${DEMO}/static/select`,
      handler: (_req, { url }) => selectPage(url),
    },
  ],
};
