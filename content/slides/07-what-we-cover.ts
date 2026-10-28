import type { Slide } from "@/content/schema";

/** What we will cover, a native glass grid with numbers on dark glass (PRD v5, 4.5; spec 6.2). */
export const slide: Slide = {
  id: "what-we-cover",
  index: 7,
  section: "open-web",
  layout: "glass-grid",
  title: "What we’ll cover",
  glass: {
    kind: "grid",
    variant: "numbered",
    tone: "dark",
    eyebrow: "2026 advances in the web",
    title: "What we’ll cover",
    cards: [
      { num: "01", icon: "CodeXml", title: "HTML, CSS, and JavaScript" },
      { num: "02", icon: "Layers", title: "Frameworks and metaframeworks" },
      { num: "03", icon: "Package", title: "Build tools and package managers" },
    ],
  },
  citations: [],
  speakerNotes:
    "Three parts. HTML, CSS and JavaScript. Frameworks and metaframeworks. Build tools and package managers. The demos sit in part one, and part three is the shortest.",
  timing: { minutes: 0.5, cumulative: 6.5 },
  background: "what-we-cover",
};
