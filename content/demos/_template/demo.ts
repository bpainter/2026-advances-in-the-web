import type { Demo } from "@/content/schema";
import { demoCode } from "@/lib/demo-files";

/**
 * Copy this folder to content/demos/<id>/, rename the id, and import `demo` from the slide.
 * Steps run in three beats: before (legacy document), after (native, live only), code
 * (highlighted lines with a target). See docs/demo-template.md for the checklist.
 */
export const demo: Demo = {
  id: "_template",
  live: {
    kind: "srcdoc",
    browsers: ["chrome", "safari", "firefox"],
  },
  code: demoCode("_template", [
    { file: "index.html", lang: "html" },
    { file: "styles.css", lang: "css" },
    { file: "app.js", lang: "js" },
  ]),
  legacy: {
    code: demoCode("_template", [
      { file: "legacy/index.html", lang: "html" },
      { file: "legacy/styles.css", lang: "css" },
      { file: "legacy/app.js", lang: "js" },
    ]),
  },
  requires: [
    { id: "starting-style", kind: "css-supports", query: "transition-behavior: allow-discrete" },
  ],
  // Every state a step names, kebab case, the result not the gesture.
  liveStates: ["rest", "highlighted"],
  steps: [
    // Beat 1: today. file and highlight point into the legacy set; target into legacy/index.html.
    {
      id: "b1",
      file: "legacy/app.js",
      highlight: [[4, 9]],
      caption: "Today this is a function we write and maintain.",
      action: "The badge lights up.",
      liveState: "highlighted",
      phase: "before",
      target: ".badge",
    },
    // Beat 2: native, live only. No highlight; the panel keeps the previous lines dimmed.
    {
      id: "a1",
      highlight: [],
      caption: "The same result with one rule of CSS.",
      action: "The badge lights up in the native card.",
      liveState: "highlighted",
      phase: "after",
    },
    // Beat 3: the code. Keep phase and target after caption so scripts/check-demos.mts still parses.
    {
      id: "s1",
      file: "styles.css",
      highlight: [[30, 33]],
      caption: "One attribute selector does the work.",
      action: "The badge is spotlit.",
      liveState: "highlighted",
      target: ".badge",
    },
    {
      id: "s2",
      file: "styles.css",
      highlight: [[36, 40]],
      caption: "Reduced motion keeps the effect and drops the movement.",
      action: "Back to rest.",
      liveState: "rest",
      target: ".card",
    },
  ],
  fallback: "https://example.com/fallback",
  wow: "The one moment to land.",
  gotcha: "The one caveat to say before it bites.",
};
