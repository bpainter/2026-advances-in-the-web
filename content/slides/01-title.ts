import type { Slide } from "@/content/schema";
import { deck } from "@/content/deck";

/**
 * The title slide, a native glass layout (PRD v5, 4.5; spec 6.2). PRD r7, 4.2: the 192 px title in
 * two lines (docs/design/r7-spec.md 1), with the speaker's name and job title from `deck.speaker` under it.
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
    lines: ["2026 advances", "in the web"],
  },
  citations: [],
  speakerNotes: "While everyone was watching AI, the web kept moving.\n\nBrowsers can handle more of the work we used to hand to libraries. Frameworks are changing how we load pages and cache data. Even installing a package deserves another look.\n\nWe’re going to look at those changes through things we actually build: forms, product pages, navigation, and the tools behind them.\n\nBut first, a little context.",
  timing: { minutes: 0.5, cumulative: 0.5 },
  background: "title",
};
