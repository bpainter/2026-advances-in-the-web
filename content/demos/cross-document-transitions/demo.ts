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
    {
      file: "nav.js",
      lang: "js",
    },
  ]),
  // The "before" beat: one document, two views, a crossfade and a hero morph by hand.
  legacy: {
    code: demoCode("cross-document-transitions", [
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
  liveStates: ["a", "b"],
  steps: [
    // Beat 1: today, with a pile of JavaScript.
    {
      id: "b1",
      file: "legacy/app.js",
      highlight: [[16, 27]],
      caption:
        "Today both views share one document, and the script measures the hero before and after the swap.",
      action: "The list view is showing; the thumbnail hero is spotlit.",
      liveState: "a",
      phase: "before",
      target: "#list .hero",
    },
    {
      id: "b2",
      file: "legacy/app.js",
      highlight: [[32, 57]],
      caption: "Then it plays the difference as a transform and crossfades the two views by hand.",
      action: "The detail view fades in and the hero grows into place.",
      liveState: "b",
      phase: "before",
      target: "#detail .hero",
    },
    {
      id: "b3",
      file: "legacy/app.js",
      highlight: [[61, 69]],
      caption:
        "Links are intercepted, so the URL never changes and the browser's Back button needs its own handler.",
      action: "Back to the list view by script; the intercepted card link is spotlit.",
      liveState: "a",
      phase: "before",
      target: "#list .card",
    },
    // Beat 2: now, native.
    {
      id: "a1",
      highlight: [],
      caption: "Two real pages. This is the list page, a plain HTML document.",
      action: "The list page is showing.",
      liveState: "a",
      phase: "after",
    },
    {
      id: "a2",
      highlight: [],
      caption:
        "The link loads a second document and the hero morphs across the navigation, with no script for the transition.",
      action: "The detail page loads and the hero morphs into its bigger self.",
      liveState: "b",
      phase: "after",
    },
    {
      id: "a3",
      highlight: [],
      caption:
        "Back is a real navigation too, so the browser's own Back button morphs it home the same way.",
      action: "Back to the list; the hero shrinks into the card.",
      liveState: "a",
      phase: "after",
    },
    // Beat 3: the code.
    {
      id: "s1",
      file: "styles.css",
      highlight: [[1, 3]],
      caption: "One at-rule, loaded by both pages, opts every same-origin navigation in.",
      action: "The list page; the card's hero is spotlit.",
      liveState: "a",
      target: ".hero",
    },
    {
      id: "s2",
      file: "styles.css",
      highlight: [[5, 7]],
      caption:
        "Name the element that should carry across; the same name on both pages pairs them up.",
      action: "The hero morphs into the detail page, where the big hero is spotlit.",
      liveState: "b",
      target: ".hero",
    },
    {
      id: "s3",
      file: "page-b.html",
      highlight: [[5, 13]],
      caption:
        "The detail page is its own document with the same stylesheet; there is no script for the transition itself.",
      action: "Still the detail page; its heading is spotlit.",
      liveState: "b",
      target: "h1",
    },
    {
      id: "s4",
      file: "styles.css",
      highlight: [[36, 44]],
      caption:
        "The group pseudo-element takes a duration like any animation, and reduced motion shortens it.",
      action: "Back to the list; the hero morphs home in half a second.",
      liveState: "a",
      target: ".hero",
    },
  ],
  fork: ["https://page-transitions.style/", "https://www.bram.us/2026/10/07/ie-page-transitions/"],
  fallback: "https://page-transitions.style/",
  wow: "A multi-page site that feels like an app with no router.",
  gotcha:
    "Serve over HTTP, never file://. Speculation Rules prerender makes it instant but is Chromium-only; Firefox prefetch is behind a Nightly pref. On stage nav.js stands in for the click: it navigates between the two pages a quarter second after a press settles, and the transition itself is still the CSS.",
};
