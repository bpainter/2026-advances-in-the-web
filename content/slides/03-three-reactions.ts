import type { Slide } from "@/content/schema";

/** Three reactions, a native glass grid with portraits (PRD v5, 4.5; spec 6.2). */
export const slide: Slide = {
  id: "three-reactions",
  index: 3,
  section: "cold-open",
  layout: "glass-grid",
  title: "Three reactions",
  glass: {
    kind: "grid",
    variant: "portraits",
    tone: "light",
    title: "Three reactions",
    cards: [
      {
        title: "The Greybeards",
        body: "Experienced engineers who want to know what problem AI will solve.",
        question: "Why?",
        image: {
          src: "/images/design/c18ba5ceb5f4a9a2dc228deb4d240a17.png",
          alt: "Caricature of a seasoned engineer with a grey beard and glasses, arms folded, one eyebrow raised.",
        },
      },
      {
        title: "The Line Toers",
        body: "Mid-career engineers finding ways to use AI because leadership expects them to.",
        question: "How?",
        image: {
          src: "/images/design/41c92a3370c2ea5a19e31664dfb3f880.png",
          alt: "Caricature of a mid-career Asian woman engineer with a laptop under one arm and a lanyard, calm and ready.",
        },
      },
      {
        title: "The New Luddites",
        body: "Early-career engineers concerned about AI’s impact on jobs, society, and the environment.",
        question: "Should we?",
        image: {
          src: "/images/design/7a3f47c0216f32a9a3c35bc46ca6e398.png",
          alt: "Caricature of an early-career Latina developer in a hoodie with headphones, glancing sideways, phone in hand.",
        },
      },
    ],
  },
  citations: [],
  speakerNotes:
    "Three people sit in every room. The greybeards want to know what problem AI solves. The line toers use it because leadership expects it. The new luddites worry about jobs, society and the planet. All three are here today, so speak to each once.",
  timing: { minutes: 1.5, cumulative: 3 },
  background: "three-reactions",
};
