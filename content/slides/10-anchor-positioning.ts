import type { Slide } from "@/content/schema";
import { demo } from "@/content/demos/anchor-positioning/demo";

export const slide: Slide = {
  id: "anchor-positioning",
  index: 10,
  section: "platform-baseline",
  layout: "demo-split",
  title: "Anchor positioning",
  eyebrow: "BASELINE NEWLY · JAN 2026 (FIREFOX 147)",
  body: ["Replaces Floating UI placement, about 20 KB."],
  support: {
    tier: "baseline-newly",
    since: "Jan 2026 (Firefox 147)",
    note: "The webstatus.dev row is stale (it omits Chrome 125 and lists only Safari 27). Do not cite webstatus.dev for this feature; MDN, web.dev's January 2026 roundup, and Interop 2026 all say shipped.",
  },
  demo: demo,
  citations: [
    {
      text: "Firefox 147 enabled by default (13 Jan 2026)",
      url: "https://developer.mozilla.org/en-US/Firefox/Releases/147",
    },
    {
      text: "web.dev Jan 2026: Baseline Newly available",
      url: "https://web.dev/blog/web-platform-01-2026",
    },
    {
      text: "MDN position-area: Newly available since January 2026",
      url: "https://developer.mozilla.org/en-US/docs/Web/CSS/position-area",
    },
    {
      text: "Interop 2026 Firefox 1000/1000",
      url: "https://raw.githubusercontent.com/web-platform-tests/results-analysis/gh-pages/data/interop-2026/interop-2026-stable-v2.csv",
    },
    {
      text: "Stale row (do not cite on stage)",
      url: "https://webstatus.dev/features/anchor-positioning",
    },
    {
      text: "Floating UI about 20 KB, react-popper archived",
      url: "https://www.buildmvpfast.com/blog/css-anchor-positioning-baseline-delete-floating-ui-2026",
    },
    {
      text: "Safari and Chrome overflow alignment",
      url: "https://www.oddbird.net/2025/10/13/anchor-position-area-update/",
    },
    {
      text: "@container anchored() Chrome 143+ only",
      url: "https://web.dev/blog/web-platform-12-2025",
    },
  ],
  speakerNotes: "Run this one in Firefox on purpose; it's the engine everyone assumes is behind, and here it's first in line. Say it on stage: Baseline Newly since January 2026, Firefox 147, and don't fact-check me with webstatus.dev on this one, its row is stale. Four primary sources beat one data row, and that's the skill the decision framework at the end depends on. Placement is solved; focus trapping, arrows, and interaction hooks are not, so for a complex hover card the honest line is shrink Floating UI, don't delete it yet. Next, the FAQ accordion, where the browser knows something your tabs component doesn't.",
  timing: {
    minutes: 1.5,
    cumulative: 10.75,
  },
};
