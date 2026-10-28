import type { Slide } from "@/content/schema";

/** The closing slide (PRD v5, 4.6; spec 7): name, role and LinkedIn, with a QR code. Always last. */
export const slide: Slide = {
  id: "closing",
  index: 36,
  section: "close",
  layout: "glass-closing",
  title: "Thank you",
  glass: {
    kind: "closing",
    eyebrow: "Thank you",
    name: "Bermon Painter",
    role: "Head of DXP and Commerce, Slalom",
    link: "linkedin.com/in/bermonpainter",
    url: "https://www.linkedin.com/in/bermonpainter",
    caption: "Scan to open LinkedIn",
  },
  citations: [],
  speakerNotes: "Leave this up during questions.",
  timing: { minutes: 0.25, cumulative: 36.25 },
  background: "closing",
};
