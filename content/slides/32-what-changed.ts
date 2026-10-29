import type { Slide } from "@/content/schema";

/** What changed in 2026, a native glass grid with numbers (PRD v5, 4.5; spec 6.2). */
export const slide: Slide = {
  id: "what-changed",
  index: 48,
  section: "close",
  layout: "glass-grid",
  title: "What changed in 2026",
  glass: {
    kind: "grid",
    variant: "numbered",
    tone: "light",
    title: "What changed in 2026",
    cards: [
      { num: "01", title: "The browser does more", body: "Features that needed a library two years ago now ship in the platform. That is less code to own and fewer dependencies to patch." },
      { num: "02", title: "Baseline and Interop settle support", body: "Baseline names what works across engines and Interop keeps closing the gaps. “Can I use it?” finally has a shared answer." },
      { num: "03", title: "Frameworks rethink rendering and caching", body: "Server-first rendering and explicit cache boundaries are the new defaults. Where your code runs is a decision again." },
      { num: "04", title: "Build tools go native", body: "Bundlers, linters, and formatters rewritten in Rust and Go made slow builds a choice. The toolchain is converging on a few fast defaults." },
      { num: "05", title: "Installs are a security decision", body: "Supply-chain attacks turned every install into a trust decision. Lockfiles, provenance, and minimal install scripts are table stakes now." },
      { num: "06", title: "Abstractions are maintenance decisions", body: "Every layer you add is a layer you keep. Reach for the ones the platform does not already give you." },
    ],
  },
  citations: [],
  speakerNotes:
    "Six takeaways. The browser does more. Baseline and Interop settle support. Frameworks rethink rendering and caching. Build tools go native. Installs are a security decision. Land the last one: every layer you add is a layer you keep.",
  timing: { minutes: 1.5, cumulative: 40.75 },
  background: "what-changed",
};
