import type { Demo } from "@/content/schema";
import { demoCode } from "@/lib/demo-files";

export const demo: Demo = {
  id: "interest-invokers",
  live: {
    kind: "srcdoc",
    browsers: ["chrome"],
  },
  code: demoCode("interest-invokers", [
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
  // Grid cell: no legacy document and no "before" beat. Interest cannot be shown from script, so
  // the states open the hint with the popover API and paint the focus ring a Tab would, in CSS.
  liveStates: ["shown", "shown-keyboard"],
  steps: [
    {
      id: "s1",
      file: "index.html",
      highlight: [5],
      caption:
        "interestfor on a link: hover, keyboard focus, long press and Esc are handled by the browser, with the accessibility mapping in the spec.",
      action: "The hint card opens under @una, as hovering the link would show it.",
      liveState: "shown",
      target: "[interestfor]",
    },
    {
      id: "s2",
      file: "index.html",
      highlight: [8],
      caption:
        "popover=hint does not take focus and stacks under regular popovers; the WHATWG spec PR is still open.",
      action:
        "The focus ring lands on @una with the card still open, as a Tab press would show it.",
      liveState: "shown-keyboard",
      target: "#who",
    },
  ],
  fork: ["https://codepen.io/web-dot-dev/pen/VYaWyoQ", "https://codepen.io/una/embed/JooENdE"],
  fallback: "https://codepen.io/web-dot-dev/pen/VYaWyoQ",
  wow: "A hover card with no hover wiring.",
  gotcha:
    "popover=hint is Chrome 151 and Firefox 153 only, no Safari. On stage interest cannot be shown from script, so the steps open the hint with showPopover and force the focus ring; hover the link yourself to show the real thing.",
  support: {
    tier: "one-engine",
    missing: ["safari", "firefox"],
    note: "Chrome and Edge only; one label for all four cells so nobody mistakes the round for a recommendation.",
    since: "Chrome 142+",
  },
};
