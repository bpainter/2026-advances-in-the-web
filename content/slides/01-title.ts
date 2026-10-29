import type { Slide } from "@/content/schema";
import { deck } from "@/content/deck";

/**
 * The title slide, a native glass layout (PRD v5, 4.5; spec 6.2). PRD r7, 4.2: the 192 px title in
 * three lines, with the speaker's name and job title from `deck.speaker` under it.
 */
export const slide: Slide = {
  id: "title",
  index: 1,
  section: "cold-open",
  layout: "glass-title",
  title: "2026 advances in the web",
  glass: {
    kind: "title",
    eyebrow: deck.event.label,
    lines: ["2026", "advances", "in the web"],
  },
  citations: [],
  speakerNotes: `Title slide. ${deck.event.label}. Say it: ${deck.speaker.name}, ${deck.speaker.title} at ${deck.speaker.org}. Say the thesis: in 2026 the browser shipped more than the frameworks on it.`,
  timing: { minutes: 0.5, cumulative: 0.5 },
  background: "title",
};
