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
  ]),
  steps: [
    {
      id: "s1",
      file: "index.html",
      highlight: [4],
      caption:
        "interestfor on a link. Hover, keyboard focus, long press, and Esc are handled by the browser, with the accessibility mapping in the spec.",
      action: "Hover the handle; Tab to it; press Esc.",
    },
    {
      id: "s2",
      file: "index.html",
      highlight: [7],
      caption:
        "popover=hint doesn't take focus and stacks under regular popovers. The WHATWG spec PR is still open.",
      action: "Open it from the keyboard once more.",
    },
  ],
  fork: ["https://codepen.io/web-dot-dev/pen/VYaWyoQ", "https://codepen.io/una/embed/JooENdE"],
  fallback: "https://codepen.io/web-dot-dev/pen/VYaWyoQ",
  wow: "A hover card with no hover wiring.",
  gotcha: "popover=hint is Chrome 151 and Firefox 153 only, no Safari.",
  support: {
    tier: "one-engine",
    missing: ["safari", "firefox"],
    note: "Chrome and Edge only; one label for all four cells so nobody mistakes the round for a recommendation.",
    since: "Chrome 142+",
  },
};
