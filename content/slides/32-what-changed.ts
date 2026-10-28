import type { Slide } from "@/content/schema";

/** Designed in Claude Design; the section markup lives in content/designed/c1-what-changed.html. */
export const slide: Slide = {
  id: "what-changed",
  index: 34,
  section: "close",
  layout: "designed",
  title: "What changed in 2026",
  designed: { file: "c1-what-changed.html" },
  citations: [],
  speakerNotes: "Six takeaways: the browser does more; Baseline and Interop settle support; frameworks rethink rendering and caching; build tools go native; installs are a security decision; abstractions are maintenance decisions. Land the last one: every layer you add is a layer you keep.",
  timing: { minutes: 1.5, cumulative: 35 },
  background: "what-changed",
};
