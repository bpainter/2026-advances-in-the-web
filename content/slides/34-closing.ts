import type { Slide } from "@/content/schema";
import { deck } from "@/content/deck";

/** The closing slide (PRD v5, 4.6; spec 7): name, role and LinkedIn, with a QR code. Always last. */
export const slide: Slide = {
  id: "closing",
  index: 50,
  section: "close",
  layout: "glass-closing",
  title: "Thank you",
  glass: {
    kind: "closing",
    eyebrow: "Thank you",
    name: deck.speaker.name,
    role: `${deck.speaker.title}, ${deck.speaker.org}`,
    link: "linkedin.com/in/bermonpainter",
    // The QR generator reads this; the validator checks it equals deck.speaker.linkedin (PRD r7, 5.1).
    url: deck.speaker.linkedin,
    caption: "Scan to open LinkedIn",
  },
  citations: [],
  speakerNotes: "Leave this up during questions.",
  timing: { minutes: 0.25, cumulative: 42 },
  background: "closing",
};
