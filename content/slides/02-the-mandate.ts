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
    "I work at a large digital consultancy with somewhere north of 3,000 software engineers. I’ve lost count.\n\nLike a lot of large organizations, we have a mandate from the executive team: use AI.\n\nUse it for what? That part can be less clear. Sometimes the training hasn’t caught up. Sometimes the licenses haven’t either. Apparently, the first thing we’re automating is the purchase request.\n\nI’m not against the tools. But handing someone a tool and telling them to be more productive isn’t much of a plan.\n\nAnd the reactions are pretty interesting.",
  timing: { minutes: 1, cumulative: 1.5 },
  background: "the-mandate",
};
