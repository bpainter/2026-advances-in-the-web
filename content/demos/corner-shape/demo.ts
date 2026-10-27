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
  // Grid cell: no legacy document and no "before" beat. Both states are CSS only: "shaped" is
  // the four shapes as authored, "shape-b" is the plain round corner unsupported browsers draw.
  liveStates: ["shaped", "shape-b"],
  steps: [
    {
      id: "s1",
      file: "styles.css",
      highlight: [[15, 16]],
      caption: "Same radius, four shapes from one property.",
      action: "The four tiles are spotlit: squircle, scoop, notch and bevel at one radius.",
      liveState: "shaped",
      target: ".tile",
    },
    {
      id: "s2",
      file: "styles.css",
      highlight: [[22, 24]],
      caption: "Where it is unsupported you get a plain rounded corner, the ideal failure mode.",
      action:
        "Every tile drops to the plain rounded corner Safari and Firefox draw today; the labels stay.",
      liveState: "shape-b",
      target: ".tile",
    },
  ],
  fork: [
    "https://codepen.io/web-dot-dev/pen/OPNzoqW",
    "https://codepen.io/t_afif/pen/yyNjmLw",
    "https://css-tip.com/corner-shape/",
  ],
  fallback: "https://codepen.io/web-dot-dev/pen/OPNzoqW",
  wow: "The biggest visual change per character of CSS in the deck.",
  gotcha:
    "Chrome 139+, still marked experimental on webstatus.dev. The second step fakes the fallback by setting corner-shape: round, which is what Safari and Firefox draw for the same markup.",
  support: {
    tier: "one-engine",
    missing: ["safari", "firefox"],
    note: "Chrome and Edge only; one label for all four cells so nobody mistakes the round for a recommendation.",
    since: "Chrome 139+",
  },
};
