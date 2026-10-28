import type { Slide } from "@/content/schema";

/** Why the open web matters, a native glass grid with icons (PRD v5, 4.5; spec 6.2). */
export const slide: Slide = {
  id: "open-web",
  index: 6,
  section: "open-web",
  layout: "glass-grid",
  title: "Why the open web matters",
  glass: {
    kind: "grid",
    variant: "icons",
    tone: "light",
    title: "Why the open web matters",
    lede: "Agents will browse, buy, and build on the web next. These six properties are why it stays worth building on, whoever the user turns out to be.",
    cards: [
      { icon: "MonitorSmartphone", title: "Interoperability", body: "One page, every browser" },
      { icon: "SlidersHorizontal", title: "User control", body: "Inspect, grant, revoke" },
      { icon: "Link", title: "Durable access", body: "URLs outlive apps" },
      { icon: "Accessibility", title: "Accessibility", body: "Shared HTML, shared meaning" },
      { icon: "ShieldCheck", title: "Security and trust", body: "Same rules for everyone" },
      { icon: "DoorOpen", title: "Innovation without permission", body: "Publish without asking" },
    ],
  },
  citations: [],
  speakerNotes:
    "Agents will browse, buy and build on the web next. Six properties keep it worth building on. Give each one sentence, and do not read the subtitles.",
  timing: { minutes: 1.5, cumulative: 6 },
  background: "open-web",
};
