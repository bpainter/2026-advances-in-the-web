import type { Slide } from "@/content/schema";
import { demo } from "@/content/demos/cross-document-transitions/demo";

export const slide: Slide = {
  id: "cross-document-transitions",
  index: 20,
  section: "platform-two-engine",
  layout: "demo-split",
  title: "Cross-document view transitions",
  eyebrow: "TWO-ENGINE · MISSING FIREFOX",
  body: ["Two HTML pages, three lines of CSS, no JavaScript."],
  support: {
    tier: "two-engine",
    since: "Chrome 126, Safari 18.2",
    missing: ["firefox"],
    note: "Firefox 147 shipped the same-document types only. Cross-document is inside the Interop 2026 view-transitions focus area.",
  },
  demo: demo,
  citations: [
    {
      text: "Cross-document support",
      url: "https://webstatus.dev/features/cross-document-view-transitions",
    },
    {
      text: "Firefox 147 SPA types only",
      url: "https://developer.mozilla.org/en-US/Firefox/Releases/147",
    },
    {
      text: "Interop 2026 focus area",
      url: "https://web.dev/blog/interop-2026",
    },
    {
      text: "IE page transitions revived in CSS",
      url: "https://www.bram.us/2026/10/07/ie-page-transitions/",
    },
    {
      text: "Speculation Rules",
      url: "https://webstatus.dev/features/speculation-rules",
    },
    {
      text: "Firefox 158",
      url: "https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/158",
    },
  ],
  speakerNotes: "This is the demo outside the converged five that argues most directly for the open web: it makes the plain multi-page site competitive again, which lowers the floor for everyone who can't afford a framework team. Two static pages, three lines of CSS, and the hero image morphs across a full navigation. If there's time, thirty seconds on page-transitions.style, where Bramus revived all 23 of Internet Explorer's page-enter effects in CSS; the platform finally shipped what one vendor tried in 1999, this time as a spec. Keep the Firefox line to one sentence; the band already says it. Then four Chrome-only features in under two minutes.",
  timing: {
    minutes: 0.75,
    cumulative: 19.5,
  },
  cutPriority: 2,
};
