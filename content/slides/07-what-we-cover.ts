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
    align: "center",
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
    "That’s enough AI for now.\n\nWe’ll start with HTML, CSS, and JavaScript. For each demo, we’ll look at what we used to build ourselves, what the browser can handle now, and the code behind it.\n\nThen we’ll look at features that still need more care around support. After that, we’ll get into caching, package installs, and build tools.\n\nSome of these features are new. Others have been around for a while and have become more useful as support has improved.\n\nThe point isn’t to stop using libraries. It’s to know what we’re choosing. AI is another tool in that mix. It isn’t a reason to stop learning how the web works.",
  timing: { minutes: 0.5, cumulative: 6.5 },
  background: "what-we-cover",
};
