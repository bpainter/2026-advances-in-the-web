import type { DemoSection } from "@/content/demo-schema";

/**
 * F1: the opener of the Still in motion group (docs/design/still-in-motion-demos.md 1.2). Five tiles
 * name the five demos that follow, M1 to M5, with a use and a wait signal each. It stays when a
 * demo is cut, so the room still hears the cut demo's name.
 */
export const section: DemoSection = {
  id: "f1-still-in-motion",
  background: "f1",
  order: 7,
  label: "Still in motion",
  scenario: "Five features worth a prototype now. The next five demos try each one.",
  pages: [
    {
      id: "f1-single",
      stage: "single",
      badge: { text: "A wait signal on each tile" },
      title: "Still in motion",
      intro:
        "The six demos so far are safe to ship. The next five are close, but still moving. We will try each one.",
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
          label: "Reveal the tiles",
          // Five targets exceed the spotlight cap of two, so this step has none.
          actions: [
            { type: "reveal", target: "#tile-anchor" },
            { type: "wait", ms: 150 },
            { type: "reveal", target: "#tile-grid-lanes" },
            { type: "wait", ms: 150 },
            { type: "reveal", target: "#tile-scoped-registries" },
            { type: "wait", ms: 150 },
            { type: "reveal", target: "#tile-scroll-driven" },
            { type: "wait", ms: 150 },
            { type: "reveal", target: "#tile-xdoc-vt" },
          ],
          bullets: ["Each tile names a use and what we are waiting for."],
        },
        {
          id: "s2",
          label: "The rule",
          key: true,
          actions: [{ type: "reveal", target: "#rule" }],
          spotlight: ["#rule"],
          bullets: [
            "Prototype now. Check Baseline and Interop before you ship.",
            "Baseline means all major browsers support it. Interop is their shared yearly test plan.",
          ],
        },
      ],
      timing: { minutes: 0.5 },
    },
  ],
  citations: [
    {
      text: "Andrew, Interop 2026: Continuing to improve the web for developers, 12 Feb 2026: anchor positioning, dialogs and popovers, scroll-driven animations, view transitions, scoped custom element registries as focus areas",
      url: "https://web.dev/blog/interop-2026",
    },
    {
      text: "web.dev, Baseline 2026: the features that became Baseline this year",
      url: "https://web.dev/baseline/2026",
    },
  ],
  cautions: [],
};
