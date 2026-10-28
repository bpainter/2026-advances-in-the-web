import type { Slide } from "@/content/schema";

/** People to follow, a native glass people grid (PRD v5, 4.5; spec 6.2). */
export const slide: Slide = {
  id: "people-to-follow",
  index: 35,
  section: "close",
  layout: "glass-people",
  title: "People to follow",
  glass: {
    kind: "people",
    title: "People to follow",
    people: [
      { initials: "CC", name: "Chris Coyier", role: "Co-founder, CodePen" },
      { initials: "DR", name: "Dave Rupert", role: "Co-host, ShopTalk Show" },
      { initials: "TA", name: "Tab Atkins Jr.", role: "CSS spec editor" },
      { initials: "LV", name: "Lea Verou", role: "Web standards leader" },
      { initials: "AG", name: "Aaron Gustafson", role: "Author, Adaptive Web Design" },
      { initials: "VH", name: "Val Head", role: "Web animation expert" },
      { initials: "JS", name: "Jen Simmons", role: "Safari and WebKit, Apple" },
      { initials: "MS", name: "Miriam Suzanne", role: "OddBird, CSS Working Group" },
      { initials: "TB", name: "Tim Berners-Lee", role: "Inventor of the web" },
      { initials: "RA", name: "Rachel Andrew", role: "Author, The New CSS Layout" },
      { initials: "EM", name: "Eric Meyer", role: "Author, CSS: The Definitive Guide" },
      { initials: "JK", name: "Jeremy Keith", role: "Author, Resilient Web Design" },
    ],
  },
  citations: [],
  speakerNotes: "Twelve people whose writing covers everything in this talk. Point at two or three you read every week. The closing slide follows with the QR code.",
  timing: { minutes: 1, cumulative: 36 },
  background: "people-to-follow",
};
