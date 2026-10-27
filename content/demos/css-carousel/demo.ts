import type { Demo } from "@/content/schema";
import { demoCode } from "@/lib/demo-files";

export const demo: Demo = {
  id: "css-carousel",
  live: {
    kind: "srcdoc",
    browsers: ["chrome"],
  },
  code: demoCode("css-carousel", [
    {
      file: "index.html",
      lang: "html",
    },
    {
      file: "styles.css",
      lang: "css",
    },
    {
      file: "app.js",
      lang: "js",
    },
  ]),
  // Grid cell: no legacy document and no "before" beat; the stage scrolls the scroller itself
  // because ::scroll-button and ::scroll-marker cannot be clicked from script.
  liveStates: ["next2", "dot"],
  steps: [
    {
      id: "s1",
      file: "styles.css",
      highlight: [[29, 44]],
      caption: "Arrows are pseudo-elements; the browser scrolls a page at a time.",
      action: "The gallery scrolls on two items to Sole, as two presses of Next would.",
      liveState: "next2",
      target: ".gallery",
    },
    {
      id: "s2",
      file: "styles.css",
      highlight: [[46, 63]],
      caption:
        "Dots are scroll markers and the current one is :target-current; in Firefox and Safari this is a plain scroll-snap list.",
      action: "The gallery jumps to Lugs and its dot fills in, as a click on that dot would.",
      liveState: "dot",
      target: ".gallery li:nth-child(5)",
    },
  ],
  fork: [
    "https://codepen.io/web-dot-dev/pen/RNaBypZ",
    "https://codepen.io/una/embed/ZYbXgpN",
    "https://chrome.dev/carousel",
  ],
  fallback: "https://codepen.io/web-dot-dev/pen/RNaBypZ",
  wow: "A Swiper-grade carousel in about 15 lines that degrades to a scroll-snap list.",
  gotcha:
    "Browsers expose scroll markers as ARIA tabs, so Sara Soueidan's critique applies: every gallery example is supposed to be a Tabs widget. ARIA is a promise. Chrome has not implemented prev and next for scroll buttons. On stage the steps scroll the scroller from script, which is what the buttons and dots do; the pseudo-elements cannot be clicked from script.",
  support: {
    tier: "one-engine",
    missing: ["safari", "firefox"],
    note: "Chrome and Edge only; one label for all four cells so nobody mistakes the round for a recommendation.",
    since: "Chrome 135+",
  },
};
