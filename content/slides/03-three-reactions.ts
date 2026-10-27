import type { Slide } from "@/content/schema";

/** Designed in Claude Design; the section markup lives in content/designed/o2-three-reactions.html. */
export const slide: Slide = {
  id: "three-reactions",
  index: 3,
  section: "cold-open",
  layout: "designed",
  title: "Three reactions",
  designed: { file: "o2-three-reactions.html" },
  citations: [],
  speakerNotes: "Three people in every room: the greybeards who want the reason before the tool (why), the line toers who make the mandate useful (how), and the new luddites weighing what the trade costs (should we). All three are in this audience; speak to each once.",
  timing: { minutes: 1.5, cumulative: 3 },
};
