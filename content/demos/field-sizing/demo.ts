import type { Demo } from "@/content/schema";
import { demoCode } from "@/lib/demo-files";

export const demo: Demo = {
  id: "field-sizing",
  live: {
    kind: "srcdoc",
    browsers: ["chrome", "safari", "firefox"],
  },
  code: demoCode("field-sizing", [
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
  // The "before" beat: the same fields sized by an input listener and a hidden span.
  legacy: {
    code: demoCode("field-sizing", [
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
  requires: [{ id: "field-sizing", kind: "css-supports", query: "field-sizing: content" }],
  liveStates: ["typed", "pasted", "grip"],
  steps: [
    // Beat 1: today, with a pile of JavaScript.
    {
      id: "b1",
      file: "legacy/app.js",
      highlight: [[11, 20]],
      caption:
        "Today a textarea grows only if a listener resets the height, reads scrollHeight and writes it back on every keystroke.",
      action:
        "Three lines type themselves and the box grows a line at a time; the select widens for 11 wide.",
      liveState: "typed",
      phase: "before",
      target: "#review",
    },
    // prettier-ignore
    {
      id: "b2",
      file: "legacy/app.js",
      highlight: [[5, 9], [14, 16]],
      caption: "The cap is arithmetic on a line height we measured ourselves, plus a scrollbar we toggle by hand.",
      action: "A long review lands at once; the box stops at five lines and scrolls.",
      liveState: "pasted",
      phase: "before",
      target: "#review",
    },
    {
      id: "b3",
      file: "legacy/app.js",
      highlight: [[22, 29]],
      caption:
        "The select needs a hidden span to measure its option against, and the native grip is still there to fight the script.",
      action:
        "A note appears by the corner: drag the grip and the next keystroke snaps the height back.",
      liveState: "grip",
      phase: "before",
      target: ".note",
    },
    // Beat 2: now, native.
    {
      id: "a1",
      highlight: [],
      caption: "The same fields with no script for sizing.",
      action:
        "Three lines type themselves and the box grows with each one; the select widens for 11 wide.",
      liveState: "typed",
      phase: "after",
    },
    {
      id: "a2",
      highlight: [],
      caption: "Min and max in line heights, and it stops where you said.",
      action: "A long review lands at once; the box stops at five lines and scrolls.",
      liveState: "pasted",
      phase: "after",
    },
    {
      id: "a3",
      highlight: [],
      caption: "The resize grip is turned off, so nothing fights the auto-grow.",
      action: "A note appears by the corner where the grip used to be.",
      liveState: "grip",
      phase: "after",
    },
    // Beat 3: the code.
    {
      id: "s1",
      file: "styles.css",
      highlight: [[34, 39]],
      caption: "One declaration. The box fits what's in it, on textarea and select alike.",
      action:
        "Three lines type themselves; it grows on every keystroke. The select widens for 11 wide.",
      liveState: "typed",
      target: "#review",
    },
    {
      id: "s2",
      file: "styles.css",
      highlight: [[23, 24]],
      caption: "Min and max in line heights. Without a max, a review box grows forever.",
      action: "A long paragraph lands at once; it stops at five lines and scrolls.",
      liveState: "pasted",
      target: "#review",
    },
    {
      id: "s3",
      file: "styles.css",
      highlight: [25],
      caption: "The native resize grip now fights the auto-grow, so turn it off.",
      action: "A note appears by the corner where the grip would be; nothing to click.",
      liveState: "grip",
      target: "#review",
    },
  ],
  fork: ["https://ishadeed.com/article/field-sizing"],
  fallback: "If the typing hook fails, click into the box and type three lines live.",
  wow: "Growth per character typed.",
  gotcha:
    "Unbounded growth without max-block-size. Fixed width or height re-imposes a fixed box, so size with min and max only.",
};
