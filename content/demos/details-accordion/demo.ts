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
  ]),
  requires: [
    { id: "details-name", kind: "html-attr", element: "details", attr: "name" },
    { id: "details-content", kind: "css-selector", selector: "::details-content" },
  ],
  steps: [
    {
      id: "s1",
      file: "index.html",
      highlight: [12, 16, 20],
      caption: "The name attribute makes the group exclusive: open one and the others close.",
      action: "Click Returns; Shipping closes.",
    },
    {
      id: "s2",
      file: "styles.css",
      highlight: [[50, 63]],
      caption: "::details-content is the panel, so you can fade and nudge it in every engine.",
      action: "Open Materials; it fades in. The chevron turns.",
    },
    {
      id: "s3",
      file: "styles.css",
      highlight: [[66, 77]],
      caption: "Chromium adds the height slide behind @supports. Safari and Firefox keep the fade.",
      action: "Same clicks in Safari: fade, no slide. Say it before it happens.",
    },
    {
      id: "s4",
      file: "index.html",
      highlight: [[20, 25]],
      caption: "Search the page for lugs. The closed panel opens itself.",
      action: "Cmd-F lugs in Chrome, then repeat in Safari.",
    },
  ],
  fork: ["https://webkit.org/?p=17640"],
  fallback:
    "If Safari doesn't open on find, say so and show the Chrome behaviour; the label already carries the caveat.",
  wow: "Find in page opening a closed accordion.",
  gotcha:
    "Smooth height to auto needs interpolate-size, which is Chrome-only; here it sits behind @supports so the other engines get the fade. Marker styling is not interoperable, so hide it and draw the chevron yourself.",
};
