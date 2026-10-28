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
  citations: [],
  speakerNotes:
    "Two quotes, nine years apart. Berners-Lee wanted a neutral space where everyone could create and share. The W3C strategy team wants humanity at the center while agents act for us. Read both slowly.",
  timing: { minutes: 1, cumulative: 4 },
  background: "two-perspectives",
};
