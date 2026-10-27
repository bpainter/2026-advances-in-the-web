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
  // Grid cell: no legacy document and no "before" beat. Both states are CSS only.
  liveStates: ["size-lg", "gap-16"],
  steps: [
    {
      id: "s1",
      file: "styles.css",
      highlight: [[19, 22]],
      caption: "if() with a style() query reads --size on the button, and the first match wins.",
      action: "Small picks up --size: lg from the state and grows to match Large.",
      liveState: "size-lg",
      target: ".btn:first-of-type",
    },
    {
      id: "s2",
      file: "styles.css",
      highlight: [[1, 3]],
      caption:
        "@function is a real function with arguments, and var() inside it reads the element it is called on; @mixin is in no browser yet.",
      action: "The unit doubles to 16px and both buttons gain padding; Small is small again.",
      liveState: "gap-16",
      target: ".btn",
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
