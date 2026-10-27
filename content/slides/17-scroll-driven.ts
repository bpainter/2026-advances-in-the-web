import type { Slide } from "@/content/schema";
import { demo } from "@/content/demos/scroll-driven/demo";

export const slide: Slide = {
  id: "scroll-driven",
  index: 17,
  section: "platform-two-engine",
  layout: "demo-split",
  title: "Scroll-driven animations",
  eyebrow: "TWO-ENGINE · MISSING FIREFOX",
  body: ["Two engines shipped. From here we say which one is missing."],
  support: {
    tier: "two-engine",
    since: "Chrome 115, Safari 26",
    missing: ["firefox"],
    note: "Firefox behind a flag (155); Interop 2026 focus area. Interop 2026: Chrome 975, Safari 965, Firefox 92.",
  },
  demo: demo,
  citations: [
    {
      text: "Support: Chrome 115, Safari 26, Firefox flagged in 155",
      url: "https://webstatus.dev/features/scroll-driven-animations",
    },
    {
      text: "Firefox 155 notes",
      url: "https://developer.mozilla.org/en-US/Firefox/Releases/155",
    },
    {
      text: "Interop 2026 975/965/92",
      url: "https://raw.githubusercontent.com/web-platform-tests/results-analysis/gh-pages/data/interop-2026/interop-2026-stable-v2.csv",
    },
    {
      text: "Interop 2026 focus areas",
      url: "https://web.dev/blog/interop-2026",
    },
    {
      text: "Safari 26.4 compositor thread",
      url: "https://webkit.org/?p=17862",
    },
    {
      text: "Scroll-triggered Chrome 146+",
      url: "https://web.dev/blog/web-platform-03-2026",
    },
    {
      text: "gsap downloads",
      url: "https://api.npmjs.org/downloads/point/last-week/gsap",
    },
  ],
  speakerNotes: "Stage line: Chrome, Edge, and Safari today; Firefox behind a flag and an Interop 2026 target. This replaces the scroll-linked half of GSAP ScrollTrigger, AOS, and the IntersectionObserver reveal boilerplate, and Safari 26.4 moved these to the compositor thread so they no longer jank on iOS. The fallback question matters more than the support table here, because the failure mode is invisible content rather than a plainer page. The Interop score tells you Firefox's gap is real engineering work that a flag won't close. Next, the feature component libraries were built for.",
  timing: {
    minutes: 1,
    cumulative: 17.5,
  },
};
