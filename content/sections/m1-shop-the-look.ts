import type { DemoSection } from "@/content/demo-schema";
import { excerpt, sectionCode } from "@/lib/demo-files";

const TODAY = "demos/12-anchor-hotspots/today";

/**
 * M1: a "Shop the look" photo with three product pins (docs/design/still-in-motion-demos.md 4).
 * Used to: a hand-written positioning library modeled on Floating UI. Now: popovers opened by
 * invoker commands, tied to their pins with anchor positioning, flipping at the edge and following
 * when the photo narrows. Both pages at the 60/40 split, because the photo is the point.
 */
export const section: DemoSection = {
  id: "m1-shop-the-look",
  background: "m1",
  order: 7,
  label: "Shop the look",
  group: "still-in-motion",
  feature: "Anchor positioning",
  scenario: "Pins on a store photo open product cards. Cards flip at the edge and follow the photo.",
  // The whole feature waits on two Safari 27 position-visibility values; the tiles read the parts
  // this demo uses (spec 3.2). The whole-feature status is in the citations.
  support: {
    kind: "web-features",
    id: "anchor-positioning",
    compatKeys: ["css.properties.anchor-name", "css.properties.position-area", "css.properties.position-try-fallbacks"],
    alsoUses: ["popover", "invoker-commands"],
  },
  pages: [
    {
      id: "m1-intro",
      stage: "intro",
      // Said on arrival; it carries the framing of the removed F1 opener (PRD r7, 8.3).
      intro:
        "Now we’re into features where we need to pay closer attention to the exact parts supported by each browser.\n\nHere’s a product photo with clickable hotspots. Each one opens a card beside the item.\n\nKeeping that card close to its hotspot, and inside the visible area, has usually meant a positioning library or our own measurements. CSS anchor positioning takes over much of that work.",
      description: "Anchor positioning places an element beside another one and moves it when space runs out.",
      visual: {
        src: "/intro/m1-shop-the-look.png",
        alt: "The look photo with a product card open to the left of the shoe pin.",
        capture: { pageId: "m1-now", stepId: "s2" },
      },
      steps: [{ id: "s0", label: "Title and support", actions: [], bullets: [] }],
      timing: { minutes: 0.25 },
      cutPriority: 3,
    },
    {
      id: "m1-used-to",
      stage: "used-to",
      eyebrow: "Anchor positioning",
      title: "What we used to do",
      intro: "The photo has a few product hotspots.\n\nEach card needs to follow its hotspot as the layout changes.",
      split: "60/40",
      frame: {
        build: "today",
        route: "/demos/12-anchor-hotspots/today",
        viewport: { width: 768, height: 628 },
        hooks: ["reset"],
      },
      files: [
        excerpt(`${TODAY}/index.html`, "html", [
          [3, 16],
          [24, 32],
          [69, 74],
        ]),
        excerpt(`${TODAY}/styles.css`, "css", [[1, 24]]),
        excerpt(`${TODAY}/position.js`, "js", [
          [15, 22],
          [43, 53],
        ]),
        excerpt(`${TODAY}/hotspots.js`, "js", [
          [26, 38],
          [65, 83],
        ]),
      ],
      steps: [
        {
          id: "s0",
          label: "The scripted look",
          actions: [],
          code: { file: "index.html", lines: [] },
          bullets: [],
        },
        {
          id: "s1",
          label: "Open the shell card",
          actions: [
            { type: "pointer", to: "#t-pin-shell" },
            { type: "click", target: "#t-pin-shell" },
            { type: "assert", target: "#t-card-shell", expect: "visible" },
          ],
          code: {
            file: "index.html",
            lines: [[13, 15], [21, 23], 29],
          },
          spotlight: ["#t-pin-shell", "#t-card-shell"],
          bullets: [
            "Open the shell jacket.",
            "Our code measures the hotspot and the card, then decides where to place the card. Moving it elsewhere in the document can avoid clipping, but now the connection is something we maintain ourselves.",
          ],
        },
        {
          id: "s2",
          label: "Open the shoe card",
          actions: [
            { type: "pointer", to: "#t-pin-shoe" },
            { type: "click", target: "#t-pin-shoe" },
            { type: "assert", target: "#t-card-shoe", expect: "attr:data-side=left" },
          ],
          code: {
            file: "styles.css",
            lines: [
              [5, 8],
              [19, 24],
            ],
          },
          // The card alone: a pin ring beside it fuses into one shape and hides the arrow (review r6 M2).
          spotlight: ["#t-card-shoe"],
          bullets: [
            "Open the shoe near the edge.",
            "The card doesn’t fit on the usual side, so our code moves it to the other side. The arrow needs to follow that decision too.",
          ],
        },
        {
          id: "s3",
          label: "Narrow the photo",
          key: true,
          actions: [{ type: "resize", target: "#t-look", inlineSize: "72%" }],
          code: {
            file: "position.js",
            lines: [
              [5, 9],
              [14, 20],
            ],
          },
          spotlight: ["#t-card-shoe"],
          meter: {
            label: "JavaScript",
            value: "71 lines",
            source: "non-blank, non-comment lines in /demos/12-anchor-hotspots/today/*.js",
          },
          bullets: [
            "Make the photo narrower.",
            "Now we measure again. Resize listeners and observers keep the card in place. The demo counts 71 lines of positioning JavaScript.",
            "It’s a familiar problem, which is exactly why it’s useful for the platform to handle more of it.",
          ],
        },
      ],
      timing: { minutes: 0.5 },
      cutPriority: 3,
    },
    {
      id: "m1-now",
      stage: "now",
      eyebrow: "Anchor positioning",
      title: "What we can do today",
      intro: "Same photo and hotspots.\n\nIn CSS, we name the anchor and tell the card which anchor it belongs to.",
      split: "60/40",
      frame: {
        build: "native",
        route: "/demos/12-anchor-hotspots/native",
        viewport: { width: 768, height: 628 },
        flags: { "enhance-css": true },
        hooks: ["reset"],
      },
      files: [
        sectionCode("m1-shop-the-look", "index.html", "html"),
        sectionCode("m1-shop-the-look", "look.css", "css"),
      ],
      steps: [
        {
          id: "s0",
          label: "Same look",
          actions: [],
          code: { file: "index.html", lines: [] },
          bullets: [],
        },
        {
          id: "s1",
          label: "Open the shell card",
          actions: [
            { type: "pointer", to: "#pin-shell" },
            { type: "click", target: "#pin-shell" },
            { type: "assert", target: "#card-shell", expect: ":popover-open" },
          ],
          code: { file: "look.css", lines: [[2, 7], [12, 13]] },
          spotlight: ["#pin-shell", "#card-shell"],
          ifKeyboard: "Click the pin. Then press Next once to sync the frame.",
          bullets: [
            "Open the jacket.",
            "`position-anchor` connects the card to the hotspot. `position-area` describes where we’d like it to go.",
            "We describe the relationship instead of calculating the coordinates ourselves.",
          ],
        },
        {
          id: "s2",
          label: "Open the shoe card",
          actions: [
            { type: "pointer", to: "#pin-shoe" },
            { type: "click", target: "#pin-shoe" },
            { type: "assert", target: "#card-shoe", expect: ":popover-open" },
          ],
          code: { file: "look.css", lines: [[14, 15], 21, [31, 33]] },
          // The card alone: a pin ring beside it fuses into one shape and hides the arrow (review r6 M2).
          spotlight: ["#card-shoe"],
          ifKeyboard: "Click the pin. Then press Next once to sync the frame.",
          bullets: [
            "Now open the shoe.",
            "The preferred position doesn’t fit, so the browser tries the fallback positions we’ve supplied.",
            "The arrow is an extra enhancement in this demo. Support for that part is narrower than support for the basic anchored card.",
          ],
        },
        {
          id: "s3",
          label: "Narrow the photo",
          key: true,
          actions: [
            { type: "resize", target: "#look", inlineSize: "72%" },
            { type: "assert", target: "#card-shoe", expect: ":popover-open" },
          ],
          code: { file: "look.css", lines: [[9, 16]] },
          spotlight: ["#card-shoe"],
          meter: {
            label: "JavaScript",
            value: "0 lines",
            source: "non-blank, non-comment lines in content/sections/m1-shop-the-look/files/*.js",
          },
          bullets: [
            "Make the photo narrower again.",
            "The browser updates the position without our positioning listeners. In a browser without the needed anchor support, this example uses a simpler centered card.",
            "The card still opens. It just loses the more precise placement.",
          ],
        },
      ],
      timing: { minutes: 1.25 },
      cutPriority: 3,
    },
  ],
  citations: [
    {
      text: "Comeau, Getting started with anchor positioning, 6 Jul 2026 (updated 20 Oct 2026)",
      url: "https://www.joshwcomeau.com/css/anchor-positioning/",
    },
    {
      text: "Yitbarek, A gentle introduction to anchor positioning (WebKit), 12 Aug 2025",
      url: "https://webkit.org/blog/17240/a-gentle-introduction-to-anchor-positioning/",
    },
    {
      text: "Andrew, New to the web platform in January (web.dev), 30 Jan 2026: Firefox 147 ships anchor positioning",
      url: "https://web.dev/blog/web-platform-01-2026",
    },
    {
      text: "Chrome for Developers, Detect fallback positions with anchored container queries from Chrome 143, 29 Oct 2025",
      url: "https://developer.chrome.com/blog/anchored-container-queries",
    },
    {
      text: "Andrew, Interop 2026, 12 Feb 2026: anchor positioning focus area, carrying the 2025 tests forward",
      url: "https://web.dev/blog/interop-2026",
    },
    {
      text: "Floating UI docs: computePosition and autoUpdate, the API the used-to build is modeled on",
      url: "https://floating-ui.com/docs/computeposition",
    },
    {
      text: "@floating-ui/dom size on Bundlephobia (pull a fresh figure the week of the talk)",
      url: "https://bundlephobia.com/package/@floating-ui/dom",
    },
    {
      text: "Whole feature: not yet Baseline in web-features 3.44.0 (two position-visibility values ship only in Safari 27; position-anchor from Chrome 151, Firefox 151, Safari 27). The tiles show anchor-name, position-area and position-try-fallbacks.",
      url: "https://webstatus.dev/features/anchor-positioning",
    },
    {
      text: "MDN compatibility: position-anchor",
      url: "https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/properties/position-anchor.json",
    },
    {
      text: "MDN compatibility: position-area",
      url: "https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/properties/position-area.json",
    },
    {
      text: "MDN compatibility: container-type",
      url: "https://raw.githubusercontent.com/mdn/browser-compat-data/main/css/properties/container-type.json",
    },
  ],
  cautions: [
    "Without support, the card opens centered over the photo. Check that it still works.",
    "Test zoom and small screens. A card with no room can cover its pin.",
    "Arrow flips and position visibility still differ by browser. Check each one.",
  ],
};
