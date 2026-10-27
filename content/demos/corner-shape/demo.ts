import type { Demo } from "@/content/schema";
import { demoCode } from "@/lib/demo-files";

export const demo: Demo = {
  id: "corner-shape",
  live: {
    kind: "srcdoc",
    browsers: ["chrome"],
  },
  code: demoCode("corner-shape", [
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
      highlight: [[8, 9]],
      caption:
        "Same radius, four shapes. Where it's unsupported you get a plain rounded corner, the ideal failure mode.",
      action: "Edit --shape on a tile in DevTools.",
    },
  ],
  fork: [
    "https://codepen.io/web-dot-dev/pen/OPNzoqW",
    "https://codepen.io/t_afif/pen/yyNjmLw",
    "https://css-tip.com/corner-shape/",
  ],
  fallback: "https://codepen.io/web-dot-dev/pen/OPNzoqW",
  wow: "The biggest visual change per character of CSS in the deck.",
  gotcha: "Chrome 139+, still marked experimental on webstatus.dev.",
  support: {
    tier: "one-engine",
    missing: ["safari", "firefox"],
    note: "Chrome and Edge only; one label for all four cells so nobody mistakes the round for a recommendation.",
    since: "Chrome 139+",
  },
};
