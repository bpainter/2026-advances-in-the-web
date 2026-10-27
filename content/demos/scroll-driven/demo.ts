import type { Demo } from "@/content/schema";
import { demoCode } from "@/lib/demo-files";

export const demo: Demo = {
  id: "scroll-driven",
  live: {
    kind: "srcdoc",
    browsers: ["chrome", "safari", "firefox"],
  },
  code: demoCode("scroll-driven", [
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
  // The "before" beat: the same page with a scroll listener and an IntersectionObserver.
  legacy: {
    code: demoCode("scroll-driven", [
      {
        file: "legacy/index.html",
        lang: "html",
      },
      {
        file: "legacy/styles.css",
        lang: "css",
      },
      {
        file: "legacy/app.js",
        lang: "js",
      },
    ]),
  },
  requires: [
    { id: "scroll-timeline", kind: "css-supports", query: "animation-timeline: scroll()" },
  ],
  liveStates: ["top", "scrolled", "end"],
  steps: [
    // Beat 1: today, with a pile of JavaScript.
    {
      id: "b1",
      file: "legacy/app.js",
      highlight: [[12, 25]],
      caption:
        "Today the bar is a scroll listener, a division and a transform, throttled to one paint a frame.",
      action: "The page scrolls down and the bar follows, one frame behind.",
      liveState: "scrolled",
      phase: "before",
      target: ".track",
    },
    {
      id: "b2",
      file: "legacy/app.js",
      highlight: [[35, 45]],
      caption: "The reveal is an IntersectionObserver that adds a class once and stops watching.",
      action: "The page scrolls to the end and each image fades in as it passes 40%.",
      liveState: "end",
      phase: "before",
      target: ".shot",
    },
    // prettier-ignore
    {
      id: "b3",
      file: "legacy/app.js",
      highlight: [[8, 10], [26, 31]],
      caption: "Resize, fonts, images: anything that changes the page height means measuring again.",
      action: "Back to the top. The bar empties, but the images stay revealed: the observer let go of them.",
      liveState: "top",
      phase: "before",
      target: ".shot",
    },
    // Beat 2: now, native.
    {
      id: "a1",
      highlight: [],
      caption:
        "The same bar with no scroll listener: an animation whose clock is the scroll position.",
      action: "The page scrolls down and the bar fills in lockstep.",
      liveState: "scrolled",
      phase: "after",
    },
    {
      id: "a2",
      highlight: [],
      caption: "Each image's reveal is tied to its own trip through the viewport.",
      action: "To the end; every image rises as it enters.",
      liveState: "end",
      phase: "after",
    },
    {
      id: "a3",
      highlight: [],
      caption: "Scroll back and everything rewinds, because none of it was a one-shot event.",
      action: "Back to the top: the bar empties and the reveals rewind on the way up.",
      liveState: "top",
      phase: "after",
    },
    // Beat 3: the code.
    {
      id: "s1",
      file: "styles.css",
      highlight: [[38, 41]],
      caption:
        "animation-timeline: scroll() makes the document's scroll position the clock for grow.",
      action: "The page scrolls down; the bar at the top is spotlit as it fills.",
      liveState: "scrolled",
      target: ".track",
    },
    {
      id: "s2",
      file: "styles.css",
      highlight: [[42, 46]],
      caption:
        "view() ties reveal to the element's own trip through the viewport, and the range says when.",
      action: "To the end; the images are spotlit as each one rises in.",
      liveState: "end",
      target: ".shot",
    },
    // prettier-ignore
    {
      id: "s3",
      file: "styles.css",
      highlight: [[19, 24], [34, 37]],
      caption: "The bar hides by default and @supports opts it in, so Firefox gets a plain page, not images stuck at opacity 0.",
      action: "Back to the top. In Firefox this same page shows the images and no bar.",
      liveState: "top",
      target: ".shot",
    },
  ],
  fork: ["https://scroll-driven-animations.style/"],
  fallback: "https://scroll-driven-animations.style/",
  wow: "A progress bar with no scroll listener.",
  gotcha:
    "Stranding content at opacity 0 without @supports. Scroll-triggered (as opposed to scroll-driven) animations and trigger-scope are Chrome 146+ only. On stage the steps scroll the page with scrollTo; the bar and the reveals are still driven by the scroll position.",
};
