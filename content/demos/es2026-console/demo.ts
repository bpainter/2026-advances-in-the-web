import type { Demo } from "@/content/schema";
import { demoCode } from "@/lib/demo-files";

export const demo: Demo = {
  id: "es2026-console",
  live: {
    kind: "srcdoc",
    browsers: ["chrome", "safari", "firefox"],
  },
  code: demoCode("es2026-console", [
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
  steps: [
    {
      id: "s1",
      file: "app.js",
      highlight: [[10, 13]],
      caption: "reduce returns 0; sumPrecise returns 0.1. Correctness landed in the language.",
      action: "Read the first two output lines aloud. 1e20 swallowed the 0.1.",
    },
    {
      id: "s2",
      file: "app.js",
      highlight: [[14, 17]],
      caption: "Set methods cover most of what lodash did for arrays, and they return Sets.",
      action: 'Point at the array, then at Set {"Road Racer"}.',
    },
    {
      id: "s3",
      file: "app.js",
      highlight: [[18, 29]],
      caption: "getOrInsert replaces has-then-set. URLPattern is also a global in Node 24.",
      action: 'Point at [] against ["Road Racer"], and at trail-runner-2.',
    },
    {
      id: "s4",
      file: "app.js",
      highlight: [[41, 48]],
      caption: "Each line runs in a try. Safari 26.0 prints not a function for getOrInsert.",
      action: "Open the same page in an older Safari; a TC39 stage is not a support label.",
    },
  ],
  fallback: "A DevTools snippet with the same expressions, saved in Sources.",
  wow: "0 against 0.1.",
  gotcha:
    "Spec approval is not shipping. Error.isError is in ES2026 and still partial in Safari, so it stays off the list. Math.sumPrecise needs V8 14.7, newer than Node 26.0's V8, so expect it missing there.",
};
