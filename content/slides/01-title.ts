import type { Slide } from "@/content/schema";

/** The title slide, a native glass layout (PRD v5, 4.5; spec 6.2). */
export const slide: Slide = {
  id: "title",
  index: 1,
  section: "cold-open",
  layout: "glass-title",
  title: "2026 advances in the web",
  glass: {
    kind: "title",
    eyebrow: "FITC Web Unleashed 2026, Toronto",
    lines: ["2026 advances", "in the web"],
    speaker: { name: "Bermon Painter", role: "Head of DXP and Commerce, Slalom" },
  },
  citations: [],
  speakerNotes:
    "Title slide. FITC Web Unleashed 2026, Toronto. Bermon Painter, Head of DXP and Commerce at Slalom. Say the thesis: in 2026 the browser shipped more than the frameworks on it.",
  timing: { minutes: 0.5, cumulative: 0.5 },
  background: "title",
};
