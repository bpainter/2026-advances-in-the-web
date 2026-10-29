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
    align: "center",
    eyebrow: "The mandate",
    display: "Use AI",
    cardsEyebrow: "The reaction",
    cards: [
      { icon: "Wrench", title: "Which tools?" },
      { icon: "KeyRound", title: "Which licenses?" },
      { icon: "GraduationCap", title: "What training?" },
      { icon: "UserCheck", title: "Who reviews it?" },
      { icon: "ClipboardCheck", title: "Who is accountable?" },
      { icon: "Activity", title: "What’s the impact?" },
    ],
  },
  citations: [],
  speakerNotes:
    "Every enterprise got the same two-word mandate this year: use AI. The reaction was a list of questions. Which tools? Which licenses? What training? Who reviews it? Who is accountable? What’s the impact? Name the mandate plainly before taking any position on it.",
  timing: { minutes: 1, cumulative: 1.5 },
  background: "the-mandate",
};
