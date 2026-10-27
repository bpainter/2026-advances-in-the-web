import type { Slide } from "@/content/schema";
import { demo as cssCarousel } from "@/content/demos/css-carousel/demo";
import { demo as interestInvokers } from "@/content/demos/interest-invokers/demo";
import { demo as cssIfFunction } from "@/content/demos/css-if-function/demo";
import { demo as cornerShape } from "@/content/demos/corner-shape/demo";

export const slide: Slide = {
  id: "chrome-only-round",
  index: 21,
  section: "platform-chrome-only",
  layout: "demo-grid",
  // Steps belong to the enlarged cell (keys 1 to 4); in the grid itself the arrows still change slide.
  stepThrough: "steps-first",
  title: "Chrome-only lightning round",
  eyebrow: "ONE-ENGINE · CHROME AND EDGE ONLY",
  body: ["One engine. Direction for prototypes, and nothing here is a production dependency."],
  support: {
    tier: "one-engine",
    missing: ["safari", "firefox"],
    note: "Chrome and Edge only; one label for all four cells so nobody mistakes the round for a recommendation.",
  },
  items: [
    {
      label: "CSS carousels",
      detail: "Replaces Swiper (2.3M a week), Slick, Glide. Chrome 135+. Pinterest: about 2,000 lines of JS became about 200 lines of CSS.",
    },
    {
      label: "Interest invokers",
      detail: "Replaces Tippy.js and hover-card wiring. Chrome 142+. popover=hint: Chrome 151 and Firefox 153, no Safari.",
    },
    {
      label: "if() and @function",
      detail: "Replaces Sass conditionals and functions. Chrome 137 and 139. @mixin is in no browser.",
    },
    {
      label: "corner-shape",
      detail: "Replaces SVG masks and clip-path polygons. Chrome 139+. Falls back to plain border-radius.",
    },
  ],
  demos: [cssCarousel, interestInvokers, cssIfFunction, cornerShape],
  citations: [
    {
      text: "Carousel support",
      url: "https://webstatus.dev/features/scroll-markers",
    },
    {
      text: "Chrome 154 links and tabs",
      url: "https://developer.chrome.com/release-notes/154",
    },
    {
      text: "Open UI research stage",
      url: "https://open-ui.org/",
    },
    {
      text: "Pinterest 2,000 to 200",
      url: "https://developer.chrome.com/blog/web-at-io25",
    },
    {
      text: "Soueidan on carousel accessibility",
      url: "https://www.sarasoueidan.com/blog/css-carousels-accessibility/",
    },
    {
      text: "prev and next unimplemented",
      url: "https://chrome.dev/css-wrapped-2025",
    },
    {
      text: "Interest invokers Chrome 142",
      url: "https://webstatus.dev/features/interest-invokers",
    },
    {
      text: "Interest invokers explainer",
      url: "https://open-ui.org/components/interest-invokers.explainer",
    },
    {
      text: "popover=hint",
      url: "https://webstatus.dev/features/popover-hint",
    },
    {
      text: "if() Chrome 137 and 142, @function 139",
      url: "https://webstatus.dev/features/if",
    },
    {
      text: "@mixin nowhere",
      url: "https://api.webstatus.dev/v1/features?q=mixin",
    },
    {
      text: "Bramus on if() and @function",
      url: "https://www.bram.us/2025/02/18/css-at-function-and-css-if/",
    },
    {
      text: "Una's five functions",
      url: "https://una.im/5-css-functions/",
    },
    {
      text: "Coyier: the first match wins",
      url: "https://blog.master.dev/what-you-need-to-know-about-modern-css-2025-edition/",
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
      text: "Suzanne, CSS Day 2025 talk title",
      url: "https://conffab.com/program/css-day-25/",
    },
    {
      text: "corner-shape Chrome 139, experimental",
      url: "https://webstatus.dev/features/corner-shape",
    },
    {
      text: "Temani Afif corner-shape",
      url: "https://css-tip.com/corner-shape/",
    },
    {
      text: "Rupert, sci-fi rectangles with corner-shape (demo, by title)",
      url: "https://daverupert.com/2025/07/sci-fi-rectangles-with-corner-shape/",
    },
    {
      text: "Swiper downloads",
      url: "https://api.npmjs.org/downloads/point/last-week/swiper",
    },
  ],
  speakerNotes: "The lightning round is where the Chrome-only reels live, and the band at the top keeps it honest: this is direction, 20 to 25 seconds a cell, and none of it ships to production. The Pinterest number is the one people will quote, so attach Soueidan's critique in the same breath: browsers expose scroll markers as ARIA tabs, so every gallery example is supposed to be a Tabs widget, and ARIA is a promise. For if() use Coyier's rule, the first match wins, and note that @function is on the Comeau, Meyer, and Soueidan Interop 2027 wish lists, which is the best proxy for cross-browser within 18 months; Miriam Suzanne's CSS Day 2025 talk was titled Is Sass Dead Yet. corner-shape is the biggest visual change per character in the deck with the ideal failure mode. That closes the platform act; now, what the frameworks did while the platform moved.",
  timing: {
    minutes: 1.75,
    cumulative: 21.25,
  },
  cutPriority: 3,
};
