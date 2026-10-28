import type { Slide } from "@/content/schema";

/** Designed in Claude Design; the section markup lives in content/designed/o1-the-mandate.html. */
export const slide: Slide = {
  id: "the-mandate",
  index: 2,
  section: "cold-open",
  layout: "designed",
  title: "The mandate",
  designed: { file: "o1-the-mandate.html" },
  citations: [],
  speakerNotes: "Every enterprise got the same two-word mandate this year: use AI. The reaction was tools, licenses, training, human review, accountability and impacts, roughly in that order. Name the mandate plainly before taking any position on it.",
  timing: { minutes: 1, cumulative: 1.5 },
  background: "the-mandate",
};
