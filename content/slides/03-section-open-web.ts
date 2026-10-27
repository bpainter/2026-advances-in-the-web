import type { Slide } from "@/content/schema";

export const slide: Slide = {
  id: "section-open-web",
  index: 3,
  section: "open-web",
  layout: "section",
  title: "The open web",
  eyebrow: "SECTION 1",
  body: ["Whose agent is it?"],
  image: {
    prompt: "Candid daylight photo of a woman in a wool coat reading something on her phone while waiting at a Toronto streetcar stop, photographed from the side at a respectful distance, late-autumn morning light, red streetcar out of focus behind her, brick and glass storefronts, natural colour, no readable screen content, no logos, no lens flare, no colour wash. 16:9.",
    alt: "A woman reading her phone at a Toronto streetcar stop in morning light.",
    model: "higgsfield/nano-banana-2",
    placement: "right-half",
  },
  citations: [],
  speakerNotes: "Four minutes, five numbers, and one sentence from the W3C. We open on governance rather than nostalgia because this room won't buy sentiment. The W3C's position since December 2024 is that the web can be consumed any way people choose, and in November 2025 its Technical Architecture Group said AI summarisers and agents count as user agents. That means they owe the person using them the same things a browser does. Keep that framing in your pocket; the next four slides make it urgent.",
  timing: {
    minutes: 0.25,
    cumulative: 2.25,
  },
};
