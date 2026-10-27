import type { Demo } from "@/content/schema";
import { demoCode } from "@/lib/demo-files";

export const demo: Demo = {
  id: "cross-document-transitions",
  live: {
    kind: "route",
    src: "/demos/cross-document-transitions/page-a.html",
    browsers: ["chrome", "safari", "firefox"],
  },
  code: demoCode("cross-document-transitions", [
    {
      file: "page-a.html",
      lang: "html",
    },
    {
      file: "page-b.html",
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
      highlight: [1],
      caption: "One at-rule, loaded by both pages, opts the navigation in.",
      action: "Nothing yet.",
    },
    {
      id: "s2",
      file: "styles.css",
      highlight: [3],
      caption: "Name the element that should carry across.",
      action: "Click the card; the hero morphs into the detail page. Back morphs it home.",
    },
    {
      id: "s3",
      file: "page-b.html",
      highlight: [[7, 13]],
      caption: "No script on either page. Firefox gets a normal navigation, which is fine.",
      action: "Same two pages in Safari, then Firefox.",
    },
  ],
  fork: ["https://page-transitions.style/", "https://www.bram.us/2026/10/07/ie-page-transitions/"],
  fallback: "https://page-transitions.style/",
  wow: "A multi-page site that feels like an app with no router.",
  gotcha:
    "Serve over HTTP, never file://. Speculation Rules prerender makes it instant but is Chromium-only; Firefox prefetch is behind a Nightly pref.",
};
