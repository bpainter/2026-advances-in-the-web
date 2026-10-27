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
  ]),
  steps: [
    {
      id: "s1",
      file: "styles.css",
      highlight: [[14, 19]],
      caption: "A reading-progress bar driven by document scroll. No scroll listener.",
      action: "Scroll down and up; the bar fills and empties.",
    },
    {
      id: "s2",
      file: "styles.css",
      highlight: [[20, 24]],
      caption: "view() ties the reveal to the element's own trip through the viewport.",
      action: "The images rise as they enter.",
    },
    {
      id: "s3",
      file: "styles.css",
      highlight: [13],
      caption:
        "Everything sits inside @supports. Without it, Firefox leaves the images at opacity 0.",
      action:
        "Same page in Firefox: images visible, no bar. Flip the pref in about:config if there's time.",
    },
  ],
  fork: ["https://scroll-driven-animations.style/"],
  fallback: "https://scroll-driven-animations.style/",
  wow: "A progress bar with no scroll listener.",
  gotcha:
    "Stranding content at opacity 0 without @supports. Scroll-triggered (as opposed to scroll-driven) animations and trigger-scope are Chrome 146+ only.",
};
