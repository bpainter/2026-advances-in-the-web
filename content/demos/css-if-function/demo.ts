import type { Demo } from "@/content/schema";
import { demoCode } from "@/lib/demo-files";

export const demo: Demo = {
  id: "css-if-function",
  live: {
    kind: "srcdoc",
    browsers: ["chrome"],
  },
  code: demoCode("css-if-function", [
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
      highlight: [[11, 14]],
      caption: "if() with a style() query. The first match wins.",
      action: "Toggle --size on a button in DevTools.",
    },
    {
      id: "s2",
      file: "styles.css",
      highlight: [[1, 3]],
      caption: "@function is a real function with arguments. @mixin is in no browser yet.",
      action: "Change the 8px and watch both buttons move.",
    },
  ],
  fork: [
    "https://codepen.io/bramus/pen/EaYBJJx",
    "https://codepen.io/bramus/pen/xbxGOdw",
    "https://codepen.io/bramus/pen/wBvKVpR",
    "https://codepen.io/una/pen/XJmzZdj",
    "https://codepen.io/una/pen/LEpOYOw",
  ],
  fallback: "https://codepen.io/bramus/pen/EaYBJJx",
  wow: "Sass conditionals and functions, in CSS, without a build step.",
  gotcha:
    "Chrome 137 for if(), 139 for @function, 142 for the full if() syntax; @function is on the Comeau, Meyer, and Soueidan Interop 2027 wish lists.",
  support: {
    tier: "one-engine",
    missing: ["safari", "firefox"],
    note: "Chrome and Edge only; one label for all four cells so nobody mistakes the round for a recommendation.",
    since: "Chrome 137 and 139",
  },
};
