import type { Demo } from "@/content/schema";
import { demoCode } from "@/lib/demo-files";

export const demo: Demo = {
  id: "details-accordion",
  live: {
    kind: "srcdoc",
    browsers: ["chrome", "safari", "firefox"],
  },
  code: demoCode("details-accordion", [
    {
      file: "index.html",
      lang: "html",
    },
    {
      file: "styles.css",
      lang: "css",
    },
    {
      file: "card.css",
      lang: "css",
    },
    {
      file: "app.js",
      lang: "js",
    },
  ]),
  // The "before" beat: the same accordion driven by a sibling loop and a height animation.
  legacy: {
    code: demoCode("details-accordion", [
      {
        file: "legacy/index.html",
        lang: "html",
      },
      {
        file: "legacy/styles.css",
        lang: "css",
      },
      {
        file: "card.css",
        lang: "css",
      },
      {
        file: "legacy/app.js",
        lang: "js",
      },
    ]),
  },
  requires: [
    { id: "details-name", kind: "html-attr", element: "details", attr: "name" },
    { id: "details-content", kind: "css-selector", selector: "::details-content" },
  ],
  liveStates: ["returns", "materials", "found"],
  steps: [
    // Beat 1: today, with a pile of JavaScript.
    {
      id: "b1",
      file: "legacy/app.js",
      highlight: [[36, 43]],
      caption:
        "Today an exclusive accordion is a loop over the siblings: open this one, collapse the rest.",
      action: "Returns opens and Shipping collapses, both animated by the script.",
      liveState: "returns",
      phase: "before",
      target: "#returns",
    },
    {
      id: "b2",
      file: "legacy/app.js",
      highlight: [[5, 19]],
      caption:
        "Animating the height means measuring scrollHeight, forcing a reflow, and a timer to put auto back.",
      action: "Materials slides open and Returns closes.",
      liveState: "materials",
      phase: "before",
      target: "#materials",
    },
    {
      id: "b3",
      file: "legacy/app.js",
      highlight: [[29, 33]],
      caption: "And once the panel is hidden, find-in-page cannot see the word inside it.",
      action: "Materials collapses to hidden; a search for lugs would find nothing.",
      liveState: "found",
      phase: "before",
      target: "#materials",
    },
    // Beat 2: now, native.
    {
      id: "a1",
      highlight: [],
      caption:
        "The same accordion with no script: the panel fades in, and Chromium slides the height too.",
      action: "Materials opens with a fade and the chevron turns; Shipping closes.",
      liveState: "materials",
      phase: "after",
    },
    {
      id: "a2",
      highlight: [],
      caption: "One attribute makes the group exclusive.",
      action: "Returns opens and Materials closes by itself.",
      liveState: "returns",
      phase: "after",
    },
    {
      id: "a3",
      highlight: [],
      caption:
        "Find in page opens a closed panel; the stage cannot press Cmd-F, so it marks the word a search for lugs lands on.",
      action: "Materials opens again with lugs highlighted, as after Cmd-F lugs; Returns closes.",
      liveState: "found",
      phase: "after",
    },
    // Beat 3: the code.
    {
      id: "s1",
      file: "index.html",
      highlight: [15, 21, 25],
      caption: "The name attribute makes the group exclusive: open one and the others close.",
      action: "Returns opens and Materials closes; the Returns panel is spotlit.",
      liveState: "returns",
      target: "#returns",
    },
    {
      id: "s2",
      file: "styles.css",
      highlight: [[50, 63]],
      caption: "::details-content is the panel, so you can fade and nudge it in every engine.",
      action: "Materials fades in and Returns closes.",
      liveState: "materials",
      target: "#materials",
    },
    {
      id: "s3",
      file: "styles.css",
      highlight: [[66, 77]],
      caption: "Chromium adds the height slide behind @supports. Safari and Firefox keep the fade.",
      action:
        "Returns slides open and Materials closes; in Safari and Firefox the same press fades without the slide.",
      liveState: "returns",
      target: "#returns",
    },
    {
      id: "s4",
      file: "index.html",
      highlight: [[25, 30]],
      caption:
        "Search the page for lugs and the closed panel opens itself; the stage cannot press Cmd-F, so it marks the word instead.",
      action: "Materials opens with lugs highlighted, as it would after Cmd-F lugs.",
      liveState: "found",
      target: "#materials",
    },
  ],
  fork: ["https://webkit.org/?p=17640"],
  fallback:
    "If Safari doesn't open on find, say so and show the Chrome behaviour; the label already carries the caveat.",
  wow: "Find in page opening a closed accordion.",
  gotcha:
    "Smooth height to auto needs interpolate-size, which is Chrome-only; here it sits behind @supports so the other engines get the fade. Marker styling is not interoperable, so hide it and draw the chevron yourself. Find-in-page cannot be triggered from script, so the found state opens Materials and marks lugs itself; press Cmd-F lugs for the real thing.",
};
