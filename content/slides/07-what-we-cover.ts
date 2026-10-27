import type { Slide } from "@/content/schema";

/** Designed in Claude Design; the section markup lives in content/designed/o5-what-we-cover.html. */
export const slide: Slide = {
  id: "what-we-cover",
  index: 7,
  section: "open-web",
  layout: "designed",
  title: "What we'll cover",
  designed: { file: "o5-what-we-cover.html" },
  citations: [],
  speakerNotes: "The agenda: HTML, CSS and JavaScript; frameworks and metaframeworks; build tools and package managers. Say where the demos sit (part one) and that part three is the shortest.",
  timing: { minutes: 0.5, cumulative: 6.5 },
};
