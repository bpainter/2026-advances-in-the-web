import type { Slide } from "@/content/schema";
import { demo } from "@/content/demos/customizable-select/demo";

export const slide: Slide = {
  id: "customizable-select",
  index: 19,
  section: "platform-two-engine",
  layout: "demo-split",
  title: "Customizable select",
  eyebrow: "TWO-ENGINE · MISSING FIREFOX",
  body: [
    "Replaces the styling and rich-option case for react-select (5.1M a week), downshift, Choices.js, and Select2.",
  ],
  support: {
    tier: "two-engine",
    since: "Chrome 135; Safari 27 shipped 14 Sep 2026",
    missing: ["firefox"],
    note: "Firefox: Nightly prefs only; 153 added parsing groundwork. Demo: select.showPicker() needs a user click, so the open steps show a labelled replica of the picker built from the same options; one real click on the select shows the real picker.",
  },
  demo: demo,
  citations: [
    {
      text: "Chrome 135, Safari 27, Firefox prefs",
      url: "https://webstatus.dev/features/customizable-select",
    },
    {
      text: "Firefox 153 parsing groundwork",
      url: "https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/153",
    },
    {
      text: "Safari 27: keyboard, screen reader, forms intact",
      url: "https://webkit.org/blog/17967/news-from-wwdc26-webkit-in-saf",
    },
    {
      text: "The golden rule of customizable select",
      url: "https://webkit.org/blog/18117/the-golden-rule-of-customizable-select/",
    },
    {
      text: "UA defaults under discussion",
      url: "https://webkit.org/blog/18325/webkit-features-for-safari-27-0/",
    },
    {
      text: "Mobile picker trade-off",
      url: "https://developer.chrome.com/blog/a-customizable-select",
    },
    {
      text: "react-select downloads",
      url: "https://api.npmjs.org/downloads/point/last-week/react-select",
    },
  ],
  speakerNotes:
    "The number-one reason component libraries exist, gone in two of three engines, with keyboard, screen reader, form submission, and validation intact. Showing the Firefox fallback is more persuasive than hiding it, because it demonstrates the thing a component library can never give you: when the enhancement is missing, the form still works. Say the golden rule; it's the kind of accessibility detail this room respects. This is one of the converged five demos every CSS talk did this year, so keep it brisk and spend the saved time on the next slide, which nobody else is doing.",
  timing: {
    minutes: 1,
    cumulative: 18.75,
  },
};
