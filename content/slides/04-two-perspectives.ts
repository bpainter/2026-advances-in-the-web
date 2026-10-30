import type { Slide } from "@/content/schema";

/** Two perspectives, a native glass quotes slide (PRD v5, 4.5; spec 6.2). */
export const slide: Slide = {
  id: "two-perspectives",
  index: 4,
  section: "open-web",
  layout: "glass-quotes",
  title: "Two perspectives",
  glass: {
    kind: "quotes",
    title: "Two perspectives",
    quotes: [
      {
        text: "“I aimed to create a neutral space where everyone could create, share, debate, innovate, learn and dream.”",
        cite: "Sir Tim Berners-Lee, 2017",
      },
      {
        text: "“We have to keep humanity at the center of the web while allowing AI agents to act on their behalf.”",
        cite: "W3C Strategy Team, October 2026",
      },
    ],
  },
  citations: [
    {
      text: "W3C Strategy Team: the web in the AI era",
      url: "https://www.w3.org/2026/10/w3c-and-state-of-web-in-ai-era.html",
    },
  ],
  speakerNotes:
    "Tim Berners-Lee described what he wanted the web to be:\n\n> “I aimed to create a neutral space where everyone could create, share, debate, innovate, learn and dream.”\n\nThat’s a much bigger idea than a place to consume content. It’s a place where any of us can contribute.\n\nThe W3C perspective on this slide brings us back to people as AI becomes part of the web. The tools should work for us. They shouldn’t decide what the web is allowed to become.\n\nThose ideas belong together. Keep the web open to new tools, but keep people in control.",
  timing: { minutes: 1, cumulative: 4 },
  background: "two-perspectives",
};
