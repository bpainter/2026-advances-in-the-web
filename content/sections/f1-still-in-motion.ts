import type { DemoSection } from "@/content/demo-schema";

/** F1: five features worth prototyping now, one tile at a time (PRD v4, 2.3). */
export const section: DemoSection = {
  id: "f1-still-in-motion",
  order: 7,
  label: "Still in motion",
  scenario: "Five features worth trying now that are not ready to recommend for production.",
  pages: [
    {
      id: "f1-single",
      stage: "single",
      badge: { text: "A wait signal on each tile" },
      title: "Still in motion",
      intro:
        "The six demos so far work in every browser. These five are close but still moving. Each tile names a use and what we are waiting for.",
      frame: {
        build: "static",
        route: "/demos/08-fast-follows/static",
        viewport: { width: 1304, height: 628 },
        hooks: ["reset"],
      },
      steps: [
        { id: "s0", label: "Empty grid", actions: [{ type: "hook", name: "reset" }], bullets: [] },
        {
          id: "s1",
          label: "Anchor positioning",
          actions: [{ type: "reveal", target: "#tile-anchor" }],
          spotlight: ["#tile-anchor"],
          bullets: [
            "Anchor positioning places a menu or tooltip next to the element it belongs to.",
            "Small syntax details still change between browsers.",
          ],
        },
        {
          id: "s2",
          label: "Layout and transitions",
          actions: [
            { type: "reveal", target: "#tile-grid-lanes" },
            { type: "wait", ms: 300 },
            { type: "reveal", target: "#tile-xdoc-vt" },
          ],
          spotlight: ["#tile-grid-lanes", "#tile-xdoc-vt"],
          bullets: [
            "Grid Lanes builds masonry layouts. Safari renamed one of its properties in October.",
            "Cross-document view transitions animate moves between pages. They are waiting on Baseline status.",
          ],
        },
        {
          id: "s3",
          label: "Scroll and components",
          actions: [
            { type: "reveal", target: "#tile-scroll-driven" },
            { type: "wait", ms: 300 },
            { type: "reveal", target: "#tile-scoped-registries" },
          ],
          spotlight: ["#tile-scroll-driven", "#tile-scoped-registries"],
          bullets: [
            "Scroll-driven animations tie progress bars to scrolling.",
            "Scoped registries let two versions of a component share one page. Support is not cross-browser yet.",
          ],
        },
        {
          id: "s4",
          label: "The rule",
          key: true,
          actions: [{ type: "reveal", target: "#rule" }],
          spotlight: ["#rule"],
          bullets: [
            "Prototype now. Check Baseline and Interop. Move a feature into production when support settles.",
          ],
        },
      ],
      timing: { minutes: 1.0 },
      cutPriority: 4,
    },
  ],
  citations: [
    {
      text: "Andrew, Interop 2026: anchor positioning, dialogs and popovers, scroll-driven animations, view transitions, scoped custom element registries as focus areas",
      url: "https://web.dev/blog/interop-2026",
    },
    {
      text: "WebDX Community Group, Baseline 2026",
      url: "https://web.dev/baseline/2026",
    },
    {
      text: "Customizable select support: Chrome 135, Safari 27, Firefox prefs only",
      url: "https://webstatus.dev/features/customizable-select",
    },
    {
      text: "Keith, Enhancing with CSS Grid Lanes, 16 Jun 2026",
      url: "https://adactio.com/journal/22613",
    },
    {
      text: "The Session event page with Grid Lanes (view in Safari)",
      url: "https://thesession.org/events/11446",
    },
    {
      text: "Simmons, Etemad, Stewart, Introducing CSS Grid Lanes, 19 Dec 2025",
      url: "https://webkit.org/blog/17660/introducing-css-grid-lanes/",
    },
    {
      text: "Simmons, Grid Lanes demo",
      url: "https://webkit.org/demos/grid3/",
    },
    {
      text: "Matuzović, Your Grid Lanes will likely fail WCAG 2.4.3, 24 Jun 2026",
      url: "https://www.matuzo.at/blog/2026/grid-lanes-accessibility",
    },
  ],
  cautions: [],
};
