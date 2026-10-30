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
    "I’ve started thinking about these reactions in three groups. These are people I’ve worked with, not a scientific study. You may recognize more than one.\n\nFirst, the Greybeards. They’ve seen a few revolutions already. Their question is, “Why? What problem are we solving?” They’re not against a new tool. They just want a reason beyond the fact that we bought it.\n\nThen we have the Line Toers. Their question is, “How?” Leadership wants AI, so they’re working out where it can help and how to fit it into the job.\n\nAnd then the New Luddites. They’re asking, “Should we?” They’re worried about the effects on jobs, society, and the environment. The hesitation isn’t always about the technology. It’s about what comes with it.\n\nWhy, how, and should we. Honestly, we need all three questions.",
  timing: { minutes: 1.5, cumulative: 3 },
  background: "three-reactions",
};
