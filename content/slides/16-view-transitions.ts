import type { Slide } from "@/content/schema";
import { demo } from "@/content/demos/view-transitions/demo";

export const slide: Slide = {
  id: "view-transitions",
  index: 16,
  section: "platform-baseline",
  layout: "demo-split",
  title: "View transitions",
  eyebrow: "BASELINE NEWLY · 14 OCT 2025 (FIREFOX 144)",
  body: ["One line of animation and a router that fits on a slide."],
  support: {
    tier: "baseline-newly",
    since: "14 Oct 2025 (Firefox 144); Navigation API 13 Jan 2026 (Safari 26.2, Firefox 147)",
    note: "Interop 2026 view transitions: Chrome 1000, Safari 990, Firefox 798. The Firefox gap is cross-document, slide 20.",
  },
  demo: demo,
  citations: [
    {
      text: "View transitions Baseline 14 Oct 2025 (Firefox 144 last); types 13 Jan 2026",
      url: "https://webstatus.dev/features/view-transitions",
    },
    {
      text: "Navigation API Baseline 13 Jan 2026",
      url: "https://webstatus.dev/features/navigation",
    },
    {
      text: "Interop 2026 scores",
      url: "https://raw.githubusercontent.com/web-platform-tests/results-analysis/gh-pages/data/interop-2026/interop-2026-stable-v2.csv",
    },
    {
      text: "React 19.3 <ViewTransition>",
      url: "https://react.dev/blog/2026/09/09/react-19-3",
    },
    {
      text: "React Router 8.5 deprecation",
      url: "https://reactrouter.com/changelog",
    },
    {
      text: "Element-scoped, Chrome 147",
      url: "https://webstatus.dev/features/view-transitions-element-scoped",
    },
    {
      text: "moveBefore() status",
      url: "https://webstatus.dev/features/move-before",
    },
    {
      text: "Safari Technology Preview 255",
      url: "https://webkit.org/blog/18482/release-notes-for-safari-technology-preview-255/",
    },
    {
      text: "auto-animate downloads",
      url: "https://api.npmjs.org/downloads/point/last-week/@formkit/auto-animate",
    },
  ],
  speakerNotes: "This is the demo that reframes the SPA. Many content sites became single-page apps for the transitions, and the platform now does them in one line with a router that fits on a slide. Seed the framework act here: React 19.3 made <ViewTransition> stable as a wrapper over this API, and React Router 8.5 deprecated its own view-transition APIs in favour of it; we come back to that in section 3. Keep the Firefox repeat short; it proves the Baseline label. Then a change of pace: the console.",
  timing: {
    minutes: 1.5,
    cumulative: 15.75,
  },
};
