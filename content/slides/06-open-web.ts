import type { Slide } from "@/content/schema";

/** Designed in Claude Design; the section markup lives in content/designed/o4-open-web.html. */
export const slide: Slide = {
  id: "open-web",
  index: 6,
  section: "open-web",
  layout: "designed",
  title: "Why the open web matters",
  designed: { file: "o4-open-web.html" },
  citations: [],
  speakerNotes: "Agents will browse, buy and build on the web next. Six properties keep it worth building on whoever the user turns out to be: interoperability, user control, durable access, accessibility, security and trust, innovation without permission. One sentence each; do not read the subtitles.",
  timing: { minutes: 1.5, cumulative: 6 },
};
