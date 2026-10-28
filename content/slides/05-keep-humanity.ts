import type { Slide } from "@/content/schema";

/** Keep humanity at the center, a native glass statement (PRD v5, 4.5; spec 6.2). */
export const slide: Slide = {
  id: "keep-humanity",
  index: 5,
  section: "open-web",
  layout: "glass-statement",
  title: "Keep humanity at the center",
  glass: { kind: "statement", lines: ["Keep humanity", "at the center"] },
  citations: [],
  speakerNotes: "The statement slide. Let it sit for a beat. This is the frame for everything that follows.",
  timing: { minutes: 0.5, cumulative: 4.5 },
  background: "keep-humanity",
};
