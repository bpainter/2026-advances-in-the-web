import type { Slide } from "@/content/schema";

/** The mandate, a native glass grid with icons (PRD v5, 4.5; spec 6.2). */
export const slide: Slide = {
  id: "the-mandate",
  index: 2,
  section: "cold-open",
  layout: "glass-grid",
  title: "The mandate",
  glass: {
    kind: "grid",
    variant: "icons",
    tone: "light",
    eyebrow: "The mandate",
    display: "Use AI",
    cardsEyebrow: "The reaction",
    cards: [
      { icon: "Wrench", title: "Tools" },
      { icon: "KeyRound", title: "Licenses" },
      { icon: "GraduationCap", title: "Training" },
      { icon: "UserCheck", title: "Human review" },
      { icon: "ClipboardCheck", title: "Accountability" },
      { icon: "Activity", title: "Impacts" },
    ],
  },
  citations: [],
  speakerNotes:
    "Every enterprise got the same two-word mandate this year: use AI. The reaction was tools, licenses, training, human review, accountability and impacts. Name the mandate plainly before taking any position on it.",
  timing: { minutes: 1, cumulative: 1.5 },
  background: "the-mandate",
};
