import type { Slide } from "@/content/schema";

export const slide: Slide = {
  id: "not-yet-and-never",
  index: 26,
  section: "delete",
  layout: "comparison",
  title: "Not yet, and never",
  eyebrow: "THE HONEST COLUMNS",
  items: [
    {
      label: "Not yet: shrink, don't delete",
      detail: "Floating UI (62M), Popper (13M): placement solved; focus trapping and arrows are not\nGSAP ScrollTrigger (3.7M): no Firefox; GSAP is also a tween engine\nreact-select (5.1M): no Firefox\nSwiper (2.3M): carousel pseudo-elements are Chrome-only; scroll-snap alone is Widely\nmoment, dayjs, date-fns, luxon (147M combined): Temporal is not in Safari; Intl covers formatting today\njest (26M): node:test lacks stable coverage, jsdom, and expect; the ecosystem went to Vitest (78M)",
    },
    {
      label: "No native equivalent",
      detail: "fast-deep-equal (133M), deep-equal (16M): nothing in browsers; Composites at Stage 2 is the only proposal heading there\nimmer (39M): structuredClone copies everything in O(n); no structural sharing or patches\nclsx (76M), classnames (19M): the argument is dependency count, not capability; clsx is about 230 bytes",
    },
  ],
  citations: [
    {
      text: "Download counts (swap names)",
      url: "https://api.npmjs.org/downloads/point/last-week/@floating-ui/dom",
    },
    {
      text: "Temporal reaches Stage 4",
      url: "https://www.igalia.com/2026/03/13/Temporal-Reaches-Stage-4.html",
    },
    {
      text: "Temporal browser status",
      url: "https://webstatus.dev/features/temporal",
    },
    {
      text: "Node 26",
      url: "https://nodejs.org/en/blog/release/v26.0.0",
    },
    {
      text: "Deno 2.7",
      url: "https://deno.com/blog/v2.7",
    },
    {
      text: "ES2027 slating",
      url: "https://github.com/tc39/proposals/blob/main/finished-proposals.md",
    },
    {
      text: "Intl.DurationFormat Baseline Mar 2025",
      url: "https://webstatus.dev/features/intl-duration-format",
    },
    {
      text: "Records and Tuples withdrawn",
      url: "https://github.com/tc39/proposals/blob/main/inactive-proposals.md",
    },
    {
      text: "Composites",
      url: "https://github.com/tc39/proposals",
    },
    {
      text: "clsx preferred",
      url: "https://github.com/es-tooling/module-replacements/blob/main/manifests/preferred.json",
    },
    {
      text: "node:test gaps",
      url: "https://nodejs.org/api/test.html",
    },
    {
      text: "closedby no Safari",
      url: "https://webstatus.dev/features/dialog-closedby",
    },
  ],
  speakerNotes: "Say this plainly because someone in the room knows. Every talk this year told people to delete Floating UI; the accurate instruction in October 2026 is to shrink it, and saying so costs nothing and buys the rest of the slide. Temporal reached Stage 4 in March 2026 and is on by default in Node 26 and Deno 2.7, but in browsers it's Chrome 144 and Firefox 139 with Safari not shipped, and it's slated for ES2027. Records and Tuples was withdrawn in April 2025 and Composites is its successor, so deep equality still has no answer; Radix Dialog at 45.5M and Headless UI at 4.1M are covered by dialog plus commandfor, except closedby is missing in Safari and Radix also sells React composition. Last slide of the act is the tooling that makes the decision mechanical.",
  timing: {
    minutes: 0.75,
    cumulative: 26.5,
  },
};
