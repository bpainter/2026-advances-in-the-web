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
  ]),
  requires: [
    { id: "anchor-name", kind: "css-supports", query: "anchor-name: --a" },
    { id: "position-area", kind: "css-supports", query: "position-area: top" },
  ],
  liveStates: ["top", "right"],
  steps: [
    {
      id: "s1",
      file: "styles.css",
      highlight: [12],
      caption: "Name the anchor.",
      action: "The tip sits above the Free shipping badge.",
      liveState: "top",
    },
    {
      id: "s2",
      file: "styles.css",
      highlight: [[18, 20]],
      caption: "Attach the tip to it and put it on top. Fixed, so it never disturbs the card.",
      action: "Nothing moves yet; this is the resting position.",
      liveState: "top",
    },
    {
      id: "s3",
      file: "styles.css",
      highlight: [21],
      caption: "No room above? Flip below. No resize observer, no scroll listener.",
      action: "Scroll a little; when the badge nears the top edge the tip flips under it.",
      liveState: "top",
    },
    {
      id: "s4",
      file: "styles.css",
      highlight: [[47, 50]],
      caption: "Any side is one keyword away. The slide swaps it to right span-bottom here.",
      action: "The tip moves beside the badge, over the image.",
      liveState: "right",
    },
    {
      id: "s5",
      file: "styles.css",
      highlight: [[40, 44]],
      caption: "Standalone it is a real tooltip: hover or focus shows it. The stage keeps it open.",
      action: "Open /demos/anchor-positioning in a tab and hover the badge.",
      liveState: "top",
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
    "Names churned: inset-area became position-area and position-try-options became position-try-fallbacks; the old names fail silently. A popover needs inset: auto before anchoring or the UA centring wins. Overflow alignment differed between Safari and Chrome as of October 2025 and Safari was deemed correct.",
};
