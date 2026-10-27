import type { Demo } from "@/content/schema";
import { demoCode } from "@/lib/demo-files";

export const demo: Demo = {
  id: "anchor-positioning",
  live: {
    kind: "srcdoc",
    browsers: ["firefox", "chrome", "safari"],
  },
  code: demoCode("anchor-positioning", [
    {
      file: "index.html",
      lang: "html",
    },
    {
      file: "styles.css",
      lang: "css",
    },
    {
      file: "card.css",
      lang: "css",
    },
    {
      file: "app.js",
      lang: "js",
    },
  ]),
  // The "before" beat: the same tooltip placed by getBoundingClientRect and listeners.
  legacy: {
    code: demoCode("anchor-positioning", [
      {
        file: "legacy/index.html",
        lang: "html",
      },
      {
        file: "legacy/styles.css",
        lang: "css",
      },
      {
        file: "card.css",
        lang: "css",
      },
      {
        file: "legacy/app.js",
        lang: "js",
      },
    ]),
  },
  requires: [
    { id: "anchor-name", kind: "css-supports", query: "anchor-name: --a" },
    { id: "position-area", kind: "css-supports", query: "position-area: top" },
  ],
  liveStates: ["top", "edge", "right"],
  steps: [
    // Beat 1: today, with a pile of JavaScript.
    // prettier-ignore
    {
      id: "b1",
      file: "legacy/app.js",
      highlight: [[8, 12], [20, 25]],
      caption: "Today a tooltip starts with getBoundingClientRect and arithmetic for one side.",
      action: "The tip appears above the Free shipping badge, placed by the script.",
      liveState: "top",
      phase: "before",
      target: ".tip",
    },
    // prettier-ignore
    {
      id: "b2",
      file: "legacy/app.js",
      highlight: [[23, 24], [49, 55]],
      caption: "The flip is a branch that only runs because scroll and resize listeners re-measure on every move.",
      action: "The page scrolls; the badge nears the top edge and the script flips the tip under it.",
      liveState: "edge",
      phase: "before",
      target: ".tip",
    },
    // prettier-ignore
    {
      id: "b3",
      file: "legacy/app.js",
      highlight: [[15, 19], [26, 27]],
      caption: "Every other side is another branch and another clamp, which is why Floating UI exists.",
      action: "The tip jumps beside the badge and the page scrolls back.",
      liveState: "right",
      phase: "before",
      target: ".tip",
    },
    // Beat 2: now, native.
    {
      id: "a1",
      highlight: [],
      caption: "The same tooltip, with no script for placement.",
      action: "The tip sits above the badge again, placed by CSS.",
      liveState: "top",
      phase: "after",
    },
    {
      id: "a2",
      highlight: [],
      caption: "Near the edge it flips on its own; no listener fired.",
      action: "The page scrolls a little and the tip flips under the badge.",
      liveState: "edge",
      phase: "after",
    },
    {
      id: "a3",
      highlight: [],
      caption: "Any side is one keyword away.",
      action: "The tip moves beside the badge and the page scrolls back.",
      liveState: "right",
      phase: "after",
    },
    // Beat 3: the code.
    {
      id: "s1",
      file: "styles.css",
      highlight: [12],
      caption: "Name the anchor.",
      action: "The tip sits above the Free shipping badge; the badge is spotlit.",
      liveState: "top",
      target: ".ship",
    },
    {
      id: "s2",
      file: "styles.css",
      highlight: [[18, 20]],
      caption: "Attach the tip to it and put it on top. Fixed, so it never disturbs the card.",
      action: "Nothing moves yet; this is the resting position.",
      liveState: "top",
      target: ".tip",
    },
    {
      id: "s3",
      file: "styles.css",
      highlight: [21],
      caption: "No room above? Flip below. No resize observer, no scroll listener.",
      action: "The page scrolls; the badge nears the top edge and the tip flips under it.",
      liveState: "edge",
      target: ".tip",
    },
    {
      id: "s4",
      file: "styles.css",
      highlight: [[47, 50]],
      caption: "Any side is one keyword away. The slide swaps it to right span-bottom here.",
      action: "The page scrolls back and the tip moves beside the badge, over the image.",
      liveState: "right",
      target: ".tip",
    },
    {
      id: "s5",
      file: "styles.css",
      highlight: [[40, 44]],
      caption: "Standalone it is a real tooltip: hover or focus shows it. The stage keeps it open.",
      action:
        "The tip returns above the badge. Open /demos/anchor-positioning in a tab and hover it.",
      liveState: "top",
      target: ".ship",
    },
  ],
  fork: [
    "https://codepen.io/web-dot-dev/embed/MYaOgmj",
    "https://www.joshwcomeau.com/css/anchor-positioning/",
    "https://chrome.dev/anchor-tool",
  ],
  fallback: "https://codepen.io/web-dot-dev/embed/MYaOgmj",
  wow: "The tooltip flips at the viewport edge with no JavaScript.",
  gotcha:
    "Names churned: inset-area became position-area and position-try-options became position-try-fallbacks; the old names fail silently. A popover needs inset: auto before anchoring or the UA centring wins. Overflow alignment differed between Safari and Chrome as of October 2025 and Safari was deemed correct. A fallback that fit once is remembered until the box is rebuilt (the last successful position option), so after the edge flip the stage rebuilds the tip once the page has scrolled back.",
};
