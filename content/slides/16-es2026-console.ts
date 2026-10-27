import type { Slide } from "@/content/schema";
import { demo } from "@/content/demos/es2026-console/demo";

export const slide: Slide = {
  id: "es2026-console",
  index: 16,
  section: "platform-baseline",
  layout: "demo-split",
  title: "ES2026 in the console",
  eyebrow: "BASELINE NEWLY · MATH.SUMPRECISE 10 APR 2026",
  body: ["ES2026 was approved on 30 June 2026. Replaces lodash helpers, path-to-regexp, and the has-then-set idiom."],
  support: {
    tier: "baseline-newly",
    since: "Set methods Jun 2024; iterator helpers 31 Mar 2025; URLPattern 15 Sep 2025; getOrInsertComputed 14 Feb 2026; Math.sumPrecise 10 Apr 2026",
    missing: [],
    note: "Error.isError is in ES2026 and only partial in Safari, so it is left out. Map.getOrInsert prints 'not a function' in Safari 26.0: spec approval is not a support label.",
  },
  demo: demo,
  citations: [
    {
      text: "Set methods",
      url: "https://webstatus.dev/features/set-methods",
    },
    {
      text: "Iterator helpers",
      url: "https://webstatus.dev/features/iterator-methods",
    },
    {
      text: "Uint8Array base64",
      url: "https://webstatus.dev/features/uint8array-base64-hex",
    },
    {
      text: "getOrInsertComputed 14 Feb 2026",
      url: "https://webstatus.dev/features/getorinsert",
    },
    {
      text: "Math.sumPrecise 10 Apr 2026",
      url: "https://webstatus.dev/features/math-sum-precise",
    },
    {
      text: "URLPattern 15 Sep 2025",
      url: "https://webstatus.dev/features/urlpattern",
    },
    {
      text: "Error.isError: Safari partial, left out of the demo",
      url: "https://webstatus.dev/features/is-error",
    },
    {
      text: "ES2026 approved 30 Jun 2026",
      url: "https://pawelgrzybek.com/whats-new-in-ecmascript-2026/",
    },
    {
      text: "InfoWorld on ES2026",
      url: "https://www.infoworld.com/article/4193461/ecmascript-2026-specification-approved.html",
    },
    {
      text: "Node 24 URLPattern global",
      url: "https://nodejs.org/en/blog/release/v24.0.0",
    },
  ],
  speakerNotes: "The console changes the rhythm after seven browser demos, and it's the one place JavaScript gets to be the hero of its own section. The floating-point line is a cheap laugh that makes a real point about correctness landing in the language. URLPattern is also a global in Node 24, so the same route matcher runs on both sides. The getOrInsert line in Safari 26.0 is the deliberate counter-example: it gives the room a rule they can use, that a TC39 stage is not a support label, and Error.isError stays off the slide for the same reason. From here we leave Baseline and start saying which engine is missing.",
  timing: {
    minutes: 1,
    cumulative: 16.5,
  },
  cutPriority: 6,
};
