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
  speakerNotes: "For me, that means keeping room for people to make things, learn things, and make their own choices.\n\nAI can help us write code or work through an idea. It doesn’t take responsibility for whether the result is useful, accessible, or safe.\n\nWe still have to understand what we’re shipping. We still have to test it. And we still need a web where people can build something without asking a platform for permission.",
  timing: { minutes: 0.5, cumulative: 4.5 },
  background: "keep-humanity",
};
