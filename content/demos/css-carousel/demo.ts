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
  ]),
  steps: [
    {
      id: "s1",
      file: "styles.css",
      highlight: [[17, 25]],
      caption: "Arrows are pseudo-elements; the browser scrolls a page at a time.",
      action: "Click Next twice.",
    },
    {
      id: "s2",
      file: "styles.css",
      highlight: [[27, 36]],
      caption:
        "Dots are scroll markers; the current one is :target-current. In Firefox and Safari this is a plain scroll-snap list.",
      action: "Click a dot; resize to show the snap fallback.",
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
    "Browsers expose scroll markers as ARIA tabs, so Sara Soueidan's critique applies: every gallery example is supposed to be a Tabs widget. ARIA is a promise. Chrome has not implemented prev and next for scroll buttons.",
  support: {
    tier: "one-engine",
    missing: ["safari", "firefox"],
    note: "Chrome and Edge only; one label for all four cells so nobody mistakes the round for a recommendation.",
    since: "Chrome 135+",
  },
};
