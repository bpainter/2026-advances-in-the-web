import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { DemoFolder } from "@/lib/frames/types";
import type { ServerRoute } from "@/lib/frames/routes";
import {
  folderBuild,
  nativeBuild,
  manifestDefaults,
  BASE_SANDBOX,
} from "@/lib/frames/build-helpers";

/**
 * D5 Rich content: scattered innerHTML sinks behind a legacy CSP (today) against one Trusted
 * Types policy and a header the `csp-enforce` flag switches between report-only and enforce
 * (native). Headers per PRD Part A, 14.1; `ORIGIN` and `PRESENTER` are substituted by the
 * composer.
 */
const DEMO = "05-trusted-types";
const ROOT = process.cwd();
const EXTRA = path.join(ROOT, "demos", DEMO, "native-extra");
const FIXTURE = path.join(ROOT, "fixtures", "cms-content.json");

/** D5 today: the base policy with inline handlers allowed, like many legacy policies. */
const LEGACY_CSP =
  "default-src 'none'; script-src ORIGIN 'unsafe-inline'; style-src ORIGIN 'unsafe-inline'; img-src ORIGIN data:; font-src ORIGIN; connect-src ORIGIN; form-action ORIGIN; base-uri 'none'; object-src 'none'; frame-ancestors PRESENTER";

/**
 * D5 native: the legacy policy plus the Trusted Types directives exactly as csp-header.http shows
 * them (one line on the wire). Sent as Content-Security-Policy when csp-enforce is on and as
 * Content-Security-Policy-Report-Only when off (lib/frames/compose.ts).
 */
const TRUSTED_TYPES_CSP = `${LEGACY_CSP}; require-trusted-types-for 'script'; trusted-types cms-html dompurify; report-to csp`;

const NO_STORE = { "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" };

function extraFile(file: string): Response {
  const abs = path.join(EXTRA, file);
  if (!existsSync(abs)) return new Response("Not found", { status: 404 });
  return new Response(readFileSync(abs), {
    status: 200,
    headers: { "Content-Type": "text/javascript; charset=utf-8", ...NO_STORE },
  });
}

function fixtures(): Record<string, unknown> {
  return JSON.parse(readFileSync(FIXTURE, "utf8")) as Record<string, unknown>;
}

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf-8", ...NO_STORE },
  });
}

const routes: ServerRoute[] = [
  // The shown app.js imports DOMPurify from a root path; the today build's helper shares the copy.
  { method: "GET", path: "/vendor/purify.es.mjs", handler: () => extraFile("purify.es.mjs") },
  // The violation log both builds load (instrumentation, never shown).
  { method: "GET", path: "/demo/console.js", handler: () => extraFile("console.js") },
  // The CMS response the shown app.js fetches on load: the approved fixture.
  {
    method: "GET",
    path: "/cms/ridgeline.json",
    handler: () => json({ body: fixtures().approved }),
  },
  // The fixtures, fetched relative to either build's document.
  {
    method: "GET",
    path: /^(?:\/demos\/05-trusted-types\/(?:today|native))?\/fixtures\/cms-content\.json$/,
    handler: () => json(fixtures()),
  },
];

export const folder: DemoFolder = {
  demo: DEMO,
  builds: {
    today: folderBuild(
      DEMO,
      "today",
      "Rich content: today",
      manifestDefaults({
        sandbox: BASE_SANDBOX,
        enhancement: {
          css: "all",
          js: ["app.js", "description.js", "reviews.js", "promo.js", "sanitize.js"],
        },
        sideEffects: ["reset"],
        csp: LEGACY_CSP,
        shell: { title: "Content", nav: "content" },
        styles: ["/portal/05-trusted-types.css"],
      }),
    ),
    native: nativeBuild(
      DEMO,
      "d5-rich-content",
      "Rich content: now",
      manifestDefaults({
        sandbox: BASE_SANDBOX,
        flags: { "csp-enforce": true },
        enhancement: { css: "all", js: ["app.js"] },
        instrumentation: ["hooks.js"],
        sideEffects: ["reset"],
        runtimeSelectors: ["#description img"],
        csp: TRUSTED_TYPES_CSP,
        shell: { title: "Content", nav: "content" },
        styles: ["/portal/05-trusted-types.css"],
      }),
    ),
  },
  routes,
};
