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
  ]),
  requires: [{ id: "field-sizing", kind: "css-supports", query: "field-sizing: content" }],
  steps: [
    {
      id: "s1",
      file: "styles.css",
      highlight: [[34, 39]],
      caption: "One declaration. The box fits what's in it, on textarea and select alike.",
      action: "Type three lines; it grows on every keystroke. Pick 11 wide; the select widens.",
    },
    {
      id: "s2",
      file: "styles.css",
      highlight: [[23, 24]],
      caption: "Min and max in line heights. Without a max, a review box grows forever.",
      action: "Paste a long paragraph; it stops at five lines and scrolls.",
    },
    {
      id: "s3",
      file: "styles.css",
      highlight: [25],
      caption: "The native resize grip now fights the auto-grow, so turn it off.",
      action: "Nothing to click; point at the missing grip in the corner.",
    },
  ],
  fork: ["https://ishadeed.com/article/field-sizing"],
  fallback: "Type the four lines live; nothing to pre-load.",
  wow: "Growth per character typed.",
  gotcha:
    "Unbounded growth without max-block-size. Fixed width or height re-imposes a fixed box, so size with min and max only.",
};
