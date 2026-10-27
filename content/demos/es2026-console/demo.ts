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
      file: "console.css",
      lang: "css",
    },
    {
      file: "app.js",
      lang: "js",
    },
  ]),
  // The "before" beat: the same four answers, written the ES2015 way.
  legacy: {
    code: demoCode("es2026-console", [
      {
        file: "legacy/index.html",
        lang: "html",
      },
      {
        file: "legacy/styles.css",
        lang: "css",
      },
      {
        file: "console.css",
        lang: "css",
      },
      {
        file: "legacy/app.js",
        lang: "js",
      },
    ]),
  },
  liveStates: ["line1", "line2", "all"],
  steps: [
    // Beat 1: today, with a pile of JavaScript.
    {
      id: "b1",
      file: "legacy/app.js",
      highlight: [[11, 25]],
      caption:
        "Today a correct sum of floats is a compensation loop we write and maintain by hand.",
      action: "The first line prints: sum(ledger) gives 0.1, after fourteen lines of bookkeeping.",
      liveState: "line1",
      phase: "before",
      target: "#out > li:nth-child(1)",
    },
    {
      id: "b2",
      file: "legacy/app.js",
      highlight: [[27, 34]],
      caption: "Set intersection is a loop over one set probing the other, or a lodash import.",
      action: "The second line prints the hand-written intersection.",
      liveState: "line2",
      phase: "before",
      target: "#out > li:nth-child(2)",
    },
    {
      id: "b3",
      file: "legacy/app.js",
      highlight: [[36, 46]],
      caption: "has-then-set and a route regex: two more helpers every codebase owns a copy of.",
      action: "The last two lines print.",
      liveState: "all",
      phase: "before",
      target: "#out > li:nth-child(4)",
    },
    // Beat 2: now, native.
    {
      id: "a1",
      highlight: [],
      caption: "The same sum with no helper: reduce returns 0, Math.sumPrecise returns 0.1.",
      action: "Two lines appear: 1e20 swallowed the 0.1, then the right answer.",
      liveState: "line1",
      phase: "after",
    },
    {
      id: "a2",
      highlight: [],
      caption: "Set.prototype.intersection returns a Set: no spread, no filter, no lodash.",
      action: "The Set pair appears under it.",
      liveState: "line2",
      phase: "after",
    },
    {
      id: "a3",
      highlight: [],
      caption: "getOrInsert and URLPattern are one line each.",
      action: "The last four lines rise in one after another.",
      liveState: "all",
      phase: "after",
    },
    // Beat 3: the code.
    {
      id: "s1",
      file: "app.js",
      highlight: [[10, 13]],
      caption: "reduce returns 0; sumPrecise returns 0.1. Correctness landed in the language.",
      action: "The first pair shows; the sumPrecise line is spotlit.",
      liveState: "line1",
      target: "#out > li:nth-child(2)",
    },
    {
      id: "s2",
      file: "app.js",
      highlight: [[14, 17]],
      caption: "Set methods cover most of what lodash did for arrays, and they return Sets.",
      action: 'The Set pair shows; Set {"Road Racer"} is spotlit.',
      liveState: "line2",
      target: "#out > li:nth-child(4)",
    },
    {
      id: "s3",
      file: "app.js",
      highlight: [[18, 29]],
      caption: "getOrInsert replaces has-then-set. URLPattern is also a global in Node 24.",
      action: 'All eight lines show; ["Road Racer"] from getOrInsert is spotlit.',
      liveState: "all",
      target: "#out > li:nth-child(6)",
    },
    {
      id: "s4",
      file: "app.js",
      highlight: [[39, 46]],
      caption: "Each line runs in a try. Safari 26.0 prints not a function for getOrInsert.",
      action:
        "Same line spotlit. Open the page in an older Safari; a TC39 stage is not a support label.",
      liveState: "all",
      target: "#out > li:nth-child(6)",
    },
  ],
  fallback: "A DevTools snippet with the same expressions, saved in Sources.",
  wow: "0 against 0.1.",
  gotcha:
    "Spec approval is not shipping. Error.isError is in ES2026 and still partial in Safari, so it stays off the list. Math.sumPrecise needs V8 14.7, newer than Node 26.0's V8, so expect it missing there. On stage every line is computed at load and revealed by state, so a missing API shows its error text the moment its line appears.",
};
