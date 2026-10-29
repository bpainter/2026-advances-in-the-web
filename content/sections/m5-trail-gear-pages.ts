import type { DemoSection } from "@/content/demo-schema";
import { excerpt, sectionCode } from "@/lib/demo-files";

const TODAY = "demos/16-cross-document-vt/today";

/**
 * M5: a single-page store with a router and FLIP, then two plain pages with a cross-document view
 * transition (still-in-motion-demos.md 8). The now page is a multi-page build (spec 3.3): each step
 * names the document it ends on in `route`, and its forward run is a real page load in the frame.
 */
export const section: DemoSection = {
  id: "m5-trail-gear-pages",
  background: "m5",
  order: 11,
  label: "Trail gear pages",
  group: "still-in-motion",
  feature: "Cross-document view transitions",
  scenario: "Picking a product grows its photo into the product page, across two real pages.",
  support: {
    kind: "web-features",
    id: "cross-document-view-transitions",
    fallback: { missing: ["firefox"], text: "a normal page load" },
  },
  pages: [
    {
      id: "m5-intro",
      stage: "intro",
      intro:
        "Next is a store category page. Pick a product, and its photo grows into the product page. These are two separate pages.",
      description: "Cross-document view transitions animate the move between pages, with no single-page app.",
      visual: {
        src: "/intro/m5-trail-gear-pages.png",
        alt: "The Ridgeline Trail product page with its large hero photo.",
        capture: { pageId: "m5-now", stepId: "s1" },
      },
      steps: [{ id: "s0", label: "Title and support", actions: [], bullets: [] }],
      timing: { minutes: 0.25 },
    },
    {
      id: "m5-used-to",
      stage: "used-to",
      eyebrow: "Cross-document view transitions",
      title: "What we used to do",
      intro: "Picking a product grows its photo into the product page. We built a single-page app for that.",
      split: "60/40",
      frame: {
        build: "today",
        route: "/demos/16-cross-document-vt/today",
        viewport: { width: 768, height: 628 },
        hooks: ["reset"],
      },
      files: [
        excerpt(`${TODAY}/index.html`, "html", [[1, 26]]),
        excerpt(`${TODAY}/styles.css`, "css", [[1, 20]]),
        excerpt(`${TODAY}/router.js`, "js", [
          [13, 28],
          [47, 52],
        ]),
        excerpt(`${TODAY}/flip.js`, "js", [[1, 18]]),
      ],
      steps: [
        {
          id: "s0",
          label: "The single-page store",
          actions: [],
          code: { file: "index.html", lines: [] },
          bullets: [],
        },
        {
          id: "s1",
          label: "Open Ridgeline Trail",
          actions: [
            { type: "pointer", to: "#t-card-trail" },
            { type: "click", target: "#t-card-trail" },
            { type: "wait", ms: 600 },
            { type: "assert", target: "#t-hero", expect: "visible" },
          ],
          code: {
            file: "index.html",
            lines: [
              [2, 7],
              [14, 16],
            ],
          },
          spotlight: ["#t-hero"],
          bullets: ["The photo grows into the product page. The whole store is one HTML page."],
        },
        {
          id: "s2",
          label: "Go back",
          actions: [
            { type: "navigate", history: "back" },
            { type: "wait", ms: 600 },
            { type: "assert", target: "#t-card-trail", expect: "visible" },
          ],
          code: { file: "styles.css", lines: [[6, 14]] },
          spotlight: ["#t-card-trail"],
          bullets: ["Back shrinks the photo into its card. CSS animates moves that script measures."],
        },
        {
          id: "s3",
          label: "Open Day pack 22 L",
          key: true,
          actions: [
            { type: "pointer", to: "#t-card-daypack" },
            { type: "click", target: "#t-card-daypack" },
            { type: "wait", ms: 600 },
          ],
          code: {
            file: "router.js",
            lines: [
              [3, 7],
              [11, 11],
              [15, 17],
              [21, 22],
            ],
          },
          spotlight: ["#t-hero"],
          meter: {
            label: "JavaScript",
            value: "63 lines",
            source: "non-blank, non-comment lines in /demos/16-cross-document-vt/today/*.js",
          },
          bullets: ["A second product works the same way.", "Script routes, fetches, renders and moves focus: 63 lines."],
        },
      ],
      timing: { minutes: 0.5 },
    },
    {
      id: "m5-now",
      stage: "now",
      eyebrow: "Cross-document view transitions",
      title: "What we can do today",
      intro: "These are two plain HTML pages with no router. One CSS rule asks for a transition between them.",
      split: "60/40",
      frame: {
        build: "native",
        route: "/demos/16-cross-document-vt/native",
        viewport: { width: 768, height: 628 },
        flags: { "enhance-css": true },
        hooks: ["reset"],
      },
      files: [
        sectionCode("m5-trail-gear-pages", "index.html", "html"),
        sectionCode("m5-trail-gear-pages", "product.html", "html"),
        sectionCode("m5-trail-gear-pages", "transitions.css", "css"),
      ],
      steps: [
        {
          id: "s0",
          label: "Category page",
          route: "index.html",
          actions: [],
          code: { file: "index.html", lines: [] },
          bullets: [],
        },
        {
          id: "s1",
          label: "Open Ridgeline Trail",
          route: "product.html?id=trail",
          actions: [
            { type: "pointer", to: "#card-trail" },
            { type: "click", target: "#card-trail" },
            { type: "wait", ms: 600 },
            { type: "assert", target: "#hero", expect: "visible" },
          ],
          code: {
            file: "transitions.css",
            lines: [
              [1, 5],
              [7, 10],
            ],
          },
          spotlight: ["#hero"],
          bullets: [
            "The photo grows into the product page. This is a real page load.",
            "A view transition animates between two states. This rule opts both pages in.",
            "The browser captures the old page and animates to the new one.",
          ],
        },
        {
          id: "s2",
          label: "Go back",
          route: "index.html",
          actions: [
            { type: "navigate", history: "back" },
            { type: "wait", ms: 600 },
            { type: "assert", target: "#card-trail", expect: "visible" },
          ],
          code: { file: "index.html", lines: [[8, 15]] },
          spotlight: ["#card-trail"],
          bullets: [
            "Back shrinks the photo into its card.",
            "Both pages give the photo the same name. That pairs old and new.",
            "Back and forward work, because these are real pages.",
          ],
        },
        {
          id: "s3",
          label: "Open Day pack 22 L",
          key: true,
          route: "product.html?id=daypack",
          actions: [
            { type: "pointer", to: "#card-daypack" },
            { type: "click", target: "#card-daypack" },
            { type: "wait", ms: 600 },
          ],
          code: {
            file: "product.html",
            lines: [
              [4, 7],
              [10, 11],
            ],
          },
          spotlight: ["#hero"],
          meter: {
            label: "JavaScript",
            value: "0 lines",
            source: "non-blank, non-comment lines in content/sections/m5-trail-gear-pages/files/*.js",
          },
          bullets: [
            "A second product works the same way.",
            "Without support, the page loads with no animation.",
            "We deleted the router. We wrote no JavaScript.",
          ],
        },
      ],
      timing: { minutes: 1.25 },
    },
  ],
  citations: [
    {
      text: "Chrome for Developers, Cross-document view transitions for multi-page applications",
      url: "https://developer.chrome.com/docs/web-platform/view-transitions/cross-document",
    },
    {
      text: "Andrew, Interop 2026, 12 Feb 2026: view transitions, including cross-document, as a focus area",
      url: "https://web.dev/blog/interop-2026",
    },
    {
      text: "Same-document view transitions: Baseline Newly available since October 2025",
      url: "https://webstatus.dev/features/view-transitions",
    },
    {
      text: "Cross-document view transitions support: Chrome 126, Edge 126, Safari 18.2, not in Firefox",
      url: "https://webstatus.dev/features/cross-document-view-transitions",
    },
    {
      text: "Van Damme, view-transitions.chrome.dev: Profiles and Stack Navigator MPA demos",
      url: "https://view-transitions.chrome.dev/",
    },
    {
      text: "Archibald, simple-vt-demos: the same-document view transition demos for the Chrome for Developers guide",
      url: "https://github.com/jakearchibald/simple-vt-demos",
    },
    {
      text: "Keith, Reasoning, 14 Oct 2025 (also in D4; say it aloud in one demo only)",
      url: "https://adactio.com/journal/22188",
    },
  ],
  cautions: [
    "Give each paired element a unique name. A duplicate name skips the transition.",
    "Keep transitions short and honor reduced motion. Slow pages make long transitions worse.",
    "Both pages must opt in and share an origin.",
  ],
};
