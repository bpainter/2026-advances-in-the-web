import type { Slide } from "@/content/schema";
import { demo } from "@/content/demos/details-accordion/demo";

export const slide: Slide = {
  id: "details-accordion",
  index: 11,
  section: "platform-baseline",
  layout: "demo-split",
  title: "Exclusive accordion",
  eyebrow: "BASELINE NEWLY · 16 SEP 2025",
  body: ["Find in page opens a closed panel. Your tabs component can't do that."],
  support: {
    tier: "baseline-newly",
    since: "16 Sep 2025 (::details-content); <details name> 3 Sep 2024",
    note: "hidden=until-found: all three engines as of Safari 26.2 by WebKit's own notes; one dashboard still lists no Safari. Say: all three engines as of Safari 26.2, one dashboard is lagging. The found step is simulated: find-in-page cannot be scripted, so the demo opens Materials and marks lugs itself; press Cmd-F lugs for the real thing.",
  },
  demo: demo,
  citations: [
    {
      text: "<details name> 3 Sep 2024 and ::details-content 16 Sep 2025",
      url: "https://webstatus.dev/features/details-content",
    },
    {
      text: "hidden=until-found Safari 26.2 with beforematch",
      url: "https://webkit.org/?p=17640",
    },
    {
      text: "Dashboard lag",
      url: "https://webstatus.dev/features/hidden-until-found",
    },
    {
      text: "web.dev Dec 2025 calling it Baseline Newly",
      url: "https://web.dev/blog/web-platform-12-2025",
    },
    {
      text: "interpolate-size Chrome-only",
      url: "https://webstatus.dev/features/interpolate-size",
    },
  ],
  speakerNotes: "The browser has state your component library doesn't know about: find in page. A JavaScript accordion hides its content from search; the native one surfaces it, because closed details content behaves like hidden until found. That's Chrome 102, Firefox 148, and Safari 26.2 by WebKit's own release notes, and one dashboard still lists no Safari, so say all three engines as of Safari 26.2 and move on. This is the first live Safari verification, which is how the label scheme earns trust; if it fails, the honest label is already on screen and you lose nothing by saying so. Now the smallest demo with the biggest payoff per character.",
  timing: {
    minutes: 1,
    cumulative: 11.75,
  },
  cutPriority: 9,
};
