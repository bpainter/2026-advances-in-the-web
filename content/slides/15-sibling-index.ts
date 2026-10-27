import type { Slide } from "@/content/schema";
import { demo } from "@/content/demos/sibling-index/demo";

export const slide: Slide = {
  id: "sibling-index",
  index: 15,
  section: "platform-baseline",
  layout: "demo-split",
  title: "Sibling index",
  eyebrow: "BASELINE NEWLY · 18 AUG 2026 (FIREFOX 154)",
  body: ["Replaces style=\"--i: 3\" on every list item."],
  support: {
    tier: "baseline-newly",
    since: "18 Aug 2026 (Chrome 138, Safari 26.2, Firefox 154); progress() 1 Sep 2026",
  },
  demo: demo,
  citations: [
    {
      text: "sibling-index() and sibling-count() Baseline 18 Aug 2026",
      url: "https://webstatus.dev/features/sibling-count",
    },
    {
      text: "progress() Baseline 1 Sep 2026",
      url: "https://developer.mozilla.org/en-US/Firefox/Releases/155",
    },
  ],
  speakerNotes: "Thirty seconds, no more. This demo exists to show how recent some Baseline dates are: August and September of this year. progress() does fluid type without a calculator, something like opacity from progress(100cqw, 300px, 900px). That recency is part of the argument that the platform moves faster than people assume, and it answers anyone who thinks Baseline means old news. Then the demo that most changes how the card behaves, the sort animation.",
  timing: {
    minutes: 0.5,
    cumulative: 14.25,
  },
  cutPriority: 4,
};
