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
      { num: "01", title: "The browser does more", body: "Browsers now handle more features that once needed separate libraries. That means less code to maintain and fewer dependencies to update." },
      { num: "02", title: "Browser support is easier to check", body: "Baseline shows which features work across major browsers. Interop helps browser makers fix differences so the same code works more consistently." },
      { num: "03", title: "Frameworks give us more control", body: "Frameworks give us better ways to choose what runs on the server and what runs in the browser. We also have more control over what gets cached and when it updates." },
      { num: "04", title: "Build tools are getting faster", body: "Tools written in Rust and Go can speed up builds, code checks, and formatting. That means faster feedback and less time waiting while we work." },
      { num: "05", title: "Package installs need safeguards", body: "Installing a package means trusting someone else’s code. Lockfiles, checks on where packages come from, and limits on install scripts help reduce the risk." },
      { num: "06", title: "Every dependency adds upkeep", body: "Each library we add needs updates, testing, and maintenance. Use one when it solves a problem the browser does not already handle well." },
    ],
  },
  citations: [],
  speakerNotes:
    "Six takeaways. The browser does more. Browser support is easier to check. Frameworks give us more control. Build tools are getting faster. Package installs need safeguards. Land the last one: every dependency adds upkeep.",
  timing: { minutes: 1.5, cumulative: 40.75 },
  background: "what-changed",
};
