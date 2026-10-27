import type { Slide } from "@/content/schema";
import { demo } from "@/content/demos/colour-functions/demo";

export const slide: Slide = {
  id: "colour-functions",
  index: 13,
  section: "platform-baseline",
  layout: "demo-split",
  title: "Colour functions",
  eyebrow: "BASELINE NEWLY · 10 APR 2026 (CONTRAST-COLOR)",
  body: ["Replaces the black-or-white text script, Sass lighten() and darken(), and stylesheet-swapping theme toggles."],
  support: {
    tier: "baseline-newly",
    since: "10 Apr 2026 (contrast-color); relative colour syntax Sep 2024; light-dark() with images 14 Sep 2026",
    note: "contrast-color() returns only black or white today; no max keyword yet.",
  },
  demo: demo,
  citations: [
    {
      text: "contrast-color() Baseline 10 Apr 2026, Interop 1000/1000/1000",
      url: "https://webstatus.dev/features/contrast-color",
    },
    {
      text: "Relative colour syntax Sep 2024; color-mix() and oklch Widely 9 Nov 2025",
      url: "https://webstatus.dev/features/color-mix",
    },
    {
      text: "alpha() Sep 2026",
      url: "https://web.dev/blog/web-platform-09-2026",
    },
    {
      text: "Firefox 155 notes",
      url: "https://developer.mozilla.org/en-US/Firefox/Releases/155",
    },
    {
      text: "light-dark() with images 14 Sep 2026",
      url: "https://api.webstatus.dev/v1/features?q=light-dark",
    },
    {
      text: "Black or white only",
      url: "https://webkit.org/blog/17333/webkit-features-in-safari-26-0/",
    },
    {
      text: "Safari 26.2 oklab default",
      url: "https://webkit.org/?p=17640",
    },
  ],
  speakerNotes: "Colour is where most design systems still carry a JavaScript dependency because the maths felt like code, and this shows it was always a styling concern. contrast-color() is 1000 out of 1000 on Interop 2026 in all three engines, which is as safe as a Newly feature gets, and it returns only black or white today. color-mix() and oklch have been Widely since 9 November 2025, alpha() landed as Baseline in September, and light-dark() has taken images since 14 September. Mention the Safari interpolation change, because anyone who compared screenshots across browsers this year has been confused by it. Next, a two-line replacement for the inline index hack.",
  timing: {
    minutes: 1,
    cumulative: 13.5,
  },
};
