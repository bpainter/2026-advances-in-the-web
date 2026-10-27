import type { Slide } from "@/content/schema";

export const slide: Slide = {
  id: "section-platform",
  index: 9,
  section: "platform-baseline",
  layout: "section",
  title: "The platform",
  eyebrow: "SECTION 2",
  body: ["One product card, eight features, four labels.", "Live in the browser, then two engines, then Chrome only."],
  items: [
    {
      label: "BASELINE WIDELY",
      detail: "All engines for 30+ months",
    },
    {
      label: "BASELINE NEWLY · DATE",
      detail: "All engines; the date the last one shipped",
    },
    {
      label: "TWO-ENGINE · MISSING X",
      detail: "Progressive enhancement only",
    },
    {
      label: "ONE-ENGINE · X ONLY",
      detail: "Demos and prototypes",
    },
  ],
  image: {
    prompt: "Candid over-the-shoulder daylight photo of a developer at a kitchen table, laptop and an external monitor showing the same simple product page in three browser windows side by side, plain UI shapes and grey text bars with no readable words, soft morning light from a window to the left, a coffee cup and a plant, natural colour, no logos, no lens flare, no colour wash. 16:9.",
    alt: "A developer at a kitchen table with the same product page open in three browser windows.",
    model: "higgsfield/nano-banana-2",
    placement: "right-half",
  },
  citations: [
    {
      text: "Label scheme and dates (queried 23 Oct 2026)",
      url: "https://api.webstatus.dev/v1/features",
    },
    {
      text: "Interop 2026 scores",
      url: "https://raw.githubusercontent.com/web-platform-tests/results-analysis/gh-pages/data/interop-2026/interop-2026-stable-v2.csv",
    },
  ],
  speakerNotes: "Show the starting state in the browser: a product card with image, title, price, options menu, FAQ, review box, colour picker, and feature list, backed by a package.json with Floating UI, react-textarea-autosize, Headless UI, auto-animate, and a theme script, about 70 KB of JavaScript for one card. Each demo removes one dependency and adds platform code, and the label tells you whether you can do the same on Monday. Rule for the room: Baseline dates come from webstatus.dev on 23 October 2026 unless I say otherwise, and I'll say otherwise once. The legend is the honesty contract for the next fourteen minutes. From here the slides are framing cards and the browser is the deck.",
  timing: {
    minutes: 0.75,
    cumulative: 7.5,
  },
};
