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

interface Review {
  author: string;
  rating: number;
  body: string;
}
interface Fixtures {
  approved: string;
  promo: string;
  reviews: Review[];
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * The reviews block as CMS rich text, the same markup the today build's reviews.js writes (heading
 * with the count, one item per review), so both pages show the same reviews. The native page
 * renders it through its one policy, which sanitizes it like any CMS field.
 */
function reviewsHtml(reviews: Review[]): string {
  const items = reviews
    .map((r) => {
      const stars = "\u2605".repeat(r.rating) + "\u2606".repeat(5 - r.rating);
      return (
        `<li class="review"><p class="review__meta"><strong>${esc(r.author)}</strong>` +
        `<span class="review__stars" aria-label="${r.rating} of 5">${stars}</span></p>` +
        `<div class="review__body">${r.body}</div></li>`
      );
    })
    .join("");
  return `<h2>Reviews <span class="count">(${reviews.length})</span></h2><ul class="review-list">${items}</ul>`;
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
  // The CMS response the shown app.js fetches on load: the approved description, the reviews and
  // the promotion, the same three fields the today build renders (review r6 M5).
  {
    method: "GET",
    path: "/cms/ridgeline.json",
    handler: () => {
      const data = fixtures() as unknown as Fixtures;
      return json({ body: data.approved, reviews: reviewsHtml(data.reviews), promo: data.promo });
    },
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
        wrapper: { id: "product-page" },
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
        wrapper: { id: "product-page" },
        styles: ["/portal/05-trusted-types.css"],
      }),
    ),
  },
  routes,
};
