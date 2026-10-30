import type { Slide } from "@/content/schema";

/** People to follow, a native glass people grid (PRD v5, 4.5; spec 6.2). */
export const slide: Slide = {
  id: "people-to-follow",
  index: 49,
  section: "close",
  layout: "glass-people",
  title: "People to follow",
  glass: {
    kind: "people",
    title: "People to follow",
    people: [
      { initials: "CC", name: "Chris Coyier", role: "Co-founder, CodePen", photo: "/people/chris-coyier.webp" },
      { initials: "DR", name: "Dave Rupert", role: "Co-host, ShopTalk Show", photo: "/people/dave-rupert.webp" },
      { initials: "TA", name: "Tab Atkins Jr.", role: "CSS spec editor", photo: "/people/tab-atkins.webp" },
      { initials: "LV", name: "Lea Verou", role: "Web standards leader", photo: "/people/lea-verou.webp" },
      { initials: "AG", name: "Aaron Gustafson", role: "Author, Adaptive Web Design", photo: "/people/aaron-gustafson.webp" },
      { initials: "VH", name: "Val Head", role: "Web animation expert", photo: "/people/val-head.webp" },
      { initials: "JS", name: "Jen Simmons", role: "Safari and WebKit, Apple", photo: "/people/jen-simmons.webp" },
      { initials: "MS", name: "Miriam Suzanne", role: "OddBird, CSS Working Group", photo: "/people/miriam-suzanne.webp" },
      { initials: "TB", name: "Tim Berners-Lee", role: "Inventor of the web", photo: "/people/tim-berners-lee.webp" },
      { initials: "RA", name: "Rachel Andrew", role: "Author, The New CSS Layout", photo: "/people/rachel-andrew.webp" },
      { initials: "EM", name: "Eric Meyer", role: "Author, CSS: The Definitive Guide", photo: "/people/eric-meyer.webp" },
      { initials: "JK", name: "Jeremy Keith", role: "Author, Resilient Web Design", photo: "/people/jeremy-keith.webp" },
    ],
  },
  citations: [],
  speakerNotes: "None of this progress happened on its own.\n\nThese are some of the people I keep learning from: Chris Coyier, Dave Rupert, Tab Atkins, Lea Verou, Aaron Gustafson, Val Head, Jen Simmons, Miriam Suzanne, Tim Berners-Lee, Rachel Andrew, Eric Meyer, and Jeremy Keith.\n\nThey contribute in different ways, from standards and browser work to teaching, writing, and showing what the web can do.\n\nYou don’t have to follow every proposal or read every specification. But staying close to people who explain the work makes it much easier to keep learning.\n\n*Pause so the audience can read or photograph the names.*",
  timing: { minutes: 1, cumulative: 41.75 },
  background: "people-to-follow",
};
