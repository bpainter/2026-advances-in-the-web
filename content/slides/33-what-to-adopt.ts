import type { Slide } from "@/content/schema";

export const slide: Slide = {
  id: "what-to-adopt",
  index: 33,
  section: "decide",
  layout: "framework-grid",
  title: "What to adopt",
  eyebrow: "DECIDE · FOUR QUESTIONS AND ONE RULE ABOUT TIME",
  body: ["Newly becomes Widely 30 months after the last engine ships."],
  items: [
    {
      label: "1. Which tier, by data?",
      detail: "webstatus.dev baseline.status and low_date, cross-checked against MDN and the vendor note. Widely: delete the library this quarter. Newly: primary path behind @supports, keep the fallback to the 30-month mark. Two-engine: progressive enhancement, name the missing engine in the PR. One-engine: demos and prototypes only.",
    },
    {
      label: "2. What happens where it's missing?",
      detail: "Degrades: corner-shape to border-radius, field-sizing to a fixed height, customizable select to native, closedby to Esc only, cross-document transitions to a plain navigation. Breaks: anchor positioning without a fallback (popover centred in the viewport), scroll-driven reveals (content at opacity 0), a carousel without scroll-snap (horizontal overflow).",
    },
    {
      label: "3. Is it in Interop 2026, and what is the laggard's score?",
      detail: "Firefox 92 on scroll-driven: a real gap. Safari 553 on dialogs and popovers: two missing sub-features. Safari 136 on attr(): don't plan on typed attr() in 2026. The Interop 2027 wish lists are your 2027 to 2028 column.",
    },
    {
      label: "4. Does deleting the dependency pay for the fallback?",
      detail: "Bytes (small), maintenance (the script you own forever), attack surface (new, and dominant for anything transitive). Newly plus a library with an incident: delete now, carry the fallback. Two-engine plus a small maintained library: keep it, add the native path behind @supports.",
    },
  ],
  stats: [
    {
      value: "Feb 2027",
      label: "@starting-style and transition-behavior go Widely",
    },
    {
      value: "Jun 2028",
      label: "Invoker commands go Widely",
    },
    {
      value: "Dec 2028",
      label: "field-sizing goes Widely",
    },
    {
      value: "72 hours",
      label: "A 3-day cooldown: behind on everything, ahead of almost every incident of the last 18 months",
    },
  ],
  citations: [
    {
      text: "Interop 2025 29 to 97 as the predictor",
      url: "https://webkit.org/?p=17808",
    },
    {
      text: "Interop 2026 focus areas and scores",
      url: "https://web.dev/blog/interop-2026",
    },
    {
      text: "Interop 2026 data",
      url: "https://raw.githubusercontent.com/web-platform-tests/results-analysis/gh-pages/data/interop-2026/interop-2026-stable-v2.csv",
    },
    {
      text: "Comeau Interop 2027 wish list",
      url: "https://www.joshwcomeau.com/css/interop-2027/",
    },
    {
      text: "Meyer Interop 2027 rankings",
      url: "https://meyerweb.com/eric/thoughts/2026/10/14/my-interop-2027-rankings/",
    },
    {
      text: "Soueidan Interop 2027 rankings",
      url: "https://www.sarasoueidan.com/blog/interop-2027-rankings/",
    },
    {
      text: "Lea Verou, In defense of polyfills (pointer only)",
      url: "https://lea.verou.me/blog/2026/polyfills/",
    },
    {
      text: "Rachel Andrew on scrollbar-color",
      url: "https://rachelandrew.co.uk/archives/2026/04/23/what-would-a-2026-css-anthology-look-like/",
    },
    {
      text: "Gustafson: a usable experience when an enhancement isn't available",
      url: "https://www.aaron-gustafson.com/notebook/i-changed-my-mind-about-css-variables/",
    },
    {
      text: "Leatherman: CrUX shows you the users you have, Lighthouse the users you want",
      url: "https://www.zachleat.com/web/ai-websites/",
    },
    {
      text: "30-month dates: inferences from webstatus.dev low_date values on slides 10 and 13",
      url: "https://webstatus.dev/features/field-sizing",
    },
  ],
  speakerNotes: "This is the slide the room photographs, so it's denser than the rest on purpose and the quotes live here rather than on screen. Walk the four questions in order and land on question two, because it separates a safe Newly feature from a dangerous one and it's the one teams skip; Aaron Gustafson's standard is that people should have a usable experience when a particular enhancement isn't available, and a modest amount of redundancy when it matters is a small price to pay. For question four, Zach Leatherman's instrument check: CrUX shows you the users you have, Lighthouse shows you the users you want, so look at your real browser mix before deciding what Baseline means for your product. The 2026 lag pattern, inverted: for CSS UI features Chrome and Safari agree and Firefox is pending; for DOM and scheduling features like closedby, moveBefore, CloseWatcher, and scheduler.yield, Chrome and Firefox agree and Safari is pending, and Rachel Andrew's reminder that the cadence is new is that scrollbar-color took more than twenty years to reach Baseline. The calendar makes the tiers predictable, and the cooldown line ties the dependency act to the same logic in reverse; then the close, one minute.",
  timing: {
    minutes: 2,
    cumulative: 33.5,
  },
};
