import type { DemoSection } from "@/content/demo-schema";
import { excerpt, sectionFile } from "@/lib/demo-files";

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
  order: 8,
  label: "Shop the look",
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
      intro:
        "Next is a storefront photo you can shop. Each pin opens a product card beside it. Near an edge, the card has to move.",
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
      title: "How we used to do it",
      intro: "Each pin opens a product card. Script decides where it fits.",
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
          bullets: ["The shell pin opens its card. The card sits in a box at the page end."],
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
          bullets: ["The shoe pin is near the edge, so the card flips left. CSS keeps a class per side."],
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
            "The photo narrows, and the card follows.",
            "Script checks each edge and reacts to every scroll and resize: 71 lines.",
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
      title: "How we do it now",
      intro: "This is the same photo with no positioning script. Each card is a popover tied to its pin.",
      split: "60/40",
      frame: {
        build: "native",
        route: "/demos/12-anchor-hotspots/native",
        viewport: { width: 768, height: 628 },
        flags: { "enhance-css": true },
        hooks: ["reset"],
      },
      files: [
        { file: "index.html", lang: "html", source: sectionFile("m1-shop-the-look", "index.html") },
        { file: "look.css", lang: "css", source: sectionFile("m1-shop-the-look", "look.css") },
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
            "The shell pin opens its card on the right.",
            "Anchor name marks the pin. Position anchor ties the card to it.",
            "Position area picks the side of the pin.",
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
            "The shoe pin is near the edge, so the card opens on the left.",
            "Position try fallbacks lists other sides to try when one does not fit.",
            "Chrome flips the arrow too. Other browsers hide it for now.",
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
            "The photo narrows. The open card stays beside its pin.",
            "The browser places it again after every layout change.",
            "We wrote no measuring code and no listeners.",
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
  ],
  cautions: [
    "Without support, the card opens centered over the photo. Check that it still works.",
    "Test zoom and small screens. A card with no room can cover its pin.",
    "Arrow flips and position visibility still differ by browser. Check each one.",
  ],
};
