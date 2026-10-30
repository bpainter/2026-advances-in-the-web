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
  citations: [
    {
      text: "W3C Ethical Web Principles",
      url: "https://www.w3.org/TR/ethical-web-principles/",
    },
  ],
  speakerNotes:
    "There are six reasons I care about this.\n\n- **Choice.** A website shouldn’t require everyone to use one company’s browser, app, or assistant.\n- **Control.** People should understand what a service does and have a say in what it can access.\n- **Lasting access.** A link should take you to something you can read, share, and return to. It shouldn’t depend on one feed deciding to show it.\n- **Access for more people.** Good HTML gives us a starting point for different devices, keyboards, and assistive tools.\n- **Trust.** Open standards give us shared rules we can inspect, test, and improve.\n- **Room to create.** You can publish a useful tool, a strange little experiment, or something nobody has thought of yet.\n\nOpen standards don’t guarantee every site does those things well. But they give us a foundation that isn’t controlled by one product.",
  timing: { minutes: 1.5, cumulative: 6 },
  background: "open-web",
};
